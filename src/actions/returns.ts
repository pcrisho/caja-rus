'use server';

import { prisma } from '@/lib/prisma';
import { requireTenantAuth, requireTenantRole } from '@/lib/auth-helpers';
import { ReturnReason } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';

type ReturnItemData = {
  saleItemId: string;
  quantity: number;
  totalAmount: number;
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

export async function searchSaleForReturnAction(tenantSlug: string, query: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    // Si la búsqueda es una cadena, intentar buscar por ID exacto si coincide con formato UUID o traer las últimas ventas
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.trim());

    const sales = await prisma.sale.findMany({
      where: {
        tenantId: auth.tenantId,
        status: 'COMPLETED',
        ...(isUuid ? { id: query.trim() } : {})
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } }
          }
        },
        returns: {
          include: {
            items: true
          }
        }
      },
      take: 10
    });

    return { success: true, data: sales };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al buscar la venta' };
  }
}

export async function createReturnAction(tenantSlug: string, saleId: string, items: ReturnItemData[], reason: ReturnReason, notes?: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN', 'CASHIER');
    
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { tenantId_id: { tenantId: auth.tenantId, id: saleId } },
        include: { items: true, returns: { include: { items: true } } }
      });

      if (!sale) throw new Error('Venta no encontrada');
      if (sale.status !== 'COMPLETED') throw new Error('Solo se pueden devolver ventas completadas');

      let totalReturnAmount = 0;
      const returnItemsToCreate = [];

      for (const reqItem of items) {
        const saleItem = sale.items.find(i => i.id === reqItem.saleItemId);
        if (!saleItem) throw new Error(`Item ${reqItem.saleItemId} no pertenece a esta venta`);

        const alreadyReturnedQty = sale.returns.reduce((acc, r) => {
          const matched = r.items.find(ri => ri.saleItemId === reqItem.saleItemId);
          return acc + (matched ? Number(matched.quantity) : 0);
        }, 0);

        const availableQty = Number(saleItem.quantity) - alreadyReturnedQty;
        if (reqItem.quantity > availableQty) {
          throw new Error(`La cantidad a devolver de un item excede el disponible (${availableQty})`);
        }

        await tx.product.update({
          where: { tenantId_id: { tenantId: auth.tenantId, id: saleItem.productId } },
          data: { stock: { increment: reqItem.quantity } }
        });

        totalReturnAmount += reqItem.totalAmount;
        returnItemsToCreate.push({
          tenantId: auth.tenantId,
          saleItemId: reqItem.saleItemId,
          quantity: reqItem.quantity,
          totalAmount: reqItem.totalAmount
        });
      }

      const saleReturn = await tx.saleReturn.create({
        data: {
          tenantId: auth.tenantId,
          saleId: sale.id,
          processedById: auth.userId,
          reason,
          totalAmount: totalReturnAmount,
          notes,
          items: {
            create: returnItemsToCreate
          }
        }
      });

      // Validar si todos los items han sido devueltos al 100%
      const updatedReturns = [...sale.returns, { items: returnItemsToCreate }];
      let allRefunded = true;
      for (const sItem of sale.items) {
        const returnedQty = updatedReturns.reduce((acc, r) => {
          const matched = r.items.find((ri: any) => ri.saleItemId === sItem.id);
          return acc + (matched ? Number(matched.quantity) : 0);
        }, 0);
        if (returnedQty < Number(sItem.quantity)) {
          allRefunded = false;
          break;
        }
      }

      if (allRefunded) {
        await tx.sale.update({
          where: { tenantId_id: { tenantId: auth.tenantId, id: sale.id } },
          data: { status: 'REFUNDED' }
        });
      }

      // Descontar venta si es del mismo mes
      const now = new Date();
      const saleDate = sale.saleDate;
      if (saleDate.getFullYear() === now.getFullYear() && saleDate.getMonth() === now.getMonth()) {
        await upsertNrusSummary(tx, auth.tenantId, now.getFullYear(), now.getMonth() + 1, -totalReturnAmount);
      }

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'SALE_RETURNED',
          entity: 'SaleReturn',
          entityId: saleReturn.id
        }
      });

      return saleReturn.id;
    }, { isolationLevel: 'Serializable' });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al procesar la devolución' };
  }
}
