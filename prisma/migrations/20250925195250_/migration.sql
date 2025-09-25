-- CreateTable
CREATE TABLE "properties" (
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
    "images" TEXT
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "entryDate" DATETIME NOT NULL,
    "exitDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'current',
    "notes" TEXT,
    "receivePaymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilityPaymentDate" DATETIME,
    "internetPaymentDate" DATETIME,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentAttachment" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tenants_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_apartmentNumber_key" ON "properties"("apartmentNumber");
