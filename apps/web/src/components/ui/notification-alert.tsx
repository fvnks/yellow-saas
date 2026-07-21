'use client';

import { useState, type ReactNode } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const variantStyles = {
  info: {
    container: 'bg-gradient-to-b from-blue-50 to-transparent to-50% border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    descriptionColor: 'text-blue-700/60',
  },
  success: {
    container: 'bg-gradient-to-b from-emerald-50 to-transparent to-50% border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
    descriptionColor: 'text-emerald-700/60',
  },
  warning: {
    container: 'bg-gradient-to-b from-amber-50 to-transparent to-50% border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    descriptionColor: 'text-amber-700/60',
  },
  error: {
    container: 'bg-gradient-to-b from-rose-50 to-transparent to-50% border-rose-200',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
    titleColor: 'text-rose-900',
    descriptionColor: 'text-rose-700/60',
  },
};

interface NotificationAlertProps {
  variant?: keyof typeof variantStyles;
  title?: string;
  description?: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function NotificationAlert({
  variant = 'info',
  title,
  description,
  icon,
  dismissible = true,
  onDismiss,
  className = '',
}: NotificationAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm ${styles.container} ${className}`}
    >
      {icon || <IconComponent className={`size-4 mt-0.5 ${styles.iconColor}`} />}
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-medium ${styles.titleColor}`}>{title}</p>}
        {description && (
          <p className={`text-xs mt-0.5 ${styles.descriptionColor}`}>{description}</p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`self-start p-0.5 rounded hover:bg-black/5 transition-colors ${styles.iconColor}`}
        >
          <X className="size-4" />
          <span className="sr-only">Cerrar</span>
        </button>
      )}
    </div>
  );
}
