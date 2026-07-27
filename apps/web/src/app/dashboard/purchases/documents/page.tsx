'use client';

import { useState } from 'react';
import { FileText, ReceiptText, RotateCcw, FileMinus, ClipboardList } from 'lucide-react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import PurchaseInvoices from '../components/PurchaseInvoices';
import PurchaseCreditNotes from '../components/PurchaseCreditNotes';
import PurchaseDebitNotes from '../components/PurchaseDebitNotes';
import PurchaseReturns from '../components/PurchaseReturns';

const tabs = [
  { id: 'invoices', label: 'Facturas de Compra' },
  { id: 'credit-notes', label: 'Notas de Crédito' },
  { id: 'debit-notes', label: 'Notas de Débito' },
  { id: 'returns', label: 'Devoluciones' },
];

export default function PurchaseDocumentsPage() {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Documentos de Compra</h1>
          <p className="text-sm text-slate-500 mt-1">Facturas, notas de crédito, notas de débito y devoluciones</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <ContinuousTabs
          tabs={tabs}
          defaultActiveId={activeTab}
          onChange={setActiveTab}
        />
        <div className="p-6">
          {activeTab === 'invoices' && <PurchaseInvoices />}
          {activeTab === 'credit-notes' && <PurchaseCreditNotes />}
          {activeTab === 'debit-notes' && <PurchaseDebitNotes />}
          {activeTab === 'returns' && <PurchaseReturns />}
        </div>
      </div>
    </div>
  );
}
