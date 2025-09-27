/**
 * Vercel Blob Storage Solution
 * Stores images in Vercel Blob Storage for production
 */

import { del, list, put } from '@vercel/blob';
import { generateUniqueFilename } from './image-hash';

// Storage configuration constants
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  FOLDER_PREFIX: 'properties',
} as const;

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface ImageDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload an image to Vercel Blob Storage
 */
export async function uploadImage(file: File, propertyId: string): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (
      !STORAGE_CONFIG.ALLOWED_TYPES.includes(
        file.type as (typeof STORAGE_CONFIG.ALLOWED_TYPES)[number]
      )
    ) {
      return {
        success: false,
        error: `Invalid file type. Allowed types: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`,
      };
    }

    // Validate file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size is ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Generate unique filename with hash for deduplication
    const fileName = await generateUniqueFilename(file, propertyId);
    const fullPath = `${STORAGE_CONFIG.FOLDER_PREFIX}/${fileName}`;

    // Upload to Vercel Blob Storage
    const blob = await put(fullPath, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return {
      success: true,
      url: blob.url,
      path: fullPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an image from Vercel Blob Storage
 */
export async function deleteImage(imagePath: string): Promise<ImageDeleteResult> {
  try {
    // Extract URL from path if it's a full URL
    let urlToDelete = imagePath;

    // If it's just a path, we need to construct the full URL
    if (!imagePath.startsWith('http')) {
      // This is a path, we need to find the actual blob URL
      // For now, we'll try to delete by path pattern
      const pathParts = imagePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const fullPath = `${STORAGE_CONFIG.FOLDER_PREFIX}/${fileName}`;

      // List blobs to find the matching one
      const { blobs } = await list({
        prefix: fullPath,
        limit: 1,
      });

      if (blobs.length === 0) {
        return {
          success: false,
          error: 'Image not found',
        };
      }

      urlToDelete = blobs[0].url;
    }

    await del(urlToDelete);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get all images for a property
 */
export async function getPropertyImages(propertyId: string): Promise<string[]> {
  try {
    const { blobs } = await list({
      prefix: `${STORAGE_CONFIG.FOLDER_PREFIX}/${propertyId}_`,
      limit: 100, // Adjust as needed
    });

    return blobs.map((blob) => blob.url);
  } catch (error) {
    console.error('Error getting property images:', error);
    return [];
  }
}

/**
 * Delete all images for a property
 */
export async function deletePropertyImages(propertyId: string): Promise<boolean> {
  try {
    const { blobs } = await list({
      prefix: `${STORAGE_CONFIG.FOLDER_PREFIX}/${propertyId}_`,
      limit: 100,
    });

    if (blobs.length === 0) {
      return false;
    }

    // Delete all blobs for this property
    const deletePromises = blobs.map((blob) => del(blob.url));
    await Promise.all(deletePromises);

    return true;
  } catch (error) {
    console.error('Error deleting property images:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  try {
    const { blobs } = await list({
      prefix: STORAGE_CONFIG.FOLDER_PREFIX,
      limit: 1000, // Adjust as needed
    });

    const totalSize = blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);

    return {
      totalImages: blobs.length,
      totalSize,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalImages: 0,
      totalSize: 0,
    };
  }
}

/**
 * Check if an image exists (by URL)
 */
export function imageExists(imageUrl: string): boolean {
  // For Vercel Blob, we assume the URL exists if it's a valid blob URL
  return imageUrl.includes('blob.vercel-storage.com');
}
