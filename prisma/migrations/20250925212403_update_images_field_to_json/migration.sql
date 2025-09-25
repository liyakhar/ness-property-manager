/*
  Warnings:

  - You are about to alter the column `images` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentNumber" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "readinessStatus" TEXT NOT NULL DEFAULT 'unfurnished',
    "propertyType" TEXT NOT NULL DEFAULT 'rent',
    "occupancyStatus" TEXT NOT NULL DEFAULT 'available',
    "urgentMatter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "apartmentContents" TEXT,
    "images" JSONB
);
INSERT INTO "new_properties" ("apartmentContents", "apartmentNumber", "createdAt", "id", "images", "location", "occupancyStatus", "propertyType", "readinessStatus", "rooms", "updatedAt", "urgentMatter") SELECT "apartmentContents", "apartmentNumber", "createdAt", "id", "images", "location", "occupancyStatus", "propertyType", "readinessStatus", "rooms", "updatedAt", "urgentMatter" FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
CREATE UNIQUE INDEX "properties_apartmentNumber_key" ON "properties"("apartmentNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
