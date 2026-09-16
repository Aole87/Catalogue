import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  th: {
    // Nav & General
    home: 'หน้าหลัก',
    shop: 'สินค้าทั้งหมด',
    tech: 'เทคโนโลยี',
    accessories: 'อุปกรณ์เสริม',
    lifestyle: 'ไลฟ์สไตล์',
    products: 'สินค้า',
    promos: 'โปรโมชัน',
    blog: 'บทความข่าวสาร',
    tourVideo: 'วิดีโอแนะนำ',
    searchPlaceholder: 'ค้นหาสินค้า, แบรนด์, รหัสอะไหล่...',
    categories: 'หมวดหมู่สินค้า',
    allCategories: 'ทุกหมวดหมู่',
    wishlist: 'รายการโปรด',
    cart: 'ตะกร้าสินค้า',
    signIn: 'เข้าสู่ระบบ',
    signOut: 'ออกจากระบบ',
    register: 'สมัครสมาชิก',
    myOrders: 'ประวัติคำสั่งซื้อ',
    adminDashboard: 'ระบบหลังบ้าน Admin',
    vehicleFitment: 'เลือกรุ่นรถยนต์',
    needHelp: 'ช่วยเหลือ:',
    
    // Member Pricing & Access Restrictions
    loginToViewPrice: '🔒 เข้าสู่ระบบเพื่อดูราคาพิเศษ',
    membersOnlyNotice: 'เว็บไซต์นี้แสดงราคาสินค้าและเปิดให้ซื้อสินค้าเฉพาะสมาชิกเท่านั้น',
    loginToBuy: 'เข้าสู่ระบบเพื่อสั่งซื้อ',
    pleaseLoginFirst: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ',
    guestCheckoutNotAllowed: 'ไม่มีการซื้อแบบ Guest กรุณาสมัครสมาชิกหรือเข้าสู่ระบบ',

    // Shipping & Pricing Breakdown
    subtotal: 'ราคาสินค้าสุทธิ',
    shippingFee: 'ค่าจัดส่งสินค้า',
    discount: 'ส่วนลดพิเศษ',
    grandTotal: 'ยอดรวมชำระสุทธิ',
    selectCarrier: 'เลือกผู้ให้บริการจัดส่ง',
    estimatedDelivery: 'ระยะเวลาจัดส่งโดยประมาณ',

    // Sections
    popularCategories: 'หมวดหมู่ยอดนิยม',
    getCategory: 'ดูหมวดหมู่ทั้งหมด',
    weeklyBestDeals: 'ดีลเด็ดประจำสัปดาห์',
    brandLogos: 'แบรนด์ชั้นนำ',
    moreBrands: 'แบรนด์ทั้งหมด',
    popularProducts: 'สินค้ายอดนิยม',
    articlesNews: 'บทความ & ข่าวสาร',
    showAllArticles: 'อ่านบทความทั้งหมด',
    readMore: 'อ่านต่อ',
    buyNow: 'สั่งซื้อทันที',
    getDetails: 'ดูรายละเอียด',
    addToCart: 'เพิ่มลงตะกร้า',
    quickView: 'ดูตัวอย่าง',

    // Admin & Backoffice
    backofficeTitle: 'ระบบการทำงานหลังบ้าน (Backoffice Control Panel)',
    tabSettings: '⚙️ ตั้งค่าระบบ & Payment API',
    tabMembers: '👥 จัดการสมาชิก',
    tabProducts: '📦 จัดการสินค้า & หมวดหมู่',
    tabOrders: '🛍️ จัดการ Order & การชำระเงิน',
    tabArticles: '📰 จัดการบทความ (Articles)',
  },
  en: {
    // Nav & General
    home: 'Home',
    shop: 'Shop All',
    tech: 'Tech',
    accessories: 'Accessories',
    lifestyle: 'Lifestyle',
    products: 'Products',
    promos: 'Promos',
    blog: 'Articles & News',
    tourVideo: 'Tour Video',
    searchPlaceholder: 'Search products, brands, parts...',
    categories: 'Categories',
    allCategories: 'All Categories',
    wishlist: 'Wishlist',
    cart: 'Cart',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    register: 'Register',
    myOrders: 'My Orders',
    adminDashboard: 'Admin Dashboard',
    vehicleFitment: 'Select Vehicle',
    needHelp: 'Need Help?',

    // Member Pricing & Access Restrictions
    loginToViewPrice: '🔒 Login to view price',
    membersOnlyNotice: 'Product prices and ordering are visible to registered members only.',
    loginToBuy: 'Login to Buy',
    pleaseLoginFirst: 'Please sign in to your member account to proceed.',
    guestCheckoutNotAllowed: 'Guest checkout disabled. Please sign in or register.',

    // Shipping & Pricing Breakdown
    subtotal: 'Subtotal',
    shippingFee: 'Shipping Fee',
    discount: 'Discount',
    grandTotal: 'Grand Total',
    selectCarrier: 'Select Shipping Carrier',
    estimatedDelivery: 'Estimated Delivery',

    // Sections
    popularCategories: 'Popular By Category',
    getCategory: 'Get Category',
    weeklyBestDeals: 'Weekly Best Deals',
    brandLogos: 'Brand Logos',
    moreBrands: 'More Brands',
    popularProducts: 'Popular Products',
    articlesNews: 'Articles & News',
    showAllArticles: 'Show All',
    readMore: 'Read More',
    buyNow: 'Buy Now',
    getDetails: 'Get Details',
    addToCart: 'Add to Cart',
    quickView: 'Quick View',

    // Admin & Backoffice
    backofficeTitle: 'Backoffice Administration Control Panel',
    tabSettings: '⚙️ Settings & Payment API',
    tabMembers: '👥 Member Management',
    tabProducts: '📦 Products & Categories',
    tabOrders: '🛍️ Order & Payment Fulfillments',
    tabArticles: '📰 Article CMS',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app_lang') || 'th';
  });

  const toggleLanguage = () => {
    const newLang = lang === 'th' ? 'en' : 'th';
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['th']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
