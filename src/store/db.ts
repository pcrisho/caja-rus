import Dexie, { type EntityTable } from "dexie";

export interface OfflineProduct {
  id: string;
  barcode: string | null;
  name: string;
  sellingPrice: number;
  unitType: "UNIT" | "KILOGRAM";
  stock: number;
  updatedAt: string;
}

export interface PendingSale {
  id: string;
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

db.version(1).stores({
  products: "&id, barcode, name, *updatedAt",
  pendingSales: "&id, synced, saleDate",
});

export { db };
