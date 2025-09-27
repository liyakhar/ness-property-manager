import fs from 'node:fs';
import { type NextRequest, NextResponse } from 'next/server';
import { getImagePath } from '@/lib/local-image-storage';

// GET /api/images/[filename]
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  try {
    const imagePath = getImagePath(filename);

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ success: false, error: 'Image not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);

    // Determine content type based on file extension
    const extension = filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ success: false, error: 'Failed to serve image' }, { status: 500 });
  }
}
