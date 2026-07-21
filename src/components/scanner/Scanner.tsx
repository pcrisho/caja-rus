"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { scanImageData } from "@undecaf/zbar-wasm";
import { X, Zap, ZapOff, Loader2 } from "lucide-react";

type Props = {
  onScan: (barcode: string) => void;
  onClose: () => void;
};

export function Scanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraReadyRef = useRef(false);
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  });

  useEffect(() => {
    let active = true;
    let animId = 0;
    let lastScan = 0;
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    const streamHolder = { current: null as MediaStream | null };

    async function startCamera() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        if (!active) return;
        setError(
          "Cámara no disponible. En iOS, asegúrate de usar HTTPS (no HTTP) — Safari lo exige."
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamHolder.current = stream;

        const track = stream.getVideoTracks()[0];
        try {
          const caps = track.getCapabilities?.() as
            | { torch?: boolean }
            | undefined;
          if (caps?.torch) setTorchAvailable(true);
        } catch {
          /* torch detection not supported */
        }

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play().then(() => {
            if (active) {
              setCameraReady(true);
              cameraReadyRef.current = true;
              scanLoop();
            }
          }).catch(() => {
            /* play falló, probablemente safari bloqueó la reproducción */
          });
        };
      } catch (e: any) {
        if (!active) return;
        if (e.name === "NotAllowedError") {
          setError(
            "Permiso de cámara denegado. Actívalo en Ajustes de tu celular."
          );
        } else if (e.name === "NotFoundError") {
          setError("No se encontró una cámara en este dispositivo.");
        } else {
          setError(
            "No se pudo abrir la cámara. ¿Otra app la está usando?"
          );
        }
      }
    }

    function scanLoop() {
      if (!active) return;
      const now = Date.now();
      if (now - lastScan < 300) {
        animId = requestAnimationFrame(scanLoop);
        return;
      }
      lastScan = now;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        animId = requestAnimationFrame(scanLoop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animId = requestAnimationFrame(scanLoop);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      scanImageData(imageData)
        .then((symbols) => {
          if (symbols.length > 0 && active) {
            const data = symbols[0].decode("utf-8");
            if (data) {
              active = false;
              if (
                typeof navigator !== "undefined" &&
                "vibrate" in navigator
              ) {
                navigator.vibrate(100);
              }
              onScanRef.current(data);
              return;
            }
          }
          animId = requestAnimationFrame(scanLoop);
        })
        .catch(() => {
          animId = requestAnimationFrame(scanLoop);
        });
    }

    // Safety: si después de 8s la cámara no se inició, mostrar error
    safetyTimer = setTimeout(() => {
      if (active && !cameraReadyRef.current) {
        setError(
          "La cámara está tomando mucho tiempo en iniciar. ¿Diste permiso de cámara?"
        );
      }
    }, 8000);

    // Delay para asegurar que el DOM tenga el <video> montado
    requestAnimationFrame(() => {
      if (active) startCamera();
    });

    return () => {
      active = false;
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animId);
      streamHolder.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleTorch = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const stream = video.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [
          { torch: !torchOn } as unknown as MediaTrackConstraintSet,
        ],
      });
      setTorchOn(!torchOn);
    } catch {
      /* torch not supported */
    }
  }, [torchOn]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <style>{`
        @keyframes barcode-scan-line {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 3px); }
        }
        .scan-line {
          animation: barcode-scan-line 2s ease-in-out infinite;
        }
      `}</style>

      {/* Video SIEMPRE en el DOM para que el ref esté disponible */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-6 bg-black/80">
          <p className="text-red-400 text-lg font-semibold">{error}</p>
          <button
            onClick={onClose}
            className="bg-white text-gray-900 rounded-xl py-4 px-10 text-lg font-semibold active:scale-95 transition-transform"
          >
            CERRAR
          </button>
        </div>
      ) : !cameraReady ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
          <Loader2 size={40} className="animate-spin text-white" />
          <p className="text-white text-base">Iniciando cámara...</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-72 h-52 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-2xl">
              <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl" />
              <div className="absolute left-1.5 right-1.5 h-0.5 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] scan-line" />
            </div>
          </div>

          <p className="absolute bottom-28 left-0 right-0 text-center text-white text-base font-medium pointer-events-none drop-shadow-lg">
            Apunta el código de barras al centro
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white z-10 active:scale-90 transition-transform"
            aria-label="Cerrar escáner"
          >
            <X size={24} />
          </button>

          {torchAvailable && (
            <button
              onClick={toggleTorch}
              className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white z-10 active:scale-90 transition-transform"
              aria-label={torchOn ? "Apagar flash" : "Encender flash"}
            >
              {torchOn ? <Zap size={24} /> : <ZapOff size={24} />}
            </button>
          )}
        </>
      )}
    </div>
  );
}
