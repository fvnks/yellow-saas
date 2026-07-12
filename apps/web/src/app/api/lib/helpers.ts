import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';

export const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgresql://demo:demo@localhost:5432/demo';

export async function getCompanyId(request: NextRequest): Promise<string | null> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const companiesIndex = pathParts.indexOf('companies');
  if (companiesIndex === -1 || !pathParts[companiesIndex + 1]) return null;
  return pathParts[companiesIndex + 1];
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function parseSearchParams(request: NextRequest) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const sort = url.searchParams.get('sort') || 'created_at';
  const order = url.searchParams.get('order') || 'desc';
  const offset = (page - 1) * limit;
  return { page, limit, search, sort, order, offset };
}

export function getDemoData(entity: string) {
  const demoData: Record<string, unknown[]> = {
    products: [
      { id: '1', name: 'Laptop HP ProBook 450', sku: 'LP-HP-450', price: 650000, stock: 25, warehouse: 'Bodega Central' },
      { id: '2', name: 'Mouse Logitech MX Master 3S', sku: 'MS-LG-MX3', price: 89000, stock: 150, warehouse: 'Bodega Central' },
      { id: '3', name: 'Monitor Dell 27" 4K', sku: 'MN-DELL-27', price: 420000, stock: 18, warehouse: 'Bodega Norte' },
      { id: '4', name: 'Teclado Mecánico Keychron K2', sku: 'KB-KC-K2', price: 95000, stock: 45, warehouse: 'Bodega Sur' },
      { id: '5', name: 'Disco SSD Samsung 980 PRO 1TB', sku: 'SSD-SAM-980', price: 110000, stock: 60, warehouse: 'Bodega Central' },
    ],
    warehouses: [
      { id: '1', name: 'Bodega Central', code: 'BC-01', total_products: 3, total_stock: 235, is_default: true },
      { id: '2', name: 'Bodega Norte', code: 'BN-02', total_products: 1, total_stock: 18, is_default: false },
      { id: '3', name: 'Bodega Sur', code: 'BS-03', total_products: 1, total_stock: 45, is_default: false },
    ],
    customers: [
      { id: '1', name: 'Empresa ABC SpA', email: 'ventas@abc.cl', phone: '+56 2 2222 3333', tax_id: '76.123.456-7' },
      { id: '2', name: 'Comercial XYZ Ltda', email: 'contacto@xyz.cl', phone: '+56 2 4444 5555', tax_id: '76.234.567-8' },
      { id: '3', name: 'Distribuidora Norte', email: 'compras@norte.cl', phone: '+56 2 6666 7777', tax_id: '76.345.678-9' },
      { id: '4', name: 'Retail Sur SA', email: 'pedidos@sur.cl', phone: '+56 2 8888 9999', tax_id: '76.456.789-0' },
      { id: '5', name: 'Importadora Chile', email: 'ventas@importadora.cl', phone: '+56 2 1111 2222', tax_id: '76.567.890-1' },
    ],
    suppliers: [
      { id: '1', name: 'Logistica Norte SpA', email: 'ventas@lognorte.cl', phone: '+56 2 3333 4444', tax_id: '76.111.222-3' },
      { id: '2', name: 'Distribuidora Chile', email: 'contacto@distchile.cl', phone: '+56 2 5555 6666', tax_id: '76.333.444-5' },
      { id: '3', name: 'Mecánica y Repuestos', email: 'ventas@mecrep.cl', phone: '+56 2 7777 8888', tax_id: '76.555.666-7' },
    ],
    'sales-orders': [
      { id: '1', order_number: 'SO-2024-001', customer_id: '1', status: 'delivered', total: 2450000, created_at: '2024-07-11' },
      { id: '2', order_number: 'SO-2024-002', customer_id: '2', status: 'shipped', total: 1200000, created_at: '2024-07-10' },
      { id: '3', order_number: 'SO-2024-003', customer_id: '3', status: 'processing', total: 890000, created_at: '2024-07-10' },
    ],
    'purchase-orders': [
      { id: '1', order_number: 'OC-2024-001', supplier_id: '1', status: 'received', total: 1890000, created_at: '2024-07-09' },
      { id: '2', order_number: 'OC-2024-002', supplier_id: '2', status: 'pending', total: 3200000, created_at: '2024-07-08' },
    ],
    'delivery-guides': [
      { id: '1', guide_number: 'GD-2024-001', order_id: '1', status: 'delivered', transport: 'Chilexpress', created_at: '2024-07-12' },
    ],
    invoices: [
      { id: '1', invoice_number: 'FAC-2024-001', order_id: '1', status: 'paid', total: 2450000, created_at: '2024-07-11' },
    ],
    employees: [
      { id: '1', name: 'Juan Pérez', position: 'Gerente de TI', department: 'Tecnología', salary: 2500000, status: 'active' },
      { id: '2', name: 'María López', position: 'Desarrolladora Senior', department: 'Tecnología', salary: 2000000, status: 'active' },
    ],
    quotations: [
      { id: '1', number: 'COT-2024-001', supplier_id: '1', status: 'pending', total_amount: 1500000, quote_date: '2024-07-09', expiry_date: '2024-08-09', supplier: { id: '1', name: 'Logistica Norte SpA' } },
      { id: '2', number: 'COT-2024-002', supplier_id: '2', status: 'accepted', total_amount: 3200000, quote_date: '2024-07-08', expiry_date: '2024-08-08', supplier: { id: '2', name: 'Distribuidora Chile' } },
      { id: '3', number: 'COT-2024-003', supplier_id: '3', status: 'rejected', total_amount: 890000, quote_date: '2024-07-07', expiry_date: '2024-08-07', supplier: { id: '3', name: 'Mecánica y Repuestos' } },
    ],
    roles: [
      { id: '1', name: 'Admin', description: 'Acceso completo', is_system: true, created_at: '2024-01-01' },
      { id: '2', name: 'Ventas', description: 'Módulo de ventas', is_system: false, created_at: '2024-01-01' },
    ],
    permissions: [
      { id: '1', module: 'inventory', action: 'create', label: 'Crear productos' },
      { id: '2', module: 'inventory', action: 'read', label: 'Ver productos' },
    ],
    'user-roles': [],
    'stock-movements': [
      { id: '1', product_id: '1', warehouse_id: '1', type: 'in', quantity: 10, notes: 'Compra inicial', created_at: '2024-07-01' },
    ],
    'price-lists': [
      { id: '1', name: 'Lista General', is_default: true, items_count: 5 },
    ],
    'journal-entries': [
      { id: '1', entry_number: 'AS-2024-001', entry_date: '2024-07-11', description: 'Venta a Empresa ABC', total_debit: 2450000, total_credit: 2450000, status: 'posted' },
    ],
  };
  return demoData[entity] || [];
}
