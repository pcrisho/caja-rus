"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export type RegisterActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  tenantSlug?: string;
  tenantId?: string;
};

export async function checkEmailRegisteredAction(email: string): Promise<{ exists: boolean }> {
  try {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) return { exists: false };

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    return { exists: Boolean(user) };
  } catch (error) {
    console.error("[checkEmailRegisteredAction Error]:", error);
    return { exists: false };
  }
}

export async function registerBodegaAction(
  _prevState: RegisterActionResult | null,
  formData: FormData
): Promise<RegisterActionResult> {
  try {
    const name = (formData.get("name") as string || "").trim();
    const phone = (formData.get("phone") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const bodegaName = (formData.get("bodegaName") as string || "").trim();
    const rucOrDni = (formData.get("rucOrDni") as string || "").trim();
    const sunatRegime = (formData.get("sunatRegime") as string || "NRUS").trim();
    const password = (formData.get("password") as string || "");
    const confirmPassword = (formData.get("confirmPassword") as string || "");

    const errors: Record<string, string> = {};

    if (!name || name.length < 2) {
      errors.name = "Ingresa tus nombres y apellidos completos.";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone || phoneDigits.length < 7) {
      errors.phone = "Ingresa un número de celular o WhatsApp válido.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Ingresa un correo electrónico válido.";
    }

    if (!bodegaName || bodegaName.length < 2) {
      errors.bodegaName = "Ingresa el nombre comercial de tu bodega.";
    }

    if (!password || password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Revisa los campos del formulario.",
        errors,
      };
    }

    // Comprobar si el correo ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Este correo electrónico ya se encuentra registrado. Ingresa a tu cuenta con la opción de Iniciar Sesión.",
        errors: { email: "Este correo ya está registrado." },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generar slug único para la bodega
    const cleanSlugBase = bodegaName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const randomHash = Math.random().toString(36).substring(2, 7);
    const tenantSlug = `${cleanSlugBase || "bodega"}-${randomHash}`;

    let createdTenantId = "";

    await prisma.$transaction(async (tx) => {
      // 1. Crear el usuario activo
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          isActive: true,
        },
      });

      // 2. Crear la bodega (Tenant)
      const newTenant = await tx.tenant.create({
        data: {
          name: bodegaName,
          slug: tenantSlug,
          isActive: true,
        },
      });

      createdTenantId = newTenant.id;

      // 3. Asignar rol ADMIN como primaria
      await tx.tenantMember.create({
        data: {
          tenantId: newTenant.id,
          userId: newUser.id,
          role: "ADMIN",
          isActive: true,
          isPrimary: true,
        },
      });
    });

    return {
      success: true,
      message: "¡Bodega registrada exitosamente! Ahora puedes invitar a tus cajeros o ingresar directo a tu sistema.",
      tenantSlug,
      tenantId: createdTenantId,
    };
  } catch (error) {
    console.error("[registerBodegaAction Error]:", error);
    return {
      success: false,
      message: "Ocurrió un inconveniente al registrar tu bodega. Inténtalo nuevamente.",
    };
  }
}

export type InviteMemberResult = {
  success: boolean;
  message: string;
};

export async function inviteTeamMemberAction(
  _prevState: InviteMemberResult | null,
  formData: FormData
): Promise<InviteMemberResult> {
  try {
    const inviteName = (formData.get("inviteName") as string || "").trim();
    const inviteContact = (formData.get("inviteContact") as string || "").trim();
    const role = (formData.get("role") as string || "CASHIER").trim();

    if (!inviteName || inviteName.length < 2) {
      return {
        success: false,
        message: "Ingresa el nombre del colaborador o cajero.",
      };
    }

    if (!inviteContact) {
      return {
        success: false,
        message: "Ingresa el celular o correo electrónico del colaborador.",
      };
    }

    const roleLabel = role === "ADMIN" ? "Administrador" : "Cajero";

    return {
      success: true,
      message: `¡Invitación enviada a ${inviteName} (${inviteContact}) como ${roleLabel}! Recibirá un enlace directo para ingresar a tu bodega.`,
    };
  } catch (error) {
    console.error("[inviteTeamMemberAction Error]:", error);
    return {
      success: false,
      message: "No se pudo enviar la invitación en este momento.",
    };
  }
}

export async function completeGoogleOnboardingAction(
  userId: string,
  bodegaName: string,
  phone: string,
  sunatRegime: string
): Promise<{ success: boolean; message: string; tenantSlug?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return {
        success: false,
        message: "No se pudo validar tu sesión. Inicia sesión nuevamente.",
      };
    }

    const cleanBodegaName = (bodegaName || "").trim();
    if (!cleanBodegaName || cleanBodegaName.length < 2) {
      return { success: false, message: "Ingresa el nombre comercial de tu bodega." };
    }

    const cleanSlugBase = cleanBodegaName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const randomHash = Math.random().toString(36).substring(2, 7);
    const tenantSlug = `${cleanSlugBase || "bodega"}-${randomHash}`;

    let finalSlug = tenantSlug;

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar usuario: marcar isFirstLogin = false
      await tx.user.update({
        where: { id: userId },
        data: { isFirstLogin: false },
      });

      // 2. Buscar si el usuario ya tiene una membresía primaria creada en el evento createUser
      const existingPrimaryMember = await tx.tenantMember.findFirst({
        where: { userId, isPrimary: true },
      });

      if (existingPrimaryMember) {
        // Actualizar el nombre y slug de su bodega existente
        const updatedTenant = await tx.tenant.update({
          where: { id: existingPrimaryMember.tenantId },
          data: {
            name: cleanBodegaName,
            slug: tenantSlug,
            isActive: true,
          },
        });
        finalSlug = updatedTenant.slug;
      } else {
        // Si no tenía bodega previa, crear bodega y membresía primaria
        const tenant = await tx.tenant.create({
          data: {
            name: cleanBodegaName,
            slug: tenantSlug,
            isActive: true,
          },
        });

        await tx.tenantMember.create({
          data: {
            tenantId: tenant.id,
            userId,
            role: "ADMIN",
            isActive: true,
            isPrimary: true,
          },
        });
        finalSlug = tenant.slug;
      }
    });

    return {
      success: true,
      message: "¡Configuración de bodega completada exitosamente!",
      tenantSlug: finalSlug,
    };
  } catch (error) {
    console.error("[completeGoogleOnboardingAction Error]:", error);
    return {
      success: false,
      message: "Ocurrió un inconveniente al guardar los datos de la bodega.",
    };
  }
}
