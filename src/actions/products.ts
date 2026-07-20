'use server';

import { prisma } from '@/lib/prisma';
import { UnitType, WasteReason } from '@/generated/prisma/enums';
import { requireTenantAuth, requireTenantRole } from '@/lib/auth-helpers';
import { Prisma } from '@/generated/prisma/client';

type ProductData = {
  name: string;
  barcode?: string;
  description?: string;
  categoryId?: string;
  costPrice: number;
  sellingPrice: number;
  unitType: UnitType;
  stock: number;
  minStock: number;
  imageUrl?: string;
};

type ProductImportRow = {
  name: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unitType: UnitType;
  categoryId?: string;
};

export async function getProductsAction(tenantSlug: string, options?: { search?: string; categoryId?: string; lowStock?: boolean; page?: number; limit?: number }) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    const { search, categoryId, lowStock, page = 1, limit = 50 } = options || {};
    
    const where: Prisma.ProductWhereInput = {
      tenantId: auth.tenantId,
      isActive: true,
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: search }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (lowStock) {
      where.stock = { lte: prisma.product.fields.minStock };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    return { success: true, data: { products, total, page, limit } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener productos' };
  }
}

export async function getProductByIdAction(tenantSlug: string, productId: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const product = await prisma.product.findUnique({
      where: { tenantId_id: { tenantId: auth.tenantId, id: productId }, isActive: true }
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener el producto' };
  }
}

export async function createProductAction(tenantSlug: string, data: ProductData) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...data,
          tenantId: auth.tenantId
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'PRODUCT_CREATED',
          entity: 'Product',
          entityId: product.id
        }
      });
      return product;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el producto' };
  }
}

export async function updateProductAction(tenantSlug: string, productId: string, data: Partial<ProductData>) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { tenantId_id: { tenantId: auth.tenantId, id: productId } },
        data
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'PRODUCT_UPDATED',
          entity: 'Product',
          entityId: product.id,
          metadata: { changes: Object.keys(data) }
        }
      });
      return product;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el producto' };
  }
}

export async function deleteProductAction(tenantSlug: string, productId: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { tenantId_id: { tenantId: auth.tenantId, id: productId } },
        data: { isActive: false }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'PRODUCT_DELETED',
          entity: 'Product',
          entityId: product.id
        }
      });
      return product;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar el producto' };
  }
}

export async function adjustWasteAction(tenantSlug: string, productId: string, quantity: number, reason: WasteReason, description?: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { tenantId_id: { tenantId: auth.tenantId, id: productId } },
        select: { stock: true }
      });

      if (!product) throw new Error('Producto no encontrado');
      if (Number(product.stock) < quantity) throw new Error('Stock insuficiente para realizar la merma');

      await tx.product.update({
        where: { tenantId_id: { tenantId: auth.tenantId, id: productId } },
        data: { stock: { decrement: quantity } }
      });

      const adjustment = await tx.wasteAdjustment.create({
        data: {
          tenantId: auth.tenantId,
          productId,
          adminId: auth.userId,
          quantity,
          reason,
          description
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'WASTE_ADJUSTED',
          entity: 'WasteAdjustment',
          entityId: adjustment.id
        }
      });

      return adjustment;
    }, { isolationLevel: 'Serializable' });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al ajustar merma' };
  }
}

export async function importProductsCsvAction(tenantSlug: string, rows: ProductImportRow[]) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        try {
          if (row.barcode) {
            const existing = await tx.product.findUnique({
              where: { tenantId_barcode: { tenantId: auth.tenantId, barcode: row.barcode } }
            });
            if (existing) {
              await tx.product.update({
                where: { tenantId_id: { tenantId: auth.tenantId, id: existing.id } },
                data: row
              });
              updated++;
              continue;
            }
          }
          await tx.product.create({
            data: {
              ...row,
              tenantId: auth.tenantId
            }
          });
          created++;
        } catch (e: any) {
          errors.push(`Error en producto ${row.name || row.barcode}: ${e.message}`);
        }
      }
    });

    return { success: true, data: { created, updated, errors } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al importar productos' };
  }
}
