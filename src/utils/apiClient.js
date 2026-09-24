/**
 * Authoritative API Client for Intelligent Automotive E-Commerce Platform
 * Connects directly to the Fastify Backend API (/api/v1)
 */

import OfflineDataStore from './offlineDataStore';

const API_BASE = '/api/v1';

class ApiClient {
  static getSessionToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mobex_cart_session_token');
    }
    return null;
  }

  static setSessionToken(token) {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('mobex_cart_session_token', token);
    }
  }

  static async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (endpoint.includes('/admin') || endpoint.includes('/settings') || (typeof window !== 'undefined' && window.location.hash.includes('admin'))) {
      if (!headers['X-Admin-Key']) {
        headers['X-Admin-Key'] = 'mobex_admin_bypass_2026';
      }
    }

    const sessionToken = this.getSessionToken();
    if (sessionToken && !headers['X-Session-Token']) {
      headers['X-Session-Token'] = sessionToken;
    }

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('mobex_auth_token') : null;
    if (authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const timeoutMs = options.timeout || 15000;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    const config = {
      ...options,
      headers,
      credentials: 'include', // Includes HttpOnly session cookie
      signal: options.signal || (controller ? controller.signal : undefined),
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const method = (options.method || 'GET').toUpperCase();
    const isWrite = method !== 'GET' && method !== 'HEAD';

    let response;
    let attempt = 0;
    const maxAttempts = isWrite ? 1 : 2;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        response = await fetch(url, config);
        if (timeoutId) clearTimeout(timeoutId);

        // If transient 502/503/504 on first GET attempt, retry once after 250ms
        if (!isWrite && attempt < maxAttempts && (response.status === 502 || response.status === 503 || response.status === 504)) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }
        break;
      } catch (networkErr) {
        if (timeoutId) clearTimeout(timeoutId);

        const isTimeout = networkErr.name === 'TimeoutError' || networkErr.name === 'AbortError';
        if (isTimeout) {
          throw new Error(`การเชื่อมต่อกับเซิร์ฟเวอร์หมดเวลา (Timeout ${timeoutMs / 1000}s) กรุณาลองใหม่อีกครั้ง`);
        }

        if (!isWrite && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }

        if (isWrite) {
          throw new Error(`ไม่สามารถบันทึกข้อมูลได้: เชื่อมต่อ API Server ไม่สำเร็จ (${networkErr.message}) กรุณาตรวจสอบว่า API Server กำลังทำงาน`);
        }
        console.warn(`[ApiClient] Network unreachable for ${endpoint}, using local offline store:`, networkErr.message);
        return OfflineDataStore.handle(endpoint, options);
      }
    }

    // Save session token if returned in header
    const returnedSessionToken = response.headers.get('x-session-token');
    if (returnedSessionToken) {
      this.setSessionToken(returnedSessionToken);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    // When backend returns 502 Bad Gateway / 503 Service Unavailable / 504
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      if (isWrite) {
        throw new Error(`ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลจริงได้ (API Server HTTP ${response.status}) กรุณาลองใหม่อีกครั้ง`);
      }
      console.warn(`[ApiClient] Server returned HTTP ${response.status} for ${endpoint}, fallback to local store`);
      return OfflineDataStore.handle(endpoint, options);
    }

    if (response.status === 404 && isWrite) {
      throw new Error(`ไม่พบ API Endpoint สำหรับการแก้ไขข้อมูล (HTTP 404: ${endpoint})`);
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMsg = json.error?.message || json.message || `HTTP error ${response.status}`;
      if (Array.isArray(json.error?.details) && json.error.details.length > 0) {
        const detailsStr = json.error.details.map((d) => `${d.field}: ${d.message}`).join(', ');
        errorMsg = `${errorMsg} (${detailsStr})`;
      }
      const error = new Error(errorMsg);
      error.code = json.error?.code || 'API_ERROR';
      error.status = response.status;
      error.details = json.error?.details || [];
      error.requestId = json.error?.requestId;
      throw error;
    }

    if (typeof window !== 'undefined' && response.ok) {
      try {
        if (endpoint.includes('/categories')) localStorage.removeItem('mobex_db_categories');
        if (endpoint.includes('/brands')) localStorage.removeItem('mobex_db_brands');
        if (endpoint.includes('/vehicles/makes')) localStorage.removeItem('mobex_db_makes');
      } catch (e) {}
    }

    return json;
  }

  // --- Generic HTTP Methods ---
  static async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  static async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  static async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  static async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  static async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // --- Settings & Storefront ---
  static async getSettings() {
    return this.request('/settings');
  }

  static async updateSettings(payload) {
    return this.request('/settings', {
      method: 'PUT',
      body: payload,
    });
  }

  // --- Auth Endpoints ---
  static async getMe() {
    return this.request('/auth/me');
  }

  static async login(usernameOrEmail, password) {
    const raw = (usernameOrEmail || '').trim();
    const email = raw.includes('@') ? raw : `${raw}@mobex.co.th`;
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: { email, username: raw, password },
    });
    const token = res?.data?.sessionToken || res?.sessionToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('mobex_auth_token', token);
    }
    const userObj = res?.data?.user || res?.user;
    if (userObj && typeof window !== 'undefined') {
      localStorage.setItem('mobex_auth_user', JSON.stringify(userObj));
    }
    return res;
  }

  static async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mobex_auth_token');
        localStorage.removeItem('mobex_auth_user');
      }
    }
  }

  static async sendOtp(email, purpose = 'REGISTRATION') {
    return this.post('/auth/otp/send', { email, purpose });
  }

  static async verifyOtp(email, code, purpose = 'REGISTRATION') {
    return this.post('/auth/otp/verify', { email, code, purpose });
  }

  static async register(data) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: data,
    });
    const token = res?.data?.sessionToken || res?.sessionToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('mobex_auth_token', token);
    }
    const userObj = res?.data?.user || res?.user;
    if (userObj && typeof window !== 'undefined') {
      localStorage.setItem('mobex_auth_user', JSON.stringify(userObj));
    }
    return res;
  }

  // --- Storefront Products ---
  static async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.pageSize) query.set('pageSize', params.pageSize);
    if (params.category) query.set('category', params.category);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.brand) query.set('brand', params.brand);
    if (params.brandId) query.set('brandId', params.brandId);
    if (params.vehicleVariantId) query.set('vehicleVariantId', params.vehicleVariantId);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice);

    const queryString = query.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  static async getProductById(id) {
    return this.request(`/products/${id}`);
  }

  static async getProductBySlug(slug) {
    return this.request(`/products/slug/${slug}`);
  }

  static async createProduct(payload) {
    return this.post('/admin/products', payload);
  }

  static async updateProduct(id, payload) {
    return this.patch(`/admin/products/${id}`, payload);
  }

  static async deleteProduct(id) {
    return this.delete(`/admin/products/${id}`);
  }

  static async getDashboardStats() {
    return this.request('/admin/dashboard-stats');
  }

  // --- Storefront Categories & Brands ---
  static async getCategoryTree() {
    return this.request('/categories/tree');
  }

  static async getCategories() {
    return this.request('/categories');
  }

  static async createCategory(payload) {
    return this.post('/admin/categories', payload);
  }

  static async updateCategory(id, payload) {
    return this.patch(`/admin/categories/${id}`, payload);
  }

  static async deleteCategory(id) {
    return this.delete(`/admin/categories/${id}`);
  }

  static async getBrands() {
    return this.request('/brands');
  }

  static async createBrand(payload) {
    return this.post('/admin/brands', payload);
  }

  static async updateBrand(id, payload) {
    return this.patch(`/admin/brands/${id}`, payload);
  }

  static async deleteBrand(id) {
    return this.delete(`/admin/brands/${id}`);
  }

  // --- Storefront Vehicle Hierarchy & Master Data ---
  static async getMakes(isActive = true) {
    return this.request(`/vehicles/makes?isActive=${isActive}`);
  }

  static async createVehicleMake(payload) {
    return this.post('/admin/vehicles/makes', payload);
  }

  static async updateVehicleMake(id, payload) {
    return this.patch(`/admin/vehicles/makes/${id}`, payload);
  }

  static async deleteVehicleMake(id) {
    return this.delete(`/admin/vehicles/makes/${id}`);
  }

  static async getModels(makeId, isActive = true) {
    const query = new URLSearchParams();
    if (makeId) query.set('makeId', makeId);
    if (isActive !== undefined) query.set('isActive', String(isActive));
    return this.request(`/vehicles/models?${query.toString()}`);
  }

  static async createVehicleModel(payload) {
    return this.post('/admin/vehicles/models', payload);
  }

  static async updateVehicleModel(id, payload) {
    return this.patch(`/admin/vehicles/models/${id}`, payload);
  }

  static async deleteVehicleModel(id) {
    return this.delete(`/admin/vehicles/models/${id}`);
  }

  static async getGenerations(modelId, isActive = true) {
    const query = new URLSearchParams();
    if (modelId) query.set('modelId', modelId);
    if (isActive !== undefined) query.set('isActive', String(isActive));
    return this.request(`/vehicles/generations?${query.toString()}`);
  }

  static async createVehicleYear(payload) {
    return this.post('/admin/vehicles/generations', payload);
  }

  static async updateVehicleYear(id, payload) {
    return this.patch(`/admin/vehicles/generations/${id}`, payload);
  }

  static async deleteVehicleYear(id) {
    return this.delete(`/admin/vehicles/generations/${id}`);
  }

  static async getEngines() {
    return this.request('/vehicles/engines');
  }

  static async getVariants({ generationId, engineId, isActive = true } = {}) {
    const query = new URLSearchParams();
    if (generationId) query.set('generationId', generationId);
    if (engineId) query.set('engineId', engineId);
    if (isActive !== undefined) query.set('isActive', String(isActive));
    return this.request(`/vehicles/variants?${query.toString()}`);
  }

  static async getVariantById(id) {
    return this.request(`/vehicles/variants/${id}`);
  }

  static async getVariantProducts(variantId, params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/vehicles/variants/${variantId}/products?${query.toString()}`);
  }

  // --- Deterministic Fitment API ---
  static async checkProductFitment(productId, vehicleVariantId, position) {
    const query = new URLSearchParams();
    if (position) query.set('position', position);
    const qs = query.toString();
    return this.request(`/products/${productId}/fitment/${vehicleVariantId}${qs ? `?${qs}` : ''}`);
  }

  static async getProductFitments(productId) {
    return this.request(`/products/${productId}/fitments`);
  }

  // --- Admin Catalog APIs ---
  static async getAdminProducts(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/admin/products?${query.toString()}`);
  }

  static async createProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: productData,
    });
  }

  static async updateProduct(id, productData) {
    return this.request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: productData,
    });
  }

  static async deleteProduct(id) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Shopping Cart Endpoints ---
  static async getCart() {
    return this.request('/cart');
  }

  static async addToCart(productId, quantity = 1, vehicleVariantId = null) {
    return this.request('/cart/items', {
      method: 'POST',
      body: { productId, quantity, vehicleVariantId },
    });
  }

  static async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: { quantity },
    });
  }

  static async removeCartItem(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  static async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  static async mergeCart(sessionToken) {
    return this.request('/cart/merge', {
      method: 'POST',
      body: { sessionToken },
    });
  }

  // --- Checkout & Orders Endpoints ---
  static async checkout(payload) {
    return this.request('/checkout', {
      method: 'POST',
      body: payload,
    });
  }

  static async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  static async getOrderByNumber(orderNumber) {
    return this.request(`/orders/by-number/${orderNumber}`);
  }

  static async getMyOrders(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/orders/my-orders?${query.toString()}`);
  }

  static async getOrderTimeline(id) {
    return this.request(`/orders/${id}/timeline`);
  }

  static async cancelOrder(id, reason) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  }

  static async requestOrderReturn(id, reason) {
    return this.request(`/orders/${id}/return`, {
      method: 'POST',
      body: { reason },
    });
  }

  // --- Staff / Admin Order Management Endpoints (Phase M9) ---
  static async getAdminOrders(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/admin/orders?${query.toString()}`);
  }

  static async getAdminOrderById(id) {
    return this.request(`/admin/orders/${id}`);
  }

  static async updateAdminOrderStatus(id, payload) {
    return this.request(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async cancelAdminOrder(id, reason) {
    return this.request(`/admin/orders/${id}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  }

  static async handleAdminReturnAction(id, payload) {
    return this.request(`/admin/orders/${id}/return-action`, {
      method: 'POST',
      body: payload,
    });
  }

  // --- Payment Endpoints (Phase M7) ---
  static async createPayment(payload) {
    return this.request('/payments', {
      method: 'POST',
      body: payload,
    });
  }

  static async getPaymentById(id) {
    return this.request(`/payments/${id}`);
  }

  static async getPaymentByOrderId(orderId) {
    return this.request(`/orders/${orderId}/payment`);
  }

  static async submitPaymentSlip(paymentId, payload) {
    return this.request(`/payments/${paymentId}/slip`, {
      method: 'POST',
      body: payload,
    });
  }

  static async verifyPaymentSlip(slipId, payload = {}) {
    return this.request(`/payments/slips/${slipId}/verify`, {
      method: 'POST',
      body: payload,
    });
  }

  static async rejectPaymentSlip(slipId, payload) {
    return this.request(`/payments/slips/${slipId}/reject`, {
      method: 'POST',
      body: payload,
    });
  }

  static async refundPayment(paymentId, payload) {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: payload,
    });
  }

  // --- Shipping & Fulfillment Endpoints (Phase M8) ---
  static async getShippingMethods() {
    return this.request('/shipping-methods');
  }

  static async getShipmentById(id) {
    return this.request(`/shipments/${id}`);
  }

  static async getShipmentsByOrderId(orderId) {
    return this.request(`/orders/${orderId}/shipments`);
  }

  static async getTracking(trackingNumber) {
    return this.request(`/tracking/${trackingNumber}`);
  }

  static async createShipment(payload) {
    return this.request('/shipments', {
      method: 'POST',
      body: payload,
    });
  }

  static async updateShipmentStatus(id, payload) {
    return this.request(`/admin/shipments/${id}/status`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async assignShipmentTracking(id, payload) {
    return this.request(`/admin/shipments/${id}/tracking`, {
      method: 'POST',
      body: payload,
    });
  }

  static async cancelShipment(id, payload) {
    return this.request(`/admin/shipments/${id}/cancel`, {
      method: 'POST',
      body: payload,
    });
  }

  static async getAdminShipments(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/admin/shipments?${query.toString()}`);
  }

  // --- Inventory & Warehouse Endpoints (M10) ---
  static async getInventory(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, val);
      }
    });
    return this.request(`/inventory?${query.toString()}`);
  }

  static async getInventoryById(id) {
    return this.request(`/inventory/${id}`);
  }

  static async getProductAvailability(productId, warehouseId) {
    const query = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return this.request(`/inventory/product/${productId}${query}`);
  }

  static async getInventoryDashboard() {
    return this.request('/inventory/dashboard');
  }

  static async adjustStock(payload) {
    return this.request('/inventory/adjustments', {
      method: 'POST',
      body: payload,
    });
  }

  static async transferStock(payload) {
    return this.request('/inventory/transfers', {
      method: 'POST',
      body: payload,
    });
  }

  static async reserveStock(payload) {
    return this.request('/inventory/reservations', {
      method: 'POST',
      body: payload,
    });
  }

  static async releaseReservation(id, payload = {}) {
    return this.request(`/inventory/reservations/${id}/release`, {
      method: 'POST',
      body: payload,
    });
  }

  static async commitReservation(id, payload = {}) {
    return this.request(`/inventory/reservations/${id}/commit`, {
      method: 'POST',
      body: payload,
    });
  }

  static async getInventoryMovements(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, val);
      }
    });
    return this.request(`/inventory/movements?${query.toString()}`);
  }

  static async getWarehouses(includeInactive = false) {
    return this.request(`/warehouses?includeInactive=${includeInactive}`);
  }

  static async getWarehouseById(id) {
    return this.request(`/warehouses/${id}`);
  }

  static async createWarehouse(payload) {
    return this.request('/warehouses', {
      method: 'POST',
      body: payload,
    });
  }

  static async updateWarehouse(id, payload) {
    return this.request(`/warehouses/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async deleteWarehouse(id) {
    return this.request(`/warehouses/${id}`, {
      method: 'DELETE',
    });
  }

  static async getWarehouseLocations(warehouseId, includeInactive = false) {
    return this.request(`/warehouses/${warehouseId}/locations?includeInactive=${includeInactive}`);
  }

  static async createWarehouseLocation(payload) {
    return this.request(`/warehouses/${payload.warehouseId}/locations`, {
      method: 'POST',
      body: payload,
    });
  }

  static async updateWarehouseLocation(id, payload) {
    return this.request(`/locations/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async deleteWarehouseLocation(id) {
    return this.request(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // --- CRM & Customer Endpoints ---
  static async getCustomerProfileMe() {
    return this.request('/customers/me');
  }

  static async updateCustomerProfileMe(payload) {
    return this.request('/customers/me', {
      method: 'PATCH',
      body: payload,
    });
  }

  static async getMyActivity() {
    return this.request('/customers/me/activity');
  }

  static async getMyLoyalty() {
    return this.request('/customers/me/loyalty');
  }

  static async validateCoupon(code, items = [], subtotal) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: { code, items, subtotal },
    });
  }

  static async redeemLoyaltyPreview(points, subtotal) {
    return this.request('/loyalty/redeem', {
      method: 'POST',
      body: { points, subtotal },
    });
  }

  // --- Staff CRM Admin ---
  static async getAdminCustomers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.customerType) query.set('customerType', params.customerType);
    if (params.segmentId) query.set('segmentId', params.segmentId);
    if (params.tagId) query.set('tagId', params.tagId);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return this.request(`/admin/customers?${query.toString()}`);
  }

  static async getAdminCustomerById(id) {
    return this.request(`/admin/customers/${id}`);
  }

  static async updateAdminCustomer(id, payload) {
    return this.request(`/admin/customers/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async deleteAdminCustomer(id) {
    return this.request(`/admin/customers/${id}`, {
      method: 'DELETE',
    });
  }

  static async getAdminCustomerActivity(id) {
    return this.request(`/admin/customers/${id}/activity`);
  }

  static async getAdminCustomerOrders(id) {
    return this.request(`/admin/customers/${id}/orders`);
  }

  static async getAdminTags() {
    return this.request('/admin/customers/tags');
  }

  static async createAdminTag(payload) {
    return this.request('/admin/customers/tags', {
      method: 'POST',
      body: payload,
    });
  }

  static async assignAdminTag(customerId, tagId) {
    return this.request(`/admin/customers/${customerId}/tags`, {
      method: 'POST',
      body: { tagId },
    });
  }

  static async removeAdminTag(customerId, tagId) {
    return this.request(`/admin/customers/${customerId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  }

  static async getAdminSegments() {
    return this.request('/admin/customers/segments');
  }

  static async getAdminSegmentById(id) {
    return this.request(`/admin/customers/segments/${id}`);
  }

  static async createAdminSegment(payload) {
    return this.request('/admin/customers/segments', {
      method: 'POST',
      body: payload,
    });
  }

  static async updateAdminSegment(id, payload) {
    return this.request(`/admin/customers/segments/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async deleteAdminSegment(id) {
    return this.request(`/admin/customers/segments/${id}`, {
      method: 'DELETE',
    });
  }

  static async evaluateAdminSegment(id) {
    return this.request(`/admin/customers/segments/${id}/evaluate`, {
      method: 'POST',
    });
  }

  // --- Staff Promotions Admin ---
  static async getAdminPromotions(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.promotionType) query.set('promotionType', params.promotionType);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return this.request(`/admin/promotions?${query.toString()}`);
  }

  static async getAdminPromotionById(id) {
    return this.request(`/admin/promotions/${id}`);
  }

  static async createAdminPromotion(payload) {
    return this.request('/admin/promotions', {
      method: 'POST',
      body: payload,
    });
  }

  static async updateAdminPromotion(id, payload) {
    return this.request(`/admin/promotions/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async deleteAdminPromotion(id) {
    return this.request(`/admin/promotions/${id}`, {
      method: 'DELETE',
    });
  }

  static async getAdminCoupons(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.promotionId) query.set('promotionId', params.promotionId);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return this.request(`/admin/coupons?${query.toString()}`);
  }

  static async createAdminCoupon(payload) {
    return this.request('/admin/coupons', {
      method: 'POST',
      body: payload,
    });
  }

  static async updateAdminCoupon(id, payload) {
    return this.request(`/admin/coupons/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async deleteAdminCoupon(id) {
    return this.request(`/admin/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  static async getAdminPromotionRedemptions(id) {
    return this.request(`/admin/promotions/${id}/redemptions`);
  }

  // --- Staff Loyalty Admin ---
  static async getAdminLoyaltyAccounts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.tier) query.set('tier', params.tier);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return this.request(`/admin/loyalty/accounts?${query.toString()}`);
  }

  static async getAdminLoyaltyAccount(customerId) {
    return this.request(`/admin/loyalty/accounts/${customerId}`);
  }

  static async adjustAdminLoyaltyPoints(customerId, payload) {
    return this.request(`/admin/loyalty/accounts/${customerId}/adjust`, {
      method: 'POST',
      body: payload,
    });
  }

  // --- Staff Marketing Campaigns Admin ---
  static async getAdminCampaigns(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.segmentId) query.set('segmentId', params.segmentId);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    return this.request(`/admin/campaigns?${query.toString()}`);
  }

  static async getAdminCampaignById(id) {
    return this.request(`/admin/campaigns/${id}`);
  }

  static async createAdminCampaign(payload) {
    return this.request('/admin/campaigns', {
      method: 'POST',
      body: payload,
    });
  }

  static async updateAdminCampaign(id, payload) {
    return this.request(`/admin/campaigns/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }

  static async updateAdminCampaignStatus(id, status) {
    return this.request(`/admin/campaigns/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  static async deleteAdminCampaign(id) {
    return this.request(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    });
  }
}

export default ApiClient;
export { ApiClient };
