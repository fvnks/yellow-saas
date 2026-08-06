'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, ScanBarcode, Keyboard, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'camera') startCamera();
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError('');
    } catch (e) {
      setError('Camara no disponible. Use entrada manual.');
      setMode('manual');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const handleSubmitManual = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full dark:bg-primary max-w- dark:bg-primarymd">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Escanear Codigo</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-primary text-white' : 'bg-muted text-slate-600 hover:bg-slate-200'}`}>
              <Keyboard className="w-4 h-4" /> Manual
            </button>
            <button onClick={() => setMode('camera')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'camera' ? 'bg-primary text-white' : 'bg-muted text-slate-600 hover:bg-slate-200'}`}>
              <Camera className="w-4 h-4" /> Camara
            </button>
          </div>

          {mode === 'manual' && (
            <div className="space-y-3">
              <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitManual()}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                placeholder="Ingrese o pegue el codigo de barras" autoFocus />
              <button onClick={handleSubmitManual} disabled={!manualCode.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                Buscar Producto
              </button>
            </div>
          )}

          {mode === 'camera' && (
            <div className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-700">{error}</span>
                </div>
              )}
              <div className="relative bg-primary rounded-xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-1 border-t-2 border-red-500 animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Apunte la camara al codigo de barras
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
