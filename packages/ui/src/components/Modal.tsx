import { cn } from '../lib/utils';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, footer, size = 'md', className }: ModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className={cn(
          'bg-white rounded-xl shadow-xl w-full animate-slide-up',
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}