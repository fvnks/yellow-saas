'use client'; import { useState } from 'react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import PurchaseInvoices from '../components/PurchaseInvoices';
import PurchaseCreditNotes from '../components/PurchaseCreditNotes';
import PurchaseDebitNotes from '../components/PurchaseDebitNotes';
import PurchaseDeliveryGuides from '../components/PurchaseDeliveryGuides'; const tabs = [ { id: 'invoices', label: 'Facturas de Compra' }, { id: 'credit-notes', label: 'Notas de Crédito' }, { id: 'debit-notes', label: 'Notas de Débito' }, { id: 'delivery-guides', label: 'Guías de Despacho' },
]; export default function PurchaseDocumentsPage() { const [activeTab, setActiveTab] = useState('invoices'); return ( <div className="space-y-6"> <div className="flex items-center justify-between"> <div> <h1 className="text-xl font-bold text-foreground">Documentos de Compra</h1> <p className="text-sm text-muted-foreground mt-1">Documentos recibidos de proveedores desde el SII</p> </div> </div> <div className="bg-card border border-border rounded-xl shadow-sm"> <ContinuousTabs tabs={tabs} defaultActiveId={activeTab} onChange={setActiveTab} /> <div className="p-6"> {activeTab === 'invoices' && <PurchaseInvoices />} {activeTab === 'credit-notes' && <PurchaseCreditNotes />} {activeTab === 'debit-notes' && <PurchaseDebitNotes />} {activeTab === 'delivery-guides' && <PurchaseDeliveryGuides />} </div> </div> </div> );
}
