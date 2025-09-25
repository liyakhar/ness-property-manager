import { type NextRequest, NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';
import {
  isSupabaseConfigured,
  PROPERTY_IMAGES_BUCKET,
  STORAGE_CONFIG,
  supabase,
} from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, falling back to free storage');
      return await handleFreeStorageUpload(request);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    console.log('Upload request received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      propertyId,
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Validate file type
    if (
      !STORAGE_CONFIG.ALLOWED_TYPES.includes(
        file.type as (typeof STORAGE_CONFIG.ALLOWED_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

    console.log('Uploading to Supabase Storage:', {
      bucket: PROPERTY_IMAGES_BUCKET,
      fileName,
    });

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        {
          error: `Failed to upload file: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(fileName);

    console.log('Upload successful:', {
      path: data.path,
      url: urlData.publicUrl,
    });

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json({ error: 'Image path is required' }, { status: 400 });
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using free storage for deletion');
      return await handleFreeStorageDelete(imagePath);
    }

    // Delete file from Supabase Storage
    const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove([imagePath]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Free storage upload handler
async function handleFreeStorageUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    console.log('Free storage upload request received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      propertyId,
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename with property ID
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `prop_${propertyId}_${timestamp}_${randomString}.${extension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save image using free storage
    const imageUrl = freeStorage.images.save(buffer, filename);

    console.log('Free storage upload successful:', {
      filename,
      url: imageUrl,
    });

    return NextResponse.json({
      success: true,
      url: imageUrl,
      path: filename,
    });
  } catch (error) {
    console.error('Free storage upload error:', error);
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

// Free storage delete handler
async function handleFreeStorageDelete(imagePath: string) {
  try {
    // Extract filename from path (remove any directory structure)
    const filename = imagePath.split('/').pop() || imagePath;

    const success = freeStorage.images.delete(filename);

    if (!success) {
      return NextResponse.json(
        { error: 'File not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Free storage delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
