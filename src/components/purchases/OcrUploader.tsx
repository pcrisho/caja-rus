'use client';

import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { PurchaseReviewForm } from './PurchaseReviewForm';
import { DsAlert } from '@/components/design-system/DsAlert';
import { DsButton } from '@/components/design-system/DsButton';

type OcrUploaderProps = {
  tenantSlug: string;
  catalogProducts?: any[];
  categories?: any[];
  suppliers?: Array<{ ruc: string; name: string }>;
};

export function OcrUploader({
  tenantSlug,
  catalogProducts = [],
  categories = [],
  suppliers = [],
}: OcrUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ocrData, setOcrData] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      setTimeout(() => {
        setImageUrl('https://example.com/invoice.jpg');
        setOcrData({
          supplierRuc: '20123456789',
          supplierName: 'Distribuidora del Centro SAC',
          invoiceNumber: 'F001-000123',
          totalAmount: 150.50,
          date: new Date().toISOString(),
          items: [
            { name: 'Coca Cola 500ml', quantity: 24, unitPrice: 2.00, totalPrice: 48.00 },
            { name: 'Galletas Oreo', quantity: 12, unitPrice: 1.00, totalPrice: 12.00 }
          ]
        });
        setLoading(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      setLoading(false);
    }
  };

  if (ocrData) {
    return (
      <PurchaseReviewForm
        tenantSlug={tenantSlug}
        ocrData={ocrData}
        imageUrl={imageUrl}
        catalogProducts={catalogProducts}
        categories={categories}
        suppliers={suppliers}
        onCancel={() => setOcrData(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {error && <DsAlert variant="error" message={error} />}

      <div className="bg-white dark:bg-zinc-900 p-8 flex flex-col items-center justify-center gap-6 text-center border-2 border-dashed border-gray-300 dark:border-zinc-700 relative">
        <input 
          type="file" 
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Tomar foto o subir comprobante"
          disabled={loading}
        />
        
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-blue-900 dark:text-blue-400" />
            <div className="flex flex-col">
              <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg">Analizando comprobante...</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Nuestra IA está extrayendo los datos</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 text-blue-900 dark:text-blue-400">
              <Camera size={40} />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-zinc-50 font-bold text-lg">Escanear Factura / Boleta</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mt-2">Toca aquí para tomar una foto del comprobante físico o subir una imagen de tu galería.</p>
            </div>
          </>
        )}
      </div>

      {!loading && (
        <div className="flex items-center gap-4">
          <div className="h-px bg-gray-200 dark:bg-zinc-700 flex-1"></div>
          <span className="text-gray-400 dark:text-zinc-500 text-sm font-medium">O</span>
          <div className="h-px bg-gray-200 dark:bg-zinc-700 flex-1"></div>
        </div>
      )}

      {!loading && (
        <DsButton
          type="button"
          variant="secondary"
          onClick={() => setOcrData({ items: [], totalAmount: 0 })}
        >
          INGRESO MANUAL
        </DsButton>
      )}
    </div>
  );
}
