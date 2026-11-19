-- CreateEnum
CREATE TYPE "QcStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "qc_reports" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "status" "QcStatus" NOT NULL DEFAULT 'PENDING',
    "inspectionDate" TIMESTAMP(3),
    "notes" TEXT,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdById" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "qc_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qc_reports_reportNumber_key" ON "qc_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "qc_reports_purchaseOrderId_idx" ON "qc_reports"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "qc_reports_customerId_idx" ON "qc_reports"("customerId");

-- CreateIndex
CREATE INDEX "qc_reports_supplierId_idx" ON "qc_reports"("supplierId");

-- CreateIndex
CREATE INDEX "qc_reports_inspectorId_idx" ON "qc_reports"("inspectorId");

-- CreateIndex
CREATE INDEX "qc_reports_status_idx" ON "qc_reports"("status");

-- CreateIndex
CREATE INDEX "qc_reports_createdAt_idx" ON "qc_reports"("createdAt");

-- CreateIndex
CREATE INDEX "qc_reports_deletedAt_idx" ON "qc_reports"("deletedAt");

-- AddForeignKey
ALTER TABLE "qc_reports" ADD CONSTRAINT "qc_reports_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_reports" ADD CONSTRAINT "qc_reports_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_reports" ADD CONSTRAINT "qc_reports_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_reports" ADD CONSTRAINT "qc_reports_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_reports" ADD CONSTRAINT "qc_reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

