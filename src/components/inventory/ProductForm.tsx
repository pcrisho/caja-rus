'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction, deleteProductAction, adjustWasteAction } from '@/actions/products';
import { createCategoryAction } from '@/actions/categories';
import { toast } from 'sonner';
import { MASTER_BODEGA_PRODUCTS, MasterProduct } from '@/lib/master-catalog';
import { Trash2, AlertTriangle, Save, Camera, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { Scanner } from '@/components/scanner/Scanner';
import { ImageUploader } from '@/components/inventory/ImageUploader';

type ProductFormProps = {
  tenantSlug: string;
  initialData?: any;
  categories: any[];
};

export function ProductForm({ tenantSlug, initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [localCategories, setLocalCategories] = useState<any[]>(categories);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const [masterQuery, setMasterQuery] = useState('');
  const [showMasterResults, setShowMasterResults] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    barcode: initialData?.barcode || '',
    categoryId: initialData?.categoryId || '',
    costPrice: initialData?.costPrice ? Number(initialData.costPrice).toFixed(2) : '',
    sellingPrice: initialData?.sellingPrice ? Number(initialData.sellingPrice).toFixed(2) : '',
    unitType: initialData?.unitType || 'UNIT',
    stock: initialData?.stock ? Number(initialData.stock).toString() : '',
    minStock: initialData?.minStock ? Number(initialData.minStock).toString() : '5',
    imageUrl: initialData?.imageUrl || '',
  });

  const [showScanner, setShowScanner] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteData, setWasteData] = useState({ quantity: '', reason: 'EXPIRED', description: '' });
  const [wasteError, setWasteError] = useState('');

  const masterFiltered = MASTER_BODEGA_PRODUCTS.filter(p =>
    masterQuery.trim() !== '' &&
    (p.name.toLowerCase().includes(masterQuery.toLowerCase()) ||
     p.barcode.includes(masterQuery.trim()))
  );

  const handleSelectMasterProduct = (item: MasterProduct) => {
    const matchedCategory = localCategories.find(c =>
      c.name.toLowerCase() === item.categoryName.toLowerCase()
    );

    setFormData(prev => ({
      ...prev,
      name: item.name,
      barcode: item.barcode || prev.barcode,
      unitType: item.unitType,
      costPrice: item.suggestedCost ? item.suggestedCost.toFixed(2) : prev.costPrice,
      sellingPrice: item.suggestedPrice ? item.suggestedPrice.toFixed(2) : prev.sellingPrice,
      categoryId: matchedCategory ? matchedCategory.id : prev.categoryId,
    }));

    setMasterQuery('');
    setShowMasterResults(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCategoryLoading(true);
    setCategoryError('');

    try {
      const res = await createCategoryAction(tenantSlug, newCategoryName.trim());
      if (res.success && res.data) {
        setLocalCategories(prev => [...prev, res.data]);
        setFormData(prev => ({ ...prev, categoryId: res.data.id }));
        setNewCategoryName('');
        setShowCategoryModal(false);
      } else {
        setCategoryError(res.error || 'Error al crear la categoría');
      }
    } catch (err: any) {
      setCategoryError(err.message || 'Error al crear la categoría');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBarcodeScanned = (barcode: string) => {
    setShowScanner(false);
    setFormData(prev => ({ ...prev, barcode }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        barcode: formData.barcode || undefined,
        categoryId: formData.categoryId || undefined,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        unitType: formData.unitType as any,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        imageUrl: formData.imageUrl || undefined,
      };

      const res = isEditing
        ? await updateProductAction(tenantSlug, initialData.id, payload)
        : await createProductAction(tenantSlug, payload);

      if (res.success) {
        toast.success(isEditing ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
        router.push(`/t/${tenantSlug}/inventory`);
      } else {
        setError(res.error || 'Ocurrió un error al guardar');
        toast.error(res.error || 'Ocurrió un error al guardar');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      toast.error(err.message || 'Error inesperado');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    const res = await deleteProductAction(tenantSlug, initialData.id);
    if (res.success) {
      router.push(`/t/${tenantSlug}/inventory`);
      router.refresh();
    } else {
      setError(res.error || 'Error al eliminar');
      setLoading(false);
    }
  };

  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setWasteError('');
    
    try {
      const res = await adjustWasteAction(
        tenantSlug, 
        initialData.id, 
        Number(wasteData.quantity), 
        wasteData.reason as any, 
        wasteData.description
      );
      
      if (res.success) {
        setShowWasteModal(false);
        router.refresh();
        // Refresh local stock to avoid full reload just for stock
        setFormData(prev => ({ ...prev, stock: (Number(prev.stock) - Number(wasteData.quantity)).toString() }));
      } else {
        setWasteError(res.error || 'Error al registrar merma');
      }
    } catch (err: any) {
      setWasteError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {showScanner && (
        <Scanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {!isEditing && (
          <div className="relative flex flex-col gap-2 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3">
            <label className="text-blue-900 dark:text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Sugerencias del Catálogo Peruano
            </label>
            <input
              type="text"
              placeholder="Buscar ej. Inca Kola, Gloria, Arroz..."
              value={masterQuery}
              onFocus={() => setShowMasterResults(true)}
              onChange={(e) => {
                setMasterQuery(e.target.value);
                setShowMasterResults(true);
              }}
              className="w-full border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-2.5 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            />

            {showMasterResults && masterFiltered.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-zinc-900 border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-xl max-h-48 overflow-y-auto flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
                {masterFiltered.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMasterProduct(item)}
                    className="p-3 text-left hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-zinc-50">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">{item.categoryName} • {item.unitType === 'KILOGRAM' ? 'Peso' : 'Unidad'}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      S/ {item.suggestedPrice.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Nombre del Producto *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              placeholder="Ej. Gaseosa Coca Cola 500ml"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase flex justify-between">
              <span>Código de Barras</span>
              <button type="button" onClick={() => setShowScanner(true)} className="text-blue-900 dark:text-blue-400 flex items-center gap-1 font-bold">
                <Camera size={14} /> ESCANEAR
              </button>
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              placeholder="Opcional"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Categoría</label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> NUEVA CATEGORÍA
              </button>
            </div>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
            >
              <option value="">Sin categoría</option>
              {localCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Costo (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                required
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Venta (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                required
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
          </div>
          
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Unidad de medida</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, unitType: 'UNIT' })}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium border ${formData.unitType === 'UNIT' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-50'}`}
              >
                UNIDAD
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, unitType: 'KILOGRAM' })}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium border ${formData.unitType === 'KILOGRAM' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-50'}`}
              >
                KILOGRAMO
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Stock actual</label>
              <input
                type="number"
                step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                min="0"
                name="stock"
                required
                value={formData.stock}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Alerta stock min</label>
              <input
                type="number"
                step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                min="0"
                name="minStock"
                required
                value={formData.minStock}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
          </div>
          
          <ImageUploader
            tenantSlug={tenantSlug}
            initialUrl={formData.imageUrl}
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url || '' }))}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Save size={24} />
          )}
          {loading ? 'GUARDANDO...' : (isEditing ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO')}
        </button>
      </form>

      {isEditing && (
        <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-zinc-800 pt-6">
          <button
            type="button"
            onClick={() => setShowWasteModal(true)}
            className="w-full bg-white dark:bg-zinc-900 border-2 border-amber-600 text-amber-700 dark:text-amber-400 rounded-xl py-4 px-6 text-lg font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <AlertTriangle size={24} />
            REGISTRAR MERMA
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Trash2 size={24} />
            ELIMINAR PRODUCTO
          </button>
        </div>
      )}

      {/* Modal / Drawer for Waste */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 dark:bg-black/80 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col gap-4 animate-in">
            <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-xl">Registrar Merma</h3>
            <p className="text-gray-700 dark:text-zinc-300 text-sm">El producto fue dañado, vencido o robado y debe salir del inventario.</p>
            
            {wasteError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-3 rounded-xl text-sm">
                {wasteError}
              </div>
            )}
            
            <form onSubmit={handleWasteSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Cantidad a retirar</label>
                <input
                  type="number"
                  step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                  min="0.001"
                  required
                  value={wasteData.quantity}
                  onChange={(e) => setWasteData({ ...wasteData, quantity: e.target.value })}
                  className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-3 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Motivo</label>
                <select
                  required
                  value={wasteData.reason}
                  onChange={(e) => setWasteData({ ...wasteData, reason: e.target.value })}
                  className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-3 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
                >
                  <option value="EXPIRED">Vencido</option>
                  <option value="DAMAGED">Dañado / Malogrado</option>
                  <option value="BROKEN">Roto</option>
                  <option value="LOST">Perdido</option>
                  <option value="STOLEN">Robado</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">Detalles (Opcional)</label>
                <input
                  type="text"
                  value={wasteData.description}
                  onChange={(e) => setWasteData({ ...wasteData, description: e.target.value })}
                  className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-3 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
                />
              </div>
              
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  className="flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-4 font-semibold text-gray-900 dark:text-zinc-50 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-transform cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-600 text-white rounded-xl py-4 font-semibold hover:bg-amber-700 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                >
                  CONFIRMAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Drawer for New Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-zinc-800 flex flex-col gap-4 animate-in">
            <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg">Nueva Categoría</h3>
            {categoryError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
                {categoryError}
              </div>
            )}
            <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Ej. Verduras, Cigarros, Mascotas"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full border-2 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 rounded-xl py-3 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3 font-semibold text-gray-900 dark:text-zinc-50 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {categoryLoading ? 'GUARDANDO...' : 'CREAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
