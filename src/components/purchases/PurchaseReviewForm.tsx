'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPurchaseAction, PurchaseItemInput } from '@/actions/purchases';
import { Check, ArrowLeft, Trash2, Plus, Sparkles, Building2, PackagePlus, Link2 } from 'lucide-react';

type ProductOption = {
  id: string;
  name: string;
  barcode: string | null;
  unitType: 'UNIT' | 'KILOGRAM';
  costPrice: number | string;
  sellingPrice: number | string;
  stock: number | string;
};

type SupplierOption = {
  ruc: string;
  name: string;
};

type ItemState = {
  id: string;
  isNewProduct: boolean;
  productId: string;
  name: string;
  barcode: string;
  unitType: 'UNIT' | 'KILOGRAM';
  sellingPrice: string;
  categoryId: string;
  quantity: string;
  unitCost: string;
  totalCost: string;
};

type PurchaseReviewFormProps = {
  tenantSlug: string;
  ocrData: any;
  imageUrl: string | null;
  catalogProducts?: ProductOption[];
  categories?: any[];
  suppliers?: SupplierOption[];
  onCancel: () => void;
};

export function PurchaseReviewForm({
  tenantSlug,
  ocrData,
  imageUrl,
  catalogProducts = [],
  categories = [],
  suppliers = [],
  onCancel,
}: PurchaseReviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    supplierRuc: ocrData.supplierRuc || '',
    supplierName: ocrData.supplierName || '',
    invoiceNumber: ocrData.invoiceNumber || '',
    totalAmount: ocrData.totalAmount ? Number(ocrData.totalAmount).toFixed(2) : '0.00',
  });

  // Map extracted OCR items into form item states with smart product matching
  const [items, setItems] = useState<ItemState[]>(() => {
    const rawItems = ocrData.items || [];
    if (rawItems.length === 0) {
      return [
        {
          id: crypto.randomUUID(),
          isNewProduct: false,
          productId: '',
          name: '',
          barcode: '',
          unitType: 'UNIT',
          sellingPrice: '',
          categoryId: '',
          quantity: '1',
          unitCost: '0.00',
          totalCost: '0.00',
        },
      ];
    }

    return rawItems.map((rawItem: any) => {
      const extractedName = rawItem.name || '';
      // Try to match extracted name against catalog
      const matchedProduct = catalogProducts.find(
        (p) =>
          p.name.toLowerCase() === extractedName.toLowerCase() ||
          p.name.toLowerCase().includes(extractedName.toLowerCase()) ||
          extractedName.toLowerCase().includes(p.name.toLowerCase())
      );

      const qty = rawItem.quantity ? String(rawItem.quantity) : '1';
      const totCost = rawItem.totalPrice ? Number(rawItem.totalPrice).toFixed(2) : '0.00';
      const uCost = rawItem.unitPrice
        ? Number(rawItem.unitPrice).toFixed(2)
        : Number(totCost) > 0 && Number(qty) > 0
        ? (Number(totCost) / Number(qty)).toFixed(2)
        : '0.00';

      if (matchedProduct) {
        return {
          id: crypto.randomUUID(),
          isNewProduct: false,
          productId: matchedProduct.id,
          name: matchedProduct.name,
          barcode: matchedProduct.barcode || '',
          unitType: matchedProduct.unitType,
          sellingPrice: Number(matchedProduct.sellingPrice).toFixed(2),
          categoryId: '',
          quantity: qty,
          unitCost: uCost,
          totalCost: totCost,
        };
      }

      // If no match found, default to new product creation
      const unitCostNum = Number(uCost);
      const suggestedSellingPrice = unitCostNum > 0 ? (unitCostNum * 1.3).toFixed(2) : '';

      return {
        id: crypto.randomUUID(),
        isNewProduct: true,
        productId: '',
        name: extractedName,
        barcode: '',
        unitType: 'UNIT',
        sellingPrice: suggestedSellingPrice,
        categoryId: '',
        quantity: qty,
        unitCost: uCost,
        totalCost: totCost,
      };
    });
  });

  // Supplier RUC lookup helper
  const handleRucChange = (ruc: string) => {
    setFormData((prev) => {
      const match = suppliers.find((s) => s.ruc === ruc.trim());
      return {
        ...prev,
        supplierRuc: ruc,
        supplierName: match ? match.name : prev.supplierName,
      };
    });
  };

  const handleSelectSupplierChip = (supplier: SupplierOption) => {
    setFormData((prev) => ({
      ...prev,
      supplierRuc: supplier.ruc,
      supplierName: supplier.name,
    }));
  };

  const updateItem = (id: string, updates: Partial<ItemState>) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Recalculate costs if quantity or unitCost changed
        if ('quantity' in updates || 'unitCost' in updates) {
          const q = Number(updated.quantity) || 0;
          const uc = Number(updated.unitCost) || 0;
          if (!('totalCost' in updates)) {
            updated.totalCost = (q * uc).toFixed(2);
          }
        } else if ('totalCost' in updates && !('unitCost' in updates)) {
          const q = Number(updated.quantity) || 0;
          const tc = Number(updated.totalCost) || 0;
          if (q > 0) {
            updated.unitCost = (tc / q).toFixed(2);
          }
        }

        return updated;
      })
    );
  };

  const handleSelectCatalogProduct = (id: string, productId: string) => {
    const product = catalogProducts.find((p) => p.id === productId);
    if (!product) return;

    updateItem(id, {
      isNewProduct: false,
      productId: product.id,
      name: product.name,
      barcode: product.barcode || '',
      unitType: product.unitType,
      sellingPrice: Number(product.sellingPrice).toFixed(2),
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        isNewProduct: false,
        productId: '',
        name: '',
        barcode: '',
        unitType: 'UNIT',
        sellingPrice: '',
        categoryId: '',
        quantity: '1',
        unitCost: '0.00',
        totalCost: '0.00',
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const itemsSum = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.isNewProduct && !item.productId) {
        setError(`Ítem ${i + 1}: Debes seleccionar un producto del catálogo o marcarlo como "Nuevo Producto".`);
        setLoading(false);
        return;
      }

      if (item.isNewProduct) {
        if (!item.name.trim()) {
          setError(`Ítem ${i + 1}: Ingrese el nombre del nuevo producto.`);
          setLoading(false);
          return;
        }
        if (!item.sellingPrice || Number(item.sellingPrice) <= 0) {
          setError(`Ítem ${i + 1}: Ingrese un precio de venta válido para "${item.name}".`);
          setLoading(false);
          return;
        }
      }

      if (Number(item.quantity) <= 0) {
        setError(`Ítem ${i + 1}: La cantidad debe ser mayor a 0.`);
        setLoading(false);
        return;
      }
    }

    try {
      const purchaseData = {
        supplierRuc: formData.supplierRuc || undefined,
        supplierName: formData.supplierName || undefined,
        invoiceNumber: formData.invoiceNumber || undefined,
        totalAmount: Number(formData.totalAmount),
        invoiceImageUrl: imageUrl || undefined,
        ocrRawData: ocrData,
      };

      const purchaseItems: PurchaseItemInput[] = items.map((item) => {
        if (item.isNewProduct) {
          return {
            isNewProduct: true,
            newProductData: {
              name: item.name.trim(),
              barcode: item.barcode.trim() || undefined,
              sellingPrice: Number(item.sellingPrice),
              unitType: item.unitType,
              categoryId: item.categoryId || undefined,
            },
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost),
            totalCost: Number(item.totalCost),
          };
        }

        return {
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          totalCost: Number(item.totalCost),
        };
      });

      const res = await createPurchaseAction(tenantSlug, purchaseData, purchaseItems);

      if (res.success) {
        router.push(`/t/${tenantSlug}/purchases`);
        router.refresh();
      } else {
        setError(res.error || 'Error al guardar la compra');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          type="button"
          className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Revisar e Ingresar Compra</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Verifica los datos del comprobante y productos</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Proveedor y Comprobante */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400 font-bold text-xs tracking-wider uppercase border-b border-gray-100 dark:border-zinc-800 pb-2">
            <Building2 size={16} /> Datos del Proveedor y Comprobante
          </div>

          {suppliers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold">Proveedores recientes:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {suppliers.slice(0, 5).map((sup) => (
                  <button
                    key={sup.ruc}
                    type="button"
                    onClick={() => handleSelectSupplierChip(sup)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-900 dark:hover:text-blue-300 border border-gray-200 dark:border-zinc-700 transition-colors"
                  >
                    {sup.name || sup.ruc}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">RUC Proveedor</label>
              <input
                type="text"
                name="supplierRuc"
                maxLength={11}
                placeholder="20123456789"
                value={formData.supplierRuc}
                onChange={(e) => handleRucChange(e.target.value)}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2.5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Comprobante #</label>
              <input
                type="text"
                name="invoiceNumber"
                placeholder="F001-000123"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2.5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Razón Social / Nombre Proveedor</label>
            <input
              type="text"
              name="supplierName"
              placeholder="Distribuidora S.A.C."
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2.5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Monto Total Comprobante (S/)</label>
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                Suma ítems: <strong className={Math.abs(itemsSum - Number(formData.totalAmount)) < 0.05 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>S/ {itemsSum.toFixed(2)}</strong>
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              name="totalAmount"
              required
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 rounded-xl py-3 px-4 text-2xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            />
          </div>
        </div>

        {/* Header Ítems */}
        <div className="flex justify-between items-center px-1">
          <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg">Ítems de Compra ({items.length})</h3>
          <button
            type="button"
            onClick={addItem}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 active:scale-95 transition-transform"
          >
            <Plus size={16} /> AÑADIR ÍTEM
          </button>
        </div>

        {/* Lista de Ítems */}
        <div className="flex flex-col gap-4">
          {items.map((item, index) => {
            const selectedProduct = catalogProducts.find((p) => p.id === item.productId);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
                  <span className="font-bold text-gray-900 dark:text-zinc-50 text-sm flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-900 dark:bg-blue-400 text-white dark:text-zinc-950 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {item.isNewProduct ? (
                      <span className="text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                        <PackagePlus size={14} /> Producto Nuevo
                      </span>
                    ) : (
                      <span className="text-blue-900 dark:text-blue-400 text-xs font-bold flex items-center gap-1">
                        <Link2 size={14} /> Vinculado a Catálogo
                      </span>
                    )}
                  </span>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 dark:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Eliminar ítem"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Modo: Vincular vs Nuevo */}
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { isNewProduct: false })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      !item.isNewProduct
                        ? 'bg-white dark:bg-zinc-900 text-blue-900 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-zinc-400'
                    }`}
                  >
                    <Link2 size={12} /> Catálogo Existente
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { isNewProduct: true })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      item.isNewProduct
                        ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-sm'
                        : 'text-gray-500 dark:text-zinc-400'
                    }`}
                  >
                    <PackagePlus size={12} /> + Crear Nuevo
                  </button>
                </div>

                {!item.isNewProduct ? (
                  /* Vinculado a Catálogo Existente */
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">
                      Seleccionar Producto de Catálogo *
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleSelectCatalogProduct(item.id, e.target.value)}
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2.5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 font-semibold"
                    >
                      <option value="">-- Seleccionar producto --</option>
                      {catalogProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unitType === 'KILOGRAM' ? 'kg' : 'unid'}) - Stock: {Number(p.stock)}
                        </option>
                      ))}
                    </select>

                    {selectedProduct && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-2.5 text-xs text-blue-900 dark:text-blue-300 flex justify-between">
                        <span>Unidad: <strong>{selectedProduct.unitType === 'KILOGRAM' ? 'PESO (kg)' : 'UNIDAD'}</strong></span>
                        <span>Costo actual: <strong>S/ {Number(selectedProduct.costPrice).toFixed(2)}</strong></span>
                        <span>Stock: <strong>{Number(selectedProduct.stock)}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Crear Nuevo Producto Inline */
                  <div className="flex flex-col gap-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Nombre del Producto *</label>
                      <input
                        type="text"
                        placeholder="Ej. Arroz Superior 1kg"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Unidad</label>
                        <select
                          value={item.unitType}
                          onChange={(e) => updateItem(item.id, { unitType: e.target.value as any })}
                          className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2 px-2.5 text-xs font-bold"
                        >
                          <option value="UNIT">UNIDAD (unid)</option>
                          <option value="KILOGRAM">PESO (kg)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">P. Venta (S/) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="S/ 0.00"
                          value={item.sellingPrice}
                          onChange={(e) => updateItem(item.id, { sellingPrice: e.target.value })}
                          className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2 px-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                        />
                      </div>
                    </div>

                    {categories.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Categoría</label>
                        <select
                          value={item.categoryId}
                          onChange={(e) => updateItem(item.id, { categoryId: e.target.value })}
                          className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2 px-2.5 text-xs"
                        >
                          <option value="">Sin categoría</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Cantidad, Costo Unitario y Subtotal */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-500 dark:text-zinc-400 text-xs font-bold tracking-wider uppercase truncate">
                      {item.unitType === 'KILOGRAM' ? 'Cant (kg)' : 'Cant.'}
                    </label>
                    <input
                      type="number"
                      step={item.unitType === 'KILOGRAM' ? '0.001' : '1'}
                      min="0.001"
                      required
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: e.target.value })}
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2 px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-gray-500 dark:text-zinc-400 text-xs font-bold tracking-wider uppercase truncate">
                      {item.unitType === 'KILOGRAM' ? 'Costo/kg' : 'Costo U.'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) => updateItem(item.id, { unitCost: e.target.value })}
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2 px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-gray-500 dark:text-zinc-400 text-xs font-bold tracking-wider uppercase truncate">
                      Subtotal
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={item.totalCost}
                      onChange={(e) => updateItem(item.id, { totalCost: e.target.value })}
                      className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 rounded-xl py-2 px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen Final y Confirmar */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg font-bold hover:bg-emerald-700 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check size={24} />
            {loading ? 'GUARDANDO COMPRA...' : 'CONFIRMAR E INGRESAR COMPRA'}
          </button>
        </div>
      </form>
    </div>
  );
}
