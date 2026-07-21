'use server';

import { prisma } from '@/lib/prisma';
import { PaymentMethod, SaleStatus } from '@/generated/prisma/enums';
import { requireTenantAuth, requireTenantRole } from '@/lib/auth-helpers';
import { Prisma } from '@/generated/prisma/client';

function serializeProduct(product: any) {
  if (!product) return product;
  return {
    ...product,
    sellingPrice: product.sellingPrice ? Number(product.sellingPrice) : undefined,
    stock: product.stock ? Number(product.stock) : undefined,
  };
}

function serializeSale(sale: any) {
  if (!sale) return sale;
  return {
    ...sale,
    totalAmount: sale.totalAmount ? Number(sale.totalAmount) : undefined,
    items: sale.items?.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  };
}

type SaleItemData = {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type PaymentData = {
  method: PaymentMethod;
  amount: number;
};

async function upsertNrusSummary(tx: Prisma.TransactionClient, tenantId: string, year: number, month: number, salesAmount: number, purchasesAmount: number = 0) {
  const existing = await tx.nrusMonthlySummary.findUnique({
    where: { tenantId_year_month: { tenantId, year, month } }
  });

  const newTotalSales = (existing ? Number(existing.totalSales) : 0) + salesAmount;
  const newTotalPurchases = (existing ? Number(existing.totalPurchases) : 0) + purchasesAmount;
  
  const lMes = Math.max(newTotalSales, newTotalPurchases);
  const currentCategory = lMes <= 5000 ? 1 : lMes <= 8000 ? 2 : 3;
  let consecutiveExcess = existing ? existing.consecutiveExcess : 0;
  
  if (currentCategory === 3 && (!existing || existing.currentCategory !== 3)) {
    consecutiveExcess += 1;
  } else if (currentCategory !== 3) {
    consecutiveExcess = 0;
  }

  await tx.nrusMonthlySummary.upsert({
    where: { tenantId_year_month: { tenantId, year, month } },
    update: {
      totalSales: newTotalSales,
      totalPurchases: newTotalPurchases,
      currentCategory,
      consecutiveExcess
    },
    create: {
      tenantId,
      year,
      month,
      totalSales: newTotalSales,
      totalPurchases: newTotalPurchases,
      currentCategory,
      consecutiveExcess
    }
  });
}

export async function createSaleAction(tenantSlug: string, items: SaleItemData[], paymentMethod: PaymentMethod, payments?: PaymentData[]) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN', 'CASHIER');
    
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const saleItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { tenantId_id: { tenantId: auth.tenantId, id: item.productId } },
          select: { stock: true }
        });

        if (!product) {
          throw new Error(`Producto no encontrado`);
        }
        
        if (Number(product.stock) < item.quantity) {
          throw new Error(`Stock insuficiente para el producto`);
        }

        await tx.product.update({
          where: { tenantId_id: { tenantId: auth.tenantId, id: item.productId } },
          data: { stock: { decrement: item.quantity } }
        });

        totalAmount += item.totalPrice;
        saleItemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        });
      }

      const sale = await tx.sale.create({
        data: {
          tenantId: auth.tenantId,
          cashierId: auth.userId,
          totalAmount,
          paymentMethod,
          status: 'COMPLETED',
          items: {
            create: saleItemsToCreate
          }
        }
      });

      const now = new Date();
      await upsertNrusSummary(tx, auth.tenantId, now.getFullYear(), now.getMonth() + 1, totalAmount);

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'SALE_CREATED',
          entity: 'Sale',
          entityId: sale.id
        }
      });

      return sale.id;
    }, { isolationLevel: 'Serializable' });

    return { success: true, saleId: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Ocurrió un error al crear la venta' };
  }
}

export async function searchProductsAction(tenantSlug: string, query: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const products = await prisma.product.findMany({
      where: {
        tenantId: auth.tenantId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { barcode: query }
        ]
      },
      select: {
        id: true,
        name: true,
        barcode: true,
        sellingPrice: true,
        stock: true,
        unitType: true
      },
      take: 20
    });

    return { success: true, data: products.map(serializeProduct) };
  } catch (error: any) {
    return { success: false, error: 'Ocurrió un error al buscar productos' };
  }
}

export async function getProductByBarcodeAction(tenantSlug: string, barcode: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const product = await prisma.product.findUnique({
      where: {
        tenantId_barcode: {
          tenantId: auth.tenantId,
          barcode
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        barcode: true,
        sellingPrice: true,
        stock: true,
        unitType: true
      }
    });

    return { success: true, data: product ? serializeProduct(product) : undefined };
  } catch (error: any) {
    return { success: false, error: 'Error al buscar el producto' };
  }
}

export async function getSaleHistoryAction(tenantSlug: string, limit: number = 50) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const sales = await prisma.sale.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { saleDate: 'desc' },
      take: limit
    });

    return { success: true, data: sales.map(serializeSale) };
  } catch (error: any) {
    return { success: false, error: 'Error al obtener historial de ventas' };
  }
}

export async function cancelSaleAction(tenantSlug: string, saleId: string, reason: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { tenantId_id: { tenantId: auth.tenantId, id: saleId } },
        include: { items: true }
      });

      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      if (sale.status !== 'COMPLETED') {
        throw new Error('Solo se pueden anular ventas completadas');
      }

      for (const item of sale.items) {
        await tx.product.update({
          where: { tenantId_id: { tenantId: auth.tenantId, id: item.productId } },
          data: { stock: { increment: item.quantity } }
        });
      }

      await tx.sale.update({
        where: { tenantId_id: { tenantId: auth.tenantId, id: saleId } },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason
        }
      });

      const now = sale.saleDate;
      await upsertNrusSummary(tx, auth.tenantId, now.getFullYear(), now.getMonth() + 1, -Number(sale.totalAmount));

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'SALE_CANCELLED',
          entity: 'Sale',
          entityId: sale.id
        }
      });
      return true;
    }, { isolationLevel: 'Serializable' });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al anular la venta' };
  }
}
