'use client';

import { useState, type ReactNode } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const variantStyles = {
 info: {
 container: 'bg-sky-accent/30 border-sky-accent/50',
 icon: Info,
 iconColor: 'text-[#006680]',
 titleColor: 'text-ink',
 descriptionColor: 'text-[#006680]/60',
 },
 success: {
 container: 'bg-mint/30 border-mint/50',
 icon: CheckCircle2,
 iconColor: 'text-forest',
 titleColor: 'text-ink',
 descriptionColor: 'text-forest/60',
 },
 warning: {
 container: 'bg-peach/30 border-peach/50',
 icon: AlertTriangle,
 iconColor: 'text-[#c64d00]',
 titleColor: 'text-[#c64d00]',
 descriptionColor: 'text-[#c64d00]/60',
 },
 error: {
 container: 'bg-peach/30 border-peach/50',
 icon: AlertCircle,
 iconColor: 'text-[#c64d00]',
 titleColor: 'text-ink',
 descriptionColor: 'text-[#c64d00]/60',
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
 className={`flex items-start gap-3 rounded-3xl border p-4 shadow-sm ${styles.container} ${className}`}
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
 className={`self-start p-0.5 rounded hover:bg-cloud transition-colors ${styles.iconColor}`}
 >
 <X className="size-4" />
 <span className="sr-only">Cerrar</span>
 </button>
 )}
 </div>
 );
}


