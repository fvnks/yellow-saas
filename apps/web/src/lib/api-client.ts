const API_BASE = '/api';

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

  async createProduct(data: { name: string; sku: string; price: number; category_id?: string; warehouse_id: string; initial_stock: number }) {
    return this.request<{ id: string }>('/products', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    return this.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Warehouses
  async getWarehouses(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; code: string; total_products: number; total_stock: number }>('/warehouses', params || {});
  }

  async createWarehouse(data: { name: string; code: string; address?: string; is_default?: boolean }) {
    return this.request<{ id: string }>('/warehouses', { method: 'POST', body: JSON.stringify(data) });
  }

  // Warehouse Layout
  async getWarehouseLayout(warehouseId: string) {
    return this.request<{ zones: { id: string; name: string; code: string; color: string; x: number; y: number; width: number; height: number; shelves: { id: string; name: string; code: string; x: number; y: number; width: number; height: number; positions: { id: string; name: string; code: string; capacity: number; current_stock: number }[] }[] }[] }>(`/warehouses/${warehouseId}/layout`);
  }

  async saveWarehouseLayout(warehouseId: string, data: { zones: { name: string; code?: string; color?: string; x: number; y: number; width: number; height: number; shelves?: { name: string; code?: string; x: number; y: number; width: number; height: number }[]; positions?: { name: string; code?: string; x: number; y: number; width: number; height: number; capacity?: number; product_id?: string }[] }[] }) {
    return this.request(`/warehouses/${warehouseId}/layout`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async assignProductToPosition(warehouseId: string, positionId: string, productId: string | null) {
    return this.request(`/warehouses/${warehouseId}/layout/assign`, { method: 'PUT', body: JSON.stringify({ position_id: positionId, product_id: productId }) });
  }

  // Customers
  async getCustomers(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; email: string; phone: string; tax_id: string; address: string }>('/customers', params || {});
  }

  async getCustomer(id: string) {
    return this.request<{ id: string; name: string; email: string; phone: string; tax_id: string; address: string }>(`/customers/${id}`);
  }

  async createCustomer(data: { name: string; email?: string; phone?: string; tax_id?: string; address?: string }) {
    return this.request<{ id: string }>('/customers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCustomer(id: string, data: Record<string, unknown>) {
    return this.request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, { method: 'DELETE' });
  }

  // Suppliers
  async getSuppliers(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; email: string; phone: string; tax_id: string }>('/suppliers', params || {});
  }

  async getSupplier(id: string) {
    return this.request<{ id: string; name: string; email: string; phone: string; tax_id: string; address: string }>(`/suppliers/${id}`);
  }

  async createSupplier(data: { name: string; email?: string; phone?: string; tax_id?: string; address?: string }) {
    return this.request<{ id: string }>('/suppliers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSupplier(id: string, data: Record<string, unknown>) {
    return this.request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, { method: 'DELETE' });
  }

  // Sales Orders
  async getSalesOrders(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; order_number: string; customer_id: string; status: string; total: number; created_at: string }>('/sales-orders', params || {});
  }

  async getSalesOrder(id: string) {
    return this.request<{ id: string; order_number: string; customer_id: string; warehouse_id: string; status: string; total: number; delivery_date: string; payment_terms: number; notes: string; created_at: string; customer?: { id: string; name: string; tax_id: string }; warehouse?: { id: string; name: string; code: string }; items?: { id: string; product_id: string; quantity: number; unit_price: number; discount_percent: number; line_total: number; product?: { id: string; name: string; sku: string } }[] }>(`/sales-orders/${id}`);
  }

  async createSalesOrder(data: {
    customer_id: string;
    warehouse_id: string;
    delivery_date?: string;
    payment_method?: string;
    payment_terms?: number;
    shipping_address?: string;
    notes?: string;
    items: { product_id: string; quantity: number; unit_price: number; discount?: number }[];
  }) {
    return this.request<{ id: string; order_number: string }>('/sales-orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSalesOrder(id: string, data: Record<string, unknown>) {
    return this.request(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSalesOrder(id: string) {
    return this.request(`/sales-orders/${id}`, { method: 'DELETE' });
  }

  // Purchase Orders
  async getPurchaseOrders(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; order_number: string; supplier_id: string; status: string; total: number; created_at: string }>('/purchase-orders', params || {});
  }

  async getPurchaseOrder(id: string) {
    return this.request<{ id: string; order_number: string; supplier_id: string; warehouse_id: string; status: string; total: number; expected_date: string; payment_terms: number; notes: string; created_at: string; supplier?: { id: string; name: string; tax_id: string }; warehouse?: { id: string; name: string; code: string }; items?: { id: string; product_id: string; quantity: number; received_quantity: number; unit_price: number; discount_percent: number; line_total: number; product?: { id: string; name: string; sku: string } }[] }>(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: {
    supplier_id: string;
    warehouse_id: string;
    expected_date?: string;
    payment_terms?: number;
    notes?: string;
    items: { product_id: string; quantity: number; unit_price: number }[];
  }) {
    return this.request<{ id: string; order_number: string }>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePurchaseOrder(id: string, data: Record<string, unknown>) {
    return this.request(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deletePurchaseOrder(id: string) {
    return this.request(`/purchase-orders/${id}`, { method: 'DELETE' });
  }

  // Quotations
  async getQuotations(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; number: string; supplier_id: string; status: string; total_amount: number; quote_date: string; expiry_date: string; supplier?: { id: string; name: string } }>('/quotations', params || {});
  }

  async getQuotation(id: string) {
    return this.request<{ id: string; number: string; supplier_id: string; status: string; total_amount: number; quote_date: string; expiry_date: string; valid_until: string; payment_terms: string; delivery_terms: string; notes: string; internal_notes: string; supplier?: { id: string; name: string; tax_id: string; email: string; phone: string }; items?: { id: string; product_id: string; quantity: number; unit_price: number; discount_percent: number; discount_amount: number; tax_rate: number; tax_amount: number; line_total: number; notes: string; product?: { id: string; name: string; sku: string; unit: string } }[] }>(`/quotations/${id}`);
  }

  async createQuotation(data: {
    supplier_id: string;
    quote_date?: string;
    expiry_date?: string;
    valid_until?: string;
    payment_terms?: string;
    delivery_terms?: string;
    notes?: string;
    internal_notes?: string;
    items: { product_id: string; quantity: number; unit_price: number; discount_percent?: number; discount_amount?: number; tax_rate?: number; tax_amount?: number; notes?: string }[];
  }) {
    return this.request<{ id: string; number: string }>('/quotations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateQuotation(id: string, data: Record<string, unknown>) {
    return this.request(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteQuotation(id: string) {
    return this.request(`/quotations/${id}`, { method: 'DELETE' });
  }

  // Delivery Guides
  async getDeliveryGuides(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; guide_number: string; order_id: string; status: string; transport: string; created_at: string }>('/delivery-guides', params || {});
  }

  async getDeliveryGuide(id: string) {
    return this.request<{ id: string; guide_number: string; status: string; transport: string; driver_name: string; vehicle_plate: string; shipping_address: string; created_at: string; order?: { id: string; order_number: string; customer?: { id: string; name: string; tax_id: string } }; warehouse?: { id: string; name: string; code: string }; items?: { id: string; product_id: string; quantity: number; observation: string; product?: { id: string; name: string; sku: string } }[] }>(`/delivery-guides/${id}`);
  }

  async createDeliveryGuide(data: {
    order_id: string;
    warehouse_id: string;
    transport: string;
    driver_name: string;
    vehicle_plate: string;
    shipping_address: string;
    items: { product_id: string; quantity: number; observation?: string }[];
  }) {
    return this.request<{ id: string; guide_number: string }>('/delivery-guides', { method: 'POST', body: JSON.stringify(data) });
  }

  // Invoices
  async getInvoices(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; invoice_number: string; order_id: string; status: string; total: number; created_at: string }>('/invoices', params || {});
  }

  async getInvoice(id: string) {
    return this.request<{ id: string; invoice_number: string; status: string; invoice_date: string; due_date: string; payment_terms: number; subtotal: number; tax_amount: number; total_amount: number; notes: string; created_at: string; customer?: { id: string; name: string; tax_id: string }; warehouse?: { id: string; name: string; code: string }; items?: { id: string; product_id: string; quantity: number; unit_price: number; discount_percent: number; tax_rate: number; tax_amount: number; line_total: number; product?: { id: string; name: string; sku: string } }[] }>(`/invoices/${id}`);
  }

  async createInvoice(data: {
    order_id: string;
    customer_id: string;
    invoice_date: string;
    due_date: string;
    payment_method: string;
    items: { product_id: string; quantity: number; unit_price: number; discount?: number }[];
  }) {
    return this.request<{ id: string; invoice_number: string }>('/invoices', { method: 'POST', body: JSON.stringify(data) });
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

  async createPriceList(data: { name: string; description?: string; is_default?: boolean; items: { product_id: string; price: number }[] }) {
    return this.request<{ id: string }>('/price-lists', { method: 'POST', body: JSON.stringify(data) });
  }

  // Journal Entries
  async getJournalEntries(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; entry_number: string; date: string; description: string; total_debit: number; status: string }>('/journal-entries', params || {});
  }

  async createJournalEntry(data: { date: string; description: string; lines: { account_id: string; debit: number; credit: number; description?: string }[] }) {
    return this.request<{ id: string; entry_number: string }>('/journal-entries', { method: 'POST', body: JSON.stringify(data) });
  }

  // Employees
  async getEmployees(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; name: string; position: string; department: string; salary: number; status: string }>('/employees', params || {});
  }

  async createEmployee(data: { name: string; rut?: string; position: string; department: string; salary: number; hire_date: string }) {
    return this.request<{ id: string }>('/employees', { method: 'POST', body: JSON.stringify(data) });
  }

  // Roles
  async getRoles() {
    return this.requestWithPagination<{ id: string; name: string; description: string; is_system: boolean }>('/roles', {});
  }

  async getRole(id: string) {
    return this.request<{ id: string; name: string; description: string; is_system: boolean; permissions: { id: string; module: string; action: string; description: string }[] }>(`/roles/${id}`);
  }

  async createRole(data: { name: string; description?: string }) {
    return this.request<{ id: string }>('/roles', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateRole(id: string, data: { name: string; description?: string }) {
    return this.request(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteRole(id: string) {
    return this.request(`/roles/${id}`, { method: 'DELETE' });
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return this.request(`/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permission_ids: permissionIds }) });
  }

  // Permissions
  async getPermissions() {
    return this.request<{ id: string; module: string; action: string; description: string }[]>('/permissions');
  }

  // User Roles
  async getUserRoles() {
    return this.request<{ id: string; user_id: string; role_id: string; role: { id: string; name: string }; user: { id: string; email: string; full_name: string } }[]>('/user-roles');
  }

  async assignUserRole(userId: string, roleId: string) {
    return this.request('/user-roles', { method: 'POST', body: JSON.stringify({ user_id: userId, role_id: roleId }) });
  }

  async removeUserRole(userId: string, roleId: string) {
    return this.request('/user-roles', { method: 'DELETE', body: JSON.stringify({ user_id: userId, role_id: roleId }) });
  }

  // Audit
  async getAuditLogs(params?: Record<string, string>) {
    return this.requestWithPagination<{ id: string; action: string; entity_type: string; entity_id: string; details: string; user_id: string; created_at: string }>('/audit', params || {});
  }
}

// Helper to get companyId from current URL or context
export function getCompanyIdFromPath(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const match = path.match(/\/dashboard\/(\w+)/);
  return match ? match[1] : null;
}

// Singleton for demo purposes - in real app this would come from auth context
let _client: ApiClient | null = null;

export function getApiClient(companyId?: string): ApiClient {
  const id = companyId || 'demo-company-id';
  if (!_client || _client['companyId'] !== id) {
    _client = new ApiClient(id);
  }
  return _client;
}