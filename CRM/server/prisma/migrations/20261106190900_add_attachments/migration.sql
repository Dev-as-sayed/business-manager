-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'cloudinary',
    "storageKey" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "format" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_entityType_entityId_idx" ON "attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "attachments_uploadedById_idx" ON "attachments"("uploadedById");

-- CreateIndex
CREATE INDEX "attachments_createdAt_idx" ON "attachments"("createdAt");

-- CreateIndex
CREATE INDEX "attachments_deletedAt_idx" ON "attachments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_storageProvider_storageKey_key" ON "attachments"("storageProvider", "storageKey");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

