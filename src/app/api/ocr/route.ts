import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { visionModel } from "@/lib/ai";
import { auth } from "@/lib/auth";

const invoiceOcrSchema = z.object({
  supplierRuc: z
    .string()
    .describe("RUC del proveedor. 11 dígitos numéricos."),
  supplierName: z
    .string()
    .describe("Razón social o nombre comercial del proveedor."),
  invoiceNumber: z
    .string()
    .describe("Serie y número: F001-00012345 o B120-23423."),
  purchaseDate: z.string().describe("Fecha ISO: YYYY-MM-DD."),
  items: z
    .array(
      z.object({
        rawName: z
          .string()
          .describe("Nombre del producto tal cual en la factura."),
        quantity: z
          .number()
          .describe("Cantidad comprada. Permite decimales (ej. 12.500)."),
        unitCost: z.number().describe("Costo unitario en Soles."),
        totalCost: z.number().describe("Monto total del ítem."),
      })
    )
    .describe("Lista detallada de productos."),
  baseAmount: z
    .number()
    .optional()
    .describe("Base imponible (subtotal antes de IGV)."),
  igvAmount: z
    .number()
    .optional()
    .describe("Monto del IGV si está discriminado."),
  totalAmount: z.number().describe("Monto total final de la factura."),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo administradores" },
      { status: 403 }
    );
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de imagen requerida." },
        { status: 400 }
      );
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("No se pudo descargar la imagen desde R2.");
    }

    const contentType = imageResponse.headers.get("content-type") || "";
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(contentType)
    ) {
      return NextResponse.json(
        { error: "Formato de imagen no soportado. Usa JPEG, PNG o WebP." },
        { status: 400 }
      );
    }

    const contentLength = imageResponse.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen excede el límite de 5MB." },
        { status: 400 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const { object: extractedInvoice } = await generateObject({
      model: visionModel,
      schema: invoiceOcrSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza el comprobante de pago peruano adjunto y extrae todos sus datos respetando las reglas de la SUNAT.",
            },
            {
              type: "image",
              image: imageBuffer,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true, data: extractedInvoice });
  } catch (error: any) {
    console.error("Error en OCR:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error inesperado al procesar la factura.",
      },
      { status: 500 }
    );
  }
}
