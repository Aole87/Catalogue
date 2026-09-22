/**
 * Resilient Offline/Standalone Data Store
 * Provides seamless local fallback when backend API is unreachable or returns 502/503.
 * Preserves user additions, edits, and deletions in localStorage.
 */

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'ระบบเบรก', slug: 'brakes', description: 'จานเบรก ผ้าเบรก สายเบรก และน้ำมันเบรก', imageUrl: null, isActive: true },
  { id: 'cat-2', name: 'ผ้าเบรกหน้า (Front Brake Pads)', slug: 'front-brake-pads', parentId: 'cat-1', description: null, imageUrl: null, isActive: true },
  { id: 'cat-3', name: 'ผ้าเบรกหลัง (Rear Brake Pads)', slug: 'rear-brake-pads', parentId: 'cat-1', description: null, imageUrl: null, isActive: true },
  { id: 'cat-4', name: 'ไส้กรอง', slug: 'filters', description: 'กรองน้ำมันเครื่อง กรองอากาศ กรองแอร์ กรองโซล่า', imageUrl: null, isActive: true },
  { id: 'cat-5', name: 'กรองน้ำมันเครื่อง (Oil Filters)', slug: 'oil-filters', parentId: 'cat-4', description: null, imageUrl: null, isActive: true },
  { id: 'cat-6', name: 'กรองอากาศเครื่องยนต์ (Air Filters)', slug: 'air-filters', parentId: 'cat-4', description: null, imageUrl: null, isActive: true },
  { id: 'cat-7', name: 'ระบบช่วงล่าง', slug: 'suspension', description: 'โช้คอัพ ลูกหมาก บูชปีกนก สปริง', imageUrl: null, isActive: true },
  { id: 'cat-8', name: 'เครื่องยนต์และระบบจุดระเบิด', slug: 'engine', description: 'หัวเทียน คอยล์จุดระเบิด สายพาน ปะเก็น', imageUrl: null, isActive: true },
  { id: 'cat-9', name: 'หัวเทียน (Spark Plugs)', slug: 'spark-plugs', parentId: 'cat-8', description: null, imageUrl: null, isActive: true },
  { id: 'cat-10', name: 'น้ำมันและสารหล่อลื่น', slug: 'fluids', description: 'น้ำมันเครื่อง น้ำมันเกียร์ น้ำมันเบรก น้ำยาหม้อน้ำ', imageUrl: null, isActive: true },
];

const DEFAULT_BRANDS = [
  { id: 'brand-1', name: 'TRW', slug: 'trw', countryOfOrigin: 'Germany', websiteUrl: 'https://www.trwaftermarket.com', logoUrl: null, isActive: true },
  { id: 'brand-2', name: 'Bosch', slug: 'bosch', countryOfOrigin: 'Germany', websiteUrl: 'https://www.bosch.com', logoUrl: null, isActive: true },
  { id: 'brand-3', name: 'Brembo', slug: 'brembo', countryOfOrigin: 'Italy', websiteUrl: 'https://www.brembo.com', logoUrl: null, isActive: true },
  { id: 'brand-4', name: 'Denso', slug: 'denso', countryOfOrigin: 'Japan', websiteUrl: 'https://www.denso.com', logoUrl: null, isActive: true },
  { id: 'brand-5', name: 'Aisin', slug: 'aisin', countryOfOrigin: 'Japan', websiteUrl: 'https://www.aisin.com', logoUrl: null, isActive: true },
  { id: 'brand-6', name: 'Mann-Filter', slug: 'mann-filter', countryOfOrigin: 'Germany', websiteUrl: 'https://www.mann-filter.com', logoUrl: null, isActive: true },
  { id: 'brand-7', name: 'Mobil 1', slug: 'mobil1', countryOfOrigin: 'USA', websiteUrl: 'https://www.mobil.com', logoUrl: null, isActive: true },
  { id: 'brand-8', name: 'Motul', slug: 'motul', countryOfOrigin: 'France', websiteUrl: 'https://www.motul.com', logoUrl: null, isActive: true },
  { id: 'brand-9', name: 'Castrol', slug: 'castrol', countryOfOrigin: 'UK', websiteUrl: 'https://www.castrol.com', logoUrl: null, isActive: true },
];

