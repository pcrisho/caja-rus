'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction, deleteProductAction, adjustWasteAction } from '@/actions/products';
import { createCategoryAction } from '@/actions/categories';
import { toast } from 'sonner';
import { MASTER_BODEGA_PRODUCTS, MasterProduct } from '@/lib/master-catalog';
import { Trash2, AlertTriangle, Save, Camera, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Scanner } from '@/components/scanner/Scanner';
import { ImageUploader } from '@/components/inventory/ImageUploader';
import { DsInput } from '@/components/design-system/DsInput';
import { DsButton } from '@/components/design-system/DsButton';
import { DsAlert } from '@/components/design-system/DsAlert';
import { DsCard } from '@/components/design-system/DsCard';
import { DsRadioGroup } from '@/components/design-system/DsRadioGroup';
import { DsModal } from '@/components/design-system/DsModal';
import { DsTextarea } from '@/components/design-system/DsTextarea';

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
          <div className="flex flex-col gap-2 bg-blue-50/60 dark:bg-blue-950/20 p-3">
            <label className="text-blue-900 dark:text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} /> Sugerencias del Catálogo Peruano
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 border-b border-blue-300 dark:border-blue-700 focus-within:border-blue-900 transition-colors">
                <input
                  type="text"
                  placeholder="Buscar ej. Inca Kola, Gloria, Arroz..."
                  value={masterQuery}
                  onFocus={() => setShowMasterResults(true)}
                  onChange={(e) => {
                    setMasterQuery(e.target.value);
                    setShowMasterResults(true);
                  }}
                  className="flex-1 bg-transparent py-2.5 text-sm text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none"
                />
              </div>

              {showMasterResults && masterFiltered.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-zinc-900 max-h-48 overflow-y-auto flex flex-col">
                  {masterFiltered.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectMasterProduct(item)}
                      className="p-3 text-left hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-zinc-50">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{item.categoryName} • {item.unitType === 'KILOGRAM' ? 'Peso' : 'Unidad'}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        S/ {item.suggestedPrice.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DsCard>
          <div className="flex flex-col gap-4">
            <DsInput
              label="Nombre del Producto"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Gaseosa Coca Cola 500ml"
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Código de Barras
                </label>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="text-blue-900 dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <Camera size={14} /> ESCANEAR
                </button>
              </div>
              <DsInput
                label=""
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Categoría
                </label>
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
                className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-zinc-700 py-3 pr-8 text-base text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
              >
                <option value="">Sin categoría</option>
                {localCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <DsInput
                label="Costo (S/)"
                name="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
              />
              <DsInput
                label="Venta (S/)"
                name="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
        </DsCard>

        <DsCard>
          <div className="flex flex-col gap-4">
            <DsRadioGroup
              name="unitType"
              label="Unidad de medida"
              options={[
                { value: "UNIT", label: "UNIDAD" },
                { value: "KILOGRAM", label: "KILOGRAMO" },
              ]}
              value={formData.unitType}
              onChange={(val) => setFormData(prev => ({ ...prev, unitType: val }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <DsInput
                label="Stock actual"
                name="stock"
                type="number"
                step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
              />
              <DsInput
                label="Alerta stock min"
                name="minStock"
                type="number"
                step={formData.unitType === 'UNIT' ? '1' : '0.001'}
                min="0"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
            
            <ImageUploader
              tenantSlug={tenantSlug}
              initialUrl={formData.imageUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url || '' }))}
            />
          </div>
        </DsCard>

        {error && <DsAlert variant="error" message={error} />}

        <DsButton type="submit" disabled={loading}>
          {loading ? 'GUARDANDO...' : (isEditing ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO')}
        </DsButton>
      </form>

      {isEditing && (
        <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-zinc-800 pt-6">
          <DsButton
            type="button"
            variant="destructive"
            onClick={() => setShowWasteModal(true)}
            icon={<AlertTriangle size={24} />}
          >
            REGISTRAR MERMA
          </DsButton>
          
          <DsButton
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            icon={<Trash2 size={24} />}
          >
            ELIMINAR PRODUCTO
          </DsButton>
        </div>
      )}

      <DsModal open={showWasteModal} onClose={() => setShowWasteModal(false)} title="Registrar Merma">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700 dark:text-zinc-300">
            El producto fue dañado, vencido o robado y debe salir del inventario.
          </p>
          
          {wasteError && (
            <DsAlert variant="error" message={wasteError} />
          )}
          
          <form onSubmit={handleWasteSubmit} className="flex flex-col gap-4">
            <DsInput
              label="Cantidad a retirar"
              name="wasteQuantity"
              type="number"
              step={formData.unitType === 'UNIT' ? '1' : '0.001'}
              min="0.001"
              value={wasteData.quantity}
              onChange={(e) => setWasteData({ ...wasteData, quantity: e.target.value })}
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                Motivo
              </label>
              <select
                value={wasteData.reason}
                onChange={(e) => setWasteData({ ...wasteData, reason: e.target.value })}
                className="w-full appearance-none bg-transparent border-b border-gray-200 dark:border-zinc-700 py-3 pr-8 text-base text-gray-900 dark:text-zinc-50 focus-visible:outline-none focus-visible:border-blue-900 transition-colors"
              >
                <option value="EXPIRED">Vencido</option>
                <option value="DAMAGED">Dañado / Malogrado</option>
                <option value="BROKEN">Roto</option>
                <option value="LOST">Perdido</option>
                <option value="STOLEN">Robado</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            
            <DsTextarea
              label="Detalles (Opcional)"
              value={wasteData.description}
              onChange={(e) => setWasteData({ ...wasteData, description: e.target.value })}
              placeholder="Describe el motivo con más detalle..."
              rows={3}
            />
            
            <div className="flex gap-3 mt-2">
              <DsButton
                type="button"
                variant="secondary"
                onClick={() => setShowWasteModal(false)}
              >
                CANCELAR
              </DsButton>
              <DsButton
                type="submit"
                disabled={loading}
              >
                CONFIRMAR
              </DsButton>
            </div>
          </form>
        </div>
      </DsModal>

      <DsModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Nueva Categoría" size="sm">
        <div className="flex flex-col gap-4">
          {categoryError && (
            <DsAlert variant="error" message={categoryError} />
          )}
          <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
            <DsInput
              label="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ej. Verduras, Cigarros, Mascotas"
            />
            <div className="flex gap-3">
              <DsButton
                type="button"
                variant="secondary"
                onClick={() => setShowCategoryModal(false)}
              >
                CANCELAR
              </DsButton>
              <DsButton
                type="submit"
                disabled={categoryLoading}
              >
                {categoryLoading ? 'GUARDANDO...' : 'CREAR'}
              </DsButton>
            </div>
          </form>
        </div>
      </DsModal>
    </div>
  );
}
