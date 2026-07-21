import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import {
  TENANT_HUB_PATH,
  slugifyTenantName,
  getTenantLandingPath,
  getTenantHubPath,
} from "./tenancy-utils";

export {
  TENANT_HUB_PATH,
  slugifyTenantName,
  getTenantLandingPath,
  getTenantHubPath,
};

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

export function getBootstrapTenantName(): string {
  return process.env.BOOTSTRAP_TENANT_NAME?.trim() || "Mi bodega";
}

export function getBootstrapTenantSlug(): string {
  return slugifyTenantName(getBootstrapTenantName());
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
