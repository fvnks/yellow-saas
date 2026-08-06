'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Pencil, Trash2, Check, X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface FaqForm {
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
}

const emptyForm: FaqForm = { category: 'General', question: '', answer: '', sort_order: 0, active: true };

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const getToken = () => document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/super-admin/faq', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (err) {
      console.error('Failed to load FAQ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Pregunta y respuesta son requeridas');
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/super-admin/faq/${editing.id}` : '/api/super-admin/faq';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? 'FAQ actualizada' : 'FAQ creada');
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
        fetchItems();
      } else {
        toast.error(data.error?.message || 'Error al guardar');
      }
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: FaqItem) => {
    if (!confirm(`¿Eliminar la FAQ "${item.question}"?`)) return;
    try {
      const res = await fetch(`/api/super-admin/faq/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('FAQ eliminada');
        fetchItems();
      } else {
        toast.error(data.error?.message || 'Error al eliminar');
      }
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleToggleActive = async (item: FaqItem) => {
    try {
      await fetch(`/api/super-admin/faq/${item.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });
      fetchItems();
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const filtered = items.filter(i =>
    search === '' ||
    i.question.toLowerCase().includes(search.toLowerCase()) ||
    i.answer.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Centro de Ayuda</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las preguntas frecuentes visibles en el módulo de Ayuda</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setShowForm(!showForm);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancelar' : 'Nueva FAQ'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">{editing ? 'Editar FAQ' : 'Nueva FAQ'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Categoría</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Ej: Cuenta, Ventas, Inventario"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Orden</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground">Estado</label>
                <select
                  value={form.active ? 'true' : 'false'}
                  onChange={e => setForm({ ...form, active: e.target.value === 'true' })}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Pregunta *</label>
              <input
                type="text"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="¿Cómo hago...?"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground">Respuesta *</label>
              <textarea
                value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })}
                rows={4}
                placeholder="Explica la respuesta paso a paso..."
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                className="bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar FAQ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Pregunta</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Categoría</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Orden</th>
              <th className="text-left px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="text-right px-6 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <BookOpen className="w-12 h-12 text-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">{search ? 'No hay FAQ que coincidan' : 'Aún no hay preguntas frecuentes'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Crea la primera FAQ para mostrarla en el módulo de Ayuda</p>
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{item.question}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 max-w-md">{item.answer}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-50 text-primary border border-primary/20">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{item.sort_order}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold border transition-colors ${
                        item.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-muted text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {item.active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {item.active ? 'Visible' : 'Oculta'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditing(item);
                          setForm({
                            category: item.category,
                            question: item.question,
                            answer: item.answer,
                            sort_order: item.sort_order,
                            active: item.active,
                          });
                          setShowForm(true);
                        }}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}