'use server';

import { prisma } from '@/lib/prisma';
import { requireTenantAuth, requireTenantRole } from '@/lib/auth-helpers';

export async function getCategoriesAction(tenantSlug: string) {
  try {
    const auth = await requireTenantAuth(tenantSlug);
    
    const categories = await prisma.category.findMany({
      where: { tenantId: auth.tenantId },
      orderBy: { name: 'asc' }
    });

    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener categorías' };
  }
}

export async function createCategoryAction(tenantSlug: string, name: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const category = await prisma.category.create({
      data: {
        name,
        tenantId: auth.tenantId
      }
    });

    return { success: true, data: category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Ya existe una categoría con ese nombre' };
    }
    return { success: false, error: error.message || 'Error al crear la categoría' };
  }
}

export async function deleteCategoryAction(tenantSlug: string, categoryId: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const count = await prisma.product.count({
      where: { tenantId: auth.tenantId, categoryId, isActive: true }
    });

    if (count > 0) {
      return { success: false, error: 'No se puede eliminar la categoría porque tiene productos activos' };
    }

    const result = await prisma.category.deleteMany({
      where: { id: categoryId, tenantId: auth.tenantId }
    });

    if (result.count === 0) {
      return { success: false, error: 'Categoría no encontrada o sin acceso' };
    }

    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar la categoría' };
  }
}
