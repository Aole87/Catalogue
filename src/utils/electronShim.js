/**
 * Browser-safe Electron API Shim
 * Allows AdminDashboard and legacy components to function seamlessly in both
 * Desktop (Electron) and Web Browser (Vite dev server) environments by bridging
 * to Fastify REST API endpoints (/api/v1) and in-memory mock stores.
 */

import ApiClient from './apiClient';

if (typeof window !== 'undefined' && !window.electronAPI) {
  // In-memory mock store for data not yet fully exposed via public CRUD API
  const localStore = {
    car_years: [
      { id: 1, year: 2024 },
      { id: 2, year: 2023 },
      { id: 3, year: 2022 },
      { id: 4, year: 2021 },
      { id: 5, year: 2020 },
      { id: 6, year: 2019 },
      { id: 7, year: 2018 },
      { id: 8, year: 2017 },
      { id: 9, year: 2016 },
      { id: 10, year: 2015 },
    ],
    admins: [
      { id: 1, username: 'admin@mobex.com', role: 'SUPER_ADMIN' },
      { id: 2, username: 'manager@mobex.com', role: 'CATALOG_MANAGER' },
      { id: 3, username: 'staff@mobex.com', role: 'INVENTORY_STAFF' },
    ],
    users: [
      { id: 1, first_name: 'สมชาย', last_name: 'รักดี', email: 'somchai@example.com', business_type: 'อู่ซ่อมรถยนต์' },
      { id: 2, first_name: 'วิภา', last_name: 'เจริญยนต์', email: 'wipha@garage.com', business_type: 'ร้านอะไหล่' },
      { id: 3, first_name: 'ณัฐพงษ์', last_name: 'มีสุข', email: 'nattapong@gmail.com', business_type: 'บุคคลทั่วไป' },
    ],
  };

  window.electronAPI = {
    query: async (sql, params = []) => {
      const normalizedSql = (sql || '').trim();
      const lowerSql = normalizedSql.toLowerCase();

      try {
        // --- 1. Dashboard Stats (COUNT) ---
        if (lowerSql.includes('count(*)')) {
          if (lowerSql.includes('from users')) {
            return [{ count: localStore.users.length }];
          }
          if (lowerSql.includes('from products')) {
            try {
              const res = await ApiClient.getProducts({ pageSize: 1 });
              return [{ count: res.pagination?.totalItems || res.total || 12 }];
            } catch {
              return [{ count: 12 }];
            }
          }
          if (lowerSql.includes('from categories')) {
            try {
              const res = await ApiClient.getCategories();
              const list = res.data || res.categories || [];
              return [{ count: list.length || 6 }];
            } catch {
              return [{ count: 6 }];
            }
          }
          if (lowerSql.includes('from brands')) {
            try {
              const res = await ApiClient.getBrands();
              const list = res.data || res.brands || [];
              return [{ count: list.length || 5 }];
            } catch {
              return [{ count: 5 }];
            }
          }
          return [{ count: 0 }];
        }

        // --- 2. Categories ---
        if (lowerSql.includes('from categories')) {
          const res = await ApiClient.getCategories().catch(() => ({ data: [] }));
          const list = res.data || res.categories || [];
          return list.map((c, i) => ({
            id: c.id || i + 1,
            name: c.name,
            image_url: c.imageUrl || c.image_url || '',
          }));
        }

        // --- 3. Brands ---
        if (lowerSql.includes('from brands')) {
          const res = await ApiClient.getBrands().catch(() => ({ data: [] }));
          const list = res.data || res.brands || [];
          return list.map((b, i) => ({
            id: b.id || i + 1,
            name: b.name,
            image_url: b.logoUrl || b.image_url || '',
          }));
        }

        // --- 4. Car Brands / Makes ---
        if (lowerSql.includes('from car_brands')) {
          const res = await ApiClient.getMakes().catch(() => ({ data: [] }));
          const list = res.data || [];
          return list.map((m, i) => ({
            id: m.id || i + 1,
            name: m.name,
            image_url: m.logoUrl || '',
          }));
        }

        // --- 5. Car Models ---
        if (lowerSql.includes('from car_models')) {
          const res = await ApiClient.getModels().catch(() => ({ data: [] }));
          const list = res.data || [];
          return list.map((m, i) => ({
            id: m.id || i + 1,
            name: m.name,
            car_brand_id: m.makeId || m.make_id,
            brand_name: m.make?.name || '',
          }));
        }

        // --- 6. Car Years ---
        if (lowerSql.includes('from car_years')) {
          return localStore.car_years;
        }

        // --- 7. Users / Admins ---
        if (lowerSql.includes('from users')) {
          return localStore.users;
        }
        if (lowerSql.includes('from admins')) {
          return localStore.admins;
        }

        // --- 8. Products List ---
        if (lowerSql.includes('from products')) {
          const res = await ApiClient.getProducts({ pageSize: 100 }).catch(() => ({ data: [] }));
          const list = res.data || [];
          return list.map((p, i) => ({
            id: p.id || i + 1,
            code: p.sku || p.code || `SKU-${i + 1}`,
            name: p.name,
            description: p.description || '',
            price: typeof p.price === 'object' ? Number(p.price?.amount || 0) : Number(p.price || 0),
            cost_price: 0,
            stock_quantity: 50,
            category_id: p.categoryId,
            category_name: p.category?.name || 'ทั่วไป',
            brand_id: p.brandId,
            brand_name: p.brand?.name || 'OEM',
            image_url: p.primaryImage?.url || p.imageUrl || '',
            car_brand_name: '',
            car_model_name: '',
            car_year: '',
          }));
        }

        // --- 9. Mutating operations (INSERT / UPDATE / DELETE) ---
        if (lowerSql.startsWith('insert') || lowerSql.startsWith('update') || lowerSql.startsWith('delete')) {
          return { success: true, insertId: Date.now() };
        }

        return [];
      } catch (err) {
        console.warn('Browser electronShim query handled error:', err);
        return [];
      }
    },
  };
}
