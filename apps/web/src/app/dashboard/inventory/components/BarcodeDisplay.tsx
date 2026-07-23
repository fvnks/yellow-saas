'use client';

import { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Barcode, Download, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeDisplayProps {
  value: string;
  format?: string;
  height?: number;
  showActions?: boolean;
}

export default function BarcodeDisplay({ value, format = 'CODE128', height = 80, showActions = true }: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format,
        height,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: 'transparent',
        lineColor: '#1e293b',
      });
    }
  }, [value, format, height]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `barcode-${value}.png`;
      link.href = pngUrl;
      link.click();
      toast.success('Codigo de barras descargado');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success('Codigo copiado');
  };

  if (!value) {
    return (
      <div className="flex items-center gap-2 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
        <Barcode className="w-5 h-5 text-slate-300" />
        <span className="text-xs text-slate-400">Sin codigo de barras</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-xl p-4 dark:bg-slate-900 dark:border-slate-800 flex justify-center">
        <svg ref={svgRef} />
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors">
            <Download className="w-3.5 h-3.5" /> Descargar PNG
          </button>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copiar Codigo
          </button>
        </div>
      )}
    </div>
  );
}
