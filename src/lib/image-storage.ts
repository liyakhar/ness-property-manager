import { getStorageUrl, isSupabaseConfigured, STORAGE_CONFIG, supabase } from './supabase';

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
 * Upload an image to Supabase Storage
 */
export async function uploadImage(file: File, propertyId: string): Promise<ImageUploadResult> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase not configured. Please set environment variables.',
      };
    }

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
    const fileName = `${STORAGE_CONFIG.FOLDER_PREFIX}/${propertyId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    // Get public URL
    const publicUrl = getStorageUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(imagePath: string): Promise<ImageDeleteResult> {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase not configured. Please set environment variables.',
      };
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).remove([imagePath]);

    if (error) {
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }

    return {
      success: true,
    };
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
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(`${STORAGE_CONFIG.FOLDER_PREFIX}/${propertyId}`);

    if (error || !data) {
      console.error('Failed to list images:', error);
      return [];
    }

    return data.map((file) =>
      getStorageUrl(`${STORAGE_CONFIG.FOLDER_PREFIX}/${propertyId}/${file.name}`)
    );
  } catch (error) {
    console.error('Error getting property images:', error);
    return [];
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
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
    const bucketIndex = pathParts.indexOf(STORAGE_CONFIG.BUCKET_NAME);

    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      return null;
    }

    return pathParts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}
