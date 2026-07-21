'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from '@/lib/r2';
import { requireTenantRole } from '@/lib/auth-helpers';
import { randomUUID } from 'crypto';

export async function uploadProductImageAction(
  tenantSlug: string,
  base64: string,
  mimeType: string
) {
  try {
    const auth = await requireTenantRole(tenantSlug, 'ADMIN');

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 2 * 1024 * 1024) {
      return { success: false as const, error: 'La imagen excede 2MB después de optimizar.' };
    }

    const ext = mimeType === 'image/png' ? 'png' : 'webp';
    const key = `products/${auth.tenantId}/${randomUUID()}.${ext}`;
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return { success: true as const, url: publicUrl };
  } catch (error: any) {
    return { success: false as const, error: error.message || 'Error al subir la imagen' };
  }
}
