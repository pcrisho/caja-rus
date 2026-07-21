'use server';

import { prisma } from '@/lib/prisma';
import { requireTenantAuth } from '@/lib/auth-helpers';

export async function getCurrentShiftDataAction(tenantSlug: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const lastClosure = await prisma.cashClosure.findFirst({
      where: { tenantId: auth.tenantId, cashierId: auth.userId },
      orderBy: { closedAt: 'desc' }
    });

    const shiftStart = lastClosure ? lastClosure.closedAt : (() => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return startOfDay;
    })();

    const sales = await prisma.sale.findMany({
      where: {
        tenantId: auth.tenantId,
        cashierId: auth.userId,
        status: 'COMPLETED',
        saleDate: { gte: shiftStart }
      },
      select: {
        totalAmount: true,
        paymentMethod: true
      }
    });

    let expectedAmount = 0;
    const paymentBreakdown: Record<string, number> = {
      CASH: 0,
      YAPE: 0,
      PLIN: 0,
      CARD: 0,
      MIXED: 0
    };

    for (const sale of sales) {
      const amt = Number(sale.totalAmount);
      paymentBreakdown[sale.paymentMethod] += amt;
      if (sale.paymentMethod === 'CASH') {
        expectedAmount += amt;
      }
      // Note: MIXED could contain cash too, but it requires SalePayment to be completely accurate. 
      // If SalePayment doesn't exist, we assume MIXED goes to non-cash or requires manual input for now.
    }

    return {
      success: true,
      data: {
        shiftStart,
        salesCount: sales.length,
        expectedAmount,
        paymentBreakdown
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener datos del turno' };
  }
}

export async function closeCashAction(tenantSlug: string, countedAmount: number, notes?: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const result = await prisma.$transaction(async (tx) => {
      const lastClosure = await tx.cashClosure.findFirst({
        where: { tenantId: auth.tenantId, cashierId: auth.userId },
        orderBy: { closedAt: 'desc' }
      });

      const shiftStart = lastClosure ? lastClosure.closedAt : (() => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return startOfDay;
      })();

      const salesAgg = await tx.sale.aggregate({
        where: {
          tenantId: auth.tenantId,
          cashierId: auth.userId,
          status: 'COMPLETED',
          saleDate: { gte: shiftStart },
          paymentMethod: 'CASH'
        },
        _sum: { totalAmount: true }
      });

      const expectedAmount = Number(salesAgg._sum.totalAmount || 0);
      const difference = countedAmount - expectedAmount;

      const closure = await tx.cashClosure.create({
        data: {
          tenantId: auth.tenantId,
          cashierId: auth.userId,
          expectedAmount,
          countedAmount,
          difference,
          notes
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'CASH_CLOSED',
          entity: 'CashClosure',
          entityId: closure.id,
          metadata: { difference, expectedAmount, countedAmount }
        }
      });

      return closure;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al cerrar caja' };
  }
}

export async function getCashClosureHistoryAction(tenantSlug: string, limit: number = 30) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const closures = await prisma.cashClosure.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        cashier: { select: { name: true } }
      },
      orderBy: { closedAt: 'desc' },
      take: limit
    });

    return { success: true, data: closures };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener historial de cierres' };
  }
}
