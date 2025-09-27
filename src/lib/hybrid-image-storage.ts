/**
 * Hybrid Image Storage Solution
 * Uses local storage for development and Vercel Blob for production
 */

import {
  deleteImage as deleteLocal,
  deletePropertyImages as deleteLocalImages,
  getPropertyImages as getLocalImages,
  getStorageStats as getLocalStats,
  STORAGE_CONFIG as LOCAL_CONFIG,
  imageExists as localImageExists,
  uploadImage as uploadLocal,
} from './local-image-storage';
import {
  deleteImage as deleteFromVercel,
  deletePropertyImages as deleteVercelImages,
  getPropertyImages as getVercelImages,
  getStorageStats as getVercelStats,
  uploadImage as uploadToVercel,
  STORAGE_CONFIG as VERCEL_CONFIG,
  imageExists as vercelImageExists,
} from './vercel-blob-storage';

// Check if we're in production (Vercel environment)
const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL === '1';

// Use Vercel Blob in production, local storage in development
export const STORAGE_CONFIG = isProduction ? VERCEL_CONFIG : LOCAL_CONFIG;

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
 * Upload an image using the appropriate storage method
 */
export async function uploadImage(file: File, propertyId: string): Promise<ImageUploadResult> {
  if (isProduction) {
    return uploadToVercel(file, propertyId);
  } else {
    return uploadLocal(file, propertyId);
  }
}

/**
 * Delete an image using the appropriate storage method
 */
export async function deleteImage(imagePath: string): Promise<ImageDeleteResult> {
  if (isProduction) {
    return deleteFromVercel(imagePath);
  } else {
    return deleteLocal(imagePath);
  }
}

/**
 * Get all images for a property using the appropriate storage method
 */
export async function getPropertyImages(propertyId: string): Promise<string[]> {
  if (isProduction) {
    return getVercelImages(propertyId);
  } else {
    return getLocalImages(propertyId);
  }
}

/**
 * Delete all images for a property using the appropriate storage method
 */
export async function deletePropertyImages(propertyId: string): Promise<boolean> {
  if (isProduction) {
    return deleteVercelImages(propertyId);
  } else {
    return deleteLocalImages(propertyId);
  }
}

/**
 * Get storage statistics using the appropriate storage method
 */
export async function getStorageStats() {
  if (isProduction) {
    return getVercelStats();
  } else {
    return getLocalStats();
  }
}

/**
 * Check if an image exists using the appropriate storage method
 */
export function imageExists(imagePath: string): boolean {
  if (isProduction) {
    return vercelImageExists(imagePath);
  } else {
    return localImageExists(imagePath);
  }
}

/**
 * Get the storage method currently being used
 */
export function getStorageMethod(): 'local' | 'vercel' {
  return isProduction ? 'vercel' : 'local';
}