const DEFAULT_MAKES = [
  { id: 'make-1', name: 'Toyota', slug: 'toyota', countryOfOrigin: 'Japan', logoUrl: null, isActive: true },
  { id: 'make-2', name: 'Honda', slug: 'honda', countryOfOrigin: 'Japan', logoUrl: null, isActive: true },
  { id: 'make-3', name: 'Isuzu', slug: 'isuzu', countryOfOrigin: 'Japan', logoUrl: null, isActive: true },
  { id: 'make-4', name: 'Mitsubishi', slug: 'mitsubishi', countryOfOrigin: 'Japan', logoUrl: null, isActive: true },
  { id: 'make-5', name: 'Ford', slug: 'ford', countryOfOrigin: 'USA', logoUrl: null, isActive: true },
  { id: 'make-6', name: 'Mazda', slug: 'mazda', countryOfOrigin: 'Japan', logoUrl: null, isActive: true },
  { id: 'make-7', name: 'Nissan', slug: 'nissan', countryOfOrigin: 'Japan', logoUrl: null, isActive: true },
];

const DEFAULT_MODELS = [
  { id: 'model-1', makeId: 'make-1', name: 'Hilux Revo', slug: 'hilux-revo', make: { id: 'make-1', name: 'Toyota' }, isActive: true },
  { id: 'model-2', makeId: 'make-1', name: 'Fortuner', slug: 'fortuner', make: { id: 'make-1', name: 'Toyota' }, isActive: true },
  { id: 'model-3', makeId: 'make-2', name: 'City', slug: 'city', make: { id: 'make-2', name: 'Honda' }, isActive: true },
  { id: 'model-4', makeId: 'make-2', name: 'Civic', slug: 'civic', make: { id: 'make-2', name: 'Honda' }, isActive: true },
  { id: 'model-5', makeId: 'make-3', name: 'D-Max', slug: 'd-max', make: { id: 'make-3', name: 'Isuzu' }, isActive: true },
  { id: 'model-6', makeId: 'make-5', name: 'Ranger', slug: 'ranger', make: { id: 'make-5', name: 'Ford' }, isActive: true },
];

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    sku: 'TRW-GDB7782',
    name: 'ผ้าเบรกหน้า TRW DTEC สำหรับ Toyota Hilux Revo / Fortuner',
    slug: 'trw-front-brake-pads-hilux-revo',
    price: 1250,
    compareAtPrice: 1550,
    costPrice: 850,
    stockQuantity: 155,
    categoryId: 'cat-2',
    brandId: 'brand-1',
    brand: { id: 'brand-1', name: 'TRW' },
    category: { id: 'cat-2', name: 'ผ้าเบรกหน้า (Front Brake Pads)' },
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80'],
    description: 'ผ้าเบรกหน้าคุณภาพสูง เกรด DTEC ไร้ฝุ่นดำ เบรกนุ่ม เงียบ ระยะเบรกสั้น มั่นใจทุกสภาพถนน',
    isActive: true,
  },
  {
    id: 'prod-2',
    sku: 'BOSCH-0986AF0059',
    name: 'ไส้กรองน้ำมันเครื่อง Bosch Premium สำหรับ Honda Civic / City ทุกรุ่น',
    slug: 'bosch-oil-filter-honda-civic-city',
    price: 180,
    compareAtPrice: 220,
    costPrice: 95,
    stockQuantity: 155,
    categoryId: 'cat-5',
    brandId: 'brand-2',
    brand: { id: 'brand-2', name: 'Bosch' },
    category: { id: 'cat-5', name: 'กรองน้ำมันเครื่อง (Oil Filters)' },
    images: ['https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600&q=80'],
    description: 'ไส้กรองน้ำมันเครื่องมาตรฐานเยอรมัน กรองสิ่งสกปรกได้ถึง 99% ปกป้องเครื่องยนต์ได้อย่างยาวนาน',
    isActive: true,
  },
  {
    id: 'prod-3',
    sku: 'DENSO-IK16TT',
    name: 'หัวเทียน Iridium TT Denso สำหรับ Toyota Altis / Vios / Yaris',
    slug: 'denso-spark-plugs-iridium-tt',
    price: 450,
    compareAtPrice: 550,
    costPrice: 280,
    stockQuantity: 155,
    categoryId: 'cat-9',
    brandId: 'brand-4',
    brand: { id: 'brand-4', name: 'Denso' },
    category: { id: 'cat-9', name: 'หัวเทียน (Spark Plugs)' },
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80'],
    description: 'หัวเทียนอิริเดียมแท้ จุดระเบิดแม่นยำ ประหยัดน้ำมัน เพิ่มอัตราเร่ง อายุการใช้งานกว่า 100,000 กม.',
    isActive: true,
  },
  {
    id: 'prod-4',
    sku: 'MOBIL1-5W30-4L',
    name: 'น้ำมันเครื่องสังเคราะห์แท้ Mobil 1 5W-30 Advanced Full Synthetic (4 ลิตร)',
    slug: 'mobil-1-5w30-advanced-synthetic',
    price: 1890,
    compareAtPrice: 2200,
    costPrice: 1350,
    stockQuantity: 155,
    categoryId: 'cat-10',
    brandId: 'brand-7',
    brand: { id: 'brand-7', name: 'Mobil 1' },
    category: { id: 'cat-10', name: 'น้ำมันและสารหล่อลื่น' },
    images: ['https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600&q=80'],
    description: 'น้ำมันเครื่องสังเคราะห์แท้ 100% ปกป้องเครื่องยนต์ในทุกช่วงอุณหภูมิ ลดการสึกหรอ และช่วยประหยัดน้ำมัน',
    isActive: true,
  },
  {
    id: 'prod-5',
    sku: 'BREMBO-09A97711',
    name: 'จานเบรกหน้า Brembo UV Coated สำหรับ Isuzu D-Max / MU-X',
    slug: 'brembo-front-brake-disc-dmax',
    price: 2400,
    compareAtPrice: 2900,
    costPrice: 1650,
    stockQuantity: 155,
    categoryId: 'cat-1',
    brandId: 'brand-3',
    brand: { id: 'brand-3', name: 'Brembo' },
    category: { id: 'cat-1', name: 'ระบบเบรก' },
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80'],
    description: 'จานเบรกเคลือบสารป้องกันสนิม UV Coated ระบายความร้อนดีเยี่ยม มาตรฐาน OE ผู้ผลิตรถยนต์ชั้นนำ',
    isActive: true,
  }
];

