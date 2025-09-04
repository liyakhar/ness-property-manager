/*
  Warnings:

  - You are about to drop the column `utilityPaymentDate` on the `tenants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" ADD COLUMN "apartmentContents" TEXT;

-- RedefineTables
CREATE TABLE "new_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "exitDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'current',
    "notes" TEXT,
    "receivePaymentDate" TIMESTAMP(3) NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE)),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tenants" ("apartmentId", "createdAt", "entryDate", "exitDate", "id", "name", "notes", "receivePaymentDate", "status", "updatedAt") SELECT "apartmentId", "createdAt", "entryDate", "exitDate", "id", "name", "notes", "receivePaymentDate", "status", "updatedAt" FROM "tenants";
DROP TABLE "tenants";
ALTER TABLE "new_tenants" RENAME TO "tenants";
