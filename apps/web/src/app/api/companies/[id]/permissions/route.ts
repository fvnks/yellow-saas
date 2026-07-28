import { query } from '@/api/lib/db';
import { getCompanyId, paginatedResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const ALL_PERMISSIONS = [
  { module: 'inventory', action: 'create', description: 'Crear productos' },
  { module: 'inventory', action: 'read', description: 'Ver productos' },
  { module: 'inventory', action: 'update', description: 'Editar productos' },
  { module: 'inventory', action: 'delete', description: 'Eliminar productos' },
  { module: 'warehouses', action: 'create', description: 'Crear bodegas' },
  { module: 'warehouses', action: 'read', description: 'Ver bodegas' },
  { module: 'warehouses', action: 'update', description: 'Editar bodegas' },
  { module: 'warehouses', action: 'delete', description: 'Eliminar bodegas' },
  { module: 'sales_orders', action: 'create', description: 'Crear órdenes de venta' },
  { module: 'sales_orders', action: 'read', description: 'Ver órdenes de venta' },
  { module: 'sales_orders', action: 'update', description: 'Editar órdenes de venta' },
  { module: 'sales_orders', action: 'delete', description: 'Eliminar órdenes de venta' },
  { module: 'delivery_guides', action: 'create', description: 'Crear guías de despacho' },
  { module: 'delivery_guides', action: 'read', description: 'Ver guías de despacho' },
  { module: 'delivery_guides', action: 'update', description: 'Editar guías de despacho' },
  { module: 'delivery_guides', action: 'delete', description: 'Eliminar guías de despacho' },
  { module: 'invoices', action: 'create', description: 'Crear facturas' },
  { module: 'invoices', action: 'read', description: 'Ver facturas' },
  { module: 'invoices', action: 'update', description: 'Editar facturas' },
  { module: 'invoices', action: 'delete', description: 'Eliminar facturas' },
  { module: 'pos', action: 'create', description: 'Crear ventas POS' },
  { module: 'pos', action: 'read', description: 'Ver ventas POS' },
  { module: 'pos', action: 'update', description: 'Editar ventas POS' },
  { module: 'pos', action: 'delete', description: 'Eliminar ventas POS' },
  { module: 'purchase_orders', action: 'create', description: 'Crear órdenes de compra' },
  { module: 'purchase_orders', action: 'read', description: 'Ver órdenes de compra' },
  { module: 'purchase_orders', action: 'update', description: 'Editar órdenes de compra' },
  { module: 'purchase_orders', action: 'delete', description: 'Eliminar órdenes de compra' },
  { module: 'quotations', action: 'create', description: 'Crear cotizaciones' },
  { module: 'quotations', action: 'read', description: 'Ver cotizaciones' },
  { module: 'quotations', action: 'update', description: 'Editar cotizaciones' },
  { module: 'quotations', action: 'delete', description: 'Eliminar cotizaciones' },
  { module: 'customers', action: 'create', description: 'Crear clientes' },
  { module: 'customers', action: 'read', description: 'Ver clientes' },
  { module: 'customers', action: 'update', description: 'Editar clientes' },
  { module: 'customers', action: 'delete', description: 'Eliminar clientes' },
  { module: 'suppliers', action: 'create', description: 'Crear proveedores' },
  { module: 'suppliers', action: 'read', description: 'Ver proveedores' },
  { module: 'suppliers', action: 'update', description: 'Editar proveedores' },
  { module: 'suppliers', action: 'delete', description: 'Eliminar proveedores' },
  { module: 'crm', action: 'create', description: 'Crear contactos CRM' },
  { module: 'crm', action: 'read', description: 'Ver contactos CRM' },
  { module: 'crm', action: 'update', description: 'Editar contactos CRM' },
  { module: 'crm', action: 'delete', description: 'Eliminar contactos CRM' },
  { module: 'price_lists', action: 'create', description: 'Crear listas de precio' },
  { module: 'price_lists', action: 'read', description: 'Ver listas de precio' },
  { module: 'price_lists', action: 'update', description: 'Editar listas de precio' },
  { module: 'price_lists', action: 'delete', description: 'Eliminar listas de precio' },
  { module: 'payroll', action: 'create', description: 'Crear registros de nómina' },
  { module: 'payroll', action: 'read', description: 'Ver nómina' },
  { module: 'payroll', action: 'update', description: 'Editar nómina' },
  { module: 'payroll', action: 'delete', description: 'Eliminar nómina' },
  { module: 'accounting', action: 'create', description: 'Crear asientos contables' },
  { module: 'accounting', action: 'read', description: 'Ver contabilidad' },
  { module: 'accounting', action: 'update', description: 'Editar asientos contables' },
  { module: 'accounting', action: 'delete', description: 'Eliminar asientos contables' },
  { module: 'projects', action: 'create', description: 'Crear proyectos' },
  { module: 'projects', action: 'read', description: 'Ver proyectos' },
  { module: 'projects', action: 'update', description: 'Editar proyectos' },
  { module: 'projects', action: 'delete', description: 'Eliminar proyectos' },
  { module: 'reports', action: 'read', description: 'Ver reportes' },
  { module: 'audit', action: 'read', description: 'Ver auditoría' },
  { module: 'settings', action: 'read', description: 'Ver configuración' },
  { module: 'settings', action: 'update', description: 'Editar configuración' },
  { module: 'users', action: 'create', description: 'Invitar usuarios' },
  { module: 'users', action: 'read', description: 'Ver usuarios' },
  { module: 'users', action: 'update', description: 'Editar usuarios' },
  { module: 'users', action: 'delete', description: 'Eliminar usuarios' },
  { module: 'roles', action: 'create', description: 'Crear roles' },
  { module: 'roles', action: 'read', description: 'Ver roles' },
  { module: 'roles', action: 'update', description: 'Editar roles' },
  { module: 'roles', action: 'delete', description: 'Eliminar roles' },
];

export async function GET(request: NextRequest) {
  try {
    const { rows } = await query(
      `SELECT * FROM permissions ORDER BY module, action`
    );

    return paginatedResponse(rows || [], rows.length, 1, 100);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
