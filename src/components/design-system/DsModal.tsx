"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type DsModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  closable?: boolean;
  children: ReactNode;
};

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function DsModal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  closable = true,
  children,
}: DsModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={closable ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-zinc-900 w-full ${sizeStyles[size]} max-h-[85vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-bold text-gray-900 dark:text-zinc-50"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {closable && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
