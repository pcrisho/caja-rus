import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { visionModel } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getTenantContextBySlug } from "@/lib/tenancy";

const invoiceOcrSchema = z.object({
  supplierRuc: z
    .string()
    .length(11, "El RUC debe tener exactamente 11 dígitos.")
    .regex(/^\d{11}$/, "El RUC debe contener solo dígitos.")
    .describe("RUC del proveedor. 11 dígitos numéricos."),
  supplierName: z
    .string()
    .min(1)
    .describe("Razón social o nombre comercial del proveedor."),
  invoiceNumber: z
    .string()
    .min(1)
    .describe("Serie y número: F001-00012345 o B120-23423."),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido, se espera YYYY-MM-DD.")
    .describe("Fecha ISO: YYYY-MM-DD."),
  items: z
    .array(
      z.object({
        rawName: z
          .string()
          .describe("Nombre del producto tal cual en la factura."),
        quantity: z
          .number()
          .positive()
          .describe("Cantidad comprada. Permite decimales (ej. 12.500)."),
        unitCost: z.number().nonnegative().describe("Costo unitario en Soles."),
        totalCost: z.number().nonnegative().describe("Monto total del ítem."),
      })
    )
    .min(1)
    .describe("Lista detallada de productos."),
  baseAmount: z
    .number()
    .nonnegative()
    .optional()
    .describe("Base imponible (subtotal antes de IGV)."),
  igvAmount: z
    .number()
    .nonnegative()
    .optional()
    .describe("Monto del IGV si está discriminado."),
  totalAmount: z.number().positive().describe("Monto total final de la factura."),
});

// Nota: los montos siguen siendo `number` (float) en este schema porque es lo
// que `generateObject` puede validar de la salida del modelo de IA. Al
// persistir estos valores con Prisma, SIEMPRE convertir explícitamente con
// `new Prisma.Decimal(value.toFixed(2))` en vez de pasar el float crudo, para
// evitar errores de redondeo de punto flotante en montos legalmente
// sensibles (NRUS). Ver docs/audit/informe-auditoria-cajarus.md #5.5.

const OCR_RATE_LIMIT = { limit: 10, windowMs: 5 * 60 * 1000 }; // 10 facturas / 5 min por usuario

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { imageUrl, tenantSlug } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "URL de imagen requerida." },
        { status: 400 }
      );
    }

    if (!tenantSlug || typeof tenantSlug !== "string") {
      return NextResponse.json(
        { error: "Debes indicar la bodega activa." },
        { status: 400 }
      );
    }

    const tenantContext = await getTenantContextBySlug(
      session.user.id,
      tenantSlug
    );

    if (!tenantContext || tenantContext.tenantRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Solo administradores de esa bodega" },
        { status: 403 }
      );
    }

    const rateLimit = checkRateLimit(
      `${tenantContext.tenantId}:${session.user.id}`,
      OCR_RATE_LIMIT
    );
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error:
            "Demasiadas facturas procesadas en poco tiempo. Espera unos minutos e intenta de nuevo.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimit.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Defensa contra SSRF: solo se permite pedir imágenes que ya viven en
    // nuestro propio bucket público de R2. Sin esto, un ADMIN (o una sesión
    // ADMIN comprometida) podría usar el servidor como proxy para sondear
    // la red interna. Ver docs/audit/informe-auditoria-cajarus.md #1.4.
    const r2PublicUrl = process.env.R2_PUBLIC_URL;
    if (!r2PublicUrl || !imageUrl.startsWith(r2PublicUrl)) {
      return NextResponse.json(
        { error: "La imagen debe provenir del almacenamiento de facturas." },
        { status: 400 }
      );
    }

    // Aislamiento multitenant sobre el objeto en R2: el bucket es público y
    // compartido entre TODAS las bodegas (`R2_PUBLIC_URL` es una sola raíz
    // para todo el sistema), así que validar solo el prefijo del bucket no
    // alcanza — un ADMIN de esta bodega podría, en teoría, pasar la URL de
    // una factura subida por OTRA bodega y hacer que el modelo la procese
    // dentro de su propia sesión. Por convención, toda key subida a R2 DEBE
    // vivir bajo `${tenantId}/...` (el flujo de subida de facturas, aún no
    // implementado, debe respetar esto). Aquí se valida ese prefijo de
    // forma estricta (fail-closed): si no hay upload todavía, esta ruta
    // simplemente no dejará pasar ninguna imagen que no siga la convención.
    const imagePath = imageUrl.slice(r2PublicUrl.length).replace(/^\/+/, "");
    const [imageTenantId] = imagePath.split("/");
    if (imageTenantId !== tenantContext.tenantId) {
      return NextResponse.json(
        { error: "La imagen no pertenece a esta bodega." },
        { status: 403 }
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
  } catch (error: unknown) {
    console.error("Error en OCR:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error inesperado al procesar la factura.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
