'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select } from '@yellow-erp/ui';
import { Plus, Edit, Trash2, Copy, Tag, Percent, Star, List, X, Save } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface PriceList {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  currency: string;
  adjustment_type: string;
  adjustment_value: number;
  items: any[];
  items_count?: number;
  created_at: string;
}

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<PriceList | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDefault, setFormDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadLists = async () => {
    try {
      const api = getApiClient();
      const res = await api.getPriceLists();
      const data = res.data || [];
      setPriceLists(data.map((l: any) => ({
        ...l,
        items_count: l.items?.length || 0,
        created_at: l.created_at || new Date().toISOString(),
      })));
    } catch { setPriceLists([]); }
    setLoading(false);
  };

  useEffect(() => { loadLists(); }, []);

  const openNew = () => {
    setEditingList(null);
    setFormName(''); setFormDescription(''); setFormDefault(false);
    setShowForm(true);
  };

  const openEdit = (list: PriceList) => {
    setEditingList(list);
    setFormName(list.name);
    setFormDescription(list.description || '');
    setFormDefault(list.is_default);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const api = getApiClient();
      if (editingList) {
        await api.updatePriceList(editingList.id, {
          name: formName, description: formDescription, is_default: formDefault,
        });
      } else {
        await api.createPriceList({
          name: formName, description: formDescription, is_default: formDefault,
        });
      }
      setShowForm(false);
      loadLists();
    } catch { toast.error('Error al guardar lista de precios'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta lista de precios?')) return;
    try {
      const api = getApiClient();
      await api.deletePriceList(id);
      loadLists();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleCopy = async (list: PriceList) => {
    try {
      const api = getApiClient();
      await api.createPriceList({
        name: `${list.name} (Copia)`,
        description: list.description,
        is_default: false,
      });
      loadLists();
    } catch { toast.error('Error al copiar lista'); }
  };

  const totalProducts = priceLists.reduce((sum, l) => sum + (l.items?.length || 0), 0);
  const defaultList = priceLists.find(l => l.is_default)?.name || 'Lista General';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Listas de Precio</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de precios y descuentos por cliente</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Lista
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Total Listas</p>
              <p className="text-2xl font-bold text-foreground mt-1">{priceLists.length}</p>
            </div>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <List className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Productos con Precio</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalProducts}</p>
            </div>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <Tag className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Lista por Defecto</p>
              <p className="text-lg font-bold text-foreground mt-1">{defaultList}</p>
            </div>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{editingList ? 'Editar Lista' : 'Nueva Lista de Precios'}</CardTitle>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ej: Lista Mayorista" required />
              <Input label="Descripción" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Descripción opcional" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_default" checked={formDefault}
                onChange={(e) => setFormDefault(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-muted border-slate-300 rounded focus:ring-primary/20" />
              <label htmlFor="is_default" className="text-sm text-foreground">Lista por defecto (se aplica automáticamente)</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !formName.trim()}>
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Listas de Precio</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descripción</th>
                  <th className="text-center px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Productos</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Creada</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Cargando...</td></tr>
                ) : priceLists.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No hay listas de precios. Crea la primera.</td></tr>
                ) : priceLists.map(list => (
                  <tr key={list.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{list.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{list.description || '—'}</td>
                    <td className="px-4 py-3 text-sm text-foreground text-center">{list.items?.length || 0}</td>
                    <td className="px-4 py-3">
                      <Badge variant={list.is_default ? 'info' : 'success'}>
                        {list.is_default ? 'Por defecto' : 'Activa'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(list.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(list)} className="p-1.5 text-muted-foreground hover:text-slate-600 hover:bg-muted rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleCopy(list)} className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(list.id)} className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
