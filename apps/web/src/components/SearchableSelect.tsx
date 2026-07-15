'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@yellow-erp/ui';

interface Option {
  label: string;
  value: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string, option?: Option) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((option: Option) => {
    onChange(option.value, option);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  }, [onChange]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 0); }}
        className={cn(
          'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between gap-2 transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300',
          isOpen && 'ring-2 ring-indigo-500 border-transparent',
          !selected && 'text-slate-400'
        )}
      >
        <span className="truncate">
          {selected ? (
            <span className="text-slate-900">
              {selected.label}
              {selected.sublabel && <span className="text-slate-400 ml-1 text-xs">({selected.sublabel})</span>}
            </span>
          ) : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && !disabled && (
            <span onClick={handleClear} className="p-0.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                Sin resultados
              </div>
            ) : (
              filtered.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center justify-between',
                    option.value === value && 'bg-indigo-50 text-indigo-700'
                  )}
                >
                  <span className="truncate font-medium">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{option.sublabel}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
