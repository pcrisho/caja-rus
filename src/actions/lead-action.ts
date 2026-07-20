"use server";

import { prisma } from "@/lib/prisma";

export type SubmitLeadResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

export async function submitLeadAction(
  _prevState: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  try {
    const name = (formData.get("name") as string || "").trim();
    const bodegaName = (formData.get("bodegaName") as string || "").trim();
    const phone = (formData.get("phone") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const currentSystem = (formData.get("currentSystem") as string || "").trim();
    const notes = (formData.get("notes") as string || "").trim();

    const errors: Record<string, string> = {};

    if (!name || name.length < 2) {
      errors.name = "Por favor, ingresa tu nombre completo.";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone || phoneDigits.length < 7) {
      errors.phone = "Por favor, ingresa un celular o WhatsApp válido (mínimo 7 a 9 dígitos).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Por favor, ingresa un correo electrónico válido.";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Revisa los datos ingresados en el formulario.",
        errors,
      };
    }

    await prisma.lead.create({
      data: {
        name,
        bodegaName: bodegaName || null,
        phone,
        email,
        currentSystem: currentSystem || null,
        notes: notes || null,
      },
    });

    return {
      success: true,
      message: "¡Listo! Recibimos tus datos. Nos pondremos en contacto contigo al toque para activar tu demo de CajaRUS.",
    };
  } catch (error) {
    console.error("[submitLeadAction Error]:", error);
    return {
      success: false,
      message: "Ocurrió un inconveniente al enviar tu solicitud. Inténtalo nuevamente o escríbenos directamente.",
    };
  }
}
