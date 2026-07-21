'use server';

import { prisma } from '@/lib/prisma';
import { requireTenantRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/enums';

export async function getTenantMembersAction(tenantSlug: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const members = await prisma.tenantMember.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return { success: true, data: members };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener miembros' };
  }
}

export async function updateMemberRoleAction(tenantSlug: string, memberId: string, role: UserRole) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.tenantMember.findUnique({
        where: { id: memberId }
      });

      if (!member) throw new Error('Miembro no encontrado');
      if (member.tenantId !== auth.tenantId) throw new Error('Miembro no pertenece a esta bodega');
      if (member.userId === auth.userId) throw new Error('No puedes cambiar tu propio rol');

      const updated = await tx.tenantMember.update({
        where: { id: memberId },
        data: { role }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'MEMBER_ROLE_UPDATED',
          entity: 'TenantMember',
          entityId: updated.id,
          metadata: { newRole: role, oldRole: member.role }
        }
      });

      return updated;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el rol' };
  }
}

export async function deactivateMemberAction(tenantSlug: string, memberId: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.tenantMember.findUnique({
        where: { id: memberId }
      });

      if (!member) throw new Error('Miembro no encontrado');
      if (member.tenantId !== auth.tenantId) throw new Error('Miembro no pertenece a esta bodega');
      if (member.userId === auth.userId) throw new Error('No puedes desactivarte a ti mismo');

      const updated = await tx.tenantMember.update({
        where: { id: memberId },
        data: { isActive: false }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'MEMBER_DEACTIVATED',
          entity: 'TenantMember',
          entityId: updated.id
        }
      });

      return updated;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al desactivar al miembro' };
  }
}

export async function updateTenantNameAction(tenantSlug: string, newName: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');
    
    if (!newName || newName.trim() === '') {
      throw new Error('El nombre de la bodega no puede estar vacío');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.tenant.update({
        where: { id: auth.tenantId },
        data: { name: newName.trim() }
      });

      await tx.auditLog.create({
        data: {
          tenantId: auth.tenantId,
          userId: auth.userId,
          action: 'TENANT_NAME_UPDATED',
          entity: 'Tenant',
          entityId: updated.id,
          metadata: { newName: updated.name }
        }
      });

      return updated;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar el nombre de la bodega' };
  }
}
