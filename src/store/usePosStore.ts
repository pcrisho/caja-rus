"use client";
import { create } from "zustand";

export type CartProduct = {
  id: string;
  name: string;
  barcode: string | null;
  sellingPrice: number;
  stock: number;
  unitType: "UNIT" | "KILOGRAM";
};

export type CartItem = {
  product: CartProduct;
  quantity: number; // para UNIT: entero; para KILOGRAM: decimal con 3 cifras
};

export type PaymentEntry = {
  method: "CASH" | "YAPE" | "PLIN" | "CARD";
  amount: number;
};

type PosState = {
  items: CartItem[];
  paymentMethod: "CASH" | "YAPE" | "PLIN" | "CARD" | "MIXED";
  payments: PaymentEntry[]; // solo usado en MIXED
  weightInput: string; // para el teclado numérico de KG
  activeKgProduct: CartProduct | null; // producto esperando ingreso de peso

  // Acciones
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setPaymentMethod: (method: PosState["paymentMethod"]) => void;
  setPayments: (payments: PaymentEntry[]) => void;
  setWeightInput: (val: string) => void;
  confirmWeight: () => void;
  setActiveKgProduct: (product: CartProduct | null) => void;
};

export const usePosStore = create<PosState>((set, get) => ({
  items: [],
  paymentMethod: "CASH",
  payments: [],
  weightInput: "",
  activeKgProduct: null,

  addItem: (product, quantity = 1) => {
    if (product.unitType === "KILOGRAM") {
      set({ activeKgProduct: product, weightInput: "" });
      return;
    }
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) return state; // no exceder stock
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: newQty } : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity }] };
    });
  },

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () =>
    set({ items: [], paymentMethod: "CASH", payments: [], weightInput: "" }),

  setPaymentMethod: (method) => set({ paymentMethod: method, payments: [] }),

  setPayments: (payments) => set({ payments }),

  setWeightInput: (val) => set({ weightInput: val }),

  confirmWeight: () => {
    const { activeKgProduct, weightInput, items } = get();
    if (!activeKgProduct) return;
    const qty = parseFloat(weightInput);
    if (!qty || qty <= 0 || qty > activeKgProduct.stock) {
      set({ activeKgProduct: null, weightInput: "" });
      return;
    }
    const existing = items.find((i) => i.product.id === activeKgProduct.id);
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.product.id === activeKgProduct.id
            ? { ...i, quantity: Math.min(i.quantity + qty, activeKgProduct.stock) }
            : i
        ),
        activeKgProduct: null,
        weightInput: "",
      }));
    } else {
      set((state) => ({
        items: [...state.items, { product: activeKgProduct, quantity: qty }],
        activeKgProduct: null,
        weightInput: "",
      }));
    }
  },

  setActiveKgProduct: (product) => set({ activeKgProduct: product }),
}));

export function cartTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
}
