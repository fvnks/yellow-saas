import { cn } from '../lib/utils';
import { forwardRef } from 'react';

/* ===========================
   Root Table
   =========================== */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(({ className, children, ...props }, ref) => (
  <div className="relative w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm border-collapse', className)}
      {...props}
    >
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

/* ===========================
   Header
   =========================== */
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // fondo sutil, borde fino debajo, texto semibold uppercase
      '[&_tr]:border-b [&_tr]:border-slate-200 bg-slate-50',
      '[&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-slate-600 [&_th]:uppercase [&_th]:tracking-[0.08em]',
      className
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

/* ===========================
   Body — zebra stripes + hover fila sutil
   =========================== */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      '[&_tr]:border-b [&_tr]:border-slate-100',
      '[&_tr:last-child]:border-0',
      '[&_tr:nth-child(even)]:bg-slate-50/50',
      '[&_tr]:transition-colors [&_tr:hover]:bg-slate-50',
      className
    )}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

/* ===========================
   Row
   =========================== */
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('', className)} {...props} />
));
TableRow.displayName = 'TableRow';

/* ===========================
   Head cell
   =========================== */
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn('', className)} {...props} />
));
TableHead.displayName = 'TableHead';

/* ===========================
   Body cell
   =========================== */
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-3.5 text-slate-700 align-middle', className)} {...props} />
));
TableCell.displayName = 'TableCell';

/* ===========================
   Footer
   =========================== */
export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'bg-slate-50 border-t border-slate-200',
      '[&_tr]:border-t [&_tr]:border-slate-200',
      '[&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_td]:font-semibold [&_td]:text-slate-900',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

/* ===========================
   Caption
   =========================== */
export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-xs text-slate-500 text-left', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';
