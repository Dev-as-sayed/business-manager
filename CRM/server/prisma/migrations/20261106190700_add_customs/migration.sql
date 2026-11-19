-- CreateEnum
CREATE TYPE "CustomsStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'CLEARED', 'HELD', 'CANCELLED');

-- CreateTable
CREATE TABLE "customs_records" (
    "id" TEXT NOT NULL,
    "recordNumber" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "supplierId" TEXT,
    "status" "CustomsStatus" NOT NULL DEFAULT 'PENDING',
    "declarationNumber" TEXT,
    "customsOffice" TEXT,
    "country" TEXT,
    "dutyAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "otherFees" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1,
    "clearanceDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),
    "heldAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customs_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customs_records_recordNumber_key" ON "customs_records"("recordNumber");

-- CreateIndex
CREATE INDEX "customs_records_shipmentId_idx" ON "customs_records"("shipmentId");

-- CreateIndex
CREATE INDEX "customs_records_customerId_idx" ON "customs_records"("customerId");

-- CreateIndex
CREATE INDEX "customs_records_supplierId_idx" ON "customs_records"("supplierId");

-- CreateIndex
CREATE INDEX "customs_records_status_idx" ON "customs_records"("status");

-- CreateIndex
CREATE INDEX "customs_records_createdById_idx" ON "customs_records"("createdById");

-- CreateIndex
CREATE INDEX "customs_records_updatedById_idx" ON "customs_records"("updatedById");

-- CreateIndex
CREATE INDEX "customs_records_createdAt_idx" ON "customs_records"("createdAt");

-- CreateIndex
CREATE INDEX "customs_records_deletedAt_idx" ON "customs_records"("deletedAt");

-- AddForeignKey
ALTER TABLE "customs_records" ADD CONSTRAINT "customs_records_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customs_records" ADD CONSTRAINT "customs_records_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customs_records" ADD CONSTRAINT "customs_records_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customs_records" ADD CONSTRAINT "customs_records_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customs_records" ADD CONSTRAINT "customs_records_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

