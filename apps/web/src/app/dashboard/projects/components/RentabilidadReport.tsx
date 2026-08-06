'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Download } from 'lucide-react';

interface RentabilidadProps {
  project: any;
  costs: any[];
  expenses: any[];
  timesheets: any[];
}

export default function RentabilidadReport({ project, costs, expenses, timesheets }: RentabilidadProps) {
  const data = useMemo(() => {
    const budget = Number(project.budget) || 0;
    const totalCosts = costs.reduce((s: number, c: any) => s + Number(c.amount), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
    const totalCost = totalCosts + totalExpenses;
    const totalHours = timesheets.reduce((s: number, t: any) => s + Number(t.hours), 0);
    const billableHours = timesheets.filter((t: any) => t.billable).reduce((s: number, t: any) => s + Number(t.hours), 0);
    const margin = budget - totalCost;
    const marginPercent = budget > 0 ? Math.round((margin / budget) * 100) : 0;
    const costPerHour = billableHours > 0 ? totalCost / billableHours : 0;

    return { budget, totalCosts, totalExpenses, totalCost, totalHours, billableHours, margin, marginPercent, costPerHour };
  }, [project, costs, expenses, timesheets]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Rentabilidad', w / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${project.name} (${project.code})`, w / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, w / 2, y, { align: 'center' });
    doc.setTextColor(0);
    y += 12;

    doc.setDrawColor(200);
    doc.line(20, y, w - 20, y);
    y += 10;

    const addRow = (label: string, value: string, bold = false) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.text(label, 25, y);
      doc.text(value, w - 25, y, { align: 'right' });
      y += 7;
    };

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Financiero', 25, y);
    y += 8;

    addRow('Presupuesto', formatCurrency(data.budget));
    addRow('Costo Total', formatCurrency(data.totalCost), true);
    if (data.totalCosts > 0) addRow('  Compras / Inventario', formatCurrency(data.totalCosts));
    if (data.totalExpenses > 0) addRow('  Gastos Directos', formatCurrency(data.totalExpenses));
    addRow('Margen', `${formatCurrency(data.margin)} (${data.marginPercent}%)`, true);
    addRow('Costo por Hora', formatCurrency(data.costPerHour));
    y += 5;

    doc.setDrawColor(200);
    doc.line(20, y, w - 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Horas', 25, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addRow('Total Horas', `${data.totalHours.toFixed(1)}h`);
    addRow('Horas Facturables', `${data.billableHours.toFixed(1)}h`);

    if (costs.length > 0) {
      y += 5;
      doc.setDrawColor(200);
      doc.line(20, y, w - 20, y);
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Costos por Fuente', 25, y);
      y += 8;

      const bySource: Record<string, number> = {};
      costs.forEach((c: any) => {
        const src = c.source_type || 'other';
        bySource[src] = (bySource[src] || 0) + Number(c.amount || 0);
      });
      const sourceLabels: Record<string, string> = { purchase: 'Compras', sales: 'Ventas', inventory: 'Inventario', manual: 'Manual', payroll: 'Nómina', expense: 'Gastos' };
      Object.entries(bySource).forEach(([src, total]) => {
        addRow(sourceLabels[src] || src, formatCurrency(total));
      });
    }

    if (expenses.length > 0) {
      y += 5;
      doc.setDrawColor(200);
      doc.line(20, y, w - 20, y);
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Gastos por Categoria', 25, y);
      y += 8;

      const byCat: Record<string, number> = {};
      expenses.forEach((e: any) => {
        byCat[e.category || 'other'] = (byCat[e.category || 'other'] || 0) + Number(e.amount || 0);
      });
      const catLabels: Record<string, string> = { travel: 'Viajes', materials: 'Materiales', services: 'Servicios', equipment: 'Equipamiento', subcontract: 'Subcontratacion', other: 'Otros' };
      Object.entries(byCat).forEach(([cat, total]) => {
        addRow(catLabels[cat] || cat, formatCurrency(total));
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Yellow ERP - Modulo de Proyectos', w / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`rentabilidad-${project.code || 'proyecto'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Reporte de Rentabilidad</h3>
        <button onClick={handleExportPDF} className="bg-card border border-border hover:bg-muted text-foreground dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Presupuesto</p>
          <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(data.budget)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo Total</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(data.totalCost)}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{data.totalCosts > 0 ? `Compras/Inv: ${formatCurrency(data.totalCosts)}` : ''} {data.totalExpenses > 0 ? `Gastos: ${formatCurrency(data.totalExpenses)}` : ''}</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Margen</p>
          <p className={`text-xl font-bold mt-1 ${data.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(data.margin)}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{data.marginPercent}% del presupuesto</p>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-4 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Costo/Hora</p>
          <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(data.costPerHour)}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{data.billableHours}h facturables</p>
        </div>
      </div>

      {/* Margin bar */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {data.margin >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
            <div>
              <p className="text-sm font-semibold text-foreground">Margen del Proyecto</p>
              <p className="text-xs text-muted-foreground">{data.margin >= 0 ? 'Proyecto rentable' : 'Proyecto con perdida'}</p>
            </div>
          </div>
          <span className={`text-2xl font-bold ${data.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{data.marginPercent}%</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${data.marginPercent >= 20 ? 'bg-emerald-500' : data.marginPercent >= 0 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.max(data.marginPercent, 0), 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 dark:bg-primary dark:border-slate-800 dark:bg-primary dark:border-slate-800">
        <h4 className="text-sm font-semibold text-foreground mb-4">Desglose de Costos</h4>
        <div className="space-y-3">
          {[
            { label: 'Compras / Inventario', value: data.totalCosts, icon: DollarSign },
            { label: 'Gastos Directos', value: data.totalExpenses, icon: DollarSign },
            { label: 'Horas Trabajadas', value: data.totalHours, unit: 'h', icon: BarChart3 },
            { label: 'Horas Facturables', value: data.billableHours, unit: 'h', icon: BarChart3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-semibold text-foreground">
                {item.unit ? `${Number(item.value).toFixed(1)}${item.unit}` : formatCurrency(Number(item.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
