import { cn } from '../lib/utils';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform';

    const variants = {
      primary: 'bg-slate-900 hover:bg-black text-white',
      secondary: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
      outline: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && !loading && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';