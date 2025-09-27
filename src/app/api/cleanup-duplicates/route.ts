import { NextResponse } from 'next/server';
import { cleanPropertyImages, getDeduplicationStats } from '@/lib/image-deduplication';
import { prisma } from '@/lib/prisma';

/**
 * API endpoint to clean up duplicate images from all properties
 * This is useful for cleaning up existing duplicates
 */
export async function POST() {
  try {
    console.log('Starting duplicate cleanup process...');

    // Get all properties
    const properties = await prisma.property.findMany({
      select: { id: true, images: true },
    });

    let totalCleaned = 0;
    let propertiesUpdated = 0;
    const cleanupStats = [];

    for (const property of properties) {
      const images = property.images as string[] | null;
      if (!images || !Array.isArray(images)) {
        continue;
      }

      const stats = getDeduplicationStats(images);

      if (stats.duplicates > 0) {
        const cleanedImages = cleanPropertyImages(images);

        // Update the property with cleaned images
        await prisma.property.update({
          where: { id: property.id },
          data: { images: cleanedImages },
        });

        totalCleaned += stats.duplicates;
        propertiesUpdated++;
        cleanupStats.push({
          propertyId: property.id,
          before: stats.total,
          after: stats.unique,
          duplicates: stats.duplicates,
        });

        console.log(`Property ${property.id}: cleaned ${stats.duplicates} duplicates`);
      }
    }

    console.log(
      `Cleanup completed: ${totalCleaned} duplicates removed from ${propertiesUpdated} properties`
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${totalCleaned} duplicate images from ${propertiesUpdated} properties`,
      stats: {
        totalDuplicatesRemoved: totalCleaned,
        propertiesUpdated,
        cleanupStats,
      },
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clean up duplicates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get statistics about duplicates across all properties
 */
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      select: { id: true, images: true },
    });

    let totalImages = 0;
    let totalDuplicates = 0;
    const propertyStats = [];

    for (const property of properties) {
      const images = property.images as string[] | null;
      if (!images || !Array.isArray(images)) {
        continue;
      }

      const stats = getDeduplicationStats(images);
      totalImages += stats.total;
      totalDuplicates += stats.duplicates;

      if (stats.duplicates > 0) {
        propertyStats.push({
          propertyId: property.id,
          totalImages: stats.total,
          uniqueImages: stats.unique,
          duplicates: stats.duplicates,
          duplicatePercentage: stats.duplicatePercentage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties: properties.length,
        totalImages,
        totalDuplicates,
        duplicatePercentage: totalImages > 0 ? (totalDuplicates / totalImages) * 100 : 0,
        propertiesWithDuplicates: propertyStats.length,
        propertyStats,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get duplicate statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
