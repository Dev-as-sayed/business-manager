-- CreateEnum
CREATE TYPE "ConsignmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'PARTIALLY_DELIVERED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ConsignmentProductCategory" AS ENUM ('MOBILE', 'LAPTOP', 'ACCESSORY', 'OTHER');

-- CreateEnum
CREATE TYPE "ConsignmentProductStatus" AS ENUM ('PENDING', 'DELIVERED', 'REFUNDED', 'RETURNED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ConsignmentTransactionMethod" AS ENUM ('CASH', 'BANK', 'MOBILE', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ConsignmentTransactionType" AS ENUM ('ADVANCE', 'PAYMENT', 'REFUND', 'PAY_IN', 'PAY_OUT');

-- CreateEnum
CREATE TYPE "ConsignmentTransactionDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "ConsignmentTransactionParty" AS ENUM ('CUSTOMER', 'SUPPLIER', 'COMPANY');

-- CreateEnum
CREATE TYPE "ConsignmentTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "consignments" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shippingDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "shippingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAdvance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalProductCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSellingPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grossProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "profitMargin" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "totalReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "ConsignmentStatus" NOT NULL DEFAULT 'PENDING',
    "destination" TEXT NOT NULL DEFAULT 'Bangladesh',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "consignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignment_products" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "category" "ConsignmentProductCategory" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "specs" TEXT,
    "buyingPrice" DECIMAL(12,2) NOT NULL,
    "sellingPrice" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalBuyingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalSellingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "ConsignmentProductStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredQuantity" INTEGER NOT NULL DEFAULT 0,
    "refundedQuantity" INTEGER NOT NULL DEFAULT 0,
    "profit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "profitMargin" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consignment_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consignment_transactions" (
    "id" TEXT NOT NULL,
    "consignmentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "ConsignmentTransactionMethod" NOT NULL,
    "type" "ConsignmentTransactionType" NOT NULL,
    "direction" "ConsignmentTransactionDirection" NOT NULL,
    "party" "ConsignmentTransactionParty" NOT NULL,
    "note" TEXT,
    "addById" TEXT,
    "status" "ConsignmentTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consignment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consignments_consignmentId_key" ON "consignments"("consignmentId");

-- CreateIndex
CREATE INDEX "consignments_adminId_idx" ON "consignments"("adminId");

-- CreateIndex
CREATE INDEX "consignments_customerId_idx" ON "consignments"("customerId");

-- CreateIndex
CREATE INDEX "consignments_supplierId_idx" ON "consignments"("supplierId");

-- CreateIndex
CREATE INDEX "consignments_status_idx" ON "consignments"("status");

-- CreateIndex
CREATE INDEX "consignments_createdAt_idx" ON "consignments"("createdAt");

-- CreateIndex
CREATE INDEX "consignments_deletedAt_idx" ON "consignments"("deletedAt");

-- CreateIndex
CREATE INDEX "consignment_products_consignmentId_position_idx" ON "consignment_products"("consignmentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "consignment_transactions_consignmentId_transactionId_key" ON "consignment_transactions"("consignmentId", "transactionId");

-- CreateIndex
CREATE INDEX "consignment_transactions_consignmentId_idx" ON "consignment_transactions"("consignmentId");

-- CreateIndex
CREATE INDEX "consignment_transactions_addById_idx" ON "consignment_transactions"("addById");

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignments" ADD CONSTRAINT "consignments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_products" ADD CONSTRAINT "consignment_products_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "consignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_transactions" ADD CONSTRAINT "consignment_transactions_consignmentId_fkey" FOREIGN KEY ("consignmentId") REFERENCES "consignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consignment_transactions" ADD CONSTRAINT "consignment_transactions_addById_fkey" FOREIGN KEY ("addById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
