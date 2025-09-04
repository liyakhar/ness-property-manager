-- CreateEnum
CREATE TYPE "public"."ReadinessStatus" AS ENUM ('меблированная', 'немеблированная');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('аренда', 'продажа');

-- CreateEnum
CREATE TYPE "public"."OccupancyStatus" AS ENUM ('занята', 'свободна');

-- CreateEnum
CREATE TYPE "public"."TenantStatus" AS ENUM ('current', 'past', 'future', 'upcoming');

-- CreateTable
CREATE TABLE "public"."properties" (
    "id" TEXT NOT NULL,
    "apartmentNumber" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "readinessStatus" "public"."ReadinessStatus" NOT NULL DEFAULT 'немеблированная',
    "propertyType" "public"."PropertyType" NOT NULL DEFAULT 'аренда',
    "occupancyStatus" "public"."OccupancyStatus" NOT NULL DEFAULT 'свободна',
    "apartmentContents" TEXT,
    "urgentMatter" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "exitDate" TIMESTAMP(3),
    "status" "public"."TenantStatus" NOT NULL DEFAULT 'current',
    "notes" TEXT,
    "receivePaymentDate" TIMESTAMP(3) NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE)),
    "utilityPaymentDate" TIMESTAMP(3),
    "internetPaymentDate" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentAttachment" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."updates" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_apartmentNumber_key" ON "public"."properties"("apartmentNumber");

-- AddForeignKey
ALTER TABLE "public"."tenants" ADD CONSTRAINT "tenants_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
