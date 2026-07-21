'use server';

import { prisma } from '@/lib/prisma';
import { requireTenantAuth, requireTenantRole } from '@/lib/auth-helpers';
import { NrusPaymentStatus } from '@/generated/prisma/enums';

export async function getDashboardDataAction(tenantSlug: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // NRUS Summary
    const nrusSummary = await prisma.nrusMonthlySummary.findUnique({
      where: { tenantId_year_month: { tenantId: auth.tenantId, year, month } }
    });

    // Expenses of the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    
    const expensesAgg = await prisma.expense.aggregate({
      where: {
        tenantId: auth.tenantId,
        expenseDate: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: { amount: true }
    });
    const totalExpenses = Number(expensesAgg._sum.amount || 0);

    // Sales last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesLast7Days = await prisma.sale.findMany({
      where: {
        tenantId: auth.tenantId,
        status: 'COMPLETED',
        saleDate: { gte: sevenDaysAgo }
      },
      select: {
        totalAmount: true,
        saleDate: true
      }
    });

    const salesByDay = salesLast7Days.reduce((acc, sale) => {
      const dateKey = sale.saleDate.toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + Number(sale.totalAmount);
      return acc;
    }, {} as Record<string, number>);

    // Low stock products
    const lowStockCount = await prisma.product.count({
      where: {
        tenantId: auth.tenantId,
        isActive: true,
        stock: { lte: prisma.product.fields.minStock }
      }
    });

    // Today's sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysSalesAgg = await prisma.sale.aggregate({
      where: {
        tenantId: auth.tenantId,
        status: 'COMPLETED',
        saleDate: { gte: startOfDay, lte: endOfDay }
      },
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    return {
      success: true,
      data: {
        nrusSummary,
        totalExpenses,
        salesByDay,
        lowStockCount,
        todaysSalesCount: todaysSalesAgg._count.id,
        todaysSalesTotal: Number(todaysSalesAgg._sum.totalAmount || 0)
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al cargar el dashboard' };
  }
}

export async function addExpenseAction(tenantSlug: string, description: string, amount: number, category: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          tenantId: auth.tenantId,
          adminId: auth.userId,
          description,
          amount,
          category
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'EXPENSE_CREATED',
          entity: 'Expense',
          entityId: expense.id
        }
      });

      return expense;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al agregar gasto' };
  }
}

export async function getExpensesAction(tenantSlug: string, year: number, month: number) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await prisma.expense.findMany({
      where: {
        tenantId: auth.tenantId,
        expenseDate: { gte: startOfMonth, lte: endOfMonth }
      },
      orderBy: { expenseDate: 'desc' },
      include: {
        admin: { select: { name: true } }
      }
    });

    return { success: true, data: expenses };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener gastos' };
  }
}

export async function markNrusPaymentAction(tenantSlug: string, summaryId: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const summary = await tx.nrusMonthlySummary.findUnique({
        where: { tenantId_id: { tenantId: auth.tenantId, id: summaryId } }
      });

      if (!summary) throw new Error('Resumen NRUS no encontrado');

      // Fechas
      const now = new Date();
      // Dummy logic for due date (first 5 business days). Here we just simulate 5th day of next month.
      const dueDate = new Date(summary.year, summary.month, 5); 
      
      const isLate = now > dueDate;
      let lateFee = 0;
      
      const cuota = summary.currentCategory === 1 ? 20 : summary.currentCategory === 2 ? 50 : 0; // Si es 3 ya perdió NRUS pero asumimos 0

      if (isLate && cuota > 0) {
        const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        // 0.04% diario sobre la cuota
        lateFee = cuota * 0.0004 * daysLate;
      }

      const payment = await tx.nrusPayment.create({
        data: {
          tenantId: auth.tenantId,
          summaryId,
          amount: cuota,
          dueDate,
          paidAt: now,
          lateFee: lateFee > 0 ? lateFee : null,
          status: isLate ? 'PAID_LATE' : 'PAID_ON_TIME'
        }
      });

      return payment;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al registrar pago NRUS' };
  }
}
