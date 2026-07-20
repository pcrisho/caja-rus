'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction, deleteProductAction, adjustWasteAction } from '@/actions/products';
import { Trash2, AlertTriangle, Save, ScanBarcode, Image as ImageIcon } from 'lucide-react';

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

  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteData, setWasteData] = useState({ quantity: '', reason: 'EXPIRED', description: '' });
  const [wasteError, setWasteError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSimulateScan = () => {
    setFormData({ ...formData, barcode: Math.floor(Math.random() * 1000000000000).toString() });
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
        router.push(`/t/${tenantSlug}/inventory`);
        router.refresh();
      } else {
        setError(res.error || 'Ocurrió un error al guardar');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
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
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-base">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-gray-100 rounded-xl p-4 flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Nombre del Producto *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              placeholder="Ej. Gaseosa Coca Cola 500ml"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase flex justify-between">
              <span>Código de Barras</span>
              <button type="button" onClick={handleSimulateScan} className="text-emerald-700 flex items-center gap-1">
                <ScanBarcode size={14} /> ESCANEAR
              </button>
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              placeholder="Opcional"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Categoría</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900 bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Costo (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                required
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Venta (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                required
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
          </div>
          
        </div>

        <div className="bg-gray-100 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Unidad de medida</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, unitType: 'UNIT' })}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium border ${formData.unitType === 'UNIT' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                UNIDAD
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, unitType: 'KILOGRAM' })}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium border ${formData.unitType === 'KILOGRAM' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                KILOGRAMO
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Stock actual</label>
              <input
                type="number"
                step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                min="0"
                name="stock"
                required
                value={formData.stock}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Alerta stock min</label>
              <input
                type="number"
                step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                min="0"
                name="minStock"
                required
                value={formData.minStock}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase flex items-center gap-1">
              <ImageIcon size={14} /> URL Imagen (Opcional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl py-4 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:border-blue-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <Save size={24} />
          {isEditing ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
        </button>
      </form>

      {isEditing && (
        <div className="flex flex-col gap-4 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setShowWasteModal(true)}
            className="w-full bg-white border-2 border-amber-600 text-amber-700 rounded-xl py-4 px-6 text-lg font-semibold hover:bg-amber-50 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-gray-900/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-gray-900 font-bold text-xl">Registrar Merma</h3>
            <p className="text-gray-700 text-sm">El producto fue dañado, vencido o robado y debe salir del inventario.</p>
            
            {wasteError && (
              <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
                {wasteError}
              </div>
            )}
            
            <form onSubmit={handleWasteSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Cantidad a retirar</label>
                <input
                  type="number"
                  step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                  min="0.001"
                  required
                  value={wasteData.quantity}
                  onChange={(e) => setWasteData({ ...wasteData, quantity: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:border-amber-600"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Motivo</label>
                <select
                  required
                  value={wasteData.reason}
                  onChange={(e) => setWasteData({ ...wasteData, reason: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:border-amber-600 bg-white"
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
                <label className="text-gray-900 font-bold text-[11px] tracking-wider uppercase">Detalles (Opcional)</label>
                <input
                  type="text"
                  value={wasteData.description}
                  onChange={(e) => setWasteData({ ...wasteData, description: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-xl py-3 px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:border-amber-600"
                />
              </div>
              
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  className="flex-1 bg-white border-2 border-gray-300 rounded-xl py-4 font-semibold text-gray-900 hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer"
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
    </div>
  );
}
