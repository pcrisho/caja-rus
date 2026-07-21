"use client";
import { useState, useCallback, useTransition } from "react";
import { Search, Camera, X, ShoppingCart, ScanLine } from "lucide-react";
import { Scanner } from "@/components/scanner/Scanner";
import { CartProduct, usePosStore, cartTotal } from "@/store/usePosStore";
import { CartItem } from "@/components/pos/CartItem";
import { PaymentSelector } from "@/components/pos/PaymentSelector";
import { WeightKeypad } from "@/components/pos/WeightKeypad";
import { DsInputGroup } from "@/components/design-system/DsInputGroup";
import { DsButton } from "@/components/design-system/DsButton";
import { DsAlert } from "@/components/design-system/DsAlert";
import { DsCard } from "@/components/design-system/DsCard";
import { DsEmptyState } from "@/components/design-system/DsEmptyState";

type Props = {
  tenantSlug: string;
  initialProducts: CartProduct[];
};

let searchProductsAction: (
  tenantSlug: string,
  query: string
) => Promise<{ success: boolean; data?: CartProduct[]; error?: string }>;
let createSaleAction: (
  tenantSlug: string,
  items: { productId: string; quantity: number; unitPrice: number; totalPrice: number }[],
  paymentMethod: string,
  payments?: { method: string; amount: number }[]
) => Promise<{ success: boolean; saleId?: string; error?: string }>;
let getProductByBarcodeAction: (
  tenantSlug: string,
  barcode: string
) => Promise<{ success: boolean; data?: CartProduct; error?: string }>;

import("@/actions/sales").then((m) => {
  searchProductsAction = m.searchProductsAction as typeof searchProductsAction;
  createSaleAction = m.createSaleAction as typeof createSaleAction;
  getProductByBarcodeAction = m.getProductByBarcodeAction as typeof getProductByBarcodeAction;
});

export function PosClient({ tenantSlug, initialProducts }: Props) {
  const {
    items,
    paymentMethod,
    payments,
    clearCart,
    addItem,
  } = usePosStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CartProduct[]>(initialProducts);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, startSubmit] = useTransition();
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const total = cartTotal(items);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults(initialProducts);
      setShowResults(false);
      return;
    }
    setShowResults(true);
    if (!searchProductsAction) return;
    const res = await searchProductsAction(tenantSlug, value);
    if (res.success && res.data) setResults(res.data);
  }, [tenantSlug, initialProducts]);

  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    setShowScanner(false);
    if (!getProductByBarcodeAction) return;
    const res = await getProductByBarcodeAction(tenantSlug, barcode);
    if (res.success && res.data) {
      addItem(res.data);
      if (res.data.unitType !== "KILOGRAM") {
        showToast("ok", `${res.data.name} agregado al carrito`);
      }
    } else {
      showToast("err", `Código ${barcode} no encontrado en inventario`);
    }
  }, [tenantSlug, addItem]);

  const handleConfirmSale = () => {
    if (items.length === 0) return;
    if (paymentMethod === "MIXED") {
      const mixedTotal = payments.reduce((s, p) => s + p.amount, 0);
      if (Math.abs(mixedTotal - total) > 0.01) {
        showToast("err", "El monto del pago mixto no coincide con el total.");
        return;
      }
    }
    startSubmit(async () => {
      if (!createSaleAction) return;
      const saleItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        totalPrice: parseFloat((item.product.sellingPrice * item.quantity).toFixed(4)),
      }));
      const res = await createSaleAction(
        tenantSlug,
        saleItems,
        paymentMethod,
        paymentMethod === "MIXED" ? payments : undefined
      );
      if (res.success) {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([50, 30, 50]);
        }
        clearCart();
        setQuery("");
        setResults(initialProducts);
        setShowResults(false);
        showToast("ok", `¡Venta registrada! S/ ${total.toFixed(2)} cobrados.`);
      } else {
        showToast("err", res.error ?? "Error al registrar la venta.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {showScanner && (
        <Scanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      <WeightKeypad />

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-40">
          <DsAlert
            variant={toast.type === "ok" ? "success" : "error"}
            message={toast.msg}
          />
        </div>
      )}

      <DsInputGroup
        leftIcon={<Search size={20} />}
        placeholder="Busca por nombre o código de barra..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowResults(true)}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowScanner(true)}
              className="text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-2 transition-colors"
              aria-label="Escanear código de barras"
            >
              <Camera size={20} />
            </button>
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults(initialProducts);
                  setShowResults(false);
                }}
                className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-2 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X size={20} />
              </button>
            )}
          </div>
        }
      />

      {showResults && results.length > 0 && (
        <DsCard variant="flat" padding="sm">
          {results.slice(0, 8).map((product) => (
            <button
              key={product.id}
              onClick={() => {
                addItem(product);
                if (product.unitType !== "KILOGRAM") {
                  setShowResults(false);
                  setQuery("");
                  setResults(initialProducts);
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white dark:hover:bg-zinc-700 active:bg-white dark:active:bg-zinc-700 border-b border-gray-100 dark:border-zinc-800 last:border-0 text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-zinc-50 truncate">
                  {product.name}
                </p>
                {product.barcode && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{product.barcode}</p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  S/ {product.sellingPrice.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    product.stock <= 0
                      ? "text-red-600 dark:text-red-400"
                      : product.stock < 5
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  {product.unitType === "KILOGRAM"
                    ? `${product.stock.toFixed(3)} kg`
                    : `${product.stock} und`}
                </p>
              </div>
            </button>
          ))}
        </DsCard>
      )}

      {results.length === 0 && query && (
        <DsAlert variant="warning" message={`No encontramos "${query}". Revisa el nombre o el código de barra.`} />
      )}

      {items.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </p>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 dark:text-red-400 font-medium"
            >
              Vaciar
            </button>
          </div>

          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}

          <DsCard variant="flat" padding="sm">
            <div className="flex items-center justify-between p-1">
              <p className="text-xl font-bold text-gray-900 dark:text-zinc-50">Total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-zinc-50 tabular-nums">
                S/ {total.toFixed(2)}
              </p>
            </div>
          </DsCard>

          <PaymentSelector total={total} />

          <DsButton
            onClick={handleConfirmSale}
            disabled={isSubmitting || (paymentMethod === "MIXED" && Math.abs(payments.reduce((s,p) => s+p.amount,0) - total) > 0.01)}
            icon={<ScanLine size={24} />}
          >
            {isSubmitting ? "Registrando..." : `Cobrar S/ ${total.toFixed(2)}`}
          </DsButton>
        </section>
      ) : (
        !showResults && (
          <DsCard variant="flat" padding="lg">
            <DsEmptyState
              icon={<ShoppingCart size={48} className="text-gray-400 dark:text-zinc-500" />}
              title="El carrito está vacío"
              description="Busca un producto arriba para agregarlo"
            />
          </DsCard>
        )
      )}

      {items.length === 0 && (
        <button
          onClick={() => setShowScanner(true)}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-emerald-600 text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Escanear código de barras"
        >
          <Camera size={24} />
        </button>
      )}
    </div>
  );
}
