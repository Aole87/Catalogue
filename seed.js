const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function seed() {
  const dbPath = path.join(__dirname, 'database.sqlite');
  
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    await db.run(statement);
  }

  const categories = [
    'เครื่องยนต์', 'ช่วงล่าง', 'เบรก', 'ไฟฟ้า', 'ตัวถัง',
    'น้ำมันเครื่อง', 'กรองอากาศ', 'ยางรถยนต์', 'ระบบระบายความร้อน', 'ระบบไอเสีย',
    'ระบบเชื้อเพลิง', 'ระบบส่งกำลัง', 'คลัตช์', 'พวงมาลัยและระบบบังคับเลี้ยว', 'ระบบปรับอากาศ',
    'ไฟส่องสว่าง', 'อุปกรณ์ภายในรถยนต์', 'อุปกรณ์ภายนอกรถยนต์', 'ผลิตภัณฑ์ดูแลรักษารถยนต์', 'เซนเซอร์และกล่องควบคุม',
    'หัวเทียนและคอยล์จุดระเบิด', 'แบตเตอรี่', 'สายพานและลูกรอก', 'ซีลและปะเก็น', 'เครื่องมือช่าง',
    'บูชและลูกหมาก', 'แชสซีและโครงรถ', 'ระบบไฮดรอลิก', 'อะไหล่ตัวถังภายใน', 'อะไหล่ตัวถังภายนอก'
  ];
  for (const cat of categories) {
    await db.run('INSERT INTO categories (name) VALUES (?)', [cat]);
  }

  const brands = ['Bosch', 'Denso', 'NGK', 'Valeo', 'Aisin', 'TRW', 'Akebono', 'Sakura'];
  for (const brand of brands) {
    await db.run('INSERT INTO brands (name) VALUES (?)', [brand]);
  }

  const mockProducts = [
    { name: 'Akebono Ultra-Premium Ceramic Brake Pads', code: 'BP4K-33-28Z', category_id: 3, brand_id: 7, car_brand: 'Mazda', car_model: '3 (BP) / CX-30', car_year: '2019-Present', price_garage: 1500, price_shop: 1650, price_general: 1850 },
    { name: 'TRW DTEC Ceramic Brake Pads', code: 'GDB3494', category_id: 3, brand_id: 6, car_brand: 'Toyota', car_model: 'Camry', car_year: '2018-Present', price_garage: 1400, price_shop: 1550, price_general: 1700 },
    { name: 'RIDEX 295W0003 Wiper Motor', code: '295W0003', category_id: 2, brand_id: 6, car_brand: 'Toyota', car_model: 'Camry', car_year: '2018-Present', price_garage: 1500, price_shop: 1650, price_general: 1850 },
    { name: 'RIDEX 295W0016 Wiper Motor', code: '295W0016', category_id: 2, brand_id: 6, car_brand: 'Toyota', car_model: 'Corolla Altis', car_year: '2019-Present', price_garage: 1000, price_shop: 1100, price_general: 1200 },
    { name: 'RIDEX 300W0031 Wiper Linkage', code: '300W0031', category_id: 2, brand_id: 6, car_brand: 'Toyota', car_model: 'Hilux Revo', car_year: '2015-Present', price_garage: 800, price_shop: 890, price_general: 980 },
    { name: 'RIDEX 300W0011 Wiper Linkage', code: '300W0011', category_id: 2, brand_id: 6, car_brand: 'Honda', car_model: 'Civic', car_year: '2016-2021', price_garage: 550, price_shop: 600, price_general: 680 },
    { name: 'DENSO Hybrid DUR-060R Wiper Blade', code: 'DUR-060R', category_id: 2, brand_id: 2, car_brand: 'Honda', car_model: 'City', car_year: '2020-Present', price_garage: 580, price_shop: 620, price_general: 690 },
    { name: 'RIDEX 301W0044 Wiper Arm', code: '301W0044', category_id: 2, brand_id: 6, car_brand: 'Mazda', car_model: '3 (BP) / CX-30', car_year: '2019-Present', price_garage: 360, price_shop: 400, price_general: 450 },
    { name: 'KRAFT 8800002 Speed Sensor', code: '8800002', category_id: 4, brand_id: 4, car_brand: 'Mazda', car_model: '2', car_year: '2015-Present', price_garage: 220, price_shop: 250, price_general: 280 },
    { name: 'VEMO V10-72-0906 Speed Sensor', code: 'V10-72-0906', category_id: 4, brand_id: 4, car_brand: 'Toyota', car_model: 'Camry', car_year: '2018-Present', price_garage: 520, price_shop: 580, price_general: 650 },
    { name: 'RIDEX 807S0023 Reverse Light Switch', code: '807S0023', category_id: 4, brand_id: 6, car_brand: 'Toyota', car_model: 'Corolla Altis', car_year: '2019-Present', price_garage: 300, price_shop: 350, price_general: 390 },
    { name: 'STARK SKSRL-2120001 Reverse Light Switch', code: 'SKSRL-2120001', category_id: 4, brand_id: 3, car_brand: 'Honda', car_model: 'Civic', car_year: '2016-2021', price_garage: 550, price_shop: 610, price_general: 680 },
    { name: 'MEYLE 100 199 0053 Mounting', code: '1001990053', category_id: 5, brand_id: 8, car_brand: 'Mazda', car_model: '2', car_year: '2015-Present', price_garage: 680, price_shop: 765, price_general: 850 },
    { name: 'ORIGINAL IMPERIUM 35042 Mounting', code: '35042', category_id: 5, brand_id: 8, car_brand: 'Mazda', car_model: '3 (BP) / CX-30', car_year: '2019-Present', price_garage: 1080, price_shop: 1215, price_general: 1350 },
    { name: 'SACHS 2294 002 013 Dual Mass Flywheel', code: '2294002013', category_id: 2, brand_id: 8, car_brand: 'Toyota', car_model: 'Hilux Revo', car_year: '2015-Present', price_garage: 7200, price_shop: 8000, price_general: 8900 }
  ];

  for (const p of mockProducts) {
    await db.run(`
      INSERT INTO products (name, code, category_id, brand_id, car_brand, car_model, car_year, price_garage, price_shop, price_general)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [p.name, p.code, p.category_id, p.brand_id, p.car_brand, p.car_model, p.car_year, p.price_garage, p.price_shop, p.price_general]);
  }

  console.log('Database initialized and seed data inserted successfully!');
  await db.close();
}

seed().catch(err => console.error(err));
