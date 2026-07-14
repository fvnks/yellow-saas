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
      throw new Error(data.error || 'Error en la solicitud');
    }
    return data.data || data;
  }

  private async requestWithPagination<T>(path: string, params: Record<string, string> = {}): Promise<{ data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const searchParams = new URLSearchParams(params);
    const url = `${API_BASE}/companies/${this.companyId}${path}?${searchParams}`;
    const response = await fetch(url);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Error en la solicitud');
    }
    return result;
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; sku: string; price: number; stock: number; warehouse: string }>('/products', params || {});
  }

  async getProduct(id: string) {
    return this.request<{ id: string; name: string; sku: string; price: number; stock: number }>(`/products/${id}`);
  }

  async createProduct(data: { name: string; sku: string; price?: number; category_id?: string; warehouse_id?: string; initial_stock?: number; description?: string; type?: string; unit_of_measure?: string; cost_price?: number; sale_price?: number; min_stock?: number; max_stock?: number; track_stock?: boolean; barcode?: string; tax_id?: string; is_active?: boolean }) {
    return this.request<{ id: string }>('/products', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProduct(id: string, data: Partial<{ name: string; sku: string; price: number; category_id: string; description: string; type: string; unit_of_measure: string; cost_price: number; sale_price: number; min_stock: number; max_stock: number; track_stock: boolean; barcode: string; tax_id: string; is_active: boolean }>) {
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
    return this.requestWithPagination<{ id: string; order_number: string; customer_id: string; status: string; total: number; created_at: string }>('/sales-orders', params || {});
  }

  async getSalesOrder(id: string) {
    return this.request<{ id: string; order_number: string; customer_id: string; status: string; total: number; items: any[] }>(`/sales-orders/${id}`);
  }

  async createSalesOrder(data: { order_number?: string; customer_id: string; warehouse_id?: string; order_date?: string; delivery_date?: string; payment_method?: string; payment_terms?: number; shipping_address?: string; subtotal?: number; tax_amount?: number; total?: number; notes?: string; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }) {
    return this.request<{ id: string }>('/sales-orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSalesOrder(id: string, data: Partial<{ customer_id: string; warehouse_id: string; status: string; delivery_date: string; payment_terms: number; notes: string }>) {
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

  async createDeliveryGuide(data: { order_id: string; warehouse_id: string; transport: string; driver_name: string; vehicle_plate: string; shipping_address: string; items: { product_id: string; quantity: number; observation?: string }[] }) {
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
    return this.requestWithPagination<{ id: string; invoice_number: string; order_id: string; status: string; total: number; created_at: string }>('/invoices', params || {});
  }

  async getInvoice(id: string) {
    return this.request<{ id: string; invoice_number: string; status: string; invoice_date: string; due_date: string; payment_terms: number; subtotal: number; tax_amount: number; total_amount: number; notes: string; customer: { id: string; name: string; tax_id: string }; items: any[] }>(`/invoices/${id}`);
  }

  async createInvoice(data: { order_id: string; customer_id: string; invoice_date: string; due_date: string; payment_method: string; items: { product_id: string; quantity: number; unit_price: number; discount?: number }[] }) {
    return this.request<{ id: string; invoice_number: string }>('/invoices', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateInvoice(id: string, data: Partial<{ status: string; invoice_date: string; due_date: string; payment_terms: number; notes: string }>) {
    return this.request<{ id: string }>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteInvoice(id: string) {
    return this.request<{ message: string }>(`/invoices/${id}`, { method: 'DELETE' });
  }

  // Purchase Orders
  async getPurchaseOrders(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; order_number: string; supplier_id: string; status: string; total: number; created_at: string }>('/purchase-orders', params || {});
  }

  async getPurchaseOrder(id: string) {
    return this.request<{ id: string; order_number: string; supplier_id: string; status: string; total: number; items: any[] }>(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: { order_number?: string; supplier_id: string; warehouse_id?: string; order_date?: string; expected_date?: string; payment_terms?: number; subtotal?: number; tax_amount?: number; total?: number; notes?: string; items: { product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number }[] }) {
    return this.request<{ id: string }>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePurchaseOrder(id: string, data: Partial<{ supplier_id: string; warehouse_id: string; status: string; expected_date: string; payment_terms: number; notes: string }>) {
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

  async updateQuotation(id: string, data: Partial<{ supplier_id: string; status: string; quote_date: string; expiry_date: string; total_amount: number; notes: string }>) {
    return this.request<{ id: string }>(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteQuotation(id: string) {
    return this.request<{ message: string }>(`/quotations/${id}`, { method: 'DELETE' });
  }

  // Employees
  async getEmployees(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; position: string; department: string; salary: number; status: string }>('/employees', params || {});
  }

  async getEmployee(id: string) {
    return this.request<{ id: string; name: string; position: string; department: string; salary: number; status: string }>(`/employees/${id}`);
  }

  async createEmployee(data: { employee_code: string; first_name: string; last_name: string; email?: string; phone?: string; address?: string; birth_date?: string; hire_date: string; department?: string; position?: string; contract_type?: string; base_salary?: number; salary_frequency?: string; bank_account?: string; bank_name?: string; tax_id?: string; afp_id?: string; health_id?: string }) {
    return this.request<{ id: string }>('/employees', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEmployee(id: string, data: Partial<{ employee_code: string; first_name: string; last_name: string; email: string; phone: string; address: string; birth_date: string; hire_date: string; termination_date: string; department: string; position: string; contract_type: string; base_salary: number; salary_frequency: string; bank_account: string; bank_name: string; tax_id: string; afp_id: string; health_id: string; status: string }>) {
    return this.request<{ id: string }>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteEmployee(id: string) {
    return this.request<{ message: string }>(`/employees/${id}`, { method: 'DELETE' });
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
    return this.requestWithPagination<{ id: string; entry_number: string; entry_date: string; description: string; total_debit: number; total_credit: number; status: string }>('/journal-entries', params || {});
  }

  async getJournalEntry(id: string) {
    return this.request<{ id: string; entry_number: string; entry_date: string; description: string; total_debit: number; total_credit: number; status: string; lines: any[] }>(`/journal-entries/${id}`);
  }

  async createJournalEntry(data: { entry_number: string; entry_date: string; description: string; reference_type?: string; reference_id?: string; lines: { account_id: string; description?: string; debit: number; credit: number }[] }) {
    return this.request<{ id: string }>('/journal-entries', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateJournalEntry(id: string, data: Partial<{ entry_date: string; description: string; lines: { account_id: string; description?: string; debit: number; credit: number }[] }>) {
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
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const qs = searchParams.toString();
    return this.request<{ data: any[]; total: number }>(`/cost-centers${qs ? `?${qs}` : ''}`);
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

  // Notifications
  async getNotifications(params?: Record<string, string>) {
    return this.requestWithPagination<any>('/notifications', params || {});
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.request<{ message: string }>(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>('/notifications/read-all', { method: 'POST' });
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