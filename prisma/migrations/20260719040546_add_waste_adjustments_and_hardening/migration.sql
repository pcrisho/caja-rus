-- CreateEnum
CREATE TYPE "waste_reason" AS ENUM ('EXPIRED', 'DAMAGED', 'BROKEN', 'LOST', 'STOLEN', 'OTHER');

-- AlterTable
ALTER TABLE "purchase_items" ALTER COLUMN "unit_cost" SET DATA TYPE DECIMAL(12,4),
ALTER COLUMN "total_cost" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "sale_items" ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(12,4),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(12,4);

-- CreateTable
CREATE TABLE "waste_adjustments" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "reason" "waste_reason" NOT NULL,
    "description" VARCHAR(200),
    "adjusted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waste_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waste_adjustments_product_id_idx" ON "waste_adjustments"("product_id");

-- CreateIndex
CREATE INDEX "waste_adjustments_admin_id_adjusted_at_idx" ON "waste_adjustments"("admin_id", "adjusted_at");

-- CreateIndex
CREATE INDEX "nrus_payments_summary_id_idx" ON "nrus_payments"("summary_id");

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_product_id_idx" ON "purchase_items"("product_id");

-- CreateIndex
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items"("sale_id");

-- AddForeignKey
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint (agregado manualmente: Prisma 7 aún no declara CHECK constraints
-- en el schema declarativo, así que se mantienen a nivel de migración SQL).
-- Auditoría #2.5: fija la convención de signo de WasteAdjustment.quantity
-- (siempre positiva = "cantidad removida"), y agrega una red de seguridad a
-- nivel de BD contra bugs de sobreventa/stock negativo (defensa en profundidad
-- junto con SELECT FOR UPDATE + isolationLevel Serializable documentado en
-- docs/03-architecture.md).
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_quantity_positive_check" CHECK ("quantity" > 0);

ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative_check" CHECK ("stock" >= 0);

ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_quantity_positive_check" CHECK ("quantity" > 0);

ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_quantity_positive_check" CHECK ("quantity" > 0);
