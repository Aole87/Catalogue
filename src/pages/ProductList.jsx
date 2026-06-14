import React, { useState, useEffect } from 'react';
import {
  Search, Grid, List, ChevronRight, Eye, Car, Menu, Tag,
  Sliders, CircleDot, Zap, Layout, Droplet, Settings, Star, Heart
} from 'lucide-react';

// Import local premium images for fallback
import mobil1Bottles from '../assets/mobil1_bottles.png';
import toolsPromo from '../assets/tools_promo.png';
import batteryPromo from '../assets/battery_promo.png';

const categoryTranslations = {
  'ตัวถัง': 'Body',
  'เบรก': 'Brakes',
  'ช่วงล่าง': 'Damping',
  'ไฟฟ้า': 'Electrics',
  'เครื่องยนต์': 'Engine',
  'กรองอากาศ': 'Filters',
  'น้ำมันเครื่อง': 'Fluids',
  'ยางรถยนต์': 'Tyres',
  'ระบบระบายความร้อน': 'Cooling System',
  'ระบบไอเสีย': 'Exhaust System',
  'ระบบเชื้อเพลิง': 'Fuel System',
  'ระบบส่งกำลัง': 'Transmission',
  'คลัตช์': 'Clutch System',
  'พวงมาลัยและระบบบังคับเลี้ยว': 'Steering',
  'ระบบปรับอากาศ': 'Air Conditioning',
  'ไฟส่องสว่าง': 'Lighting',
  'อุปกรณ์ภายในรถยนต์': 'Interior',
  'อุปกรณ์ภายนอกรถยนต์': 'Exterior',
  'ผลิตภัณฑ์ดูแลรักษารถยนต์': 'Car Care',
  'เซนเซอร์และกล่องควบคุม': 'Sensors & ECUs',
  'หัวเทียนและคอยล์จุดระเบิด': 'Ignition',
  'แบตเตอรี่': 'Batteries',
  'สายพานและลูกรอก': 'Belts & Tensioners',
  'ซีลและปะเก็น': 'Seals & Gaskets',
  'เครื่องมือช่าง': 'Tools',
  'บูชและลูกหมาก': 'Bushes & Ball Joints',
  'แชสซีและโครงรถ': 'Chassis',
  'ระบบไฮดรอลิก': 'Hydraulics',
  'อะไหล่ตัวถังภายใน': 'Interior Trim',
  'อะไหล่ตัวถังภายนอก': 'Exterior Panels'
};

const getCategoryDisplay = (name) => {
  return categoryTranslations[name] || name;
};

const getCategoryIcon = (catName) => {
  const name = (catName || '').toLowerCase();
  if (name.includes('เครื่องยนต์') || name.includes('engine')) return Settings;
  if (name.includes('ช่วงล่าง') || name.includes('suspension') || name.includes('damping')) return Sliders;
  if (name.includes('เบรก') || name.includes('brake') || name.includes('brakes')) return CircleDot;
  if (name.includes('ไฟฟ้า') || name.includes('electric') || name.includes('electrics')) return Zap;
  if (name.includes('ตัวถัง') || name.includes('body')) return Layout;
  if (name.includes('น้ำมันเครื่อง') || name.includes('fluids') || name.includes('oil')) return Droplet;
  if (name.includes('กรองอากาศ') || name.includes('filter') || name.includes('filters')) return Tag;
  if (name.includes('ยางรถยนต์') || name.includes('tyre') || name.includes('wheel') || name.includes('wheels')) return CircleDot;
  return Grid;
};

