const API_BASE = '/api';

function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
  return authCookie ? authCookie.split('=')[1] : null;
}

function parseJwt(token: string): { company_id?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getCompanyIdFromToken(): string | null {
  const token = getTokenFromCookie();
  if (!token) return null;
  const payload = parseJwt(token);
  return payload?.company_id || null;
}

export class ApiClient {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}/companies/${this.companyId}${path}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = typeof data.error === 'object' ? data.error?.message || JSON.stringify(data.error) : data.error;
      throw new Error(msg || 'Error en la solicitud');
    }
    return data.data || data;
  }

  private async requestWithPagination<T>(path: string, params: Record<string, string> = {}): Promise<{ data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE}/companies/${this.companyId}${path}?${searchParams}`;
    const response = await fetch(url);
    const result = await response.json();
    if (!response.ok) {
      const msg = typeof result.error === 'object' ? result.error?.message || JSON.stringify(result.error) : result.error;
      throw new Error(msg || 'Error en la solicitud');
    }
    return result;
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; sku: string; price: number; sale_price?: number; stock: number; warehouse: string; cost_price?: number; stock_levels?: { id?: string; quantity?: number; warehouse?: { id?: string; name?: string; code?: string } | null }[]; cost_center?: { id: string; name: string; code: string } | null; image_url?: string | null }>('/products', params || {});
  }

  async getProduct(id: string) {
    return this.request<{ id: string; name: string; sku: string; price: number; stock: number; cost_center?: { id: string; name: string; code: string } | null; image_url?: string | null }>(`/products/${id}`);
  }

  async createProduct(data: { name: string; sku: string; price?: number; category_id?: string; warehouse_id?: string; initial_stock?: number; description?: string; type?: string; unit_of_measure?: string; cost_price?: number; sale_price?: number; min_stock?: number; max_stock?: number; track_stock?: boolean; barcode?: string; tax_id?: string; is_active?: boolean; cost_center_id?: string; image_url?: string }) {
    return this.request<{ id: string }>('/products', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProduct(id: string, data: Partial<{ name: string; sku: string; price: number; category_id: string; description: string; type: string; unit_of_measure: string; cost_price: number; sale_price: number; min_stock: number; max_stock: number; track_stock: boolean; barcode: string; tax_id: string; is_active: boolean; cost_center_id: string; image_url: string }>) {
    return this.request<{ id: string }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, { method: 'DELETE' });
  }

  // Warehouses
  async getWarehouses(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; code: string; total_products: number; total_stock: number; is_default: boolean }>('/warehouses', params || {});
  }

  async getWarehouse(id: string) {
    return this.request<{ id: string; name: string; code: string; address: string; city: string; region: string; country: string; postal_code: string; phone: string; email: string; is_default: boolean; is_active: boolean }>(`/warehouses/${id}`);
  }

  async createWarehouse(data: { name: string; code: string; address?: string; city?: string; region?: string; country?: string; postal_code?: string; phone?: string; email?: string; is_default?: boolean }) {
    return this.request<{ id: string }>('/warehouses', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateWarehouse(id: string, data: Partial<{ name: string; code: string; address: string; city: string; region: string; country: string; postal_code: string; phone: string; email: string; is_default: boolean; is_active: boolean }>) {
    return this.request<{ id: string }>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteWarehouse(id: string) {
    return this.request<{ message: string }>(`/warehouses/${id}`, { method: 'DELETE' });
  }

  // Customers
  async getCustomers(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; code: string; trade_name: string; tax_id: string; email: string; phone: string; address: string; city: string; region: string; country: string; contact_person: string; contact_phone: string; contact_email: string; payment_terms: number; credit_limit: number; price_list_id: string; tax_exempt: boolean; is_active: boolean }>('/customers', params || {});
  }

  async getCustomer(id: string) {
    return this.request<{ id: string; name: string; code: string; trade_name: string; tax_id: string; email: string; phone: string; address: string }>(`/customers/${id}`);
  }

  async createCustomer(data: { name: string; code?: string; trade_name?: string; tax_id?: string; tax_id_type?: string; address?: string; city?: string; region?: string; country?: string; postal_code?: string; phone?: string; email?: string; website?: string; contact_person?: string; contact_phone?: string; contact_email?: string; payment_terms?: number; credit_limit?: number; price_list_id?: string; tax_exempt?: boolean; notes?: string }) {
    return this.request<{ id: string }>('/customers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCustomer(id: string, data: Partial<{ name: string; code: string; trade_name: string; tax_id: string; tax_id_type: string; address: string; city: string; region: string; country: string; postal_code: string; phone: string; email: string; website: string; contact_person: string; contact_phone: string; contact_email: string; payment_terms: number; credit_limit: number; price_list_id: string; tax_exempt: boolean; notes: string; is_active: boolean }>) {
    return this.request<{ id: string }>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCustomer(id: string) {
    return this.request<{ message: string }>(`/customers/${id}`, { method: 'DELETE' });
  }

  // Suppliers
  async getSuppliers(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; code: string; trade_name: string; tax_id: string; email: string; phone: string; address: string; city: string; region: string; country: string; contact_person: string; contact_phone: string; contact_email: string; payment_terms: number; credit_limit: number; is_active: boolean }>('/suppliers', params || {});
  }

  async getSupplier(id: string) {
    return this.request<{ id: string; name: string; code: string; trade_name: string; tax_id: string; email: string; phone: string; address: string }>(`/suppliers/${id}`);
  }

  async createSupplier(data: { name: string; code?: string; trade_name?: string; tax_id?: string; tax_id_type?: string; address?: string; city?: string; region?: string; country?: string; postal_code?: string; phone?: string; email?: string; website?: string; contact_person?: string; contact_phone?: string; contact_email?: string; payment_terms?: number; credit_limit?: number; is_active?: boolean }) {
    return this.request<{ id: string }>('/suppliers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSupplier(id: string, data: Partial<{ name: string; code: string; trade_name: string; tax_id: string; tax_id_type: string; address: string; city: string; region: string; country: string; postal_code: string; phone: string; email: string; website: string; contact_person: string; contact_phone: string; contact_email: string; payment_terms: number; credit_limit: number; is_active: boolean }>) {
    return this.request<{ id: string }>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSupplier(id: string) {
    return this.request<{ message: string }>(`/suppliers/${id}`, { method: 'DELETE' });
  }

  // Sales Orders
  async getSalesOrders(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; order_number: string; customer_id: string; customer?: { id: string; name: string; tax_id: string }; warehouse?: { id: string; name: string; code: string }; items?: any[]; status: string; total: number; created_at: string }>('/sales-orders', params || {});
  }

  async getSalesOrder(id: string) {
    return this.request<{ id: string; order_number: string; customer_id: string; status: string; total: number; items: any[] }>(`/sales-orders/${id}`);
  }

  async createSalesOrder(data: { order_number?: string; customer_id: string; warehouse_id?: string; order_date?: string; delivery_date?: string; payment_method?: string; payment_terms?: number; shipping_address?: string; subtotal?: number; tax_amount?: number; total?: number; notes?: string; project_id?: string | null; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }) {
    return this.request<{ id: string }>('/sales-orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSalesOrder(id: string, data: Partial<{ customer_id: string; warehouse_id: string; status: string; delivery_date: string; payment_terms: number; notes: string; project_id: string | null; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }>) {
    return this.request<{ id: string }>(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSalesOrder(id: string) {
    return this.request<{ message: string }>(`/sales-orders/${id}`, { method: 'DELETE' });
  }

  // Delivery Guides
  async getDeliveryGuides(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; guide_number: string; order_id: string; status: string; transport: string; created_at: string }>('/delivery-guides', params || {});
  }

  async getDeliveryGuide(id: string) {
    return this.request<{ id: string; guide_number: string; order_id: string; status: string; transport: string; driver_name: string; vehicle_plate: string; shipping_address: string }>(`/delivery-guides/${id}`);
  }

  async createDeliveryGuide(data: { order_id?: string; warehouse_id: string; shipping_date?: string; transport: string; driver_name?: string; vehicle_plate?: string; shipping_address?: string; items: { product_id: string; quantity: number; observation?: string }[] }) {
    return this.request<{ id: string; guide_number: string }>('/delivery-guides', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateDeliveryGuide(id: string, data: Partial<{ status: string; transport: string; driver_name: string; vehicle_plate: string; shipping_address: string }>) {
    return this.request<{ id: string }>(`/delivery-guides/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteDeliveryGuide(id: string) {
    return this.request<{ message: string }>(`/delivery-guides/${id}`, { method: 'DELETE' });
  }

  // Invoices
  async getInvoices(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; invoice_number: string; order_id: string; status: string; total_amount: number; created_at: string }>('/invoices', params || {});
  }

  async getInvoice(id: string) {
    return this.request<{ id: string; invoice_number: string; status: string; invoice_date: string; due_date: string; payment_terms: number; subtotal: number; tax_amount: number; total_amount: number; notes: string; customer: { id: string; name: string; tax_id: string }; items: any[] }>(`/invoices/${id}`);
  }

  async createInvoice(data: { order_id?: string; customer_id?: string; invoice_date: string; due_date?: string; payment_method?: string; payment_terms?: string; notes?: string; status?: string; document_type?: 'boleta' | 'factura'; items: { product_id?: string; quantity: number; unit_price: number; discount?: number; tax_rate?: number; description?: string }[] }) {
    return this.request<{ id: string; invoice_number: string }>('/invoices', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateInvoice(id: string, data: Partial<{ status: string; payment_status: string; invoice_date: string; due_date: string; payment_terms: string; notes: string }>) {
    return this.request<{ id: string }>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteInvoice(id: string) {
    return this.request<{ message: string }>(`/invoices/${id}`, { method: 'DELETE' });
  }

  // Leads (CRM)
  async getLeads(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; email: string; phone: string; status: string; estimated_value: number }>('/leads', params || {});
  }

  async getLead(id: string) {
    return this.request<any>(`/leads/${id}`);
  }

  async createLead(data: { name: string; email?: string; phone?: string; source?: string; status?: string; assigned_to?: string; estimated_value?: number; notes?: string }) {
    return this.request<any>('/leads', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLead(id: string, data: Partial<{ name: string; email: string; phone: string; source: string; status: string; assigned_to: string; estimated_value: number; notes: string }>) {
    return this.request<any>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLead(id: string) {
    return this.request<{ message: string }>(`/leads/${id}`, { method: 'DELETE' });
  }

  // Activities (CRM)
  async getActivities(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; type: string; subject: string; status: string; due_date: string }>('/activities', params || {});
  }

  async createActivity(data: { type: string; subject: string; description?: string; related_type?: string; related_id?: string; assigned_to?: string; due_date?: string }) {
    return this.request<any>('/activities', { method: 'POST', body: JSON.stringify(data) });
  }

  // Landed Cost
  async getLandedCostAllocations(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/landed-cost-allocations', params || {});
  }

  async deleteLandedCostAllocation(id: string) {
    return this.request<any>(`/landed-cost-allocations/${id}`, { method: 'DELETE' });
  }

  // Consignment
  async getConsignmentAgreements(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/consignment-agreements', params || {});
  }

  async getConsignmentStock(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/consignment-stock', params || {});
  }

  // SII Inventory Book
  async getSIIInventoryBook(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/sii-inventory-book', params || {});
  }

  // Purchase Orders
  async getPurchaseOrders(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; number: string; supplier_id: string; status: string; total_amount: number; created_at: string }>('/purchase-orders', params || {});
  }

  async getPurchaseOrder(id: string) {
    return this.request<{ id: string; number: string; supplier_id: string; status: string; total_amount: number; items: any[] }>(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: { number?: string; supplier_id: string; warehouse_id?: string; order_date?: string; expected_date?: string; payment_terms?: number; subtotal?: number; tax_amount?: number; total_amount?: number; notes?: string; internal_notes?: string; project_id?: string | null; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }) {
    return this.request<{ id: string }>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePurchaseOrder(id: string, data: Partial<{ supplier_id: string; warehouse_id: string; status: string; expected_date: string; payment_terms: number; notes: string; internal_notes: string; project_id: string | null; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }>) {
    return this.request<{ id: string }>(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deletePurchaseOrder(id: string) {
    return this.request<{ message: string }>(`/purchase-orders/${id}`, { method: 'DELETE' });
  }

  // Quotations
  async getQuotations(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; number: string; supplier_id: string; status: string; total_amount: number; quote_date: string; expiry_date: string; supplier?: { id: string; name: string } }>('/quotations', params || {});
  }

  async getQuotation(id: string) {
    return this.request<{ id: string; number: string; supplier_id: string; status: string; total_amount: number; quote_date: string; expiry_date: string; notes: string; supplier: { id: string; name: string }; items: any[] }>(`/quotations/${id}`);
  }

  async createQuotation(data: { number: string; supplier_id: string; quote_date: string; expiry_date: string; total_amount: number; notes?: string; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }) {
    return this.request<{ id: string; number: string }>('/quotations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateQuotation(id: string, data: Partial<{ supplier_id: string; status: string; quote_date: string; expiry_date: string; total_amount: number; notes: string; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }>) {
    return this.request<{ id: string }>(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteQuotation(id: string) {
    return this.request<{ message: string }>(`/quotations/${id}`, { method: 'DELETE' });
  }

  // Employees
  async getEmployees(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/employees', params || {});
  }

  async getEmployee(id: string) {
    return this.request<any>(`/employees/${id}`);
  }

  async createEmployee(data: Record<string, any>) {
    return this.request<any>('/employees', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEmployee(id: string, data: Record<string, any>) {
    return this.request<any>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteEmployee(id: string) {
    return this.request<{ message: string }>(`/employees/${id}`, { method: 'DELETE' });
  }

  // Payroll Runs
  async getPayrollRuns(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/payroll/runs', params || {});
  }

  async getPayrollRun(id: string) {
    return this.request<any>(`/payroll/runs/${id}`);
  }

  async createPayrollRun(data: { period_start: string; period_end: string; notes?: string }) {
    return this.request<any>('/payroll/runs', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePayrollRun(id: string, data: { status?: string; notes?: string; paid_at?: string }) {
    return this.request<any>(`/payroll/runs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deletePayrollRun(id: string) {
    return this.request<{ message: string }>(`/payroll/runs/${id}`, { method: 'DELETE' });
  }

  // Payroll Calculator
  async calculatePayroll(runId: string) {
    return this.request<any>('/payroll/calculate', { method: 'POST', body: JSON.stringify({ run_id: runId }) });
  }

  // Payroll Schema Migration
  async migratePayrollSchema() {
    return this.request<any>('/payroll/migrate', { method: 'POST' });
  }

  // Vacation Balances
  async getVacationBalances(params?: Record<string, string>) {
    return this.request<any>('/vacation-balances', params || {});
  }

  async createVacationBalance(data: { employee_id: string; year: number; days_earned?: number; notes?: string }) {
    return this.request<any>('/vacation-balances', { method: 'POST', body: JSON.stringify(data) });
  }

  // Vacation Requests
  async getVacationRequests(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/vacation-requests', params || {});
  }

  async getVacationRequest(id: string) {
    return this.request<any>(`/vacation-requests/${id}`);
  }

  async createVacationRequest(data: { employee_id: string; start_date: string; end_date: string; reason?: string }) {
    return this.request<any>('/vacation-requests', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateVacationRequest(id: string, data: { status: string; rejection_reason?: string }) {
    return this.request<any>(`/vacation-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteVacationRequest(id: string) {
    return this.request<{ message: string }>(`/vacation-requests/${id}`, { method: 'DELETE' });
  }

  // Settings
  async getUFValue() {
    return this.request<any>('/settings/uf');
  }

  async setUFValue(uf_value: number) {
    return this.request<any>('/settings/uf', { method: 'PUT', body: JSON.stringify({ uf_value }) });
  }

  // Liquidation
  async calculateLiquidation(data: { employee_id: string; termination_type: string; termination_date: string; notice_given?: boolean }) {
    return this.request<any>('/payroll/liquidation', { method: 'POST', body: JSON.stringify(data) });
  }

  // Inventory Categories
  async getCategories(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; description: string; color: string; icon: string; sort_order: number; is_active: boolean }>('/inventory-categories', params || {});
  }

  async createCategory(data: { name: string; description?: string; color?: string; icon?: string; sort_order?: number }) {
    return this.request<{ id: string }>('/inventory-categories', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; color?: string; icon?: string; sort_order?: number; is_active?: boolean }) {
    return this.request<any>(`/inventory-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCategory(id: string) {
    return this.request<{ message: string }>(`/inventory-categories/${id}`, { method: 'DELETE' });
  }

  // Taxes
  async getTaxes(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/taxes', params || {});
  }

  async getTax(id: string) {
    return this.request<any>(`/taxes/${id}`);
  }

  async createTax(data: { name: string; code: string; rate: number; type?: string; sri_code?: string }) {
    return this.request<any>('/taxes', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTax(id: string, data: { name?: string; code?: string; rate?: number; type?: string; sri_code?: string; is_active?: boolean }) {
    return this.request<any>(`/taxes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteTax(id: string) {
    return this.request<{ message: string }>(`/taxes/${id}`, { method: 'DELETE' });
  }

  // Stock Movements
  async getStockMovements(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; product_id: string; warehouse_id: string; type: string; quantity: number; created_at: string }>('/stock-movements', params || {});
  }

  async createStockMovement(data: { product_id: string; warehouse_id: string; type: string; quantity: number; notes?: string }) {
    return this.request<{ id: string }>('/stock-movements', { method: 'POST', body: JSON.stringify(data) });
  }

  // Price Lists
  async getPriceLists(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; is_default: boolean; items_count: number }>('/price-lists', params || {});
  }

  async getPriceList(id: string) {
    return this.request<{ id: string; name: string; is_default: boolean; items: any[] }>(`/price-lists/${id}`);
  }

  async createPriceList(data: { name: string; description?: string; is_default?: boolean; currency?: string; adjustment_type?: string; adjustment_value?: number }) {
    return this.request<{ id: string }>('/price-lists', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePriceList(id: string, data: Partial<{ name: string; description: string; is_default: boolean; currency: string; adjustment_type: string; adjustment_value: number; is_active: boolean }>) {
    return this.request<{ id: string }>(`/price-lists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deletePriceList(id: string) {
    return this.request<{ message: string }>(`/price-lists/${id}`, { method: 'DELETE' });
  }

  // Journal Entries
  async getJournalEntries(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; entry_number: string; date: string; description: string; total_debit: number; total_credit: number; status: string }>('/journal-entries', params || {});
  }

  async getJournalEntry(id: string) {
    return this.request<{ id: string; entry_number: string; date: string; description: string; total_debit: number; total_credit: number; status: string; lines: any[] }>(`/journal-entries/${id}`);
  }

  async createJournalEntry(data: { date: string; description: string; reference_type?: string; reference_id?: string; lines: { account_id: string; description?: string; debit: number; credit: number }[] }) {
    return this.request<{ id: string }>('/journal-entries', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateJournalEntry(id: string, data: Partial<{ date: string; description: string; status: string; reference_type: string; reference_id: string; lines: { account_id: string; description?: string; debit: number; credit: number }[] }>) {
    return this.request<{ id: string }>(`/journal-entries/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteJournalEntry(id: string) {
    return this.request<{ message: string }>(`/journal-entries/${id}`, { method: 'DELETE' });
  }

  // Accounts
  async getAccounts(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; code: string; name: string; type: string; parent_id: string; is_active: boolean; is_control: boolean }>('/accounts', params || {});
  }

  async createAccount(data: { code: string; name: string; type: string; parent_id?: string; is_active?: boolean; is_control?: boolean }) {
    return this.request<{ id: string }>('/accounts', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateAccount(id: string, data: Partial<{ name: string; type: string; description: string; currency: string; is_active: boolean }>) {
    return this.request<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteAccount(id: string) {
    return this.request<any>(`/accounts/${id}`, { method: 'DELETE' });
  }

  // Audit
  async getAuditLogs(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; action: string; entity_type: string; entity_id: string; created_at: string; user?: { full_name: string; email: string }; details?: string }>('/audit', params || {});
  }

  // Roles
  async getRoles(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; description: string; is_system: boolean; created_at: string }>('/roles', params || {});
  }

  async getRole(id: string) {
    return this.request<{ id: string; name: string; description: string; is_system: boolean; permissions: { id: string; module: string; action: string; label: string }[] }>(`/roles/${id}`);
  }

  async createRole(data: { name: string; description?: string }) {
    return this.request<{ id: string }>('/roles', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateRole(id: string, data: Partial<{ name: string; description: string }>) {
    return this.request<{ id: string }>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteRole(id: string) {
    return this.request<{ message: string }>(`/roles/${id}`, { method: 'DELETE' });
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return this.request<{ message: string }>(`/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permission_ids: permissionIds }) });
  }

  // Permissions
  async getPermissions() {
    return this.requestWithPagination<{ id: string; module: string; action: string; label: string }>('/permissions', {});
  }

  // User Roles
  async getUserRoles(params?: Record<string, string>) {
    return this.requestWithPagination<{ user_id: string; role_id: string }>('/user-roles', params || {});
  }

  async assignUserRole(userId: string, roleId: string) {
    return this.request<{ message: string }>('/user-roles', { method: 'POST', body: JSON.stringify({ user_id: userId, role_id: roleId }) });
  }

  async removeUserRole(userId: string, roleId: string) {
    return this.request<{ message: string }>(`/user-roles/${userId}/${roleId}`, { method: 'DELETE' });
  }

  // Stock Levels
  async getStockLevels(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; product_id: string; warehouse_id: string; quantity: number; reserved_quantity: number; available_quantity: number }>('/stock-levels', params || {});
  }

  // Warehouse Layout
  async getWarehouseLayout(warehouseId: string) {
    return this.request<{ zones: any[]; shelves: any[]; positions: any[] }>(`/warehouses/${warehouseId}/layout`);
  }

  async updateWarehouseLayout(warehouseId: string, data: { zones: any[]; shelves: any[]; positions: any[] }) {
    return this.request<{ message: string }>(`/warehouses/${warehouseId}/layout`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async assignProductToPosition(warehouseId: string, data: { product_id: string; zone_id: string; shelf_id: string; position_id: string }) {
    return this.request<{ message: string }>(`/warehouses/${warehouseId}/layout/assign`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Settings
  async getSettings() {
    return this.request<{ company_name: string; timezone: string; currency: string; date_format: string; invoice_prefix: string; decimal_places: number }>('/settings');
  }

  async updateSettings(data: { company_name?: string; timezone?: string; currency?: string; date_format?: string; invoice_prefix?: string; decimal_places?: number }) {
    return this.request<{ message: string }>('/settings', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Company
  async getCompany() {
    return this.request<{ id: string; name: string; slug: string; logo_url: string | null; tax_id: string | null; razon_social: string | null; giro: string | null; address: string | null; city: string | null; region: string | null; phone: string | null; email: string | null; settings: Record<string, unknown>; plan: string; status: string }>('');
  }

  async updateCompany(data: { name?: string; tax_id?: string; razon_social?: string; giro?: string; address?: string; city?: string; region?: string; phone?: string; email?: string; logo_url?: string }) {
    return this.request<{ id: string; name: string }>('', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Dashboard KPIs
  async getDashboardKpis() {
    return this.request<{
      total_products: number;
      total_stock_value: number;
      low_stock_count: number;
      out_of_stock_count: number;
      total_customers: number;
      total_suppliers: number;
      pending_orders: number;
      pending_deliveries: number;
      pending_invoices: number;
      total_sales_month: number;
      total_purchases_month: number;
    }>('/dashboard/kpis');
  }

  // Cost Centers
  async getCostCenters(params?: { search?: string; page?: number; limit?: number }) {
    const searchParams: Record<string, string> = {};
    if (params?.search) searchParams.search = params.search;
    if (params?.page) searchParams.page = params.page.toString();
    if (params?.limit) searchParams.limit = params.limit.toString();
    return this.requestWithPagination<any>('/cost-centers', searchParams);
  }

  async createCostCenter(data: { code: string; name: string; description?: string; parent_id?: string }) {
    return this.request<any>('/cost-centers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCostCenter(id: string, data: { code?: string; name?: string; description?: string; parent_id?: string; is_active?: boolean }) {
    return this.request<any>(`/cost-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCostCenter(id: string) {
    return this.request<{ message: string }>(`/cost-centers/${id}`, { method: 'DELETE' });
  }

  // Stock Transfers
  async getStockTransfers(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/stock-transfers', params || {});
  }

  async getStockTransfer(id: string) {
    return this.request<any>(`/stock-transfers/${id}`);
  }

  async createStockTransfer(data: { source_warehouse_id: string; destination_warehouse_id: string; notes?: string; items: { product_id: string; quantity: number; unit_cost?: number; notes?: string }[] }) {
    return this.request<any>('/stock-transfers', { method: 'POST', body: JSON.stringify(data) });
  }

  async confirmStockTransfer(id: string) {
    return this.request<{ message: string }>(`/stock-transfers/${id}/confirm`, { method: 'POST' });
  }

  async cancelStockTransfer(id: string) {
    return this.request<{ message: string }>(`/stock-transfers/${id}/cancel`, { method: 'POST' });
  }

  // Inventory Counts
  async getInventoryCounts(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/inventory-counts', params || {});
  }

  async getInventoryCount(id: string) {
    return this.request<any>(`/inventory-counts/${id}`);
  }

  async createInventoryCount(data: { warehouse_id: string; count_type?: string; notes?: string }) {
    return this.request<any>('/inventory-counts', { method: 'POST', body: JSON.stringify(data) });
  }

  async startInventoryCount(id: string) {
    return this.request<any>(`/inventory-counts/${id}/start`, { method: 'POST' });
  }

  async completeInventoryCount(id: string) {
    return this.request<any>(`/inventory-counts/${id}/complete`, { method: 'POST' });
  }

  async updateInventoryCountItem(countId: string, itemId: string, data: { counted_quantity: number; notes?: string }) {
    return this.request<any>(`/inventory-counts/${countId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Product Batches (Lot Tracking)
  async getProductBatches(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/product-batches', params || {});
  }

  async getProductBatch(id: string) {
    return this.request<any>(`/product-batches/${id}`);
  }

  async createProductBatch(data: { product_id: string; warehouse_id: string; batch_number: string; quantity?: number; expiry_date?: string; manufacturing_date?: string; notes?: string }) {
    return this.request<any>('/product-batches', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProductBatch(id: string, data: { quantity?: number; expiry_date?: string; manufacturing_date?: string; status?: string; notes?: string }) {
    return this.request<any>(`/product-batches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProductBatch(id: string) {
    return this.request<any>(`/product-batches/${id}`, { method: 'DELETE' });
  }

  // Units of Measure
  async getUnitsOfMeasure(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/units-of-measure', params || {});
  }

  async createUnitOfMeasure(data: { code: string; name: string; type: string; base_unit?: string; conversion_factor?: number }) {
    return this.request<any>('/units-of-measure', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateUnitOfMeasure(id: string, data: { code?: string; name?: string; type?: string; base_unit?: string; conversion_factor?: number; is_active?: boolean }) {
    return this.request<any>(`/units-of-measure/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteUnitOfMeasure(id: string) {
    return this.request<any>(`/units-of-measure/${id}`, { method: 'DELETE' });
  }

  // Product Variants
  async getProductVariants(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/product-variants', params || {});
  }

  async createProductVariant(data: { product_id: string; sku: string; name?: string; attributes?: Record<string, string>; cost_price?: number; sale_price?: number; barcode?: string }) {
    return this.request<any>('/product-variants', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProductVariant(id: string, data: { sku?: string; name?: string; attributes?: Record<string, string>; cost_price?: number; sale_price?: number; barcode?: string; stock_quantity?: number; is_active?: boolean }) {
    return this.request<any>(`/product-variants/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProductVariant(id: string) {
    return this.request<any>(`/product-variants/${id}`, { method: 'DELETE' });
  }

  // Stock Reservations
  async getStockReservations(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/stock-reservations', params || {});
  }

  async createStockReservation(data: { product_id: string; warehouse_id: string; quantity: number; reference_type?: string; reference_id?: string; expires_at?: string; notes?: string }) {
    return this.request<any>('/stock-reservations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateStockReservation(id: string, data: { status?: string; quantity?: number }) {
    return this.request<any>(`/stock-reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async releaseStockReservation(id: string) {
    return this.request<any>(`/stock-reservations/${id}`, { method: 'DELETE' });
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    return res.json();
  }

  // Product Tags
  async getProductTags(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/product-tags', params || {});
  }
  async createProductTag(data: { name: string; color?: string }) {
    return this.request<any>('/product-tags', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateProductTag(id: string, data: { name?: string; color?: string }) {
    return this.request<any>(`/product-tags/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteProductTag(id: string) {
    return this.request<any>(`/product-tags/${id}`, { method: 'DELETE' });
  }

  // Product Price History
  async getProductPriceHistory(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/product-price-history', params || {});
  }

  // Adjustment Reasons
  async getAdjustmentReasons(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/adjustment-reasons', params || {});
  }
  async createAdjustmentReason(data: { name: string; description?: string }) {
    return this.request<any>('/adjustment-reasons', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateAdjustmentReason(id: string, data: { name?: string; description?: string; is_active?: boolean }) {
    return this.request<any>(`/adjustment-reasons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
async deleteAdjustmentReason(id: string) {
    return this.request<any>(`/adjustment-reasons/${id}`, { method: 'DELETE' });
  }

  // Valuation Methods
  async getValuationMethods(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/inventory-valuation-methods', params || {});
  }
  async getValuationMethod(id: string) {
    return this.request<any>(`/inventory-valuation-methods/${id}`);
  }
  async createValuationMethod(data: { code: string; name: string; description?: string; is_default?: boolean }) {
    return this.request<any>('/inventory-valuation-methods', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateValuationMethod(id: string, data: { name?: string; description?: string; is_default?: boolean; is_active?: boolean }) {
    return this.request<any>(`/inventory-valuation-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Valuation Runs
  async getValuationRuns(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/inventory-valuation-runs', params || {});
  }
  async runValuation(data: { valuation_method_id: string; period_start: string; period_end: string }) {
    return this.request<any>('/inventory-valuation-runs', { method: 'POST', body: JSON.stringify(data) });
  }

  // Product Serials
  async getProductSerials(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/product-serials', params || {});
  }
  async createProductSerial(data: { product_id: string; warehouse_id: string; serial_number: string; notes?: string }) {
    return this.request<any>('/product-serials', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateProductSerial(id: string, data: { status?: string; notes?: string }) {
    return this.request<any>(`/product-serials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteProductSerial(id: string) {
    return this.request<any>(`/product-serials/${id}`, { method: 'DELETE' });
  }

  // Product Relations
  async getProductRelations(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/product-relations', params || {});
  }
  async createProductRelation(data: { product_id: string; related_product_id: string; relation_type: string }) {
    return this.request<any>('/product-relations', { method: 'POST', body: JSON.stringify(data) });
  }
  async deleteProductRelation(id: string) {
    return this.request<any>(`/product-relations/${id}`, { method: 'DELETE' });
  }

  // Customer Returns
  async getCustomerReturns(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/customer-returns', params || {});
  }
  async getCustomerReturn(id: string) {
    return this.request<any>(`/customer-returns/${id}`);
  }
  async createCustomerReturn(data: { customer_id?: string; original_invoice_id?: string; warehouse_id: string; reason?: string; notes?: string; items: { product_id: string; quantity: number; unit_price: number; condition?: string; restock?: boolean; notes?: string }[] }) {
    return this.request<any>('/customer-returns', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateCustomerReturn(id: string, data: { status?: string; notes?: string }) {
    return this.request<any>(`/customer-returns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async completeCustomerReturn(id: string) {
    return this.request<any>(`/customer-returns/${id}/complete`, { method: 'POST' });
  }

  // Sales Quotations
  async getSalesQuotations(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/sales-quotations', params || {});
  }
  async getSalesQuotation(id: string) {
    return this.request<any>(`/sales-quotations/${id}`);
  }
  async createSalesQuotation(data: { customer_id: string; valid_until?: string; notes?: string; items: { product_id: string; quantity: number; unit_price: number; discount_percent?: number; tax_rate?: number }[] }) {
    return this.request<any>('/sales-quotations', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateSalesQuotation(id: string, data: { status?: string; valid_until?: string; notes?: string; items?: { product_id: string; quantity: number; unit_price: number; discount_percent?: number; tax_rate?: number }[] }) {
    return this.request<any>(`/sales-quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteSalesQuotation(id: string) {
    return this.request<any>(`/sales-quotations/${id}`, { method: 'DELETE' });
  }

  // Quality Checklists
  async getQualityChecklists(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/quality-checklists', params || {});
  }
  async getQualityChecklist(id: string) {
    return this.request<any>(`/quality-checklists/${id}`);
  }
  async createQualityChecklist(data: { code: string; name: string; description?: string; type: string; version?: string; is_active?: boolean; items?: any[] }) {
    return this.request<any>('/quality-checklists', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateQualityChecklist(id: string, data: { name?: string; description?: string; type?: string; version?: string; is_active?: boolean; items?: any[] }) {
    return this.request<any>(`/quality-checklists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteQualityChecklist(id: string) {
    return this.request<any>(`/quality-checklists/${id}`, { method: 'DELETE' });
  }
  async getQualityChecklistItems(checklistId: string, params?: Record<string, string>) {
    return this.requestWithPagination<any>(`/quality-checklists/${checklistId}/items`, params || {});
  }
  async createQualityChecklistItem(checklistId: string, data: { sequence?: number; check_type?: string; description: string; acceptance_criteria?: string; min_value?: number; max_value?: number; uom?: string; is_critical?: boolean; aql_level?: string }) {
    return this.request<any>(`/quality-checklists/${checklistId}/items`, { method: 'POST', body: JSON.stringify(data) });
  }
  async updateQualityChecklistItem(checklistId: string, itemId: string, data: { sequence?: number; check_type?: string; description?: string; acceptance_criteria?: string; min_value?: number; max_value?: number; uom?: string; is_critical?: boolean; aql_level?: string }) {
    return this.request<any>(`/quality-checklists/${checklistId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteQualityChecklistItem(checklistId: string, itemId: string) {
    return this.request<any>(`/quality-checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' });
  }

  // Quality Inspections
  async getQualityInspections(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/quality-inspections', params || {});
  }
  async getQualityInspection(id: string) {
    return this.request<any>(`/quality-inspections/${id}`);
  }
  async createQualityInspection(data: { inspection_number: string; reference_type: string; reference_id?: string; purchase_order_id?: string; supplier_id?: string; warehouse_id: string; checklist_id?: string; inspector_id?: string; sample_size?: number; notes?: string }) {
    return this.request<any>('/quality-inspections', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateQualityInspection(id: string, data: { status?: string; inspector_id?: string; notes?: string; started_at?: string; completed_at?: string }) {
    return this.request<any>(`/quality-inspections/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteQualityInspection(id: string) {
    return this.request<any>(`/quality-inspections/${id}`, { method: 'DELETE' });
  }
  async getQualityInspectionItems(inspectionId: string) {
    return this.request<any>(`/quality-inspections/${inspectionId}/items`);
  }
  async createQualityInspectionItem(inspectionId: string, data: { checklist_item_id: string; product_id?: string; result?: string; measured_value?: string; notes?: string }) {
    return this.request<any>(`/quality-inspections/${inspectionId}/items`, { method: 'POST', body: JSON.stringify(data) });
  }
  async updateQualityInspectionItem(inspectionId: string, itemId: string, data: { result?: string; measured_value?: string; notes?: string }) {
    return this.request<any>(`/quality-inspections/${inspectionId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Pick Waves
  async getPickWaves(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/pick-waves', params || {});
  }
  async getPickWave(id: string) {
    return this.request<any>(`/pick-waves/${id}`);
  }
  async createPickWave(data: { wave_number: string; warehouse_id: string; priority?: string; assigned_to?: string; order_ids?: string[]; delivery_guide_ids?: string[]; notes?: string }) {
    return this.request<any>('/pick-waves', { method: 'POST', body: JSON.stringify(data) });
  }
  async updatePickWave(id: string, data: { status?: string; priority?: string; assigned_to?: string; notes?: string }) {
    return this.request<any>(`/pick-waves/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deletePickWave(id: string) {
    return this.request<any>(`/pick-waves/${id}`, { method: 'DELETE' });
  }
  async releasePickWave(id: string) {
    return this.request<any>(`/pick-waves/${id}/release`, { method: 'POST' });
  }
  async getPickWaveTasks(waveId: string, params?: Record<string, string>) {
    return this.requestWithPagination<any>(`/pick-waves/${waveId}/tasks`, params || {});
  }

  // Pick Tasks
  async getPickTasks(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/pick-tasks', params || {});
  }
  async getPickTask(id: string) {
    return this.request<any>(`/pick-tasks/${id}`);
  }
  async updatePickTask(id: string, data: { quantity_picked?: number; status?: string; assigned_to?: string; started_at?: string; completed_at?: string }) {
    return this.request<any>(`/pick-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Cycle Count Schedules
  async getCycleCountSchedules(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/cycle-count-schedules', params || {});
  }
  async getCycleCountSchedule(id: string) {
    return this.request<any>(`/cycle-count-schedules/${id}`);
  }
  async createCycleCountSchedule(data: { name: string; description?: string; frequency: string; abc_classification?: string; category_id?: string; warehouse_id: string; responsible_id?: string; next_run_date: string }) {
    return this.request<any>('/cycle-count-schedules', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateCycleCountSchedule(id: string, data: { name?: string; description?: string; frequency?: string; abc_classification?: string; category_id?: string; warehouse_id?: string; responsible_id?: string; next_run_date?: string; is_active?: boolean }) {
    return this.request<any>(`/cycle-count-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteCycleCountSchedule(id: string) {
    return this.request<any>(`/cycle-count-schedules/${id}`, { method: 'DELETE' });
  }
  async runCycleCountSchedule(id: string) {
    return this.request<any>(`/cycle-count-schedules/${id}/run`, { method: 'POST' });
  }

  // SII Inventory Book (create/delete handled by dedicated methods above)

  // Label Templates
  async getLabelTemplates(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/label-templates', params || {});
  }
  async createLabelTemplate(data: { name: string; description?: string; width_mm: number; height_mm: number; margin_mm?: number; background_color?: string; template_json: any; is_default?: boolean; is_active?: boolean }) {
    return this.request<any>('/label-templates', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateLabelTemplate(id: string, data: { name?: string; description?: string; width_mm?: number; height_mm?: number; margin_mm?: number; background_color?: string; template_json?: any; is_default?: boolean; is_active?: boolean }) {
    return this.request<any>(`/label-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteLabelTemplate(id: string) {
    return this.request<any>(`/label-templates/${id}`, { method: 'DELETE' });
  }

  // Webhook Endpoints
  async getWebhookEndpoints(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/webhook-endpoints', params || {});
  }
  async createWebhookEndpoint(data: { url: string; events: string[]; secret?: string; headers?: any; retry_policy?: any; is_active?: boolean }) {
    return this.request<any>('/webhook-endpoints', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateWebhookEndpoint(id: string, data: { url?: string; events?: string[]; secret?: string; headers?: any; retry_policy?: any; is_active?: boolean }) {
    return this.request<any>(`/webhook-endpoints/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteWebhookEndpoint(id: string) {
    return this.request<any>(`/webhook-endpoints/${id}`, { method: 'DELETE' });
  }
  async getWebhookDeliveries(endpointId: string, params?: Record<string, string>) {
    return this.requestWithPagination<any>(`/webhook-endpoints/${endpointId}/deliveries`, params || {});
  }

  // PWA Offline Queue
  async getPwaOfflineQueue(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/pwa-offline-queue', params || {});
  }
  async addToOfflineQueue(data: { user_id: string; action_type: string; entity_type: string; entity_id?: string; payload: any }) {
    return this.request<any>('/pwa-offline-queue', { method: 'POST', body: JSON.stringify(data) });
  }

  async syncOfflineQueue(ids?: string[]) {
    return this.request<any>('/pwa-offline-queue/sync', { method: 'POST', body: JSON.stringify({ ids }) });
  }

  // Sales Registers
  async getSalesRegisters(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; client: string; invoice_number: string; emission_date: string; status: string; payment_date: string | null; net_amount: number; total_amount: number; guide_number: string | null; seller: string; notes: string | null }>('/sales-registers', params || {});
  }
  async getSalesRegister(id: string) {
    return this.request<any>(`/sales-registers/${id}`);
  }
  async createSalesRegister(data: { client: string; invoice_number: string; emission_date?: string; status?: string; payment_date?: string; net_amount?: number; total_amount?: number; guide_number?: string; seller: string; notes?: string }) {
    return this.request<any>('/sales-registers', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateSalesRegister(id: string, data: Partial<{ client: string; invoice_number: string; emission_date: string; status: string; payment_date: string; net_amount: number; total_amount: number; guide_number: string; seller: string; notes: string }>) {
    return this.request<any>(`/sales-registers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteSalesRegister(id: string) {
    return this.request<any>(`/sales-registers/${id}`, { method: 'DELETE' });
  }

  // Purchase Registers
  async getPurchaseRegisters(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; razon_social: string; rut: string | null; invoice_number: string; emission_date: string; status: string; amount: number; area: string; payment_type: string; payment_date: string | null; notes: string | null }>('/purchase-registers', params || {});
  }
  async getPurchaseRegister(id: string) {
    return this.request<any>(`/purchase-registers/${id}`);
  }
  async createPurchaseRegister(data: { razon_social: string; rut?: string; invoice_number: string; emission_date?: string; status?: string; amount?: number; area: string; payment_type: string; payment_date?: string; notes?: string }) {
    return this.request<any>('/purchase-registers', { method: 'POST', body: JSON.stringify(data) });
  }
  async updatePurchaseRegister(id: string, data: Partial<{ razon_social: string; rut: string; invoice_number: string; emission_date: string; status: string; amount: number; area: string; payment_type: string; payment_date: string; notes: string }>) {
    return this.request<any>(`/purchase-registers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deletePurchaseRegister(id: string) {
    return this.request<any>(`/purchase-registers/${id}`, { method: 'DELETE' });
  }

  // Goods Receipts
  async getGoodsReceipts(params?: { status?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return this.request(`/goods-receipts${qs ? '?' + qs : ''}`);
  }

  async getGoodsReceipt(receiptId: string) {
    return this.request(`/goods-receipts/${receiptId}`);
  }

  async createGoodsReceipt(data: any) {
    return this.request(`/goods-receipts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoodsReceipt(receiptId: string, data: any) {
    return this.request(`/goods-receipts/${receiptId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoodsReceipt(receiptId: string) {
    return this.request(`/goods-receipts/${receiptId}`, {
      method: 'DELETE',
    });
  }

  // Reports
  async getReport(params?: { report?: string; date_from?: string; date_to?: string; warehouse?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.report) searchParams.set('report', params.report);
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);
    if (params?.warehouse) searchParams.set('warehouse', params.warehouse);
    const qs = searchParams.toString();
    return this.request<{ sales?: any; inventory?: any; financials?: any }>(`/reports${qs ? `?${qs}` : ''}`);
  }

  // Projects
  async getProjects(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return this.request<any>(`/projects${qs ? `?${qs}` : ''}`);
  }

  async getDashboard() {
    return this.request<any>('/dashboard');
  }

  async getProject(projectId: string) {
    return this.request<any>(`/projects/${projectId}`);
  }

  async createProject(data: any) {
    return this.request<any>('/projects', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProject(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProject(projectId: string) {
    return this.request<any>(`/projects/${projectId}`, { method: 'DELETE' });
  }

  async cloneProject(projectId: string, data: { name?: string; code?: string; start_date?: string; end_date?: string }) {
    return this.request<any>(`/projects/${projectId}/clone`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Project Risks
  async getProjectRisks(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/risks`);
  }

  async createProjectRisk(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/risks`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectRisk(projectId: string, riskId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/risks/${riskId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProjectRisk(projectId: string, riskId: string) {
    return this.request<any>(`/projects/${projectId}/risks/${riskId}`, { method: 'DELETE' });
  }

  // Project Change Orders
  async getProjectChangeOrders(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/change-orders`);
  }

  async createProjectChangeOrder(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/change-orders`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectChangeOrder(projectId: string, changeOrderId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/change-orders/${changeOrderId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProjectChangeOrder(projectId: string, changeOrderId: string) {
    return this.request<any>(`/projects/${projectId}/change-orders/${changeOrderId}`, { method: 'DELETE' });
  }

  // Project Portal
  async toggleProjectPortal(projectId: string, data: { enabled?: boolean; show_budget?: boolean; show_costs?: boolean }) {
    return this.request<any>(`/projects/${projectId}/portal`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Project Reports
  async getProjectReports(projectId?: string) {
    const qs = projectId ? `?project_id=${projectId}` : '';
    return this.request<any>(`/reports/projects${qs}`);
  }

  // Resource Allocation
  async getResourceAllocation(period?: number) {
    const qs = period ? `?period=${period}` : '';
    return this.request<any>(`/projects/allocation${qs}`);
  }

  // File Upload
  async uploadProjectDocument(projectId: string, file: File, category?: string, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const url = `${API_BASE}/companies/${this.companyId}/projects/${projectId}/documents/upload`;
    const token = getTokenFromCookie();
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return response.json();
  }

  async getDocumentDownloadUrl(projectId: string, documentId: string) {
    return `${API_BASE}/companies/${this.companyId}/projects/${projectId}/documents/${documentId}/download`;
  }

  async getProjectTasks(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/tasks`);
  }

  async createProjectTask(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectTask(projectId: string, taskId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProjectTask(projectId: string, taskId: string) {
    return this.request<any>(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
  }

  // Project Task Dependencies
  async getProjectDependencies(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/dependencies`);
  }

  async createProjectDependency(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/dependencies`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteProjectDependency(projectId: string, dependencyId: string) {
    return this.request<any>(`/projects/${projectId}/dependencies/${dependencyId}`, { method: 'DELETE' });
  }

  // Project Templates
  async getProjectTemplates() {
    return this.request<any[]>(`/projects/templates`);
  }

  async createProjectTemplate(data: any) {
    return this.request<any>(`/projects/templates`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteProjectTemplate(templateId: string) {
    return this.request<any>(`/projects/templates/${templateId}`, { method: 'DELETE' });
  }

  async applyProjectTemplate(templateId: string, projectId: string) {
    return this.request<any>(`/projects/templates/${templateId}/apply`, { method: 'POST', body: JSON.stringify({ project_id: projectId }) });
  }

  // Project Phases
  async getProjectPhases(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/phases`);
  }

  async createProjectPhase(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/phases`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectPhase(projectId: string, phaseId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/phases`, { method: 'PUT', body: JSON.stringify({ ...data, id: phaseId }) });
  }

  async deleteProjectPhase(projectId: string, phaseId: string) {
    return this.request<any>(`/projects/${projectId}/phases/${phaseId}`, { method: 'DELETE' });
  }

  // Project Milestones
  async getProjectMilestones(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/milestones`);
  }

  async createProjectMilestone(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectMilestone(projectId: string, milestoneId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/milestones/${milestoneId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProjectMilestone(projectId: string, milestoneId: string) {
    return this.request<any>(`/projects/${projectId}/milestones/${milestoneId}`, { method: 'DELETE' });
  }

  // Project Timesheets
  async getProjectTimesheets(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/timesheets`);
  }

  async createProjectTimesheet(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/timesheets`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectTimesheet(projectId: string, timesheetId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/timesheets/${timesheetId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProjectTimesheet(projectId: string, timesheetId: string) {
    return this.request<any>(`/projects/${projectId}/timesheets/${timesheetId}`, { method: 'DELETE' });
  }

  async approveProjectTimesheet(projectId: string, timesheetId: string, approved: boolean) {
    return this.request<any>(`/projects/${projectId}/timesheets/${timesheetId}`, {
      method: 'PUT', body: JSON.stringify({ action: approved ? 'approve' : 'reject' })
    });
  }

  // Project Expenses
  async getProjectExpenses(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/expenses`);
  }

  async createProjectExpense(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/expenses`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProjectExpense(projectId: string, expenseId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProjectExpense(projectId: string, expenseId: string) {
    return this.request<any>(`/projects/${projectId}/expenses/${expenseId}`, { method: 'DELETE' });
  }

  // Project Costs
  async getProjectCosts(projectId: string) {
    return this.request<any>(`/projects/${projectId}/costs`);
  }

  async createProjectCost(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/costs`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Project Documents
  async getProjectDocuments(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/documents`);
  }

  async createProjectDocument(projectId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/documents`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteProjectDocument(projectId: string, documentId: string) {
    return this.request<any>(`/projects/${projectId}/documents/${documentId}`, { method: 'DELETE' });
  }

  // Project Activity Log
  async getProjectActivityLog(projectId: string, params?: { page?: number; limit?: number }) {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = params.page.toString();
    if (params?.limit) searchParams.limit = params.limit.toString();
    return this.requestWithPagination<any>(`/projects/${projectId}/activity`, searchParams);
  }

  async logProjectActivity(projectId: string, data: { action: string; entity_type: string; entity_id?: string; entity_name?: string; old_value?: any; new_value?: any; metadata?: any }) {
    return this.request<any>(`/projects/${projectId}/activity`, { method: 'POST', body: JSON.stringify(data) });
  }

  async getProjectNotifications() {
    return this.request<any>('/projects/notifications');
  }

  // Notifications
  async getNotifications(params?: { unread?: boolean; page?: number; limit?: number }) {
    const searchParams: Record<string, string> = {};
    if (params?.unread) searchParams.unread = 'true';
    if (params?.page) searchParams.page = params.page.toString();
    if (params?.limit) searchParams.limit = params.limit.toString();
    return this.requestWithPagination<any>('/notifications', searchParams);
  }

  async createNotification(data: { type: string; title: string; message: string; entity_type?: string; entity_id?: string; project_id?: string }) {
    return this.request<any>('/notifications', { method: 'POST', body: JSON.stringify(data) });
  }

  async markNotificationsRead(notificationId?: string) {
    return this.request<any>('/notifications', {
      method: 'PUT',
      body: JSON.stringify(notificationId ? { notification_id: notificationId } : { action: 'mark_all_read' })
    });
  }

  async checkDeadlines() {
    return this.request<any>('/notifications/check-deadlines', { method: 'POST' });
  }

  async getUsers(params?: { search?: string; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return this.request<any>(`/users${qs ? `?${qs}` : ''}`);
  }

  async createUser(data: { email: string; full_name?: string; role?: string }) {
    return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateUser(data: { id: string; full_name?: string; role?: string; status?: string }) {
    return this.request<any>('/users', { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteUser(userId: string) {
    return this.request<any>(`/users?userId=${userId}`, { method: 'DELETE' });
  }

  async getNotificationPreferences() {
    return this.request<any>('/notification-preferences');
  }

  async updateNotificationPreferences(data: { email_enabled?: boolean; email_address?: string; task_deadline?: boolean; milestone_deadline?: boolean; project_deadline?: boolean; timesheet_reminders?: boolean }) {
    return this.request<any>('/notification-preferences', { method: 'PUT', body: JSON.stringify(data) });
  }
}

// Singleton with dynamic company_id from JWT
let _client: ApiClient | null = null;

function getCurrentCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return getCompanyIdFromToken();
}

export function getApiClient(): ApiClient {
  const companyId = getCurrentCompanyId();
  if (!companyId) {
    throw new Error('No company ID found in token. Please log in.');
  }
  if (!_client || _client['companyId'] !== companyId) {
    _client = new ApiClient(companyId);
  }
  return _client;
}

export function clearApiClient() {
  _client = null;
}