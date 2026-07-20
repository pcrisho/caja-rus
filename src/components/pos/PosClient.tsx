"use client";
import { useState, useCallback, useTransition } from "react";
import { Search, ScanLine, X } from "lucide-react";
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

// Importación dinámica en cliente
import("@/actions/sales").then((m) => {
  searchProductsAction = m.searchProductsAction as typeof searchProductsAction;
  createSaleAction = m.createSaleAction as typeof createSaleAction;
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
      {/* Keypad de peso (modal fullscreen) */}
      <WeightKeypad />

      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-40 rounded-xl p-4 text-base font-semibold shadow-sm ${
            toast.type === "ok"
              ? "bg-emerald-100 border border-emerald-200 text-emerald-700"
              : "bg-red-100 border border-red-200 text-red-700"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          id="pos-search"
          placeholder="Busca por nombre o código de barra..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="w-full border-2 border-gray-300 rounded-xl py-4 pl-11 pr-11 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults(initialProducts);
              setShowResults(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label="Limpiar búsqueda"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-0 text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {product.name}
                </p>
                {product.barcode && (
                  <p className="text-sm text-gray-500">{product.barcode}</p>
                )}
              </div>
              <div className="text-right ml-4">
                <p className="text-base font-bold text-emerald-700">
                  S/ {product.sellingPrice.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    product.stock <= 0
                      ? "text-red-600"
                      : product.stock < 5
                      ? "text-amber-700"
                      : "text-gray-500"
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
        <div className="bg-amber-100 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-700 text-base">
            No encontramos &ldquo;{query}&rdquo;. Revisa el nombre o el código de barra.
          </p>
        </div>
      )}

      {/* Carrito */}
      {items.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </p>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 font-medium"
            >
              Vaciar
            </button>
          </div>

          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}

          {/* Total */}
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <p className="text-xl font-bold text-gray-900">Total</p>
            <p className="text-3xl font-bold text-gray-900">
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
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-base font-semibold text-gray-700">
              El carrito está vacío
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Busca un producto arriba para agregarlo
            </p>
          </div>
        )
      )}
    </div>
  );
}
