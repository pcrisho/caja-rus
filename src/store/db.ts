import Dexie, { type EntityTable } from "dexie";

export interface OfflineProduct {
  id: string;
  tenantId: string;
  barcode: string | null;
  name: string;
  sellingPrice: number;
  unitType: "UNIT" | "KILOGRAM";
  stock: number;
  updatedAt: string;
}

export interface PendingSale {
  id: string;
  tenantId: string;
  cashierId: string;
  paymentMethod: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  saleDate: string;
  synced: boolean;
}

const db = new Dexie("CajaRUSOffline") as Dexie & {
  products: EntityTable<OfflineProduct, "id">;
  pendingSales: EntityTable<PendingSale, "id">;
};

db.version(2).stores({
  products: "&id, tenantId, barcode, name, *updatedAt",
  pendingSales: "&id, tenantId, synced, saleDate",
});

// ──────────────────────────────────────────
// Helpers tenant-scoped
// ──────────────────────────────────────────
//
// Dexie/IndexedDB es una única base local por navegador, compartida entre
// TODAS las bodegas a las que el usuario pertenezca (a diferencia de
// Postgres, donde el aislamiento lo hace el backend). Si un cajero opera
// más de una bodega desde el mismo dispositivo, las tablas `products` y
// `pendingSales` van a tener filas de varias bodegas mezcladas. Estos
// helpers existen para que el código que consuma el store offline nunca
// tenga la opción de "olvidarse" del filtro por tenantId — siempre hay que
// pasarlo explícitamente, igual que con `requireTenantAuth(tenantSlug)` en
// el backend.

export function getProductsForTenant(tenantId: string) {
  return db.products.where("tenantId").equals(tenantId).toArray();
}

export function upsertProductForTenant(product: OfflineProduct) {
  return db.products.put(product);
}

export function getPendingSalesForTenant(tenantId: string, onlyUnsynced = true) {
  return db.pendingSales
    .where("tenantId")
    .equals(tenantId)
    .filter((sale) => !onlyUnsynced || !sale.synced)
    .toArray();
}

export function addPendingSaleForTenant(sale: PendingSale) {
  return db.pendingSales.add(sale);
}

/**
 * Borra únicamente los datos offline de UNA bodega (por ejemplo, al cerrar
 * sesión o cambiar de bodega activa desde el mismo dispositivo). Nunca usar
 * `db.products.clear()` / `db.pendingSales.clear()` directamente para esto:
 * borrarían los datos offline de TODAS las bodegas del usuario en ese
 * dispositivo, no solo la actual.
 */
export async function clearTenantOfflineData(tenantId: string): Promise<void> {
  await db.products.where("tenantId").equals(tenantId).delete();
  await db.pendingSales.where("tenantId").equals(tenantId).delete();
}

export { db };
