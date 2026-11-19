-- CreateEnum
CREATE TYPE "ProductRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWING', 'QUOTED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "product_requests" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProductRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "assignedUserId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_request_items" (
    "id" TEXT NOT NULL,
    "productRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "targetPrice" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_requests_requestNumber_key" ON "product_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "product_requests_customerId_idx" ON "product_requests"("customerId");

-- CreateIndex
CREATE INDEX "product_requests_status_idx" ON "product_requests"("status");

-- CreateIndex
CREATE INDEX "product_requests_assignedUserId_idx" ON "product_requests"("assignedUserId");

-- CreateIndex
CREATE INDEX "product_requests_createdById_idx" ON "product_requests"("createdById");

-- CreateIndex
CREATE INDEX "product_requests_createdAt_idx" ON "product_requests"("createdAt");

-- CreateIndex
CREATE INDEX "product_requests_deletedAt_idx" ON "product_requests"("deletedAt");

-- CreateIndex
CREATE INDEX "product_request_items_productRequestId_idx" ON "product_request_items"("productRequestId");

-- AddForeignKey
ALTER TABLE "product_requests" ADD CONSTRAINT "product_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_requests" ADD CONSTRAINT "product_requests_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_requests" ADD CONSTRAINT "product_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_request_items" ADD CONSTRAINT "product_request_items_productRequestId_fkey" FOREIGN KEY ("productRequestId") REFERENCES "product_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

