'use client';

import { useState, useEffect } from 'react';
import { Image, Plus, Trash2, Star, Upload, GripVertical, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

interface ProductImagesProps {
  productId: string;
  onRefresh?: () => void;
}

export default function ProductImages({ productId, onRefresh }: ProductImagesProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newAlt, setNewAlt] = useState('');

  useEffect(() => { loadImages(); }, [productId]);

  const loadImages = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products/${productId}/images`);
      if (res.ok) {
        const json = await res.json();
        setImages(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!newUrl) { toast.error('URL requerida'); return; }
    setUploading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/products/${productId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newUrl,
          alt_text: newAlt,
          sort_order: images.length,
          is_primary: images.length === 0,
        }),
      });
      if (res.ok) {
        toast.success('Imagen agregada');
        setNewUrl('');
        setNewAlt('');
        setShowUpload(false);
        loadImages();
        onRefresh?.();
      }
    } catch (e) { toast.error('Error al agregar imagen'); }
    setUploading(false);
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Eliminar imagen?')) return;
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/products/${productId}/images/${imageId}`, { method: 'DELETE' });
      toast.success('Imagen eliminada');
      loadImages();
      onRefresh?.();
    } catch (e) { toast.error('Error al eliminar'); }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/products/${productId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: true }),
      });
      loadImages();
      onRefresh?.();
    } catch (e) { toast.error('Error al actualizar'); }
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-slate-500" />
          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            Imagenes {images.length > 0 && `(${images.length})`}
          </span>
        </div>
        <button onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {showUpload && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Nueva Imagen</span>
            <button onClick={() => setShowUpload(false)} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://ejemplo.com/imagen.jpg" />
          <input type="text" value={newAlt} onChange={e => setNewAlt(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Texto alternativo (opcional)" />
          <button onClick={handleUpload} disabled={uploading || !newUrl}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {uploading ? 'Agregando...' : 'Agregar Imagen'}
          </button>
        </div>
      )}

      {images.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Sin imagenes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(image => (
            <div key={image.id} className={`relative group rounded-xl overflow-hidden border-2 transition-colors ${image.is_primary ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}>
              <img src={image.url} alt={image.alt_text} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => handleSetPrimary(image.id)}
                  className={`p-1.5 rounded-lg transition-colors ${image.is_primary ? 'bg-indigo-500 text-white' : 'bg-white/90 text-slate-700 hover:bg-white'}`}
                  title="Imagen principal">
                  <Star className="w-4 h-4" fill={image.is_primary ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => handleDelete(image.id)}
                  className="p-1.5 bg-white/90 text-red-600 hover:bg-white rounded-lg transition-colors"
                  title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {image.is_primary && (
                <div className="absolute top-1 left-1">
                  <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[8px] font-semibold rounded"> Principal </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
