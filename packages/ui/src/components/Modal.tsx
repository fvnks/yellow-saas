import React, { useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}
const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "bg-white rounded-2xl shadow-xl w-full animate-slide-up backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        sizes[size],
        className
      )}
      aria-labelledby="modal-title"
    >
      <div className="px-6 py-4 border-b border-[#E6EFF5] flex items-center justify-between">
        <h2 id="modal-title" className="text-lg font-semibold text-[#232323]">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-[#E6EFF5] flex justify-end gap-3">
          {footer}
        </div>
      )}
    </dialog>,
    document.body
  );
}
