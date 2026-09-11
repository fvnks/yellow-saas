'use client';

import { useEffect, useRef } from 'react';
import { X, Printer, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PrintModalProps {
 isOpen: boolean;
 onClose: () => void;
 html?: string;
 title?: string;
 message?: string;
}

export default function PrintModal({ isOpen, onClose, html, title, message }: PrintModalProps) {
 const iframeRef = useRef<HTMLIFrameElement>(null);
 const [copied, setCopied] = useState(false);

 useEffect(() => {
 if (isOpen && iframeRef.current && html) {
 const doc = iframeRef.current.contentDocument;
 if (doc) {
 doc.open();
 doc.write(html);
 doc.close();
 }
 }
 }, [isOpen, html]);

 const handlePrint = () => {
 iframeRef.current?.contentWindow?.print();
 };

 const handleCopy = async () => {
 if (message) {
 await navigator.clipboard.writeText(message);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
 <h3 className="text-lg font-bold text-slate-900">{title || 'Vista Previa'}</h3>
 <div className="flex items-center gap-2">
 {message && (
 <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
 {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
 {copied ? 'Copiado' : 'Copiar'}
 </button>
 )}
 {html && (
 <>
 <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-monday-violet hover:bg-[#1E293B] rounded-xl transition-colors">
 <Printer className="w-4 h-4" />
 Imprimir
 </button>
 <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 rounded-xl transition-colors">
 <Download className="w-4 h-4" />
 PDF
 </button>
 </>
 )}
 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 <div className="flex-1 overflow-hidden p-4">
 {html ? (
 <iframe ref={iframeRef} className="w-full h-full border border-slate-200 rounded-xl" title={title} />
 ) : message ? (
 <pre className="whitespace-pre-wrap p-4 bg-slate-50 rounded-xl text-sm text-slate-700 font-mono">{message}</pre>
 ) : null}
 </div>
 </div>
 </div>
 );
}
