'use client';

import { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  label: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts?: { keys: string[]; label: string; action: () => void }[];
}

export function useKeyboardShortcuts(shortcuts: { keys: string[]; label: string; action: () => void }[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map(k => k.toLowerCase());
        const match = keys.every(key => {
          if (key === 'ctrl' || key === 'cmd') return e.ctrlKey || e.metaKey;
          if (key === 'shift') return e.shiftKey;
          if (key === 'alt') return e.altKey;
          return e.key.toLowerCase() === key;
        });

        if (match && keys.length > 1) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export default function ShortcutsHelp({ shortcuts }: { shortcuts: { keys: string[]; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="p-2 hover:bg-muted dark:hover:bg-primary/90 rounded-lg transition-colors"
        title="Atajos de teclado">
        <Keyboard className="w-4 h-4 text-foreground dark:text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-card rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-border dark:border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground dark:text-white">Atajos de Teclado</h2>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted dark:hover:bg-primary/90 rounded">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-foreground dark:text-foreground">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((key, j) => (
                      <span key={j}>
                        <kbd className="px-2 py-0.5 bg-muted dark:bg-muted border border-border dark:border-border rounded text-[10px] font-mono text-foreground dark:text-foreground">
                          {key}
                        </kbd>
                        {j < s.keys.length - 1 && <span className="text-muted-foreground mx-0.5">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
