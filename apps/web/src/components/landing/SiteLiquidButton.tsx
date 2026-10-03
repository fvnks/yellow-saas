'use client';

import Link from 'next/link';
import { LiquidButton } from '@/components/animate-ui/components/buttons/liquid';
import { cn } from '@/lib/utils';

type SiteLiquidButtonProps = {
  href?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const styles = {
  primary:
    '[--liquid-button-background-color:#F5C518] [--liquid-button-color:#B8860B] bg-sunshine text-ink hover:text-white shadow-sm rounded-[160px] px-8 py-3.5 text-sm font-semibold',
  secondary:
    '[--liquid-button-background-color:#ffffff] [--liquid-button-color:rgba(245,197,24,0.35)] bg-snow text-ink border border-mist hover:border-sunshine-dark/40 rounded-[160px] px-8 py-3.5 text-sm font-medium',
};

export function SiteLiquidButton({
  href,
  type = 'button',
  variant = 'primary',
  className,
  disabled,
  onClick,
  children,
}: SiteLiquidButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
    styles[variant],
    className
  );

  if (href) {
    return (
      <LiquidButton asChild className={cls}>
        <Link href={href} onClick={onClick}>{children}</Link>
      </LiquidButton>
    );
  }

  return (
    <LiquidButton type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </LiquidButton>
  );
}
