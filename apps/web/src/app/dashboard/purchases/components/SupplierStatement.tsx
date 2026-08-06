'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, DollarSign, CreditCard, ArrowRight } from 'lucide-react';

export default function SupplierStatement() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/suppliers`).then(r => r.json()).then(d => setSuppliers(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSupplier) return;
    setLoading(true);
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/supplier-statement?supplierId=${selectedSupplier}`)
      .then(r => r.json()).then(d => { setStatement(d.data); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedSupplier]);

  const fmt = (v: number) => `$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const txTypeCfg: Record<string, { label: string; color: string; bg: string }> = {
    invoice: { label: 'Factura', color: 'text-blue-700', bg: 'bg-blue-50' },
    credit_note: { label: 'NC', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    debit_note: { label: 'ND', color: 'text-orange-700', bg: 'bg-orange-50' },
    return: { label: 'Devolución', color: 'text-red-700', bg: 'bg-red-50' },
  };

  const filtered = suppliers.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.tax_id?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado de Cuenta Proveedor</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 dark:bg-primary dark:border-slate-800">
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Buscar proveedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent" />
          <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
            className="w-72 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
            <option value="">Seleccionar proveedor...</option>
            {filtered.map(s => <option key={s.id} value={s.id}>{s.name} — {s.tax_id}</option>)}
          </select>
        </div>
      </div>

      {!selectedSupplier && (
        <div className="text-center py-12 bg-muted border border-dashed border-slate-300 rounded-xl">
          <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Selecciona un proveedor</p>
        </div>
      )}

      {selectedSupplier && loading && <div className="text-center py-8 text-xs text-muted-foreground">Cargando...</div>}

      {!loading && statement && (
        <>
          <div className="bg-card border border-border rounded-xl p-6 dark:bg-primary dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{statement.supplier.name}</h3>
                <p className="text-xs text-muted-foreground">RUT: {statement.supplier.tax_id}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase">Saldo</p>
                <p className="text-2xl font-bold text-foreground">{fmt(statement.summary.totalBalance)}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3"><p className="text-[9px] font-semibold text-blue-700 uppercase">Facturado</p><p className="text-sm font-bold text-foreground">{fmt(statement.summary.totalInvoiced)}</p></div>
              <div className="bg-emerald-50 rounded-lg p-3"><p className="text-[9px] font-semibold text-emerald-700 uppercase">Pagado</p><p className="text-sm font-bold text-foreground">{fmt(statement.summary.totalPaid)}</p></div>
              <div className="bg-amber-50 rounded-lg p-3"><p className="text-[9px] font-semibold text-amber-700 uppercase">NC</p><p className="text-sm font-bold text-foreground">{fmt(statement.summary.totalCreditNotes)}</p></div>
              <div className="bg-red-50 rounded-lg p-3"><p className="text-[9px] font-semibold text-red-700 uppercase">ND</p><p className="text-sm font-bold text-foreground">{fmt(statement.summary.totalDebitNotes)}</p></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl dark:bg-primary dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Movimientos</h3>
              <span className="text-[9px] font-semibold text-muted-foreground">{statement.transactions.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Tipo</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Referencia</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Fecha</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Monto</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Pagado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase">Saldo</th>
                </tr></thead>
                <tbody>
                  {statement.transactions.map((tx: any, i: number) => {
                    const cfg = txTypeCfg[tx.type] || txTypeCfg.invoice;
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-muted transition-colors">
                        <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{tx.reference}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{new Date(tx.date).toLocaleDateString('es-CL')}</td>
                        <td className={`px-4 py-3 text-xs text-right font-medium ${tx.amount >= 0 ? 'text-foreground' : 'text-emerald-600'}`}>{tx.amount >= 0 ? fmt(tx.amount) : `-${fmt(tx.amount)}`}</td>
                        <td className="px-4 py-3 text-xs text-right text-slate-600">{tx.paid > 0 ? fmt(tx.paid) : '-'}</td>
                        <td className={`px-4 py-3 text-xs text-right font-bold ${tx.balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>{tx.balance > 0 ? fmt(tx.balance) : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
