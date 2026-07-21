'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { importProductsCsvAction } from '@/actions/products';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

type CsvImportProps = {
  tenantSlug: string;
};

export function CsvImport({ tenantSlug }: CsvImportProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error al leer el archivo CSV. Revisa el formato.');
          return;
        }
        
        // Map and validate rows
        const mapped = results.data.map((row: any) => ({
          name: row.name || row.nombre || '',
          barcode: row.barcode || row.codigo || undefined,
          costPrice: Number(row.costPrice || row.costo || 0),
          sellingPrice: Number(row.sellingPrice || row.precio || 0),
          stock: Number(row.stock || 0),
          minStock: Number(row.minStock || 5),
          unitType: (row.unitType === 'KILOGRAM' || row.unidad === 'KG') ? 'KILOGRAM' : 'UNIT',
          categoryId: undefined, // We won't map categories directly by name in this simple version
        })).filter((r) => r.name && r.sellingPrice > 0);

        setPreviewData(mapped);
        
        if (mapped.length === 0) {
          setError('No se encontraron productos válidos en el CSV. Asegúrate de tener columnas "name" y "sellingPrice".');
        }
      },
      error: (err) => {
        setError(`Error: ${err.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await importProductsCsvAction(tenantSlug, previewData);
      if (res.success && res.data) {
        const { created, updated, errors } = res.data;
        setSuccess(`¡Importación exitosa! Creados: ${created}, Actualizados: ${updated}.`);
        if (errors && errors.length > 0) {
          setError(`Algunos errores ocurrieron: ${errors.join(', ')}`);
        }
        setPreviewData([]);
        router.refresh();
      } else {
        setError(res.error || 'Error al importar');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 p-4 rounded-xl text-base whitespace-pre-line">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-base flex items-start gap-2">
          <CheckCircle className="shrink-0 mt-0.5" size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-gray-300 dark:border-zinc-700 relative">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Subir archivo CSV"
        />
        <UploadCloud size={48} className="text-gray-400 dark:text-zinc-500" />
        <div>
          <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg">Subir archivo CSV</h3>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Toca aquí para buscar el archivo</p>
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="text-amber-700 dark:text-amber-400 shrink-0" />
            <div className="text-amber-700 dark:text-amber-400 text-sm">
              Se encontraron <strong>{previewData.length} productos</strong> válidos. Revisa una muestra antes de importar.
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-4 flex flex-col gap-3 max-h-60 overflow-y-auto">
            {previewData.slice(0, 5).map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 dark:text-zinc-50 text-sm">{p.name}</span>
                  <span className="text-gray-500 dark:text-zinc-400 text-xs">Stock: {p.stock} {p.unitType === 'UNIT' ? 'UN' : 'KG'}</span>
                </div>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">S/ {p.sellingPrice.toFixed(2)}</span>
              </div>
            ))}
            {previewData.length > 5 && (
              <p className="text-center text-gray-500 dark:text-zinc-400 text-xs py-2">+ {previewData.length - 5} productos más</p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-xl py-4 px-6 text-lg font-semibold hover:bg-emerald-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'IMPORTANDO...' : `IMPORTAR ${previewData.length} PRODUCTOS`}
          </button>
        </div>
      )}
    </div>
  );
}
