"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantRole } from "@/lib/auth-helpers";
import { UserRole } from "@/generated/prisma/enums";
import crypto from "crypto";

/**
 * Crea una invitación para un nuevo miembro del tenant.
 * Solo ADMIN puede invitar.
 */
export async function createInviteAction(
  tenantSlug: string,
  email: string,
  role: UserRole
) {
  try {
    const auth = await requireTenantRole(tenantSlug, "ADMIN");

    const emailLower = email.trim().toLowerCase();
    if (!emailLower || !emailLower.includes("@")) {
      return { success: false, error: "Ingresa un correo electrónico válido." };
    }

    // Verificar si ya existe un miembro activo con ese email
    const existing = await prisma.tenantMember.findFirst({
      where: {
        tenantId: auth.tenantId,
        isActive: true,
        user: { email: emailLower },
      },
    });
    if (existing) {
      return { success: false, error: "Este usuario ya pertenece a tu bodega." };
    }

    // Verificar si ya hay una invitación pendiente para este email
    const pendingInvite = await prisma.invite.findFirst({
      where: {
        tenantId: auth.tenantId,
        email: emailLower,
        consumed: false,
      },
    });
    if (pendingInvite) {
      return {
        success: false,
        error: "Ya hay una invitación pendiente para este correo.",
      };
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    const invite = await prisma.invite.create({
      data: {
        token,
        email: emailLower,
        role,
        tenantId: auth.tenantId,
        createdBy: auth.userId,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?invite=${token}&email=${encodeURIComponent(emailLower)}`;

    return { success: true, token: invite.token, inviteUrl };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear invitación." };
  }
}

/**
 * Obtiene los datos de una invitación por su token.
 * Usado en la página de registro para validar y pre-llenar.
 */
export async function getInviteByTokenAction(token: string) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        tenant: { select: { name: true } },
      },
    });

    if (!invite || invite.consumed || invite.expiresAt < new Date()) {
      return { success: false, error: "Invitación inválida o expirada." };
    }

    return {
      success: true,
      data: {
        email: invite.email,
        role: invite.role,
        tenantName: invite.tenant.name,
        tenantId: invite.tenantId,
      },
    };
  } catch (error: any) {
    return { success: false, error: "Error al validar invitación." };
  }
}

/**
 * Consume una invitación: vincula al usuario recién registrado al tenant.
 */
export async function consumeInviteAction(token: string, userId: string) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.consumed || invite.expiresAt < new Date()) {
      return { success: false, error: "Invitación inválida o expirada." };
    }

    await prisma.$transaction(async (tx) => {
      // Marcar la invitación como consumida
      await tx.invite.update({
        where: { id: invite.id },
        data: { consumed: true },
      });

      // Crear la membresía del usuario en el tenant
      await tx.tenantMember.create({
        data: {
          tenantId: invite.tenantId,
          userId,
          role: invite.role,
          isActive: true,
          isPrimary: false,
        },
      });
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al consumir invitación." };
  }
}

/**
 * Obtiene las invitaciones pendientes de un tenant.
 */
export async function getPendingInvitesAction(tenantSlug: string) {
  try {
    const auth = await requireTenantRole(tenantSlug, "ADMIN");

    const invites = await prisma.invite.findMany({
      where: {
        tenantId: auth.tenantId,
        consumed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: invites };
  } catch (error: any) {
    return { success: false, error: "Error al cargar invitaciones." };
  }
}
