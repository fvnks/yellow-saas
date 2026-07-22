'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, User, DollarSign, CreditCard, ArrowRight } from 'lucide-react';

interface Transaction {
  type: 'invoice' | 'credit_note' | 'debit_note' | 'payment';
  date: string;
  reference: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
}

interface StatementData {
  customer: {
    id: string;
    name: string;
    tax_id: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    credit_limit: number;
  };
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    totalBalance: number;
    totalCreditNotes: number;
    totalDebitNotes: number;
  };
  transactions: Transaction[];
}

const txTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  invoice: { label: 'Factura', color: 'text-blue-700', bg: 'bg-blue-50' },
  credit_note: { label: 'N. Crédito', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  debit_note: { label: 'N. Débito', color: 'text-orange-700', bg: 'bg-orange-50' },
  payment: { label: 'Pago', color: 'text-indigo-700', bg: 'bg-indigo-50' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Pagada', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  Pagada: { label: 'Pagada', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  'Pago Parcial': { label: 'Parcial', color: 'text-amber-700', bg: 'bg-amber-50' },
  Pendiente: { label: 'Pendiente', color: 'text-blue-700', bg: 'bg-blue-50' },
  Vencida: { label: 'Vencida', color: 'text-red-700', bg: 'bg-red-50' },
};

export default function CustomerStatement() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const companyId = localStorage.getItem('company_id');
    fetch(`/api/companies/${companyId}/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data.data || []))
      .catch(() => {});
  }, []);

  const loadStatement = async () => {
    if (!selectedCustomer) return;
    setLoading(true);
    try {
      const companyId = localStorage.getItem('company_id');
      const res = await fetch(`/api/companies/${companyId}/customer-statement?customerId=${selectedCustomer}`);
      if (res.ok) {
        const json = await res.json();
        setStatement(json.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (selectedCustomer) loadStatement(); }, [selectedCustomer]);

  const formatMoney = (val: number) => `$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tax_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500" />
        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Estado de Cuenta</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Seleccionar cliente...</option>
            {filteredCustomers.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.tax_id}</option>
            ))}
          </select>
        </div>
      </div>

      {!statement && (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Selecciona un cliente para ver su estado de cuenta</p>
        </div>
      )}

      {statement && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{statement.customer.name}</h3>
                <p className="text-xs text-slate-500">RUT: {statement.customer.tax_id}</p>
                {statement.customer.email && <p className="text-xs text-slate-500">{statement.customer.email}</p>}
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold text-slate-500 uppercase">Saldo Actual</p>
                <p className="text-2xl font-bold text-slate-900">{formatMoney(statement.summary.totalBalance)}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-[9px] font-semibold text-blue-700 uppercase">Facturado</p>
                <p className="text-sm font-bold text-slate-900">{formatMoney(statement.summary.totalInvoiced)}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-[9px] font-semibold text-emerald-700 uppercase">Pagado</p>
                <p className="text-sm font-bold text-slate-900">{formatMoney(statement.summary.totalPaid)}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-[9px] font-semibold text-amber-700 uppercase">N. Crédito</p>
                <p className="text-sm font-bold text-slate-900">{formatMoney(statement.summary.totalCreditNotes)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-[9px] font-semibold text-orange-700 uppercase">N. Débito</p>
                <p className="text-sm font-bold text-slate-900">{formatMoney(statement.summary.totalDebitNotes)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Movimientos</h3>
              <span className="text-[9px] font-semibold text-slate-500">{statement.transactions.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Referencia</th>
                    <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Fecha</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Monto</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Pagado</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Saldo</th>
                    <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.transactions.map((tx, idx) => {
                    const txCfg = txTypeConfig[tx.type] || txTypeConfig.invoice;
                    const stCfg = statusConfig[tx.status] || { label: tx.status, color: 'text-slate-700', bg: 'bg-slate-100' };
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${txCfg.bg} ${txCfg.color}`}>
                            {txCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-900">{tx.reference}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{new Date(tx.date).toLocaleDateString('es-CL')}</td>
                        <td className={`px-4 py-3 text-xs text-right font-medium ${tx.amount >= 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                          {tx.amount >= 0 ? formatMoney(tx.amount) : `-${formatMoney(tx.amount)}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-right text-slate-600">{tx.paid > 0 ? formatMoney(tx.paid) : '-'}</td>
                        <td className={`px-4 py-3 text-xs text-right font-bold ${tx.balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                          {tx.balance > 0 ? formatMoney(tx.balance) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${stCfg.bg} ${stCfg.color}`}>
                            {stCfg.label}
                          </span>
                        </td>
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
