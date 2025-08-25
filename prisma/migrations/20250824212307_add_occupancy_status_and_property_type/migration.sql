-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentNumber" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "readinessStatus" TEXT NOT NULL DEFAULT 'UNFURNISHED',
    "propertyType" TEXT NOT NULL DEFAULT 'FOR_RENT',
    "occupancyStatus" TEXT NOT NULL DEFAULT 'NOT_OCCUPIED',
    "urgentMatter" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_properties" ("apartmentNumber", "createdAt", "id", "location", "readinessStatus", "rooms", "updatedAt", "urgentMatter") SELECT "apartmentNumber", "createdAt", "id", "location", "readinessStatus", "rooms", "updatedAt", "urgentMatter" FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
CREATE UNIQUE INDEX "properties_apartmentNumber_key" ON "properties"("apartmentNumber");
CREATE TABLE "new_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "entryDate" DATETIME NOT NULL,
    "exitDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'current',
    "notes" TEXT,
    "receivePaymentDate" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-01', 'now')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tenants_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tenants" ("apartmentId", "createdAt", "entryDate", "exitDate", "id", "name", "notes", "receivePaymentDate", "status", "updatedAt") SELECT "apartmentId", "createdAt", "entryDate", "exitDate", "id", "name", "notes", "receivePaymentDate", "status", "updatedAt" FROM "tenants";
DROP TABLE "tenants";
ALTER TABLE "new_tenants" RENAME TO "tenants";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
