import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";

export const TENANT_HUB_PATH = "/tenants";

export type TenantContext = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  tenantRole: UserRole;
  isPrimary: boolean;
};

export type TenantMembershipSummary = TenantContext & {
  isActive: boolean;
};

export function slugifyTenantName(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mi-bodega"
  );
}

export function getBootstrapTenantName(): string {
  return process.env.BOOTSTRAP_TENANT_NAME?.trim() || "Mi bodega";
}

export function getBootstrapTenantSlug(): string {
  return slugifyTenantName(getBootstrapTenantName());
}

export function getTenantLandingPath(tenantSlug?: string | null): string {
  return tenantSlug ? `/t/${tenantSlug}/pos` : TENANT_HUB_PATH;
}

export function getTenantHubPath(error?: string): string {
  return error ? `${TENANT_HUB_PATH}?error=${error}` : TENANT_HUB_PATH;
}

export async function getTenantMemberships(
  userId: string
): Promise<TenantMembershipSummary[]> {
  const memberships = await prisma.tenantMember.findMany({
    where: {
      userId,
      tenant: { isActive: true },
    },
    orderBy: [{ isActive: "desc" }, { isPrimary: "desc" }, { createdAt: "asc" }],
    select: {
      role: true,
      isPrimary: true,
      isActive: true,
      tenant: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  return memberships.map((membership) => ({
    tenantId: membership.tenant.id,
    tenantSlug: membership.tenant.slug,
    tenantName: membership.tenant.name,
    tenantRole: membership.role,
    isPrimary: membership.isPrimary,
    isActive: membership.isActive,
  }));
}

export async function getTenantContextBySlug(
  userId: string,
  tenantSlug: string
): Promise<TenantContext | null> {
  const membership = await prisma.tenantMember.findFirst({
    where: {
      userId,
      isActive: true,
      tenant: {
        slug: tenantSlug,
        isActive: true,
      },
    },
    select: {
      role: true,
      isPrimary: true,
      tenant: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  if (!membership) return null;

  return {
    tenantId: membership.tenant.id,
    tenantSlug: membership.tenant.slug,
    tenantName: membership.tenant.name,
    tenantRole: membership.role,
    isPrimary: membership.isPrimary,
  };
}
