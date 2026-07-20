'use server';

import { prisma } from '@/lib/prisma';
import { requireTenantAuth, requireTenantRole } from '@/lib/auth-helpers';
import { Prisma } from '@/generated/prisma/client';

type PurchaseItemData = {
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

type PurchaseData = {
  supplierRuc?: string;
  supplierName?: string;
  invoiceNumber?: string;
  totalAmount: number;
  baseAmount?: number;
  igvAmount?: number;
  invoiceImageUrl?: string;
  ocrRawData?: any;
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

export async function createPurchaseAction(tenantSlug: string, data: PurchaseData, items: PurchaseItemData[]) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const purchaseItemsToCreate = items.map(item => ({
        tenantId: auth.tenantId,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost
      }));

      const purchase = await tx.purchase.create({
        data: {
          ...data,
          tenantId: auth.tenantId,
          adminId: auth.userId,
          status: 'CONFIRMED',
          items: {
            create: purchaseItemsToCreate
          }
        }
      });

      for (const item of items) {
        await tx.product.update({
          where: { tenantId_id: { tenantId: auth.tenantId, id: item.productId } },
          data: { stock: { increment: item.quantity } }
        });
      }

      const now = new Date();
      await upsertNrusSummary(tx, auth.tenantId, now.getFullYear(), now.getMonth() + 1, 0, data.totalAmount);

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'PURCHASE_CREATED',
          entity: 'Purchase',
          entityId: purchase.id
        }
      });

      return purchase.id;
    }, { isolationLevel: 'Serializable' });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al registrar la compra' };
  }
}

export async function getPurchasesAction(tenantSlug: string, limit: number = 50) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const purchases = await prisma.purchase.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        items: {
          take: 3,
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { purchaseDate: 'desc' },
      take: limit
    });

    return { success: true, data: purchases };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener compras' };
  }
}

export async function getPurchaseByIdAction(tenantSlug: string, purchaseId: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const purchase = await prisma.purchase.findUnique({
      where: { tenantId_id: { tenantId: auth.tenantId, id: purchaseId } },
      include: {
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    });

    if (!purchase) throw new Error('Compra no encontrada');

    return { success: true, data: purchase };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener detalles de la compra' };
  }
}

export async function cancelPurchaseAction(tenantSlug: string, purchaseId: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { tenantId_id: { tenantId: auth.tenantId, id: purchaseId } },
        include: { items: true }
      });

      if (!purchase) throw new Error('Compra no encontrada');
      if (purchase.status !== 'PENDING') throw new Error('Solo se pueden cancelar compras en estado pendiente');

      const updated = await tx.purchase.update({
        where: { tenantId_id: { tenantId: auth.tenantId, id: purchaseId } },
        data: { status: 'CANCELLED' }
      });

      return updated;
    }, { isolationLevel: 'Serializable' });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al cancelar la compra' };
  }
}
