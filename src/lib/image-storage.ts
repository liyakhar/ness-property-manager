// Re-export from hybrid image storage (local for dev, Vercel Blob for production)
export {
  deleteImage,
  deletePropertyImages,
  getPropertyImages,
  getStorageMethod,
  getStorageStats,
  type ImageDeleteResult,
  type ImageUploadResult,
  imageExists,
  STORAGE_CONFIG,
  uploadImage,
} from './hybrid-image-storage';

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const { STORAGE_CONFIG } = require('./hybrid-image-storage');

  // Check file type
  if (
    !STORAGE_CONFIG.ALLOWED_TYPES.includes(
      file.type as (typeof STORAGE_CONFIG.ALLOWED_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Extract image path from URL
 */
export function extractImagePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const imagesIndex = pathParts.indexOf('images');

    if (imagesIndex === -1 || imagesIndex === pathParts.length - 1) {
      return null;
    }

    return pathParts.slice(imagesIndex + 1).join('/');
  } catch {
    return null;
  }
}
