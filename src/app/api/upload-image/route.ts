import { type NextRequest, NextResponse } from 'next/server';
import { deleteImage, STORAGE_CONFIG, uploadImage } from '@/lib/image-storage';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
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

    // Upload file to local storage
    const result = await uploadImage(file, propertyId);

    if (!result.success) {
      console.error('Upload error:', result.error);
      return NextResponse.json(
        {
          error: result.error || 'Failed to upload file',
        },
        { status: 500 }
      );
    }

    console.log('Upload successful:', {
      path: result.path,
      url: result.url,
    });

    // Update the database with the new image URL
    try {
      // Get current images for the property
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { images: true },
      });

      const currentImages = (property?.images as string[]) || [];
      const updatedImages = [...currentImages, result.url!];

      // Update the property with the new image URL
      await prisma.property.update({
        where: { id: propertyId },
        data: { images: updatedImages },
      });

      console.log('Database updated with new image URL:', result.url);
    } catch (dbError) {
      console.error('Failed to update database:', dbError);
      // Don't fail the upload if database update fails
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
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
    const propertyId = searchParams.get('propertyId');

    if (!imagePath) {
      return NextResponse.json({ error: 'Image path is required' }, { status: 400 });
    }

    // Delete file from storage
    const result = await deleteImage(imagePath);

    if (!result.success) {
      console.error('Delete error:', result.error);
      return NextResponse.json({ error: result.error || 'Failed to delete file' }, { status: 500 });
    }

    // Update the database to remove the image URL
    if (propertyId) {
      try {
        // Get current images for the property
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
          select: { images: true },
        });

        const currentImages = (property?.images as string[]) || [];
        // Remove the image URL that matches the path or URL
        const updatedImages = currentImages.filter(
          (img) => !img.includes(imagePath) && img !== imagePath
        );

        // Update the property with the filtered images
        await prisma.property.update({
          where: { id: propertyId },
          data: { images: updatedImages },
        });

        console.log('Database updated, removed image URL:', imagePath);
      } catch (dbError) {
        console.error('Failed to update database:', dbError);
        // Don't fail the delete if database update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
