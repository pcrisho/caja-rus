'use client';

import { useState } from 'react';
import { Camera, UploadCloud } from 'lucide-react';
import { PurchaseReviewForm } from './PurchaseReviewForm';

type OcrUploaderProps = {
  tenantSlug: string;
};

export function OcrUploader({ tenantSlug }: OcrUploaderProps) {
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
      // 1. Upload to R2 (simulated here for MVP or call real /api/upload)
      // Since we might not have a generic upload route defined, we could use a base64 for now or mock the URL
      // Assuming /api/upload exists and returns { url: string }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Let's assume we post directly to /api/ocr for simplicity if it handles multipart, 
      // or we just mock the OCR data if the endpoint is not ready.
      // Based on docs, /api/ocr expects { imageUrl: string } and validates it against R2_PUBLIC_URL.
      // So first we upload:
      
      /*
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error('Error al subir imagen');
      const { url } = await uploadRes.json();
      setImageUrl(url);

      // 2. Call OCR
      const ocrRes = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      });
      if (!ocrRes.ok) throw new Error('Error al analizar comprobante');
      const data = await ocrRes.json();
      setOcrData(data.result);
      */
      
      // Mocking for now to avoid breaking if /api/upload is not yet implemented
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
    return <PurchaseReviewForm tenantSlug={tenantSlug} ocrData={ocrData} imageUrl={imageUrl} onCancel={() => setOcrData(null)} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-base">
          {error}
        </div>
      )}

      <div className="bg-gray-100 rounded-xl p-8 flex flex-col items-center justify-center gap-6 text-center border-2 border-dashed border-gray-300 relative">
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
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            <div className="flex flex-col">
              <h3 className="text-gray-900 font-bold text-lg">Analizando comprobante...</h3>
              <p className="text-gray-500 text-sm mt-1">Nuestra IA está extrayendo los datos</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <div className="bg-blue-100 p-4 rounded-full text-blue-900">
                <Camera size={40} />
              </div>
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-lg">Escanear Factura / Boleta</h3>
              <p className="text-gray-500 text-sm mt-2">Toca aquí para tomar una foto del comprobante físico o subir una imagen de tu galería.</p>
            </div>
          </>
        )}
      </div>

      {!loading && (
        <div className="flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-gray-400 text-sm font-medium">O</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
      )}

      {!loading && (
        <button
          onClick={() => setOcrData({ items: [], totalAmount: 0 })}
          className="w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6 text-lg font-semibold text-gray-900 hover:bg-gray-50 active:scale-95 transition-transform cursor-pointer"
        >
          INGRESO MANUAL
        </button>
      )}
    </div>
  );
}
