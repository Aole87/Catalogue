import React, { useState, useEffect } from 'react';
import {
  Search, Grid, Tag, Car, ChevronRight, Menu, User,
  ChevronLeft, Sliders, CircleDot, Zap, Layout, Droplet, Settings
} from 'lucide-react';

// Import local premium generated images
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

const POPULAR_MAKES = [
  { name: 'Audi' },
  { name: 'Bentley' },
  { name: 'Chevrolet' },
  { name: 'Ford' },
  { name: 'Infiniti' },
  { name: 'Kia' },
  { name: 'Lexus' },
  { name: 'Mazda' },
  { name: 'Mitsubishi' },
  { name: 'Porsche' },
  { name: 'Toyota' },
  { name: 'Volvo' },
  { name: 'BMW' },
  { name: 'Cadillac' },
  { name: 'Dodge' },
  { name: 'Honda' },
  { name: 'Hyundai' },
  { name: 'Lamborghini' },
  { name: 'Land Rover' },
  { name: 'Mercedes' },
  { name: 'Nissan' },
  { name: 'Rolls-Royce' },
  { name: 'Volkswagen' },
  { name: 'Maybach' }
];

const renderBrandLogo = (brandName) => {
  const name = brandName.toLowerCase();
  switch (name) {
    case 'audi':
      return (
        <svg viewBox="0 0 100 40" className="w-12 h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="26" cy="20" r="10" />
          <circle cx="42" cy="20" r="10" />
          <circle cx="58" cy="20" r="10" />
          <circle cx="74" cy="20" r="10" />
        </svg>
      );
    case 'bentley':
      return (
        <svg viewBox="0 0 100 50" className="w-12 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,25 C30,10 40,25 45,25 C40,25 30,35 10,25 Z M90,25 C70,10 60,25 55,25 C60,25 70,35 90,25 Z" fill="currentColor" fillOpacity="0.2" />
          <circle cx="50" cy="25" r="12" fill="white" stroke="currentColor" strokeWidth="2" />
          <text x="50" y="31" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="black" fontFamily="serif">B</text>
        </svg>
      );
    case 'chevrolet':
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-8" fill="currentColor">
          <polygon points="35,22 65,22 72,38 28,38" fill="#e0a000" stroke="currentColor" strokeWidth="2" />
          <polygon points="45,14 55,14 55,46 45,46" fill="#e0a000" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'ford':
      return (
        <svg viewBox="0 0 100 50" className="w-12 h-6">
          <ellipse cx="50" cy="25" rx="45" ry="22" fill="#003399" stroke="white" strokeWidth="2" />
          <ellipse cx="50" cy="25" rx="42" ry="19" fill="none" stroke="white" strokeWidth="1" />
          <text x="50" y="32" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontStyle="italic" fontFamily="Georgia, serif">Ford</text>
        </svg>
      );
    case 'infiniti':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="50" cy="50" r="40" />
          <path d="M25,75 L42,40 L50,55 L58,40 L75,75" />
        </svg>
      );
    case 'kia':
      return (
        <svg viewBox="0 0 100 50" className="w-12 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="50" cy="25" rx="40" ry="20" />
          <text x="50" y="32" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">KIA</text>
        </svg>
      );
    case 'lexus':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="50" cy="50" r="42" />
          <path d="M30,35 L40,35 L65,70 L72,70 M38,53 L62,53" strokeWidth="4" />
        </svg>
      );
    case 'mazda':
      return (
        <svg viewBox="0 0 100 80" className="w-12 h-8" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="50" cy="40" rx="40" ry="25" />
          <path d="M22,35 C38,50 62,50 78,35 C68,45 50,45 22,35 Z" fill="none" />
          <path d="M22,35 L40,40 L50,22 L60,40 L78,35" />
        </svg>
      );
    case 'mitsubishi':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="red">
          <polygon points="50,15 62,36 50,57 38,36" />
          <polygon points="50,57 73,70 61,91 38,78" transform="rotate(120 50 57)" />
          <polygon points="50,57 73,70 61,91 38,78" transform="rotate(240 50 57)" />
        </svg>
      );
    case 'porsche':
      return (
        <svg viewBox="0 0 80 100" className="w-8 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 L70,10 L65,70 L40,90 L15,70 Z" fill="#d4af37" fillOpacity="0.3" />
          <path d="M10,10 L70,10 L65,70 L40,90 L15,70 Z" strokeWidth="2" />
          <text x="40" y="55" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="sans-serif">P</text>
        </svg>
      );
    case 'toyota':
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-8" fill="none" stroke="currentColor" strokeWidth="2.5">
          <ellipse cx="50" cy="30" rx="40" ry="24" />
          <ellipse cx="50" cy="30" rx="26" ry="16" />
          <ellipse cx="50" cy="22" rx="12" ry="14" />
          <line x1="50" y1="6" x2="50" y2="54" strokeWidth="3" />
        </svg>
      );
    case 'volvo':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="45" cy="55" r="30" />
          <path d="M66,34 L82,18 M65,18 L82,18 L82,35" strokeWidth="4" strokeLinecap="square" />
          <text x="45" y="60" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">VOLVO</text>
        </svg>
      );
    case 'bmw':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10">
          <circle cx="50" cy="50" r="45" fill="black" stroke="gray" strokeWidth="1" />
          <circle cx="50" cy="50" r="32" fill="white" />
          <path d="M50,50 L50,18 A32,32 0 0,1 82,50 Z" fill="#0066b2" />
          <path d="M50,50 L50,82 A32,32 0 0,1 18,50 Z" fill="#0066b2" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="white" strokeWidth="2" />
          <text x="50" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">BMW</text>
        </svg>
      );
    case 'cadillac':
      return (
        <svg viewBox="0 0 80 80" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="20" y="20" width="40" height="40" fill="#d4af37" fillOpacity="0.2" />
          <rect x="20" y="20" width="40" height="40" stroke="currentColor" strokeWidth="2" />
          <path d="M10,40 L70,40 M40,10 L40,70" strokeWidth="1" strokeDasharray="2" />
        </svg>
      );
    case 'dodge':
      return (
        <svg viewBox="0 0 100 50" className="w-12 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <text x="45" y="32" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="black" fontFamily="sans-serif" letterSpacing="1">DODGE</text>
          <line x1="80" y1="15" x2="95" y2="35" stroke="red" strokeWidth="3" />
          <line x1="87" y1="15" x2="102" y2="35" stroke="red" strokeWidth="3" />
        </svg>
      );
    case 'honda':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3">
          <rect x="15" y="15" width="70" height="70" rx="15" />
          <path d="M35,30 L35,70 M65,30 L65,70 M35,50 L65,50" strokeWidth="5" />
        </svg>
      );
    case 'hyundai':
      return (
        <svg viewBox="0 0 100 60" className="w-12 h-8" fill="none" stroke="currentColor" strokeWidth="3">
          <ellipse cx="50" cy="30" rx="42" ry="22" />
          <path d="M35,18 L48,42 M65,18 L52,42 M38,30 L62,30" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'lamborghini':
      return (
        <svg viewBox="0 0 80 100" className="w-8 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 L70,10 L65,75 L40,90 L15,75 Z" fill="black" />
          <path d="M10,10 L70,10 L65,75 L40,90 L15,75 Z" stroke="#d4af37" strokeWidth="2" />
          <path d="M30,40 Q40,30 50,40 Q40,65 35,75" stroke="#d4af37" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'land rover':
      return (
        <svg viewBox="0 0 100 50" className="w-12 h-6">
          <ellipse cx="50" cy="25" rx="45" ry="22" fill="#005A36" stroke="white" strokeWidth="2" />
          <text x="50" y="27" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">LAND</text>
          <text x="50" y="37" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">ROVER</text>
        </svg>
      );
    case 'mercedes':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="50" cy="50" r="42" />
          <path d="M50,8 L50,50 M50,50 L14,71 M50,50 L86,71" strokeWidth="2.5" />
        </svg>
      );
    case 'nissan':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="50" cy="50" r="35" />
          <rect x="10" y="38" width="80" height="24" rx="4" fill="white" stroke="currentColor" strokeWidth="2.5" />
          <text x="50" y="54" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="extrabold" fontFamily="sans-serif" letterSpacing="1">NISSAN</text>
        </svg>
      );
    case 'rolls-royce':
      return (
        <svg viewBox="0 0 60 90" className="w-8 h-10" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="10" y="10" width="40" height="70" rx="4" />
          <text x="25" y="45" fill="currentColor" fontSize="26" fontWeight="bold" fontFamily="serif">R</text>
          <text x="35" y="65" fill="currentColor" fontSize="26" fontWeight="bold" fontFamily="serif">R</text>
        </svg>
      );
    case 'volkswagen':
      return (
        <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="50" cy="50" r="42" />
          <path d="M30,30 L50,70 L70,30 M33,52 L50,86 L67,52" strokeWidth="2.5" />
        </svg>
      );
    case 'maybach':
      return (
        <svg viewBox="0 0 100 90" className="w-10 h-9" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20,80 L40,30 L50,55 L60,30 L80,80" />
          <path d="M30,80 L45,40 L50,55 L55,40 L70,80" />
          <path d="M10,80 C30,70 70,70 90,80" />
        </svg>
      );
    default:
      return (
        <span className="font-bold text-[10px] text-gray-500 uppercase">{brandName.slice(0, 3)}</span>
      );
  }
};

