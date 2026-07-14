'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Select } from '@yellow-erp/ui';
import { ArrowLeft, Download, Package } from 'lucide-react';
import Link from 'next/link';
import { getApiClient } from '../../../../lib/api-client';

interface StockRow {
  product_id: string;
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  warehouse_code: string;
  quantity: number;
  cost_price: number;
  total_value: number;
}

export default function StockReportPage() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const api = getApiClient();
    Promise.all([
      api.getProducts({ limit: '500', include_inactive: 'true' }),
      api.getWarehouses(),
    ]).then(([productsRes, warehousesRes]) => {
      const whList = (warehousesRes.data || []).map((w: any) => ({ value: w.id, label: w.name }));
      setWarehouses(whList);

      const stockRows: StockRow[] = [];
      for (const p of productsRes.data || []) {
        const levels = p.stock_levels || [];
        for (const sl of levels) {
          stockRows.push({
            product_id: p.id,
            product_name: p.name,
            product_sku: p.sku,
            warehouse_name: sl.warehouse?.name || '',
            warehouse_code: sl.warehouse?.code || '',
            quantity: sl.quantity || 0,
            cost_price: p.cost_price || 0,
            total_value: (sl.quantity || 0) * (p.cost_price || 0),
          });
        }
      }
      setRows(stockRows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = warehouseFilter === 'all' ? rows : rows.filter(r => {
    const wh = warehouses.find(w => w.value === warehouseFilter);
    return wh && r.warehouse_name === wh.label;
  });

  const totalValue = filtered.reduce((sum, r) => sum + r.total_value, 0);
  const totalQuantity = filtered.reduce((sum, r) => sum + r.quantity, 0);
  const productCount = new Set(filtered.map(r => r.product_id)).size;

  const byWarehouse = warehouses.map(wh => {
    const whRows = filtered.filter(r => r.warehouse_name === wh.label);
    return {
      name: wh.label,
      value: whRows.reduce((sum, r) => sum + r.total_value, 0),
      count: whRows.length,
    };
  }).filter(w => w.count > 0);

  const handleExportCSV = () => {
    const headers = ['Producto', 'SKU', 'Bodega', 'Cantidad', 'Costo Unitario', 'Valor Total'];
    const csvRows = filtered.map(r => [r.product_name, r.product_sku, r.warehouse_name, r.quantity, r.cost_price, r.total_value]);
    const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'valorizacion-stock.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Valorización de Stock', 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 28);
    doc.text(`Total Productos: ${productCount} | Stock Total: ${totalQuantity} | Valor Total: $${totalValue.toLocaleString('es-CL')}`, 14, 34);

    autoTable(doc, {
      startY: 40,
      head: [['Producto', 'SKU', 'Bodega', 'Cantidad', 'Costo Unit.', 'Valor Total']],
      body: filtered.map(r => [r.product_name, r.product_sku, r.warehouse_name, r.quantity.toString(), `$${r.cost_price.toLocaleString('es-CL')}`, `$${r.total_value.toLocaleString('es-CL')}`]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save('valorizacion-stock.pdf');
  };

  if (loading) {
    return <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-slate-200 h-32 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bodega" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Valorización de Stock</h1>
            <p className="text-sm text-slate-500 mt-1">Reporte de valor de inventario por bodega</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Valor Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">${totalValue.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Productos con Stock</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{productCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Unidades Totales</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalQuantity.toLocaleString('es-CL')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Bodegas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{byWarehouse.length}</p>
        </div>
      </div>

      {byWarehouse.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Por Bodega</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {byWarehouse.map(w => (
              <div key={w.name} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-500">{w.name}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">${w.value.toLocaleString('es-CL')}</p>
                <p className="text-xs text-slate-400 mt-1">{w.count} movimientos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detalle por Producto</CardTitle>
            <Select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              options={[{ value: 'all', label: 'Todas las bodegas' }, ...warehouses]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Costo Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                      No hay datos de stock
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs">{row.product_name}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{row.product_sku}</TableCell>
                      <TableCell className="text-xs">{row.warehouse_name}</TableCell>
                      <TableCell className="text-center text-xs font-bold">{row.quantity}</TableCell>
                      <TableCell className="text-right text-xs">${row.cost_price.toLocaleString('es-CL')}</TableCell>
                      <TableCell className="text-right text-xs font-bold">${row.total_value.toLocaleString('es-CL')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
