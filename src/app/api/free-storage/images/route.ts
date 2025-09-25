import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';

// POST /api/free-storage/images
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `img_${timestamp}_${randomString}.${extension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save image
    const imageUrl = freeStorage.images.save(buffer, filename);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: imageUrl,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
  }
}

// GET /api/free-storage/images
export async function GET() {
  try {
    const stats = freeStorage.stats();
    return NextResponse.json({
      success: true,
      data: {
        totalImages: stats.images,
        totalSize: stats.totalSize,
        sizeFormatted: formatBytes(stats.totalSize),
      },
    });
  } catch (error) {
    console.error('Error fetching image stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch image stats' },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
