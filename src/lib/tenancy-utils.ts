export const TENANT_HUB_PATH = "/tenants";

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

export function getTenantLandingPath(tenantSlug?: string | null): string {
  return tenantSlug ? `/t/${tenantSlug}/pos` : TENANT_HUB_PATH;
}

export function getTenantHubPath(error?: string): string {
  return error ? `${TENANT_HUB_PATH}?error=${error}` : TENANT_HUB_PATH;
}
