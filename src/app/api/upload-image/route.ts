import { type NextRequest, NextResponse } from 'next/server';

import { PROPERTY_IMAGES_BUCKET, supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not configured');
      return NextResponse.json(
        {
          error: 'Server configuration error: Supabase not configured',
        },
        { status: 500 }
      );
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
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File too large. Maximum size is 10MB',
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
