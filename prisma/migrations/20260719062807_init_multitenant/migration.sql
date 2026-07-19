-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'CASHIER');

-- CreateEnum
CREATE TYPE "unit_type" AS ENUM ('UNIT', 'KILOGRAM');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'YAPE', 'PLIN', 'CARD', 'MIXED');

-- CreateEnum
CREATE TYPE "sale_status" AS ENUM ('COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "purchase_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "nrus_payment_status" AS ENUM ('PENDING', 'PAID_ON_TIME', 'PAID_LATE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "waste_reason" AS ENUM ('EXPIRED', 'DAMAGED', 'BROKEN', 'LOST', 'STOLEN', 'OTHER');

-- CreateEnum
CREATE TYPE "return_reason" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'CUSTOMER_CHANGED_MIND', 'OTHER');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_account_id" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "email_verified" TIMESTAMPTZ,
    "image" VARCHAR(512),
    "password_hash" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_members" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "user_role" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenant_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "barcode" VARCHAR(50),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "cost_price" DECIMAL(12,4) NOT NULL,
    "selling_price" DECIMAL(12,4) NOT NULL,
    "unit_type" "unit_type" NOT NULL DEFAULT 'UNIT',
    "stock" DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    "min_stock" DECIMAL(10,3) NOT NULL DEFAULT 5.000,
    "image_url" VARCHAR(512),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_adjustments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "reason" "waste_reason" NOT NULL,
    "description" VARCHAR(200),
    "adjusted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waste_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cashier_id" UUID NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "payment_method" NOT NULL DEFAULT 'CASH',
    "status" "sale_status" NOT NULL DEFAULT 'COMPLETED',
    "sale_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMPTZ,
    "cancel_reason" VARCHAR(200),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "total_price" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "supplier_ruc" CHAR(11),
    "supplier_name" VARCHAR(150),
    "invoice_number" VARCHAR(50),
    "total_amount" DECIMAL(10,2) NOT NULL,
    "base_amount" DECIMAL(10,2),
    "igv_amount" DECIMAL(10,2),
    "invoice_image_url" VARCHAR(512),
    "purchase_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "purchase_status" NOT NULL DEFAULT 'CONFIRMED',
    "ocr_raw_data" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "total_cost" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "expense_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_closures" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "cashier_id" UUID NOT NULL,
    "expected_amount" DECIMAL(10,2) NOT NULL,
    "counted_amount" DECIMAL(10,2) NOT NULL,
    "difference" DECIMAL(10,2) NOT NULL,
    "closed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "cash_closures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nrus_monthly_summaries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "total_sales" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_purchases" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "current_category" INTEGER NOT NULL DEFAULT 1,
    "consecutive_excess" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "nrus_monthly_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nrus_payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "summary_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "late_fee" DECIMAL(10,2),
    "status" "nrus_payment_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nrus_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_returns" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sale_id" UUID NOT NULL,
    "processed_by_id" UUID NOT NULL,
    "reason" "return_reason" NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "notes" VARCHAR(200),
    "returned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_return_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "return_id" UUID NOT NULL,
    "sale_item_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "total_amount" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "sale_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenant_members_user_id_is_active_idx" ON "tenant_members"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "tenant_members_tenant_id_is_primary_idx" ON "tenant_members"("tenant_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_members_tenant_id_user_id_key" ON "tenant_members"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "categories_tenant_id_idx" ON "categories"("tenant_id");

