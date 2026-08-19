'use client'; import { useState } from 'react';
import { BarChart3, TrendingUp, History, FileText, Target, Calendar } from 'lucide-react';
import { ContinuousTabs } from '@/components/ui/continuous-tabs';
import PurchaseDashboard from '../components/PurchaseDashboard';
import PurchaseReports from '../components/PurchaseReports';
import SupplierPriceHistory from '../components/SupplierPriceHistory';
import SupplierContracts from '../components/SupplierContracts';
import PurchaseBudgets from '../components/PurchaseBudgets';
import PurchaseForecast from '../components/PurchaseForecast'; const tabs = [ { id: 'dashboard', label: 'Dashboard' }, { id: 'reports', label: 'Reportes' }, { id: 'price-history', label: 'Hist. Precios' }, { id: 'contracts', label: 'Contratos' }, { id: 'budgets', label: 'Presupuestos' }, { id: 'forecast', label: 'Pronóstico' },
]; export default function PurchaseReportsPage() { const [activeTab, setActiveTab] = useState('dashboard'); return ( <div className="space-y-6"> <div className="flex items-center justify-between"> <div> <h1 className="text-xl font-bold text-foreground">Informes de Compra</h1> <p className="text-sm text-muted-foreground mt-1">Dashboard, reportes, análisis de precios y presupuestos</p> </div> </div> <div className="bg-card border border-border rounded-xl shadow-sm"> <ContinuousTabs tabs={tabs} defaultActiveId={activeTab} onChange={setActiveTab} /> <div className="p-6"> {activeTab === 'dashboard' && <PurchaseDashboard />} {activeTab === 'reports' && <PurchaseReports />} {activeTab === 'price-history' && <SupplierPriceHistory />} {activeTab === 'contracts' && <SupplierContracts />} {activeTab === 'budgets' && <PurchaseBudgets />} {activeTab === 'forecast' && <PurchaseForecast />} </div> </div> </div> );
}
