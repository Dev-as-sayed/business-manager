-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "shipmentNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "shippingMethod" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "estimatedDeliveryDate" TIMESTAMP(3),
    "actualDeliveryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_items" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "purchaseOrderItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipments_shipmentNumber_key" ON "shipments"("shipmentNumber");

-- CreateIndex
CREATE INDEX "shipments_customerId_idx" ON "shipments"("customerId");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_createdById_idx" ON "shipments"("createdById");

-- CreateIndex
CREATE INDEX "shipments_createdAt_idx" ON "shipments"("createdAt");

-- CreateIndex
CREATE INDEX "shipments_deletedAt_idx" ON "shipments"("deletedAt");

-- CreateIndex
CREATE INDEX "shipment_items_shipmentId_idx" ON "shipment_items"("shipmentId");

-- CreateIndex
CREATE INDEX "shipment_items_purchaseOrderItemId_idx" ON "shipment_items"("purchaseOrderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_items_shipmentId_purchaseOrderItemId_key" ON "shipment_items"("shipmentId", "purchaseOrderItemId");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