-- CreateIndex
CREATE INDEX "categories_tenant_id_name_idx" ON "categories"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenant_id_name_key" ON "categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "products_tenant_id_idx" ON "products"("tenant_id");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_tenant_id_name_idx" ON "products"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_is_active_barcode_idx" ON "products"("is_active", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_id_key" ON "products"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_barcode_key" ON "products"("tenant_id", "barcode");

-- CreateIndex
CREATE INDEX "waste_adjustments_tenant_id_idx" ON "waste_adjustments"("tenant_id");

-- CreateIndex
CREATE INDEX "waste_adjustments_product_id_idx" ON "waste_adjustments"("product_id");

-- CreateIndex
CREATE INDEX "waste_adjustments_tenant_id_admin_id_adjusted_at_idx" ON "waste_adjustments"("tenant_id", "admin_id", "adjusted_at");

-- CreateIndex
CREATE INDEX "sales_tenant_id_idx" ON "sales"("tenant_id");

-- CreateIndex
CREATE INDEX "sales_sale_date_idx" ON "sales"("sale_date");

-- CreateIndex
CREATE INDEX "sales_tenant_id_sale_date_idx" ON "sales"("tenant_id", "sale_date");

-- CreateIndex
CREATE INDEX "sales_tenant_id_cashier_id_sale_date_idx" ON "sales"("tenant_id", "cashier_id", "sale_date");

-- CreateIndex
CREATE UNIQUE INDEX "sales_tenant_id_id_key" ON "sales"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "sale_items_tenant_id_idx" ON "sale_items"("tenant_id");

-- CreateIndex
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items"("sale_id");

-- CreateIndex
CREATE INDEX "sale_items_tenant_id_product_id_idx" ON "sale_items"("tenant_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "sale_items_tenant_id_id_key" ON "sale_items"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "purchases_tenant_id_idx" ON "purchases"("tenant_id");

-- CreateIndex
CREATE INDEX "purchases_purchase_date_idx" ON "purchases"("purchase_date");

-- CreateIndex
CREATE INDEX "purchases_tenant_id_purchase_date_idx" ON "purchases"("tenant_id", "purchase_date");

-- CreateIndex
CREATE INDEX "purchases_tenant_id_admin_id_purchase_date_idx" ON "purchases"("tenant_id", "admin_id", "purchase_date");

-- CreateIndex
CREATE INDEX "purchases_supplier_ruc_idx" ON "purchases"("supplier_ruc");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_tenant_id_id_key" ON "purchases"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "purchase_items_tenant_id_idx" ON "purchase_items"("tenant_id");

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_tenant_id_product_id_idx" ON "purchase_items"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "expenses_tenant_id_idx" ON "expenses"("tenant_id");

-- CreateIndex
CREATE INDEX "expenses_tenant_id_admin_id_expense_date_idx" ON "expenses"("tenant_id", "admin_id", "expense_date");

-- CreateIndex
CREATE INDEX "cash_closures_tenant_id_idx" ON "cash_closures"("tenant_id");

-- CreateIndex
CREATE INDEX "cash_closures_tenant_id_cashier_id_closed_at_idx" ON "cash_closures"("tenant_id", "cashier_id", "closed_at");

-- CreateIndex
CREATE INDEX "nrus_monthly_summaries_tenant_id_idx" ON "nrus_monthly_summaries"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "nrus_monthly_summaries_tenant_id_id_key" ON "nrus_monthly_summaries"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "nrus_monthly_summaries_tenant_id_year_month_key" ON "nrus_monthly_summaries"("tenant_id", "year", "month");

-- CreateIndex
CREATE INDEX "nrus_payments_tenant_id_idx" ON "nrus_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "nrus_payments_summary_id_idx" ON "nrus_payments"("summary_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_user_id_created_at_idx" ON "audit_logs"("tenant_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "sale_returns_tenant_id_idx" ON "sale_returns"("tenant_id");

-- CreateIndex
CREATE INDEX "sale_returns_tenant_id_sale_id_idx" ON "sale_returns"("tenant_id", "sale_id");

-- CreateIndex
CREATE INDEX "sale_returns_tenant_id_processed_by_id_returned_at_idx" ON "sale_returns"("tenant_id", "processed_by_id", "returned_at");

-- CreateIndex
CREATE UNIQUE INDEX "sale_returns_tenant_id_id_key" ON "sale_returns"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "sale_return_items_tenant_id_idx" ON "sale_return_items"("tenant_id");

-- CreateIndex
CREATE INDEX "sale_return_items_return_id_idx" ON "sale_return_items"("return_id");

-- CreateIndex
CREATE INDEX "sale_return_items_tenant_id_sale_item_id_idx" ON "sale_return_items"("tenant_id", "sale_item_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_tenant_id_sale_id_fkey" FOREIGN KEY ("tenant_id", "sale_id") REFERENCES "sales"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_tenant_id_purchase_id_fkey" FOREIGN KEY ("tenant_id", "purchase_id") REFERENCES "purchases"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_closures" ADD CONSTRAINT "cash_closures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_closures" ADD CONSTRAINT "cash_closures_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nrus_monthly_summaries" ADD CONSTRAINT "nrus_monthly_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nrus_payments" ADD CONSTRAINT "nrus_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nrus_payments" ADD CONSTRAINT "nrus_payments_tenant_id_summary_id_fkey" FOREIGN KEY ("tenant_id", "summary_id") REFERENCES "nrus_monthly_summaries"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_tenant_id_sale_id_fkey" FOREIGN KEY ("tenant_id", "sale_id") REFERENCES "sales"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_tenant_id_return_id_fkey" FOREIGN KEY ("tenant_id", "return_id") REFERENCES "sale_returns"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_tenant_id_sale_item_id_fkey" FOREIGN KEY ("tenant_id", "sale_item_id") REFERENCES "sale_items"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ──────────────────────────────────────────────────────────────────────────
-- Hardening manual (no representable en schema.prisma con las herramientas
-- nativas de Prisma 7 — CHECK constraints e índices únicos parciales no
-- tienen equivalente en el DSL de Prisma). Si en el futuro se regenera esta
-- migración desde cero con `prisma migrate dev`, HAY QUE volver a agregar
-- este bloque a mano al final del nuevo .sql; Prisma no lo recreará solo
-- porque no existe en schema.prisma. Ver comentarios relacionados en
-- schema.prisma (WasteAdjustment.quantity, TenantMember.isPrimary, y las
-- notas "cashier/admin" en Sale/Purchase/Expense/CashClosure/AuditLog/
-- SaleReturn).
-- ──────────────────────────────────────────────────────────────────────────

-- CHECK constraints (defensa en profundidad sobre cantidades/stock; ninguna
-- de estas depende de tenant, son invariantes de negocio simples).
ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative" CHECK ("stock" >= 0);
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_quantity_positive" CHECK ("quantity" > 0);

-- Índice único parcial: solo puede haber UNA fila is_primary=true por
-- usuario (la bodega a la que se redirige por defecto). Prisma no soporta
-- `WHERE` en índices únicos, así que este candado vive solo aquí.
CREATE UNIQUE INDEX "tenant_members_one_primary_per_user" ON "tenant_members"("user_id") WHERE "is_primary" = true;

-- FKs compuestas de "membership": garantizan a nivel de BD que el
-- cashier/admin/usuario de cada fila operativa sea (o haya sido) un
-- miembro real de esa bodega — no solo un usuario válido en general. Esto
-- es defensa en profundidad; el control principal sigue siendo que cada
-- Server Action llame a `requireTenantRole(tenantSlug, ...)` (ver
-- src/lib/auth-helpers.ts) antes de escribir.
ALTER TABLE "sales" ADD CONSTRAINT "sales_tenant_id_cashier_id_membership_fkey" FOREIGN KEY ("tenant_id", "cashier_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_tenant_id_admin_id_membership_fkey" FOREIGN KEY ("tenant_id", "admin_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenant_id_admin_id_membership_fkey" FOREIGN KEY ("tenant_id", "admin_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cash_closures" ADD CONSTRAINT "cash_closures_tenant_id_cashier_id_membership_fkey" FOREIGN KEY ("tenant_id", "cashier_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "waste_adjustments" ADD CONSTRAINT "waste_adjustments_tenant_id_admin_id_membership_fkey" FOREIGN KEY ("tenant_id", "admin_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_user_id_membership_fkey" FOREIGN KEY ("tenant_id", "user_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_tenant_id_processed_by_id_membership_fkey" FOREIGN KEY ("tenant_id", "processed_by_id") REFERENCES "tenant_members"("tenant_id", "user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
