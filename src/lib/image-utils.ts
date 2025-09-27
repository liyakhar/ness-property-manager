/**
 * Utility functions for handling images in the application
 */

/**
 * Check if a URL is a Vercel Blob Storage URL
 */
export function isVercelBlobUrl(url: string): boolean {
  return url.includes('.public.blob.vercel-storage.com');
}

/**
 * Check if a URL is a local development image URL
 */
export function isLocalImageUrl(url: string): boolean {
  return url.startsWith('/api/images/');
}

/**
 * Get image optimization props for Next.js Image component
 */
export function getImageProps(src: string) {
  const isVercelBlob = isVercelBlobUrl(src);
  const isLocal = isLocalImageUrl(src);

  return {
    src,
    unoptimized: isVercelBlob || isLocal, // Disable optimization for Vercel Blob and local images
  };
}
