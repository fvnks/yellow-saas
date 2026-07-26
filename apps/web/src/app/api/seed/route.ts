import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

async function safeInsert(sql: string, params: unknown[]): Promise<boolean> {
  try { await query(sql, params); return true; } catch { return false; }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company_id, secret } = body;

  if (secret !== '47a3253fc5158827fee1e881806096da0da033cd7b243da906db5f08bacb6877') {
    return errorResponse('Unauthorized', 401);
  }
  if (!company_id) return errorResponse('company_id required', 400);

  const results: string[] = [];
  try {
    // Check if already seeded
    const existing = await query('SELECT COUNT(*) as c FROM products WHERE company_id = $1', [company_id]);
    if (parseInt(existing.rows[0].c) > 0) {
      return successResponse({ results: ['Already seeded'] });
    }

    // Warehouse
    const whResult = await query(
      `INSERT INTO warehouses (company_id, name, code, address, city, is_active) VALUES ($1, 'Bodega Central', 'BC-01', 'Av. Industrial 1234', 'Santiago', true) RETURNING id`,
      [company_id]
    );
    const whId = whResult.rows[0].id;
    results.push('Warehouse');

    // Categories
    const cats = ['Electrónica', 'Alimentos', 'Bebidas', 'Limpieza', 'Oficina'];
    const catIds: string[] = [];
    for (const cat of cats) {
      const r = await query(`INSERT INTO inventory_categories (company_id, name) VALUES ($1, $2) RETURNING id`, [company_id, cat]);
      catIds.push(r.rows[0].id);
    }
    results.push('Categories');

    // Products
    const products = [
      { name: 'Laptop HP 15"', sku: 'LAP-001', cat: 0, cost: 450000, sale: 599990, stock: 25 },
      { name: 'Mouse Inalámbrico Logitech', sku: 'MOU-001', cat: 0, cost: 12000, sale: 19990, stock: 150 },
      { name: 'Teclado Mecánico RGB', sku: 'TEC-001', cat: 0, cost: 35000, sale: 49990, stock: 80 },
      { name: 'Monitor 24" Dell', sku: 'MON-001', cat: 0, cost: 180000, sale: 249990, stock: 30 },
      { name: 'Cable HDMI 2m', sku: 'CAB-001', cat: 0, cost: 3000, sale: 5990, stock: 500 },
      { name: 'Arroz 1kg Miraflores', sku: 'ALI-001', cat: 1, cost: 1200, sale: 1990, stock: 200 },
      { name: 'Aceite vegetal 1L', sku: 'ALI-002', cat: 1, cost: 2500, sale: 3990, stock: 180 },
      { name: 'Atún en lata 150g', sku: 'ALI-003', cat: 1, cost: 1800, sale: 2990, stock: 300 },
      { name: 'Agua mineral 1.5L', sku: 'BEB-001', cat: 2, cost: 600, sale: 1290, stock: 400 },
      { name: 'Jugo natural 1L', sku: 'BEB-002', cat: 2, cost: 1500, sale: 2490, stock: 200 },
      { name: 'Cerveza artesanal 330ml', sku: 'BEB-003', cat: 2, cost: 2000, sale: 3990, stock: 120 },
      { name: 'Detergente líquido 3L', sku: 'LIM-001', cat: 3, cost: 5000, sale: 7990, stock: 90 },
      { name: 'Jabón antibacterial', sku: 'LIM-002', cat: 3, cost: 1500, sale: 2990, stock: 250 },
      { name: 'Papel A4 500 hojas', sku: 'OFI-001', cat: 4, cost: 3500, sale: 5490, stock: 100 },
      { name: 'Bolígrafo pack x12', sku: 'OFI-002', cat: 4, cost: 2500, sale: 4490, stock: 60 },
    ];

    const productIds: string[] = [];
    for (const p of products) {
      const r = await query(
        `INSERT INTO products (company_id, name, sku, category_id, cost_price, sale_price, stock_quantity, min_stock, unit, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 10, 'unit', true) RETURNING id`,
        [company_id, p.name, p.sku, catIds[p.cat], p.cost, p.sale, p.stock]
      );
      productIds.push(r.rows[0].id);
    }
    results.push('15 products');

    // Customers
    const customers = [
      { name: 'Sparks SpA', rut: '76.123.456-7', email: 'compras@sparks.cl', phone: '+56911112222' },
      { name: 'Distribuidora Norte Ltda', rut: '76.234.567-8', email: 'compras@norte.cl', phone: '+56922223333' },
      { name: 'Minimarket Don Pedro', rut: '12.345.678-9', email: 'pedidos@donpedro.cl', phone: '+56933334444' },
      { name: 'Restaurant La Cocina', rut: '76.345.678-9', email: 'admin@lacocina.cl', phone: '+56944445555' },
      { name: 'Construcciones ABC', rut: '76.456.789-0', email: 'compras@abc.cl', phone: '+56955556666' },
      { name: 'Farmacia Salud', rut: '76.567.890-1', email: 'compras@salud.cl', phone: '+56966667777' },
      { name: 'Librería Universal', rut: '76.678.901-2', email: 'pedidos@universal.cl', phone: '+56977778888' },
      { name: 'Supermercado Express', rut: '76.789.012-3', email: 'compras@express.cl', phone: '+56988889999' },
    ];
    const customerIds: string[] = [];
    for (const c of customers) {
      const r = await query(
        `INSERT INTO customers (company_id, name, rut, email, phone, address, city, is_active) VALUES ($1, $2, $3, $4, $5, 'Av. ' || $2, 'Santiago', true) RETURNING id`,
        [company_id, c.name, c.rut, c.email, c.phone]
      );
      customerIds.push(r.rows[0].id);
    }
    results.push('8 customers');

    // Suppliers
    const suppliers = [
      { name: 'Distribuidora Central SpA', rut: '76.111.222-3', email: 'ventas@central.cl' },
      { name: 'Importaciones Tech Ltda', rut: '76.222.333-4', email: 'ventas@tech.cl' },
      { name: 'Alimentos del Sur SpA', rut: '76.333.444-5', email: 'ventas@sur.cl' },
    ];
    const supplierIds: string[] = [];
    for (const s of suppliers) {
      const r = await query(
        `INSERT INTO suppliers (company_id, name, rut, email, phone, address, city, is_active) VALUES ($1, $2, $3, $4, '+56900000000', 'Av. ' || $2, 'Santiago', true) RETURNING id`,
        [company_id, s.name, s.rut, s.email]
      );
      supplierIds.push(r.rows[0].id);
    }
    results.push('3 suppliers');

    // Sales orders
    const saleStatuses = ['draft', 'confirmed', 'processing', 'shipped', 'delivered'];
    for (let i = 0; i < 15; i++) {
      const custIdx = i % customerIds.length;
      const status = saleStatuses[i % saleStatuses.length];
      const orderDate = new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000);
      const numProducts = 1 + (i % 3);
      let subtotal = 0;

      const orderResult = await query(
        `INSERT INTO sales_orders (company_id, order_number, customer_id, warehouse_id, status, order_date, subtotal, tax_amount, total, notes) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 'Pedido demo') RETURNING id`,
        [company_id, `OV-${String(1001 + i).padStart(4, '0')}`, customerIds[custIdx], whId, status, orderDate.toISOString()]
      );
      const orderId = orderResult.rows[0].id;

      for (let j = 0; j < numProducts; j++) {
        const prodIdx = (i + j) % productIds.length;
        const qty = 1 + (i * j + 3) % 10;
        const prices = [59990, 19990, 49990, 249990, 5990, 1990, 3990, 2990, 1290, 2490];
        const price = prices[prodIdx % prices.length];
        const lineTotal = qty * price;
        subtotal += lineTotal;
        await query(`INSERT INTO sales_order_items (company_id, order_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)`, [company_id, orderId, productIds[prodIdx], qty, price, lineTotal]);
      }
      const tax = Math.round(subtotal * 0.19);
      await query(`UPDATE sales_orders SET subtotal = $1, tax_amount = $2, total = $3 WHERE id = $4`, [subtotal, tax, subtotal + tax, orderId]);
    }
    results.push('15 sales orders');

    // Purchase orders
    for (let i = 0; i < 10; i++) {
      const suppIdx = i % supplierIds.length;
      const status = ['draft', 'pending', 'confirmed', 'received'][i % 4];
      const orderDate = new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000);
      let subtotal = 0;

      const orderResult = await query(
        `INSERT INTO purchase_orders (company_id, order_number, supplier_id, warehouse_id, status, order_date, subtotal, tax_amount, total, notes) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 'Compra demo') RETURNING id`,
        [company_id, `OC-${String(2001 + i).padStart(4, '0')}`, supplierIds[suppIdx], whId, status, orderDate.toISOString()]
      );
      const orderId = orderResult.rows[0].id;

      const numProducts = 1 + (i % 3);
      for (let j = 0; j < numProducts; j++) {
        const prodIdx = (i * 2 + j) % productIds.length;
        const qty = 5 + (i * j + 7) % 20;
        const costs = [450000, 12000, 35000, 180000, 3000, 1200, 2500, 1800, 600, 1500];
        const cost = costs[prodIdx % costs.length];
        const lineTotal = qty * cost;
        subtotal += lineTotal;
        await query(`INSERT INTO purchase_order_items (company_id, order_id, product_id, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6)`, [company_id, orderId, productIds[prodIdx], qty, cost, lineTotal]);
      }
      const tax = Math.round(subtotal * 0.19);
      await query(`UPDATE purchase_orders SET subtotal = $1, tax_amount = $2, total = $3 WHERE id = $4`, [subtotal, tax, subtotal + tax, orderId]);
    }
    results.push('10 purchase orders');

    // Invoices
    for (let i = 0; i < 12; i++) {
      const custIdx = i % customerIds.length;
      const status = ['draft', 'pending', 'sent', 'paid', 'paid', 'paid'][i % 6];
      const invDate = new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000);
      const dueDate = new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const total = 50000 + ((i * 73 + 17) % 50) * 10000;
      const paid = status === 'paid' ? total : 0;
      await safeInsert(
        `INSERT INTO invoices (company_id, invoice_number, customer_id, status, invoice_date, due_date, subtotal, tax_amount, total_amount, paid_amount, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Factura demo')`,
        [company_id, `FE-${String(3001 + i).padStart(4, '0')}`, customerIds[custIdx], status, invDate.toISOString(), dueDate.toISOString(), Math.round(total / 1.19), Math.round(total - total / 1.19), total, paid]
      );
    }
    results.push('12 invoices');

    // Journal entries
    for (let i = 0; i < 8; i++) {
      const entryDate = new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000);
      const amount = 100000 + ((i * 137 + 42) % 90) * 10000;
      await safeInsert(
        `INSERT INTO journal_entries (company_id, entry_number, entry_date, description, total_debit, total_credit, status) VALUES ($1, $2, $3, $4, $5, $5, 'posted')`,
        [company_id, `AS-${String(4001 + i).padStart(4, '0')}`, entryDate.toISOString().split('T')[0], `Asiento contable ${i + 1}`, amount]
      );
    }
    results.push('8 journal entries');

    return successResponse({ results });
  } catch (err) {
    console.error('Seed error:', err);
    return errorResponse(err instanceof Error ? err.message : String(err), 500);
  }
}
