'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';

interface ImportRow {
  sku?: string;
  product_name?: string;
  product_id?: string;
  quantity: number;
  notes?: string;
}

export default function PedidosImportPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const api = getApiClient();
    api.getWarehouses().then(d => setWarehouses(d.data || [])).catch(() => {});
    api.getProducts({ limit: '500' }).then(d => setProducts(d.data || [])).catch(() => {});
  }, []);

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const skuIdx = headers.findIndex(h => h.includes('sku'));
    const nameIdx = headers.findIndex(h => h.includes('producto') || h.includes('name'));
    const qtyIdx = headers.findIndex(h => h.includes('cantidad') || h.includes('quantity'));
    const notesIdx = headers.findIndex(h => h.includes('nota') || h.includes('note'));
    const parsed: ImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const qty = parseFloat(cols[qtyIdx]) || 0;
      if (qty <= 0) continue;
      parsed.push({
        sku: skuIdx >= 0 ? cols[skuIdx] : undefined,
        product_name: nameIdx >= 0 ? cols[nameIdx] : undefined,
        quantity: qty,
        notes: notesIdx >= 0 ? cols[notesIdx] : undefined,
      });
    }
    setRows(parsed);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => { parseCSV(ev.target?.result as string); };
    reader.readAsText(file);
  };

  const resolveProduct = (row: ImportRow) => {
    if (row.sku) { const p = products.find((p: any) => p.sku === row.sku); if (p) return p.id; }
    if (row.product_name) { const p = products.find((p: any) => p.name.toLowerCase().includes(row.product_name!.toLowerCase())); if (p) return p.id; }
    return null;
  };

  const handleImport = async () => {
    if (!selectedWarehouse || rows.length === 0) return;
    setImporting(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const importRows = rows.map(r => ({ product_id: resolveProduct(r), sku: r.sku, product_name: r.product_name, quantity: r.quantity, notes: r.notes })).filter(r => r.product_id);
      const res = await fetch(`/api/companies/${companyId}/internal-orders/import`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warehouse_id: selectedWarehouse, rows: importRows }),
      });
      const data = await res.json();
      setResult(data.data);
    } catch { alert('Error al importar'); }
    setImporting(false);
  };

  const downloadTemplate = () => {
    const csv = 'SKU,Producto,Cantidad,Notas\nPROD-001,Producto Ejemplo,10,Nota\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'plantilla_pedidos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/dashboard/sales/pedidos')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
      </button>

      {result ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground">Importación Completada</h2>
          <p className="text-sm text-muted-foreground mt-2">Pedido {result.order?.order_number} creado</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <span className="text-emerald-600">{result.imported} importados</span>
            <span className="text-muted-foreground">de {result.total} filas</span>
            {result.errors?.length > 0 && <span className="text-rose-600">{result.errors.length} errores</span>}
          </div>
          {result.errors?.length > 0 && (
            <div className="mt-4 text-left bg-rose-50 border border-rose-200 rounded-lg p-4">
              {result.errors.map((e: string, i: number) => (<p key={i} className="text-xs text-rose-600">{e}</p>))}
            </div>
          )}
          <button onClick={() => router.push('/dashboard/sales/pedidos')} className="mt-6 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Ver Pedidos
          </button>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-xl font-bold text-foreground">Importar Pedidos</h1>
            <p className="text-sm text-muted-foreground mt-1">Importa pedidos internos desde un archivo CSV</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Bodega Destino</label>
                <select value={selectedWarehouse} onChange={e => setSelectedWarehouse(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
                  <option value="">Seleccionar bodega...</option>
                  {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-primary hover:text-primary">
                <Download className="w-4 h-4" /> Descargar Plantilla
              </button>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground">
                <label className="text-primary hover:text-primary cursor-pointer font-medium">Seleccionar archivo</label> o arrastra un CSV
              </p>
              <input type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="hidden" />
              {fileName && <p className="text-xs text-muted-foreground mt-2">{fileName}</p>}
            </div>
            {rows.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{rows.length} filas detectadas</p>
                <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">SKU</th>
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">Producto</th>
                        <th className="text-right px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">Cantidad</th>
                        <th className="text-left px-3 py-2 text-[9px] font-semibold text-muted-foreground uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => {
                        const found = !!resolveProduct(r);
                        return (
                          <tr key={i} className="border-t border-border">
                            <td className="px-3 py-2 font-mono text-foreground">{r.sku || '—'}</td>
                            <td className="px-3 py-2 text-foreground">{r.product_name || '—'}</td>
                            <td className="px-3 py-2 text-right text-foreground">{r.quantity}</td>
                            <td className="px-3 py-2">
                              {found ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OK</span> : <span className="text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No encontrado</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleImport} disabled={!selectedWarehouse || importing}
                  className="mt-4 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {importing ? 'Importando...' : `Importar ${rows.filter(r => resolveProduct(r)).length} items`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
