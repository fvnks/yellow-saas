'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, KPICard } from '@yellow-erp/ui';
import { ScrollText, Search, Filter, Download, Eye, Calendar, User, Activity, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { getApiClient } from '../../../lib/api-client';

const fallbackLogs = [
  { id: 1, timestamp: '2026-07-11 14:32:15', user: 'admin@yellow.cl', action: 'create', module: 'Ventas', entity: 'Venta #VT-2026-089', details: 'Creó venta a Empresa Norte por $3.250.000', ip: '192.168.1.100' },
  { id: 2, timestamp: '2026-07-11 14:28:45', user: 'juan@yellow.cl', action: 'update', module: 'Inventario', entity: 'Producto LP-HP-450', details: 'Actualizó stock de 15 a 12 unidades', ip: '192.168.1.101' },
  { id: 3, timestamp: '2026-07-11 13:15:22', user: 'admin@yellow.cl', action: 'delete', module: 'Clientes', entity: 'Cliente #CLI-023', details: 'Eliminó cliente "Empresa Test SpA"', ip: '192.168.1.100' },
  { id: 4, timestamp: '2026-07-11 12:45:10', user: 'maria@yellow.cl', action: 'login', module: 'Auth', entity: '-', details: 'Inicio de sesión exitoso', ip: '10.0.0.55' },
  { id: 5, timestamp: '2026-07-11 11:30:00', user: 'admin@yellow.cl', action: 'create', module: 'Compras', entity: 'Orden OC-2026-015', details: 'Creó orden de compra a Distribuidora Chile por $1.890.000', ip: '192.168.1.100' },
  { id: 6, timestamp: '2026-07-11 10:20:33', user: 'juan@yellow.cl', action: 'update', module: 'Facturación', entity: 'Factura FAC-2026-044', details: 'Cambió estado de "Borrador" a "Enviada"', ip: '192.168.1.101' },
  { id: 7, timestamp: '2026-07-11 09:15:18', user: 'admin@yellow.cl', action: 'config', module: 'Configuración', entity: 'Empresa', details: 'Actualizó datos de la empresa', ip: '192.168.1.100' },
  { id: 8, timestamp: '2026-07-10 18:45:00', user: 'maria@yellow.cl', action: 'export', module: 'Reportes', entity: 'Reporte Mensual', details: 'Exportó reporte de ventas junio 2026 (PDF)', ip: '10.0.0.55' },
  { id: 9, timestamp: '2026-07-10 16:22:11', user: 'admin@yellow.cl', action: 'create', module: 'Nómina', entity: 'Nómina NÓM-2026-006', details: 'Generó nómina de junio 2026 para 6 empleados', ip: '192.168.1.100' },
  { id: 10, timestamp: '2026-07-10 14:10:55', user: 'juan@yellow.cl', action: 'update', module: 'Almacenes', entity: 'Stock BC-01', details: 'Registró movimiento de entrada: +50 unidades SKU-001', ip: '192.168.1.101' },
  { id: 11, timestamp: '2026-07-10 11:05:30', user: 'admin@yellow.cl', action: 'delete', module: 'Proveedores', entity: 'Proveedor SUP-008', details: 'Eliminó proveedor "Distribuidora Test"', ip: '192.168.1.100' },
  { id: 12, timestamp: '2026-07-10 09:00:00', user: 'maria@yellow.cl', action: 'login', module: 'Auth', entity: '-', details: 'Inicio de sesión exitoso', ip: '10.0.0.55' },
];

const actionConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  create: { label: 'Crear', icon: CheckCircle2, color: 'text-emerald-600' },
  update: { label: 'Actualizar', icon: Activity, color: 'text-blue-600' },
  delete: { label: 'Eliminar', icon: XCircle, color: 'text-rose-600' },
  login: { label: 'Login', icon: User, color: 'text-indigo-600' },
  config: { label: 'Config', icon: AlertTriangle, color: 'text-amber-600' },
  export: { label: 'Exportar', icon: Download, color: 'text-slate-600' },
};

const moduleColors: Record<string, string> = {
  'Ventas': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Inventario': 'bg-blue-50 text-blue-700 border-blue-200',
  'Clientes': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Compras': 'bg-amber-50 text-amber-700 border-amber-200',
  'Facturación': 'bg-purple-50 text-purple-700 border-purple-200',
  'Configuración': 'bg-slate-100 text-slate-700 border-slate-200',
  'Reportes': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Nómina': 'bg-pink-50 text-pink-700 border-pink-200',
  'Almacenes': 'bg-orange-50 text-orange-700 border-orange-200',
  'Proveedores': 'bg-teal-50 text-teal-700 border-teal-200',
  'Auth': 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState(fallbackLogs);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

useEffect(() => {
    const api = getApiClient();
    api.getAuditLogs()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((log, index) => ({
            id: index + 1,
            timestamp: log.created_at,
            user: log.user?.full_name || log.user?.email || 'unknown',
            action: log.action,
            module: log.entity_type,
            entity: log.entity_id || '-',
            details: log.details || '',
            ip: '-',
          }));
          setAuditLogs(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  const modules = [...new Set(auditLogs.map(l => l.module))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Auditoría</h1>
          <p className="text-sm text-slate-500 mt-1">Registro de actividades y cambios del sistema</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          Exportar Log
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Eventos Hoy" value={auditLogs.filter(l => l.timestamp.startsWith('2026-07-11')).length} icon={Activity} trend="Registrados" trendUp={true} />
        <KPICard label="Usuarios Activos" value={new Set(auditLogs.map(l => l.user)).size} icon={User} trend="Ãšltimas 24h" trendUp={true} />
        <KPICard label="Eliminaciones" value={auditLogs.filter(l => l.action === 'delete').length} icon={XCircle} trend="Ãšltima semana" trendUp={false} />
        <KPICard label="Módulos Afectados" value={modules.length} icon={ScrollText} trend="Diferentes módulos" trendUp={true} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Buscar en detalles, usuario o entidad..."
            />
          </div>
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las acciones' },
              { value: 'create', label: 'Crear' },
              { value: 'update', label: 'Actualizar' },
              { value: 'delete', label: 'Eliminar' },
              { value: 'login', label: 'Login' },
              { value: 'config', label: 'Configuración' },
              { value: 'export', label: 'Exportar' },
            ]}
          />
          <Select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los módulos' },
              ...modules.map(m => ({ value: m, label: m })),
            ]}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Fecha/Hora</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Módulo</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Entidad</th>
                <th className="text-left px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Detalles</th>
                <th className="text-right px-4 py-3 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const actionInfo = actionConfig[log.action] || actionConfig.update;
                const ActionIcon = actionInfo.icon;
                return (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{log.user}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${actionInfo.color}`}>
                        <ActionIcon className="w-3.5 h-3.5" />
                        {actionInfo.label}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${moduleColors[log.module] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{log.entity}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 text-right font-mono">{log.ip}</td>
                    <td className="px-4 py-3">
                      <Button variant="secondary" size="sm"><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <ScrollText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron registros de auditoría</p>
        </div>
      )}
    </div>
  );
}

