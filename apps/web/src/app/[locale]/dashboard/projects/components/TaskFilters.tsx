'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TaskFiltersProps {
  tasks: any[];
  users: any[];
  onFilter: (filtered: any[]) => void;
}

interface Filters {
  search: string;
  status: string;
  priority: string;
  assignee_id: string;
  date_from: string;
  date_to: string;
  has_tags: boolean;
}

export default function TaskFilters({ tasks, users, onFilter }: TaskFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '', status: '', priority: '', assignee_id: '', date_from: '', date_to: '', has_tags: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    let result = [...tasks];

    if (newFilters.search) {
      const q = newFilters.search.toLowerCase();
      result = result.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignee_name?.toLowerCase().includes(q)
      );
    }

    if (newFilters.status) {
      result = result.filter(t => t.status === newFilters.status);
    }

    if (newFilters.priority) {
      result = result.filter(t => t.priority === newFilters.priority);
    }

    if (newFilters.assignee_id) {
      result = result.filter(t => t.assignee_id === newFilters.assignee_id);
    }

    if (newFilters.date_from) {
      result = result.filter(t => t.due_date && t.due_date >= newFilters.date_from);
    }

    if (newFilters.date_to) {
      result = result.filter(t => t.due_date && t.due_date <= newFilters.date_to);
    }

    if (newFilters.has_tags) {
      result = result.filter(t => t.tags && t.tags.length > 0);
    }

    onFilter(result);
  };

  const clearFilters = () => {
    const empty: Filters = { search: '', status: '', priority: '', assignee_id: '', date_from: '', date_to: '', has_tags: false };
    setFilters(empty);
    onFilter(tasks);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== false).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" value={filters.search} onChange={e => applyFilters({ ...filters, search: e.target.value })}
            className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
            placeholder="Buscar tareas..." />
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-blue-50 text-primary border-primary/20'
              : 'bg-card text-foreground border-border hover:bg-muted dark:bg-card dark:text-foreground dark:border-border dark:hover:bg-primary/90'
          }`}>
          <Filter className="w-3.5 h-3.5" />
          Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="bg-card border border-border rounded-xl shadow-sm p-3 dark:bg-primary dark:border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <select value={filters.status} onChange={e => applyFilters({ ...filters, status: e.target.value })}
              className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option value="">Todos los estados</option>
              <option value="todo">Por Hacer</option>
              <option value="in_progress">En Progreso</option>
              <option value="review">En Revisión</option>
              <option value="done">Completada</option>
            </select>

            <select value={filters.priority} onChange={e => applyFilters({ ...filters, priority: e.target.value })}
              className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option value="">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>

            <select value={filters.assignee_id} onChange={e => applyFilters({ ...filters, assignee_id: e.target.value })}
              className="bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option value="">Todos los asignados</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
            </select>

            <div className="flex items-center gap-1">
              <input type="date" value={filters.date_from} onChange={e => applyFilters({ ...filters, date_from: e.target.value })}
                className="flex-1 bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Desde" />
              <span className="text-muted-foreground text-xs">-</span>
              <input type="date" value={filters.date_to} onChange={e => applyFilters({ ...filters, date_to: e.target.value })}
                className="flex-1 bg-muted border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Hasta" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
