/**
 * Image deduplication utilities for cleaning up existing duplicates
 */

/**
 * Extract hash from a filename pattern: propertyId_hash_timestamp.ext
 */
export function extractHashFromFilename(filename: string): string | null {
  const match = filename.match(/_([a-f0-9]{12})_/);
  return match ? match[1] : null;
}

/**
 * Deduplicate an array of image URLs by keeping only the first occurrence of each unique hash
 */
export function deduplicateImages(imageUrls: string[]): {
  uniqueImages: string[];
  duplicates: string[];
} {
  const seenHashes = new Set<string>();
  const uniqueImages: string[] = [];
  const duplicates: string[] = [];

  for (const url of imageUrls) {
    // Extract hash from URL
    const hash = extractHashFromFilename(url);

    if (!hash) {
      // If no hash found, keep the image (might be old format)
      uniqueImages.push(url);
      continue;
    }

    if (seenHashes.has(hash)) {
      // This is a duplicate
      duplicates.push(url);
    } else {
      // First time seeing this hash
      seenHashes.add(hash);
      uniqueImages.push(url);
    }
  }

  return { uniqueImages, duplicates };
}

/**
 * Clean up duplicate images from a property's image array
 */
export function cleanPropertyImages(images: unknown): string[] {
  if (!images) {
    return [];
  }

  if (!Array.isArray(images)) {
    console.warn('Images is not an array:', images);
    return [];
  }

  // Ensure all items in the array are strings
  const stringImages = images.filter((img): img is string => typeof img === 'string');

  const { uniqueImages } = deduplicateImages(stringImages);
  return uniqueImages;
}

/**
 * Get deduplication statistics for a property
 */
export function getDeduplicationStats(images: string[] | null | undefined): {
  total: number;
  unique: number;
  duplicates: number;
  duplicatePercentage: number;
} {
  if (!images || !Array.isArray(images)) {
    return { total: 0, unique: 0, duplicates: 0, duplicatePercentage: 0 };
  }

  const { uniqueImages, duplicates } = deduplicateImages(images);

  return {
    total: images.length,
    unique: uniqueImages.length,
    duplicates: duplicates.length,
    duplicatePercentage: images.length > 0 ? (duplicates.length / images.length) * 100 : 0,
  };
}
