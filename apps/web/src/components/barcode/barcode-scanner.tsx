'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, ScanBarcode } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        
        if (!mounted || !containerRef.current) return;

        const scanner = new Html5Qrcode('barcode-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (mounted) {
              onScan(decodedText);
            }
          },
          () => {}
        );
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'No se pudo acceder a la camara');
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [onScan, stopScanner]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ScanBarcode className="w-5 h-5" />
            Escanear Codigo
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div ref={containerRef} id="barcode-reader" className="rounded-lg overflow-hidden" />
              <p className="text-xs text-muted-foreground text-center mt-4">
                Apunta la camara al codigo de barras
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
