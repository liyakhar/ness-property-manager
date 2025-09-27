/**
 * Local Image Storage Solution
 * Stores images in the local file system
 */

import fs from 'node:fs';
import path from 'node:path';

// Storage configuration
const STORAGE_DIR = path.join(process.cwd(), 'data');
const IMAGES_DIR = path.join(STORAGE_DIR, 'images');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

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
 * Upload an image to local storage
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

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = path.join(IMAGES_DIR, fileName);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Return public URL path
    const publicUrl = `/api/images/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an image from local storage
 */
export async function deleteImage(imagePath: string): Promise<ImageDeleteResult> {
  try {
    // Extract filename from path if it's a full path
    const filename = imagePath.includes('/') ? path.basename(imagePath) : imagePath;
    const filePath = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Image file not found',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the local file path for an image
 */
export function getImagePath(filename: string): string {
  return path.join(IMAGES_DIR, filename);
}

/**
 * Check if an image exists
 */
export function imageExists(filename: string): boolean {
  const filePath = path.join(IMAGES_DIR, filename);
  return fs.existsSync(filePath);
}

/**
 * Get all images for a property
 */
export function getPropertyImages(propertyId: string): string[] {
  if (!fs.existsSync(IMAGES_DIR)) {
    return [];
  }

  return fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => {
      // Check if file starts with propertyId and is an image
      return file.startsWith(`${propertyId}_`) && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file);
    })
    .map((file) => `/api/images/${file}`);
}

/**
 * Delete all images for a property
 */
export function deletePropertyImages(propertyId: string): boolean {
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      return false;
    }

    const files = fs.readdirSync(IMAGES_DIR);
    const propertyFiles = files.filter(
      (file) => file.startsWith(`${propertyId}_`) && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );

    let deletedCount = 0;
    for (const file of propertyFiles) {
      const filePath = path.join(IMAGES_DIR, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    return deletedCount > 0;
  } catch (error) {
    console.error('Error deleting property images:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));

  return {
    totalImages: imageFiles.length,
    totalSize: getDirectorySize(IMAGES_DIR),
  };
}

/**
 * Calculate directory size recursively
 */
function getDirectorySize(dirPath: string): number {
  let totalSize = 0;

  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.error('Error calculating directory size:', error);
  }

  return totalSize;
}
