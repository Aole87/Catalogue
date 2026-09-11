-- AlterEnum
ALTER TYPE "ShipmentStatus" ADD VALUE 'READY_TO_FULFILL';
ALTER TYPE "ShipmentStatus" ADD VALUE 'PACKING';
ALTER TYPE "ShipmentStatus" ADD VALUE 'READY_TO_SHIP';
ALTER TYPE "ShipmentStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "ShipmentStatus" ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE "ShipmentStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "address_line_1" TEXT,
ADD COLUMN     "address_line_2" TEXT,
ADD COLUMN     "address_snapshot" JSONB,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'TH',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'THB',
ADD COLUMN     "district" TEXT,
ADD COLUMN     "estimated_delivery" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "recipient_name" TEXT,
ADD COLUMN     "service_level" TEXT,
ADD COLUMN     "shipment_number" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "shipping_cost" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "subdistrict" TEXT;

-- AlterTable
ALTER TABLE "shipping_methods" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "estimated_max_days" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "estimated_min_days" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "shipping_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipment_id" UUID NOT NULL,
    "status" "ShipmentStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "provider_event_id" TEXT,
    "actor_id" UUID,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "shipping_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_events_shipment_id_idx" ON "shipping_events"("shipment_id");

-- CreateIndex
CREATE INDEX "shipping_events_status_idx" ON "shipping_events"("status");

-- CreateIndex
CREATE INDEX "shipping_events_occurred_at_idx" ON "shipping_events"("occurred_at");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_provider_idx" ON "shipping_webhook_events"("provider");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_status_idx" ON "shipping_webhook_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_webhook_events_provider_event_id_key" ON "shipping_webhook_events"("provider", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_shipment_number_key" ON "shipments"("shipment_number");

-- CreateIndex
CREATE INDEX "shipments_shipment_number_idx" ON "shipments"("shipment_number");

-- AddForeignKey
ALTER TABLE "shipping_events" ADD CONSTRAINT "shipping_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_events" ADD CONSTRAINT "shipping_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
