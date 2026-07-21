'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, Trash2, ListChecks } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  is_checked: boolean;
  sort_order: number;
}

interface TaskChecklistProps {
  taskId: string;
  onUpdate?: () => void;
}

export default function TaskChecklist({ taskId, onUpdate }: TaskChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, [taskId]);

  const loadItems = async () => {
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/projects/tasks/${taskId}/checklists`);
      if (res.ok) {
        const json = await res.json();
        setItems(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/projects/tasks/${taskId}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newItem.trim(), sort_order: items.length }),
      });
      if (res.ok) {
        setNewItem('');
        loadItems();
        onUpdate?.();
      }
    } catch (e) { console.error(e); }
  };

  const toggleItem = async (item: ChecklistItem) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/projects/tasks/${taskId}/checklists/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_checked: !item.is_checked }),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: !i.is_checked } : i));
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const companyId = localStorage.getItem('company_id');
      await fetch(`/api/companies/${companyId}/projects/tasks/${taskId}/checklists/${itemId}`, { method: 'DELETE' });
      loadItems();
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

  const checked = items.filter(i => i.is_checked).length;
  const total = items.length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  if (loading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ListChecks className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
          Checklist {total > 0 && `(${checked}/${total})`}
        </span>
      </div>

      {total > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${percent}%` }} />
        </div>
      )}

      <div className="space-y-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button onClick={() => toggleItem(item)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                item.is_checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-400'
              }`}>
              {item.is_checked && <Check className="w-2.5 h-2.5 text-white" />}
            </button>
            <span className={`text-xs flex-1 ${item.is_checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item.text}
            </span>
            <button onClick={() => deleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded transition-all">
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Agregar item..." />
        <button onClick={addItem} disabled={!newItem.trim()}
          className="bg-slate-900 hover:bg-black text-white px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
