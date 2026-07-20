-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "bodega_name" VARCHAR(150),
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "current_system" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
