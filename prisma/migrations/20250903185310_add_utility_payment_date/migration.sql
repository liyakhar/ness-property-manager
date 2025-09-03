-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "entryDate" DATETIME NOT NULL,
    "exitDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'current',
    "notes" TEXT,
    "receivePaymentDate" DATETIME NOT NULL DEFAULT (strftime('%Y-%m-01', 'now')),
    "utilityPaymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tenants_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tenants" ("apartmentId", "createdAt", "entryDate", "exitDate", "id", "name", "notes", "receivePaymentDate", "status", "updatedAt") SELECT "apartmentId", "createdAt", "entryDate", "exitDate", "id", "name", "notes", "receivePaymentDate", "status", "updatedAt" FROM "tenants";
DROP TABLE "tenants";
ALTER TABLE "new_tenants" RENAME TO "tenants";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
