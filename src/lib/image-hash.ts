import { createHash } from 'node:crypto';

/**
 * Generate a hash of the image file data for deduplication
 */
export async function generateImageHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create SHA-256 hash of the file content
  const hash = createHash('sha256');
  hash.update(buffer);

  // Return first 12 characters of the hash for a shorter, readable ID
  return hash.digest('hex').substring(0, 12);
}

/**
 * Generate a unique filename with hash for deduplication
 */
export async function generateUniqueFilename(file: File, propertyId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const hash = await generateImageHash(file);
  const timestamp = Date.now();

  return `${propertyId}_${hash}_${timestamp}.${fileExt}`;
}

/**
 * Check if an image with the same hash already exists for a property
 */
export function findExistingImageByHash(existingImages: string[], hash: string): string | null {
  // Look for existing image URLs that contain the same hash
  return (
    existingImages.find((img) => {
      // Extract hash from filename pattern: propertyId_hash_timestamp.ext
      const match = img.match(/\/([^/]+)_([a-f0-9]{12})_(\d+)\./);
      return match && match[2] === hash;
    }) || null
  );
}
