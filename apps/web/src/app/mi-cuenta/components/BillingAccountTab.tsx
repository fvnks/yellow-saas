'use client';

import { useState, useEffect } from 'react';
import { Save, Download, Receipt, CreditCard, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function BillingAccountTab() {
  const [account, setAccount] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tax_id: '',
    business_name: '',
    address: '',
    city: '',
    region: '',
    country: 'CL',
    billing_email: '',
    phone: '',
    payment_provider: 'stripe',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const api = getApiClient();
      const companyId = api['companyId'];

      const [accountRes, invoicesRes, paymentsRes] = await Promise.all([
        fetch(`/api/companies/${companyId}/billing/account`, { headers: { Authorization: `Bearer ${document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]}` } }).then(r => r.json()),
        fetch(`/api/companies/${companyId}/billing/invoices`, { headers: { Authorization: `Bearer ${document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]}` } }).then(r => r.json()),
        fetch(`/api/companies/${companyId}/billing/payments`, { headers: { Authorization: `Bearer ${document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]}` } }).then(r => r.json()),
      ]);

      const accountData = accountRes.data?.account;
      if (accountData) {
        setAccount(accountData);
        setFormData({
          tax_id: accountData.tax_id || '',
          business_name: accountData.business_name || '',
          address: accountData.address || '',
          city: accountData.city || '',
          region: accountData.region || '',
          country: accountData.country || 'CL',
          billing_email: accountData.billing_email || '',
          phone: accountData.phone || '',
          payment_provider: accountData.payment_provider || 'stripe',
        });
      }

      setInvoices(invoicesRes.data?.invoices || []);
      setPayments(paymentsRes.data?.payments || []);
    } catch (err) {
      console.error('Failed to load billing data:', err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const api = getApiClient();
      const companyId = api['companyId'];
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

      await fetch(`/api/companies/${companyId}/billing/account`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      toast.success('Datos de facturación actualizados');
      loadData();
    } catch (err) {
      toast.error('Error al guardar');
    }
    setSaving(false);
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toLocaleString('es-CL')}`;

  if (loading) {
    return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Billing Info */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Datos de Facturación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">RUT</label>
            <input type="text" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="12.345.678-9" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Razón Social</label>
            <input type="text" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Empresa SpA" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Dirección</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Av. Principal 1234" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Ciudad</label>
            <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Santiago" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Región</label>
            <input type="text" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Región Metropolitana" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Email de Facturación</label>
            <input type="email" value={formData.billing_email} onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="billing@empresa.cl" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Teléfono</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="+56 9 1234 5678" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-foreground">Proveedor de Pagos</label>
            <select value={formData.payment_provider} onChange={(e) => setFormData({ ...formData, payment_provider: e.target.value })}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent">
              <option value="stripe">Stripe</option>
              <option value="mach">Mach</option>
              <option value="webpay">Webpay (Transbank)</option>
              <option value="flow">Flow</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handleSave} disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Historial de Pagos</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay pagos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descripción</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-600">{new Date(payment.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{payment.description || payment.plan_name}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{formatAmount(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${payment.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : payment.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {payment.status === 'completed' ? 'Completado' : payment.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Facturas</h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay facturas disponibles</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">N° Factura</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
                  <th className="text-left px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-muted transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{new Date(invoice.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{formatAmount(invoice.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : invoice.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-muted text-slate-600 border border-border'}`}>
                        {invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Anulada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {invoice.pdf_url && (
                        <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