// Web Browser Fallback Mock Products
const MOCK_PRODUCTS = [
  { id: 1, name: 'RIDEX 295W0003 Wiper Motor', code: '295W0003', category_id: 2, brand_id: 6, car_brand: 'Toyota', car_model: 'Camry', car_year: '2018-Present', price_general: 1850, price_shop: 1650, price_garage: 1500, images: null, rating: 5 },
  { id: 2, name: 'RIDEX 295W0016 Wiper Motor', code: '295W0016', category_id: 2, brand_id: 6, car_brand: 'Toyota', car_model: 'Corolla Altis', car_year: '2019-Present', price_general: 1200, price_shop: 1100, price_garage: 1000, images: null, rating: 4 },
  { id: 3, name: 'RIDEX 300W0031 Wiper Linkage', code: '300W0031', category_id: 2, brand_id: 6, car_brand: 'Toyota', car_model: 'Hilux Revo', car_year: '2015-Present', price_general: 980, price_shop: 890, price_garage: 800, images: null, rating: 5 },
  { id: 4, name: 'RIDEX 300W0011 Wiper Linkage', code: '300W0011', category_id: 2, brand_id: 6, car_brand: 'Honda', car_model: 'Civic', car_year: '2016-2021', price_general: 680, price_shop: 600, price_garage: 550, images: null, rating: 5 },
  { id: 5, name: 'DENSO Hybrid DUR-060R Wiper Blade', code: 'DUR-060R', category_id: 2, brand_id: 2, car_brand: 'Honda', car_model: 'City', car_year: '2020-Present', price_general: 690, price_shop: 620, price_garage: 580, images: null, rating: 4 },
  { id: 6, name: 'RIDEX 301W0044 Wiper Arm', code: '301W0044', category_id: 2, brand_id: 6, car_brand: 'Mazda', car_model: '3 (BP) / CX-30', car_year: '2019-Present', price_general: 450, price_shop: 400, price_garage: 360, images: null, rating: 5 },
  { id: 7, name: 'KRAFT 8800002 Speed Sensor', code: '8800002', category_id: 4, brand_id: 4, car_brand: 'Mazda', car_model: '2', car_year: '2015-Present', price_general: 280, price_shop: 250, price_garage: 220, images: null, rating: 5 },
  { id: 8, name: 'VEMO V10-72-0906 Speed Sensor', code: 'V10-72-0906', category_id: 4, brand_id: 4, car_brand: 'Toyota', car_model: 'Camry', car_year: '2018-Present', price_general: 650, price_shop: 580, price_garage: 520, images: null, rating: 5 },
  { id: 9, name: 'RIDEX 807S0023 Reverse Light Switch', code: '807S0023', category_id: 4, brand_id: 6, car_brand: 'Toyota', car_model: 'Corolla Altis', car_year: '2019-Present', price_general: 390, price_shop: 350, price_garage: 300, images: null, rating: 4 },
  { id: 10, name: 'STARK SKSRL-2120001 Reverse Light Switch', code: 'SKSRL-2120001', category_id: 4, brand_id: 3, car_brand: 'Honda', car_model: 'Civic', car_year: '2016-2021', price_general: 680, price_shop: 610, price_garage: 550, images: null, rating: 5 },
  { id: 11, name: 'MEYLE 100 199 0053 Mounting', code: '1001990053', category_id: 5, brand_id: 8, car_brand: 'Mazda', car_model: '2', car_year: '2015-Present', price_general: 850, price_shop: 765, price_garage: 680, images: null, rating: 5 },
  { id: 12, name: 'ORIGINAL IMPERIUM 35042 Mounting', code: '35042', category_id: 5, brand_id: 8, car_brand: 'Mazda', car_model: '3 (BP) / CX-30', car_year: '2019-Present', price_general: 1350, price_shop: 1215, price_garage: 1080, images: null, rating: 4 },
  { id: 13, name: 'SACHS 2294 002 013 Dual Mass Flywheel', code: '2294002013', category_id: 2, brand_id: 8, car_brand: 'Toyota', car_model: 'Hilux Revo', car_year: '2015-Present', price_general: 8900, price_shop: 8000, price_garage: 7200, images: null, rating: 5 }
];

