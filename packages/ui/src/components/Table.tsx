import { cn } from '../lib/utils';
import { forwardRef } from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(({ className, children, ...props }, ref) => (
  <div className="overflow-x-auto">
    <table ref={ref} className={cn('w-full', className)} {...props}>
      {children}
    </table>
  </div>
));

export const TableHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('[&_tr]:border-b [&_tr]:border-slate-200', className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-b border-slate-100 hover:bg-slate-50 transition-colors', className)} {...props} />
);

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider',
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 text-xs text-slate-700', className)} {...props} />
);

export const TableCaption = ({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption className={cn('text-sm text-slate-500 py-4', className)} {...props} />
);