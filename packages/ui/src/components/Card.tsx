import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className, header, footer }: CardProps) {
  return (
    <div className={cn('bg-white border border-[#E2E8F0] rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800', className)}>
      {header && (
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          {header}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F1F5F9] rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 border-b border-[#E2E8F0]', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold text-[#0F172A] dark:text-white', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-[#64748B] mt-1', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 border-t border-[#E2E8F0] bg-[#F1F5F9] rounded-b-2xl dark:bg-slate-800 dark:border-slate-800', className)}>{children}</div>;
}