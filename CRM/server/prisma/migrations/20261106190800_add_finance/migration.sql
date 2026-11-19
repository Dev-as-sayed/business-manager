-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('REVENUE', 'COST', 'PAYMENT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LedgerEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'VOID');

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "shipmentId" TEXT,
    "customerId" TEXT,
    "supplierId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "status" "LedgerEntryStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1,
    "amountInBaseCurrency" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_entryNumber_key" ON "ledger_entries"("entryNumber");

-- CreateIndex
CREATE INDEX "ledger_entries_purchaseOrderId_idx" ON "ledger_entries"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "ledger_entries_shipmentId_idx" ON "ledger_entries"("shipmentId");

-- CreateIndex
CREATE INDEX "ledger_entries_customerId_idx" ON "ledger_entries"("customerId");

-- CreateIndex
CREATE INDEX "ledger_entries_supplierId_idx" ON "ledger_entries"("supplierId");

-- CreateIndex
CREATE INDEX "ledger_entries_type_idx" ON "ledger_entries"("type");

-- CreateIndex
CREATE INDEX "ledger_entries_status_idx" ON "ledger_entries"("status");

-- CreateIndex
CREATE INDEX "ledger_entries_occurredAt_idx" ON "ledger_entries"("occurredAt");

-- CreateIndex
CREATE INDEX "ledger_entries_createdById_idx" ON "ledger_entries"("createdById");

-- CreateIndex
CREATE INDEX "ledger_entries_approvedById_idx" ON "ledger_entries"("approvedById");

-- CreateIndex
CREATE INDEX "ledger_entries_createdAt_idx" ON "ledger_entries"("createdAt");

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