const Home = ({ navigate, user }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Vehicle Selector Dropdowns Data
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);

  // Vehicle Selector State
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [vinSearch, setVinSearch] = useState('');

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

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
    return [];
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

  // Slider navigation
  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setCurrentSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const handleBrandClick = (brandId) => {
    navigate('product-list', { filters: { brandId: brandId } });
  };

  const handleSearch = () => {
    navigate('product-list', {
      filters: {
        car_brand: selectedMake,
        car_model: selectedModel,
        car_year: selectedYear,
        vin: vinSearch
      }
    });
  };

  // Slider Slides Data
  const heroSlides = [
    {
      title: "MOBIL 1",
      subTitle: "FULL SYNTHETIC",
      desc: "It's more than just oil. It's liquid engineering.",
      img: mobil1Bottles,
      badgeLine1: "SALE",
      badgeLine2: "-20%",
      bgClass: "bg-gradient-to-r from-gray-950 via-gray-900 to-slate-800",
      onClick: () => navigate('product-list', { filters: { categoryId: 6 } }) // Oil/Fluids
    },
    {
      title: "PREMIUM CAR",
      subTitle: "BATTERIES",
      desc: "Power your drive with long-lasting and reliable starting power.",
      img: batteryPromo,
      badgeLine1: "NEW",
      badgeLine2: "ARRIVALS",
      bgClass: "bg-gradient-to-r from-[#8E6300] via-[#DDA700] to-[#FFA900]",
      onClick: () => navigate('product-list', { filters: { categoryId: 4 } }) // Electrics
    },
    {
      title: "PROFESSIONAL",
      subTitle: "CAR TOOLS",
      desc: "Get every socket and wrench you need to set up your garage work.",
      img: toolsPromo,
      badgeLine1: "BEST",
      badgeLine2: "PRICE",
      bgClass: "bg-gradient-to-r from-[#1E5631] via-[#2E8B57] to-[#4CAF50]",
      onClick: () => navigate('product-list') // Shop all
    }
  ];

  // 9 circular quick link categories combining DB and fallback/mock placeholders
  const displayCategories = [...categories];
  const existingNames = displayCategories.map(c => c.name);

  const supplementary = [
    { name: 'เครื่องยนต์' },
    { name: 'Care Kit' },
    { name: 'Interior' }
  ];

  supplementary.forEach(item => {
    const isExistent = existingNames.some(existing =>
      existing.toLowerCase() === item.name.toLowerCase() ||
      (categoryTranslations[existing] && categoryTranslations[existing].toLowerCase() === item.name.toLowerCase())
    );
    if (!isExistent) {
      displayCategories.push({
        id: 'supp-' + item.name,
        name: item.name,
        isFallback: true
      });
    }
  });

  // Keep max 9 items for neat display matching the mockup
  const finalCategories = displayCategories.slice(0, 9);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9]">
      {/* Main Header */}
      <header className="bg-white py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
          <div className="text-2xl md:text-3xl font-black text-[#ff6c60] italic tracking-tighter">MOBEX</div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-t px-4 md:px-8 py-3 flex flex-col md:flex-row gap-3 md:gap-8 justify-between items-stretch md:items-center shadow-sm overflow-hidden">
        <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 items-center overflow-x-auto no-scrollbar py-1">
          <button className="flex items-center gap-2 bg-[#ff6c60] text-white px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm shrink-0">
            <Menu className="w-4 h-4" /> ALL CATEGORIES
          </button>
          <div className="flex gap-4 md:gap-8 items-center overflow-x-auto no-scrollbar">
            {['HOME', 'SHOP BY BRAND', 'SHOP BY CATEGORIES', 'BLOG', 'SHOP', 'MY GARAGE'].map(item => (
              <button key={item} className="text-[10px] md:text-xs font-bold text-gray-800 hover:text-[#ff6c60] tracking-wider shrink-0">{item}</button>
            ))}
          </div>
        </div>
        <div className="bg-[#f1c40f] text-white px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-2 self-end md:self-auto shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-gray-800">{user.first_name} ({user.business_type})</span>
              <div className="w-5 h-5 bg-[#ff6c60] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{user.first_name[0]}</div>
            </div>
          ) : (
            <button onClick={() => navigate('login')} className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">LOGIN</button>
          )}
        </div>
      </nav>

      {/* Hero Slider Section */}
      <section className="relative h-[250px] sm:h-[320px] md:h-[380px] overflow-hidden bg-gray-950">
        <div className="relative h-full w-full">
          {heroSlides.map((slide, index) => {
            if (index !== currentSlide) return null;
            return (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-between px-6 sm:px-12 md:px-24 transition-all duration-700 gap-4 sm:gap-8 ${slide.bgClass}`}
              >
                {/* Text Content */}
                <div className="relative z-20 max-w-[60%] sm:max-w-lg text-white space-y-2 sm:space-y-3">
                  <h1 className="text-xl sm:text-4xl md:text-5xl font-black tracking-wide leading-none">{slide.title}</h1>
                  <h2 className="text-sm sm:text-2xl md:text-3xl font-extrabold text-[#f1c40f] tracking-wide">{slide.subTitle}</h2>
                  <p className="text-[9px] sm:text-xs md:text-sm font-semibold opacity-80 max-w-sm">{slide.desc}</p>
                </div>

                {/* Badge sticker & image */}
                <div className="relative z-20 flex items-center gap-4 sm:gap-6 shrink-0">
                  {/* Angled Sticker */}
                  <div className="absolute -left-6 sm:-left-12 top-2 sm:top-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#00C853] rounded-full flex flex-col items-center justify-center font-black text-white text-center text-[8px] sm:text-[10px] md:text-xs shadow-lg border border-white sm:border-2 transform -rotate-12 select-none z-30">
                    <span>{slide.badgeLine1}</span>
                    <span className="text-[6px] sm:text-[8px] md:text-[10px] font-bold leading-none">{slide.badgeLine2}</span>
                  </div>

                  {/* Slide product display image */}
                  <div className="w-24 h-24 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-2xl overflow-hidden p-1 sm:p-2">
                    <img src={slide.img} alt={slide.title} className="w-full h-full object-contain object-center scale-105" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center text-white z-30 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 flex items-center justify-center text-white z-30 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/40'}`}
            ></button>
          ))}
        </div>
      </section>

      {/* Category Circles Quick Links */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-lg font-black text-gray-800 tracking-wide mb-4">Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 py-2">
            {finalCategories.map(cat => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (cat.isFallback) {
                      navigate('product-list');
                    } else {
                      navigate('product-list', { filters: { categoryId: cat.id } });
                    }
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[#ff6c60]/40 group-hover:shadow-md">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-[#ff6c60] transition-colors" />
                  </div>
                  <span className="mt-2 text-[9px] sm:text-[10px] font-black text-gray-700 tracking-wide text-center group-hover:text-[#ff6c60] transition-colors line-clamp-1">
                    {getCategoryDisplay(cat.name)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid: Sidebar + Vehicle Selector & Brands */}
      <section className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar Menu */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#35404d] text-white px-5 py-4 flex items-center gap-3 font-bold text-xs tracking-wider">
                <Menu className="w-4 h-4" /> ALL DEPARTMENTS
              </div>
              <div className="divide-y divide-gray-100">
                {categories.map(cat => {
                  const Icon = getCategoryIcon(cat.name);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => navigate('product-list', { filters: { categoryId: cat.id } })}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#ff6c60] transition-colors" />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-[#ff6c60] transition-colors">{cat.name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#ff6c60] transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Content Area: Filter Form & Brands */}
          <div className="flex-1 space-y-8">

            {/* Vehicle Selector Form Banner */}
            <div className="bg-[#FFA900] rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>

              <div className="flex flex-col xl:flex-row gap-6 items-center">

                {/* 3x2 Dropdowns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  <select
                    value={selectedMake}
                    onChange={e => setSelectedMake(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
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
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm disabled:opacity-75 cursor-pointer"
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
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm disabled:opacity-75 cursor-pointer"
                  >
                    <option value="">Year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <select
                    value={selectedEngine}
                    onChange={e => setSelectedEngine(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
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
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
                  >
                    <option value="">Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>

                  {/* <select
                    value={selectedTrim}
                    onChange={e => setSelectedTrim(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm cursor-pointer"
                  >
                    <option value="">Trim</option>
                    <option value="Standard">Standard Trim</option>
                    <option value="Premium">Premium Trim</option>
                    <option value="Sport">Sport Trim</option>
                  </select> */}
                  <button
                    onClick={handleSearch}
                    className="bg-[#004b93] hover:bg-[#003c75] text-white font-extrabold text-xs tracking-widest uppercase px-6 py-3 rounded-lg shadow-md transition-all active:scale-95 duration-150"
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
                    className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6c60] shadow-sm min-w-[120px]"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-[#004b93] hover:bg-[#003c75] text-white font-extrabold text-xs tracking-widest uppercase px-6 py-3 rounded-lg shadow-md transition-all active:scale-95 duration-150"
                  >
                    Search
                  </button>
                </div> */}

              </div>
            </div>

            {/* Featured Manufacturers */}
            <div>
              <h2 className="text-lg font-black text-gray-800 tracking-wide mb-4">Featured manufacturers</h2>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                {POPULAR_MAKES.map(make => (
                  <div
                    key={make.name}
                    onClick={() => navigate('product-list', { filters: { car_brand: make.name } })}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer transition-all duration-300 hover:scale-110 hover:border-[#ff6c60]/40 hover:shadow-md text-gray-700 hover:text-[#ff6c60]">
                      {renderBrandLogo(make.name)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Products Promo Cards */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-gray-800 tracking-wide">Featured products</h2>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#ff6c60] hover:border-[#ff6c60] transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#ff6c60] hover:border-[#ff6c60] transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Promo Card 1: Engine Oil */}
                <div
                  onClick={() => navigate('product-list', { filters: { categoryId: 6 } })}
                  className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer group h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#004b93] opacity-90 z-10 transition-colors group-hover:bg-[#003d77]"></div>
                  <img src={mobil1Bottles} alt="Engine Oil" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                    <div>
                      <span className="bg-[#00C853] text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                        Upto 40% Off
                      </span>
                      <h3 className="text-lg font-black tracking-wide mt-1.5">ENGINE OIL</h3>
                      <p className="text-[9px] font-bold opacity-85 mt-0.5">Run smoothly!</p>
                    </div>
                    <div className="bg-white text-gray-950 font-bold px-3 py-1 rounded-md text-[9px] w-fit flex items-center gap-1 shadow-sm transform group-hover:translate-x-1 transition-transform duration-300">
                      Shop now <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Promo Card 2: Tools */}
                <div
                  onClick={() => navigate('product-list')}
                  className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer group h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#4CAF50] opacity-90 z-10 transition-colors group-hover:bg-[#43a047]"></div>
                  <img src={toolsPromo} alt="Tools" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                    <div>
                      <span className="bg-[#004b93] text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                        Top brands
                      </span>
                      <h3 className="text-lg font-black tracking-wide mt-1.5">TOOLS</h3>
                      <p className="text-[9px] font-bold opacity-85 mt-0.5">You need</p>
                    </div>
                    <div className="bg-white text-gray-950 font-bold px-3 py-1 rounded-md text-[9px] w-fit flex items-center gap-1 shadow-sm transform group-hover:translate-x-1 transition-transform duration-300">
                      Shop now <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Promo Card 3: Batteries */}
                <div
                  onClick={() => navigate('product-list', { filters: { categoryId: 4 } })}
                  className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer group h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#FFA900] opacity-90 z-10 transition-colors group-hover:bg-[#e09500]"></div>
                  <img src={batteryPromo} alt="Batteries" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                    <div>
                      <span className="bg-red-600 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                        Top brands
                      </span>
                      <h3 className="text-lg font-black tracking-wide mt-1.5">BATTERIES</h3>
                      <p className="text-[9px] font-bold opacity-85 mt-0.5">Stay charged up!</p>
                    </div>
                    <div className="bg-white text-gray-950 font-bold px-3 py-1 rounded-md text-[9px] w-fit flex items-center gap-1 shadow-sm transform group-hover:translate-x-1 transition-transform duration-300">
                      Shop now <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Promo Card 4: Engine Oil */}
                <div
                  onClick={() => navigate('product-list', { filters: { categoryId: 6 } })}
                  className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer group h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#004b93] opacity-90 z-10 transition-colors group-hover:bg-[#003d77]"></div>
                  <img src={mobil1Bottles} alt="Engine Oil" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                    <div>
                      <span className="bg-[#00C853] text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                        Upto 40% Off
                      </span>
                      <h3 className="text-lg font-black tracking-wide mt-1.5">ENGINE OIL</h3>
                      <p className="text-[9px] font-bold opacity-85 mt-0.5">Run smoothly!</p>
                    </div>
                    <div className="bg-white text-gray-950 font-bold px-3 py-1 rounded-md text-[9px] w-fit flex items-center gap-1 shadow-sm transform group-hover:translate-x-1 transition-transform duration-300">
                      Shop now <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Promo Card 5: Tools */}
                <div
                  onClick={() => navigate('product-list')}
                  className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer group h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#4CAF50] opacity-90 z-10 transition-colors group-hover:bg-[#43a047]"></div>
                  <img src={toolsPromo} alt="Tools" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                    <div>
                      <span className="bg-[#004b93] text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                        Top brands
                      </span>
                      <h3 className="text-lg font-black tracking-wide mt-1.5">TOOLS</h3>
                      <p className="text-[9px] font-bold opacity-85 mt-0.5">You need</p>
                    </div>
                    <div className="bg-white text-gray-950 font-bold px-3 py-1 rounded-md text-[9px] w-fit flex items-center gap-1 shadow-sm transform group-hover:translate-x-1 transition-transform duration-300">
                      Shop now <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Promo Card 6: Batteries */}
                <div
                  onClick={() => navigate('product-list', { filters: { categoryId: 4 } })}
                  className="relative rounded-xl overflow-hidden shadow-sm cursor-pointer group h-44 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-[#FFA900] opacity-90 z-10 transition-colors group-hover:bg-[#e09500]"></div>
                  <img src={batteryPromo} alt="Batteries" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                    <div>
                      <span className="bg-red-600 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit">
                        Top brands
                      </span>
                      <h3 className="text-lg font-black tracking-wide mt-1.5">BATTERIES</h3>
                      <p className="text-[9px] font-bold opacity-85 mt-0.5">Stay charged up!</p>
                    </div>
                    <div className="bg-white text-gray-950 font-bold px-3 py-1 rounded-md text-[9px] w-fit flex items-center gap-1 shadow-sm transform group-hover:translate-x-1 transition-transform duration-300">
                      Shop now <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