const ProductList = ({ navigate, user, initialFilters }) => {
  const [products, setProducts] = useState([]);
  const [allProductsForCounts, setAllProductsForCounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Vehicle Selector Dropdowns Data
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);

  // Vehicle Selector States
  const [selectedMake, setSelectedMake] = useState(initialFilters?.car_brand || '');
  const [selectedModel, setSelectedModel] = useState(initialFilters?.car_model || '');
  const [selectedYear, setSelectedYear] = useState(initialFilters?.car_year || '');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [vinSearch, setVinSearch] = useState(initialFilters?.vin || '');

  // Sidebar Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialFilters?.categoryId || '');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');

  // Toolbar state
  const [sortBy, setSortBy] = useState('popularity');
  const [onlySale, setOnlySale] = useState(false);

  // Expose brandId navigate binding from Home page
  useEffect(() => {
    if (initialFilters?.brandId) {
      setSelectedBrands([Number(initialFilters.brandId)]);
    }
  }, [initialFilters]);

  // Fallback Database Querying
  const dbQuery = async (sql, params = []) => {
    if (window.electronAPI && typeof window.electronAPI.query === 'function') {
      return await window.electronAPI.query(sql, params);
    }
    // Web Browser Fallback Mock Data
    const upperSql = sql.trim().toUpperCase();
    if (upperSql.includes('FROM CATEGORIES')) {
      return [
        { id: 1, name: 'เครื่องยนต์' },
        { id: 2, name: 'ช่วงล่าง' },
        { id: 3, name: 'เบรก' },
        { id: 4, name: 'ไฟฟ้า' },
        { id: 5, name: 'ตัวถัง' },
        { id: 6, name: 'น้ำมันเครื่อง' },
        { id: 7, name: 'กรองอากาศ' },
        { id: 8, name: 'ยางรถยนต์' },
        { id: 9, name: 'ระบบระบายความร้อน' },
        { id: 10, name: 'ระบบไอเสีย' },
        { id: 11, name: 'ระบบเชื้อเพลิง' },
        { id: 12, name: 'ระบบส่งกำลัง' },
        { id: 13, name: 'คลัตช์' },
        { id: 14, name: 'พวงมาลัยและระบบบังคับเลี้ยว' },
        { id: 15, name: 'ระบบปรับอากาศ' },
        { id: 16, name: 'ไฟส่องสว่าง' },
        { id: 17, name: 'อุปกรณ์ภายในรถยนต์' },
        { id: 18, name: 'อุปกรณ์ภายนอกรถยนต์' },
        { id: 19, name: 'ผลิตภัณฑ์ดูแลรักษารถยนต์' },
        { id: 20, name: 'เซนเซอร์และกล่องควบคุม' },
        { id: 21, name: 'หัวเทียนและคอยล์จุดระเบิด' },
        { id: 22, name: 'แบตเตอรี่' },
        { id: 23, name: 'สายพานและลูกรอก' },
        { id: 24, name: 'ซีลและปะเก็น' },
        { id: 25, name: 'เครื่องมือช่าง' },
        { id: 26, name: 'บูชและลูกหมาก' },
        { id: 27, name: 'แชสซีและโครงรถ' },
        { id: 28, name: 'ระบบไฮดรอลิก' },
        { id: 29, name: 'อะไหล่ตัวถังภายใน' },
        { id: 30, name: 'อะไหล่ตัวถังภายนอก' }
      ];
    }
    if (upperSql.includes('FROM BRANDS')) {
      return [
        { id: 1, name: 'Bosch' },
        { id: 2, name: 'Denso' },
        { id: 3, name: 'NGK' },
        { id: 4, name: 'Valeo' },
        { id: 5, name: 'Aisin' },
        { id: 6, name: 'TRW' },
        { id: 7, name: 'Akebono' },
        { id: 8, name: 'Sakura' }
      ];
    }
    if (upperSql.includes('DISTINCT CAR_BRAND')) {
      return [
        { car_brand: 'Toyota' },
        { car_brand: 'Honda' },
        { car_brand: 'Mazda' }
      ];
    }
    if (upperSql.includes('DISTINCT CAR_MODEL')) {
      const brand = params[0];
      if (brand === 'Toyota') {
        return [{ car_model: 'Camry' }, { car_model: 'Corolla Altis' }, { car_model: 'Hilux Revo' }];
      } else if (brand === 'Honda') {
        return [{ car_model: 'Civic' }, { car_model: 'City' }];
      } else if (brand === 'Mazda') {
        return [{ car_model: '3 (BP) / CX-30' }, { car_model: '2' }];
      }
      return [];
    }
    if (upperSql.includes('DISTINCT CAR_YEAR')) {
      const model = params[1];
      if (model === 'Camry') return [{ car_year: '2018-Present' }];
      if (model === 'Corolla Altis') return [{ car_year: '2019-Present' }];
      if (model === 'Hilux Revo') return [{ car_year: '2015-Present' }];
      if (model === 'Civic') return [{ car_year: '2016-2021' }];
      if (model === 'City') return [{ car_year: '2020-Present' }];
      if (model === '3 (BP) / CX-30') return [{ car_year: '2019-Present' }];
      if (model === '2') return [{ car_year: '2015-Present' }];
      return [{ car_year: '2022' }];
    }

    // Default mock query results for products
    const hasBrandFilter = upperSql.includes('BRAND_ID IN');
    const hasCategoryFilter = upperSql.includes('CATEGORY_ID =');
    const hasMakeFilter = upperSql.includes('CAR_BRAND =');
    const hasModelFilter = upperSql.includes('CAR_MODEL =');
    const hasYearFilter = upperSql.includes('CAR_YEAR =');
    const hasVinFilter = upperSql.includes('CODE LIKE');

    let results = [...MOCK_PRODUCTS];
    if (selectedMake && hasMakeFilter) results = results.filter(p => p.car_brand === selectedMake);
    if (selectedModel && hasModelFilter) results = results.filter(p => p.car_model === selectedModel);
    if (selectedYear && hasYearFilter) results = results.filter(p => p.car_year === selectedYear);
    if (selectedCategoryId && hasCategoryFilter) results = results.filter(p => p.category_id === Number(selectedCategoryId));
    if (selectedBrands.length > 0 && hasBrandFilter) results = results.filter(p => selectedBrands.includes(p.brand_id));
    if (vinSearch && hasVinFilter) results = results.filter(p => p.code.toLowerCase().includes(vinSearch.toLowerCase()));

    return results;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await dbQuery('SELECT * FROM categories');
        const brs = await dbQuery('SELECT * FROM brands');
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchProducts = async () => {
    try {
      // 1. Fetch products matching other filters (excluding selectedBrands) to calculate brand counts
      let countSql = 'SELECT * FROM products WHERE 1=1';
      const countParams = [];
      if (selectedMake) { countSql += ' AND car_brand = ?'; countParams.push(selectedMake); }
      if (selectedModel) { countSql += ' AND car_model = ?'; countParams.push(selectedModel); }
      if (selectedYear) { countSql += ' AND car_year = ?'; countParams.push(selectedYear); }
      if (selectedCategoryId) { countSql += ' AND category_id = ?'; countParams.push(selectedCategoryId); }
      if (vinSearch) { countSql += ' AND (code LIKE ? OR name LIKE ?)'; countParams.push(`%${vinSearch}%`, `%${vinSearch}%`); }

      const countResults = await dbQuery(countSql, countParams);
      setAllProductsForCounts(countResults);

      // 2. Fetch products with brand filter applied
      let sql = countSql;
      const params = [...countParams];
      if (selectedBrands.length > 0) {
        sql += ` AND brand_id IN (${selectedBrands.map(() => '?').join(',')})`;
        params.push(...selectedBrands);
      }

      const results = await dbQuery(sql, params);
      setProducts(results);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedMake, selectedModel, selectedYear, selectedCategoryId, selectedBrands, vinSearch]);

  // Fetch unique Makes from Database on mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const result = await dbQuery('SELECT DISTINCT car_brand FROM products WHERE car_brand IS NOT NULL AND car_brand != ""');
        setMakes(result.map(r => r.car_brand));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMakes();
  }, []);

  // Fetch Models when Make is selected
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedMake) {
        setModels([]);
        setSelectedModel('');
        return;
      }
      try {
        const result = await dbQuery(
          'SELECT DISTINCT car_model FROM products WHERE car_brand = ? AND car_model IS NOT NULL AND car_model != ""',
          [selectedMake]
        );
        setModels(result.map(r => r.car_model));
        setSelectedModel('');
      } catch (err) {
        console.error(err);
      }
    };
    fetchModels();
  }, [selectedMake]);

  // Fetch Years when Model is selected
  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedMake || !selectedModel) {
        setYears([]);
        setSelectedYear('');
        return;
      }
      try {
        const result = await dbQuery(
          'SELECT DISTINCT car_year FROM products WHERE car_brand = ? AND car_model = ? AND car_year IS NOT NULL AND car_year != ""',
          [selectedMake, selectedModel]
        );
        setYears(result.map(r => r.car_year));
        setSelectedYear('');
      } catch (err) {
        console.error(err);
      }
    };
    fetchYears();
  }, [selectedMake, selectedModel]);

  // Get active price based on user role — requires login
  const getActivePrice = (product) => {
    if (!user) return null;
    let price = product.price_general;
    if (user.business_type === 'Garage') price = product.price_garage;
    if (user.business_type === 'Shop') price = product.price_shop;
    return price;
  };

  // Get crossed regular price for Sale mockup representation — requires login
  const getRegularPrice = (product) => {
    const active = getActivePrice(product);
    if (active === null) return null;
    return Math.round(active * 1.25);
  };

  // Filter brands based on search input
  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Toggle brand selection check
  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Dynamic products list sorting and filter
  const getSortedProducts = () => {
    let list = [...products];
    if (onlySale) {
      list = list.filter((_, idx) => idx % 2 === 0);
    }
    if (sortBy === 'popularity') {
      list.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => getActivePrice(a) - getActivePrice(b));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => getActivePrice(b) - getActivePrice(a));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  };

  const sortedProducts = getSortedProducts();

  // Dynamic brand item count calculator
  const getBrandCount = (brandId) => {
    return allProductsForCounts.filter(p => p.brand_id === brandId).length;
  };

  // Get correct image illustration
  const getProductImage = (product) => {
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (parsed && parsed.length > 0) return parsed[0];
      } catch (e) { }
    }
    const catId = product.category_id;
    if (catId === 6) return mobil1Bottles;
    if (catId === 4) return batteryPromo;
    if (catId === 2 && product.name.includes('Wiper')) return 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=300&auto=format&fit=crop&q=60';
    if (catId === 5) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300&auto=format&fit=crop&q=60';
    return toolsPromo;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9]">
      {/* Header */}
      <header className="bg-white py-4 px-4 md:px-8 flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-50 shadow-sm border-b">
        <div className="flex justify-between sm:justify-start items-center w-full sm:w-auto gap-6 md:gap-12">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
            <div className="text-2xl md:text-3xl font-black text-[#ff6c60] italic tracking-tighter">MOBEX</div>
          </div>
          <div className="flex sm:hidden items-center gap-2">
            {user ? (
              <div className="w-8 h-8 bg-[#ff6c60] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{user.first_name[0]}</div>
            ) : (
              <button onClick={() => navigate('login')} className="bg-[#ff6c60] text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">LOGIN</button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-full sm:w-[350px] md:w-[500px]">
          <input
            type="text"
            placeholder="Search parts..."
            value={vinSearch}
            onChange={e => setVinSearch(e.target.value)}
            className="bg-transparent border-none flex-1 text-sm focus:ring-0 outline-none"
          />
          <Search className="text-[#ff6c60] w-5 h-5 cursor-pointer" />
        </div>

        {/* User Profile / Login */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-600">{user.first_name} ({user.business_type})</span>
              <div className="w-8 h-8 bg-[#ff6c60] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{user.first_name[0]}</div>
            </div>
          ) : (
            <button onClick={() => navigate('login')} className="bg-[#ff6c60] text-white px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider">LOGIN</button>
          )}
        </div>
      </header>

      {/* Main Grid area */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col py-8 px-6 gap-6">

        {/* Top Vehicle Selector panel */}
        <div className="bg-[#FFA900] rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>

          <div className="flex flex-col xl:flex-row gap-5 items-center">

            {/* 3x2 Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
              <select
                value={selectedMake}
                onChange={e => setSelectedMake(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
              >
                <option value="">Make</option>
                {makes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                disabled={!selectedMake}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm disabled:opacity-75 cursor-pointer"
              >
                <option value="">Model</option>
                {models.map(mo => (
                  <option key={mo} value={mo}>{mo}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                disabled={!selectedModel}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm disabled:opacity-75 cursor-pointer"
              >
                <option value="">Year</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <select
                value={selectedEngine}
                onChange={e => setSelectedEngine(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
              >
                <option value="">Engine</option>
                <option value="1.5L">1.5L Engine</option>
                <option value="2.0L">2.0L Engine</option>
                <option value="2.5L">2.5L Engine</option>
                <option value="Hybrid">Hybrid Engine</option>
              </select>

              <select
                value={selectedTransmission}
                onChange={e => setSelectedTransmission(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
              >
                <option value="">Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>

              {/* <select
                value={selectedTrim}
                onChange={e => setSelectedTrim(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
              >
                <option value="">Trim</option>
                <option value="Standard">Standard Trim</option>
                <option value="Premium">Premium Trim</option>
                <option value="Sport">Sport Trim</option>
              </select> */}
              <button
                onClick={fetchProducts}
                className="bg-[#004b93] hover:bg-[#003c75] text-white font-extrabold text-xs tracking-widest uppercase px-6 py-2.5 rounded-lg shadow-md transition-all active:scale-95 duration-150"
              >
                Search
              </button>
            </div>

            {/* OR divider */}
            {/* <div className="text-black font-extrabold text-xs tracking-wider uppercase">OR</div> */}

            {/* VIN & Search Button */}
            {/* <div className="flex flex-col md:flex-row gap-3 w-full xl:w-1/4">
              <input
                type="text"
                placeholder="Search by VIN"
                value={vinSearch}
                onChange={e => setVinSearch(e.target.value)}
                className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm min-w-[120px]"
              />
              <button
                onClick={fetchProducts}
                className="bg-[#004b93] hover:bg-[#003c75] text-white font-extrabold text-xs tracking-widest uppercase px-6 py-2.5 rounded-lg shadow-md transition-all active:scale-95 duration-150"
              >
                Search
              </button>
            </div> */}

          </div>
        </div>

        {/* Main Columns Container */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">

            {/* Categories list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 font-black text-xs text-gray-800 tracking-wider">
                PRODUCT CATEGORIES
              </div>
              <div className="divide-y divide-gray-100">
                {categories.map(cat => {
                  const Icon = getCategoryIcon(cat.name);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(prev => prev === cat.id ? '' : cat.id)}
                      className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer group transition-colors ${selectedCategoryId === cat.id ? 'bg-[#ff6c60]/5 border-r-4 border-[#ff6c60]' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${selectedCategoryId === cat.id ? 'text-[#ff6c60]' : 'text-gray-400 group-hover:text-[#ff6c60]'}`} />
                        <span className={`text-xs font-bold transition-colors ${selectedCategoryId === cat.id ? 'text-[#ff6c60]' : 'text-gray-600 group-hover:text-[#ff6c60]'}`}>
                          {getCategoryDisplay(cat.name)}
                        </span>
                      </div>
                      <ChevronRight className={`w-3 h-3 transition-colors ${selectedCategoryId === cat.id ? 'text-[#ff6c60]' : 'text-gray-300 group-hover:text-[#ff6c60]'}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
              <h3 className="font-black text-xs text-gray-800 tracking-wider mb-4">FILTER BY BRAND</h3>

              {/* Type keyword search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a keyword"
                  value={brandSearch}
                  onChange={e => setBrandSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#ff6c60] transition-all"
                />
              </div>

              {/* Checkboxes list */}
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                {filteredBrands.map(brand => {
                  const count = getBrandCount(brand.id);
                  const isChecked = selectedBrands.includes(brand.id);
                  return (
                    <label
                      key={brand.id}
                      className="flex items-center justify-between group cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandToggle(brand.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#ff6c60] focus:ring-[#ff6c60]"
                        />
                        <span>{brand.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-gray-700">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full space-y-6">

            {/* Toolbar */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">

              <div className="flex items-center gap-4">
                {/* Layout buttons */}
                {/* <div className="flex border rounded-lg overflow-hidden bg-gray-50">
                  <button className="p-2 bg-[#ff6c60] text-white"><Grid className="w-4 h-4" /></button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100"><List className="w-4 h-4" /></button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                </div> */}

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="popularity">Sort by popularity</option>
                  <option value="price-asc">Sort by price: low to high</option>
                  <option value="price-desc">Sort by price: high to low</option>
                  <option value="name">Sort by name</option>
                </select>

                {/* Only products on sale checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 select-none">
                  <input
                    type="checkbox"
                    checked={onlySale}
                    onChange={e => setOnlySale(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#ff6c60] focus:ring-[#ff6c60]"
                  />
                  <span>Only products on sale</span>
                </label>
              </div>

              {/* Showing count */}
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing 1-{sortedProducts.length} of {products.length} results
              </span>

            </div>

            {/* Products Grid (5 Columns) */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map(product => {
                  const activePrice = getActivePrice(product);  // null if not logged in
                  const regularPrice = getRegularPrice(product); // null if not logged in
                  const isSale = product.id % 2 === 0;
                  const isNew = product.id === 1 || product.id === 6 || product.id === 13;
                  const isPopular = product.id === 4;

                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate('product-detail', { product })}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full cursor-pointer relative"
                    >
                      {/* Product image container */}
                      <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Badges container */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20">
                          {isSale && (
                            <span className="bg-[#FFA900] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                              Sale
                            </span>
                          )}
                          {isNew && (
                            <span className="bg-[#00C853] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                              New!
                            </span>
                          )}
                          {isPopular && (
                            <span className="bg-[#004b93] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                              Popular
                            </span>
                          )}
                        </div>

                        {/* Top-right menu list buttons (floating heart) */}
                        {/* <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1.5 z-20">
                          <button className="p-1.5 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-[#ff6c60] hover:shadow-sm transition-all">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </div> */}
                      </div>

                      {/* Product details */}
                      <div className="p-4 flex-1 flex flex-col space-y-2">
                        {/* Code info */}
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          Code: {product.code}
                        </div>

                        {/* Title name */}
                        <h4 className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#ff6c60] transition-colors line-clamp-2 h-8">
                          {product.name}
                        </h4>

                        {/* 5 Stars display review */}
                        <div className="flex gap-0.5 text-gray-200">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < (product.rating || 5) ? 'text-[#FFA900] fill-[#FFA900]' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>

                        {/* Pricing layout */}
                        {activePrice !== null ? (
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-[10px] text-gray-400 line-through">
                              ฿{regularPrice.toLocaleString()}
                            </span>
                            <span className="text-sm font-black text-[#ff6c60]">
                              ฿{activePrice.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <div
                            className="pt-1"
                            onClick={e => { e.stopPropagation(); navigate('login'); }}
                          >
                            <span className="text-[10px] font-bold text-[#004b93] underline cursor-pointer hover:text-[#ff6c60] transition-colors">
                              Login to see price
                            </span>
                          </div>
                        )}

                        {/* Add to cart — only shown when logged in */}
                        <div className="pt-2 mt-auto border-t border-gray-100">
                          {activePrice !== null ? (
                            <span className="text-[10px] font-black text-[#004b93] uppercase tracking-wider flex items-center gap-1 group-hover:underline">
                              Add to cart <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          ) : (
                            <span
                              className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-[#ff6c60] transition-colors"
                              onClick={e => { e.stopPropagation(); navigate('login'); }}
                            >
                              Login to shop <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-16 border border-gray-100 text-center space-y-4 shadow-sm">
                <Car className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="font-black text-sm text-gray-700 uppercase">No products match your search</h3>
                <p className="text-xs text-gray-400">Try adjusting your Makes, Models, or category filters.</p>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};

export default ProductList;