class OfflineDataStore {
  static getCollection(key, defaults = []) {
    if (typeof window === 'undefined') return defaults;
    try {
      const saved = localStorage.getItem(`mobex_db_${key}`);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(`mobex_db_${key}`, JSON.stringify(defaults));
      return defaults;
    } catch (e) {
      return defaults;
    }
  }

  static setCollection(key, data) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`mobex_db_${key}`, JSON.stringify(data));
    } catch (e) {}
  }

  static handle(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    let cleanPath = endpoint.split('?')[0].replace(/^\/api\/v1/, '').replace(/^\/api/, '');
    if (cleanPath.startsWith('/admin') && cleanPath !== '/admin/dashboard-stats') {
      cleanPath = cleanPath.replace(/^\/admin/, '');
    }
    let body = {};
    if (options.body) {
      try {
        body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch (e) {
        body = options.body;
      }
    }

    // 1. Categories
    if (cleanPath === '/categories' || cleanPath === '/categories/tree') {
      const items = this.getCollection('categories', DEFAULT_CATEGORIES);
      if (method === 'GET') {
        return { success: true, data: items };
      }
      if (method === 'POST') {
        const newItem = { id: `cat-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        this.setCollection('categories', updated);
        return { success: true, data: newItem };
      }
    }
    if (cleanPath.startsWith('/categories/')) {
      const id = cleanPath.split('/')[2];
      const items = this.getCollection('categories', DEFAULT_CATEGORIES);
      if (method === 'PUT' || method === 'PATCH') {
        const updated = items.map(c => c.id === id ? { ...c, ...body, updatedAt: new Date().toISOString() } : c);
        this.setCollection('categories', updated);
        const item = updated.find(c => c.id === id) || body;
        return { success: true, data: item };
      }
      if (method === 'DELETE') {
        const updated = items.filter(c => c.id !== id);
        this.setCollection('categories', updated);
        return { success: true, message: 'Deleted' };
      }
    }

    // 2. Brands
    if (cleanPath === '/brands') {
      const items = this.getCollection('brands', DEFAULT_BRANDS);
      if (method === 'GET') return { success: true, data: items };
      if (method === 'POST') {
        const newItem = { id: `brand-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
        const updated = [newItem, ...items];
        this.setCollection('brands', updated);
        return { success: true, data: newItem };
      }
    }
    if (cleanPath.startsWith('/brands/')) {
      const id = cleanPath.split('/')[2];
      const items = this.getCollection('brands', DEFAULT_BRANDS);
      if (method === 'PUT' || method === 'PATCH') {
        const updated = items.map(b => b.id === id ? { ...b, ...body } : b);
        this.setCollection('brands', updated);
        return { success: true, data: updated.find(b => b.id === id) || body };
      }
      if (method === 'DELETE') {
        const updated = items.filter(b => b.id !== id);
        this.setCollection('brands', updated);
        return { success: true, message: 'Deleted' };
      }
    }

    // 3. Vehicles: Makes & Models
    if (cleanPath === '/vehicles/makes') {
      const items = this.getCollection('makes', DEFAULT_MAKES);
      if (method === 'GET') return { success: true, data: items, makes: items };
      if (method === 'POST') {
        const newItem = { id: `make-${Date.now()}`, ...body };
        this.setCollection('makes', [newItem, ...items]);
        return { success: true, data: newItem };
      }
    }
    if (cleanPath.startsWith('/vehicles/makes/')) {
      const id = cleanPath.split('/')[3];
      const items = this.getCollection('makes', DEFAULT_MAKES);
      if (method === 'PUT') {
        const updated = items.map(m => m.id === id ? { ...m, ...body } : m);
        this.setCollection('makes', updated);
        return { success: true, data: updated.find(m => m.id === id) };
      }
      if (method === 'DELETE') {
        this.setCollection('makes', items.filter(m => m.id !== id));
        return { success: true, message: 'Deleted' };
      }
    }
    if (cleanPath === '/vehicles/models') {
      const items = this.getCollection('models', DEFAULT_MODELS);
      if (method === 'GET') return { success: true, data: items, models: items };
      if (method === 'POST') {
        const newItem = { id: `model-${Date.now()}`, ...body };
        this.setCollection('models', [newItem, ...items]);
        return { success: true, data: newItem };
      }
    }
    if (cleanPath.startsWith('/vehicles/models/')) {
      const id = cleanPath.split('/')[3];
      const items = this.getCollection('models', DEFAULT_MODELS);
      if (method === 'PUT') {
        const updated = items.map(m => m.id === id ? { ...m, ...body } : m);
        this.setCollection('models', updated);
        return { success: true, data: updated.find(m => m.id === id) };
      }
      if (method === 'DELETE') {
        this.setCollection('models', items.filter(m => m.id !== id));
        return { success: true, message: 'Deleted' };
      }
    }
    if (cleanPath.startsWith('/vehicles/generations') || cleanPath.startsWith('/vehicles/years')) {
      return { success: true, data: [], generations: [] };
    }

    // 4. Products
    if (cleanPath === '/products') {
      const items = this.getCollection('products', DEFAULT_PRODUCTS);
      if (method === 'GET') {
        return {
          success: true,
          data: items,
          pagination: { totalItems: items.length, total: items.length, page: 1, pageSize: 50 },
          meta: { total: items.length },
        };
      }
      if (method === 'POST') {
        const newItem = {
          id: `prod-${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
          isActive: body.isActive !== false,
        };
        const updated = [newItem, ...items];
        this.setCollection('products', updated);
        return { success: true, data: newItem };
      }
    }
    if (cleanPath.startsWith('/products/')) {
      const id = cleanPath.split('/')[2];
      const items = this.getCollection('products', DEFAULT_PRODUCTS);
      if (method === 'GET') {
        const item = items.find(p => p.id === id || p.slug === id) || items[0];
        return { success: true, data: item, product: item };
      }
      if (method === 'PUT' || method === 'PATCH') {
        const updated = items.map(p => p.id === id ? { ...p, ...body } : p);
        this.setCollection('products', updated);
        return { success: true, data: updated.find(p => p.id === id) || body };
      }
      if (method === 'DELETE') {
        const updated = items.filter(p => p.id !== id);
        this.setCollection('products', updated);
        return { success: true, message: 'Deleted' };
      }
    }

    // 5. Dashboard Stats
    if (cleanPath === '/admin/dashboard-stats') {
      const products = this.getCollection('products', DEFAULT_PRODUCTS);
      const categories = this.getCollection('categories', DEFAULT_CATEGORIES);
      const brands = this.getCollection('brands', DEFAULT_BRANDS);
      return {
        success: true,
        stats: {
          users: 11,
          products: products.length,
          categories: categories.length,
          brands: brands.length,
          orders: 0,
        },
      };
    }

    // 6. Inventory & Warehouses
    if (cleanPath.startsWith('/inventory') || cleanPath.startsWith('/warehouses')) {
      return {
        success: true,
        data: [
          { warehouseId: 'WH-MAIN', warehouseName: 'คลังสินค้าหลัก รังสิต', totalQty: 120, reservedQty: 0, availableQty: 120 },
          { warehouseId: 'WH-BKK-01', warehouseName: 'สาขาพระราม 9 ฮับด่วน', totalQty: 35, reservedQty: 0, availableQty: 35 },
        ],
        inventory: [
          { warehouseId: 'WH-MAIN', warehouseName: 'คลังสินค้าหลัก รังสิต', totalQty: 120, reservedQty: 0, availableQty: 120 },
          { warehouseId: 'WH-BKK-01', warehouseName: 'สาขาพระราม 9 ฮับด่วน', totalQty: 35, reservedQty: 0, availableQty: 35 },
        ],
      };
    }

    // 7. Orders & Customers
    if (cleanPath.startsWith('/orders') || cleanPath.startsWith('/admin/orders')) {
      return { success: true, data: [], orders: [], pagination: { totalItems: 0 } };
    }
    if (cleanPath.startsWith('/admin/customers') || cleanPath.startsWith('/crm')) {
      return { success: true, data: [], customers: [], pagination: { totalItems: 0 } };
    }

    // 8. Settings & Storefront
    if (cleanPath === '/settings' || cleanPath.startsWith('/settings')) {
      const defaultSettings = {
        storeName: 'MOBEX Auto Parts',
        storeEmail: 'contact@mobex.co.th',
        storePhone: '02-123-4567',
        banners: [
          { id: 'b1', imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1600&q=80', active: true, targetUrl: 'product-list' },
        ],
      };
      if (method === 'GET') {
        const saved = this.getCollection('settings', defaultSettings);
        return { success: true, data: saved, settings: saved };
      }
      if (method === 'PUT' || method === 'POST') {
        this.setCollection('settings', body);
        return { success: true, data: body };
      }
    }

    // 9. Articles
    if (cleanPath.startsWith('/articles')) {
      const articles = this.getCollection('articles', []);
      if (method === 'GET') return { success: true, data: { articles }, articles };
      if (method === 'POST') {
        const newArt = { id: `art-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
        this.setCollection('articles', [newArt, ...articles]);
        return { success: true, data: newArt, article: newArt };
      }
    }

    // Default safe fallback
    return { success: true, data: [] };
  }
}

export default OfflineDataStore;
