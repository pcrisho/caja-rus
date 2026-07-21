"use client";
import { useState, useCallback, useTransition } from "react";
import { Search, ScanLine, Camera, ShoppingCart, X } from "lucide-react";
import { Scanner } from "@/components/scanner/Scanner";
import { CartProduct, usePosStore, cartTotal } from "@/store/usePosStore";
import { CartItem } from "@/components/pos/CartItem";
import { PaymentSelector } from "@/components/pos/PaymentSelector";
import { WeightKeypad } from "@/components/pos/WeightKeypad";

type Props = {
  tenantSlug: string;
  initialProducts: CartProduct[];
};

// Importar Server Actions — se resuelven en runtime
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

// Importación dinámica en cliente
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
    activeKgProduct,
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
        // Vibración háptica en dispositivos compatibles
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
      {/* Escáner de código de barras (modal fullscreen) */}
      {showScanner && (
        <Scanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Keypad de peso (modal fullscreen) */}
      <WeightKeypad />

      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-40 rounded-xl p-4 text-base font-semibold ${
            toast.type === "ok"
              ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
              : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          id="pos-search"
          placeholder="Busca por nombre o código de barra..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-4 pl-11 pr-20 text-base bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={() => setShowScanner(true)}
            className="text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg p-2 transition-colors"
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
              className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 rounded-lg p-2 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
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
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-700 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 last:border-0 text-left"
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
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
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
        </div>
      )}

      {results.length === 0 && query && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
          <p className="text-amber-700 dark:text-amber-400 text-base">
            No encontramos &ldquo;{query}&rdquo;. Revisa el nombre o el código de barra.
          </p>
        </div>
      )}

      {/* Carrito */}
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

          {/* Total */}
          <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <p className="text-xl font-bold text-gray-900 dark:text-zinc-50">Total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-zinc-50">
              S/ {total.toFixed(2)}
            </p>
          </div>

          {/* Método de pago */}
          <PaymentSelector total={total} />

          {/* Botón CONFIRMAR */}
          <button
            onClick={handleConfirmSale}
            disabled={isSubmitting || (paymentMethod === "MIXED" && Math.abs(payments.reduce((s,p) => s+p.amount,0) - total) > 0.01)}
            className="w-full bg-emerald-600 text-white rounded-xl py-5 text-xl font-bold hover:bg-emerald-700 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              "Registrando..."
            ) : (
              <>
                <ScanLine size={24} />
                Cobrar S/ {total.toFixed(2)}
              </>
            )}
          </button>
        </section>
      ) : (
        !showResults && (
          <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-8 text-center border border-gray-200 dark:border-zinc-800">
            <ShoppingCart size={48} className="mx-auto mb-3 text-gray-400 dark:text-zinc-500" />
            <p className="text-base font-semibold text-gray-700 dark:text-zinc-300">
              El carrito está vacío
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Busca un producto arriba para agregarlo
            </p>
          </div>
        )
      )}
    </div>
  );
}
