import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@yellow-erp/ui';

interface DashboardInventoryProps {
  inventoryValue: number;
  lowStockProducts: number;
  inventoryTurnover: number;
  expiredProducts: number;
}

export const DashboardInventory: React.FC<DashboardInventoryProps> = ({
  inventoryValue,
  lowStockProducts,
  inventoryTurnover,
  expiredProducts
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M CLP`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K CLP`;
    return amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Resumen de Inventario</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Valor Total del Inventario</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">${formatCurrency(inventoryValue)}</p>
            <p className="text-xs text-gray-500 mt-2">Según último cálculo</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Productos con Stock Bajo</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{lowStockProducts}</p>
            <p className="text-xs text-gray-500 mt-2">Requieren reposición</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Rotación de Inventario</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{inventoryTurnover}x</p>
            <p className="text-xs text-gray-500 mt-2">Veces al año</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Productos Vencidos</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{expiredProducts}</p>
            <p className="text-xs text-gray-500 mt-2">Requieren atención inmediata</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
