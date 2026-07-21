"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Trash2, Upload, ImageIcon } from "lucide-react";
import { uploadProductImageAction } from "@/actions/upload";

const MAX_WIDTH = 800;
const WEBP_QUALITY = 0.8;

type Props = {
  tenantSlug: string;
  initialUrl?: string | null;
  onChange: (url: string | null) => void;
};

function resizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(MAX_WIDTH / img.width, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mimeType = "image/webp";
        const base64 = canvas.toDataURL(mimeType, WEBP_QUALITY);
        resolve({ base64, mimeType });
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ tenantSlug, initialUrl, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [localFile, setLocalFile] = useState<{ base64: string; mimeType: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const result = await resizeImage(file);
      setLocalFile(result);
      setPreview(result.base64);
    } catch (err: any) {
      setError(err.message || "Error al procesar la imagen");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!localFile) return;
    setUploading(true);
    setError(null);

    const res = await uploadProductImageAction(tenantSlug, localFile.base64, localFile.mimeType);
    if (res.success) {
      setLocalFile(null);
      setPreview(res.url);
      onChange(res.url);
    } else {
      setError(res.error);
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    setLocalFile(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-900 dark:text-zinc-50 font-bold text-xs tracking-wider uppercase">
        Foto del Producto
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
      )}

      {preview ? (
        <div className="flex flex-col gap-2">
          <div className="relative w-full aspect-square max-h-56 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800">
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-2">
            {localFile && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-emerald-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {uploading ? "SUBENDO..." : "SUBIR FOTO"}
              </button>
            )}

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={localFile ? "flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3 text-sm font-semibold text-gray-900 dark:text-zinc-50 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-transform flex items-center justify-center gap-2" : "flex-1 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-xl py-3 text-sm font-semibold text-gray-900 dark:text-zinc-50 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-transform flex items-center justify-center gap-2"}
            >
              <Camera size={18} />
              {localFile ? "OTRA" : "SELECCIONAR"}
            </button>

            {!localFile && (
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white rounded-xl py-3 px-4 text-sm font-semibold hover:bg-red-700 active:scale-95 transition-transform flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 w-full aspect-video max-h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.99] transition-all"
        >
          <ImageIcon size={32} />
          <p className="text-sm font-medium">Tocar para subir foto</p>
          <p className="text-xs">o tomar una foto con la cámara</p>
        </button>
      )}
    </div>
  );
}
