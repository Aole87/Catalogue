# 🚗 MOBEX Auto Parts Platform

ระบบบริหารจัดการแค็ตตาล็อกและร้านค้าออนไลน์อะไหล่ยานยนต์ตรงรุ่นครบวงจร (Automotive E-Commerce & Business Management Platform)

- **Frontend**: React 19 (Vite 8), Responsive Mobile & Desktop, Tailwind CSS
- **Backend API**: Fastify 5 (TypeScript), Argon2id Hashing, HMAC-SHA256 Tokenization, Rate Limiter
- **Database & ORM**: PostgreSQL 16, Prisma ORM (Connection Pooling & Global Singleton)
- **Deployment**: Docker, Docker Compose, Linux VPS (Apache / Plesk Reverse Proxy, PM2)

---

## 📑 สารบัญ
1. [การตั้งค่าไฟล์ `.env` (Environment Configuration)](#1-การตั้งค่าไฟล์-env)
2. [อะไรควรอยู่ใน `.env` vs อะไรอยู่ในระบบหลังบ้าน](#2-อะไรควรอยู่ใน-env-vs-อะไรอยู่ในระบบหลังบ้าน)
3. [ขั้นตอนการรันบน Server จริง (Deployment)](#3-ขั้นตอนการรันบน-server-จริง-deployment)
   - [วิธีที่ 1: รันด้วย Docker (แนะนำที่สุด)](#วิธีที่-1-รันด้วย-docker-แนะนำที่สุด)
   - [วิธีที่ 2: รันด้วย PM2 / Node.js บน Plesk หรือ VPS](#วิธีที่-2-รันด้วย-pm2--nodejs-บน-plesk-หรือ-vps)
4. [การตรวจสอบสถานะและการประหยัดทรัพยากร (Resource Optimization)](#4-การตรวจสอบสถานะและการประหยัดทรัพยากร)
5. [ข้อมูลเริ่มต้นสำหรับการเข้าสู่ระบบ (Default Credentials)](#5-ข้อมูลเริ่มต้นสำหรับการเข้าสู่ระบบ)

---

## 1. การตั้งค่าไฟล์ `.env`

เมื่อดาวน์โหลดหรือ `git pull` โค้ดลงบนเซิร์ฟเวอร์ ให้คัดลอกไฟล์ต้นแบบ [.env.example](file:///.env.example) ไปเป็นไฟล์ `.env`:

```bash
cp .env.example .env
nano .env
```

### รายละเอียดตัวแปรคอนฟิกทั้งหมดใน `.env`:

| ตัวแปร (Variable) | ค่าเริ่มต้น / ตัวอย่าง | คำอธิบายและความสำคัญ |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | โหมดการทำงาน (`production` จะปิด Debug logs และซ่อนรหัส OTP เพื่อความปลอดภัย) |
| `PORT` | `3000` | พอร์ตของ API Server |
| `HOST` | `0.0.0.0` | IP Address ที่เซิร์ฟเวอร์เปิดรับฟังคำขอ |
| `NODE_OPTIONS` | `"--max-old-space-size=512"` | **สำคัญมาก:** จำกัดเพดาน RAM ของ Node.js ไม่ให้กินเกิน 512MB ป้องกัน RAM ค้าง |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname?schema=public&connection_limit=8` | การเชื่อมต่อ PostgreSQL พร้อมตั้งค่า `connection_limit=8` เพื่อไม่ให้แย่ง RAM ฐานข้อมูล |
| `SESSION_COOKIE_SECRET` | `super-secret-key-min-32-chars` | กุญแจเข้ารหัสความปลอดภัยสำหรับ Sign Session Cookie และ Token ลิงก์รีเซ็ตรหัสผ่าน |
| `SESSION_TTL_HOURS` | `168` | อายุของ Session การเข้าสู่ระบบ (168 ชม. = 7 วัน) |
| `ADMIN_BYPASS_KEY` | `mobex_admin_bypass_2026` | รหัส Master Bypass สำหรับ Webhook และการเชื่อมต่อ API ภายใน |
| `FRONTEND_URL` | `https://market.autocentric.net` | โดเมนหลักของหน้าเว็บ ใช้สำหรับสร้าง Magic Link ส่งให้ผู้ใช้ทางอีเมลเวลารีเซ็ตรหัสผ่าน |
| `CORS_ALLOWED_ORIGINS` | `https://market.autocentric.net,...` | รายชื่อโดเมนที่อนุญาตให้เรียกใช้งาน API (ป้องกันเว็บภายนอกแอบยิง API ข้ามโดเมน) |
| `SMTP_HOST` | `smtp.gmail.com` | โฮสต์เซิร์ฟเวอร์อีเมลสำหรับส่ง OTP และลิงก์รีเซ็ตรหัสผ่าน |
| `SMTP_PORT` | `587` | พอร์ต SMTP (587 สำหรับ TLS, 465 สำหรับ SSL) |
| `SMTP_USER` | `noreply@autocentric.net` | ชื่อบัญชีอีเมลสำหรับส่งออก |
| `SMTP_PASS` | `app_specific_password` | รหัสผ่านอีเมล หรือ Google App Password |
| `SMTP_FROM` | `MOBEX Auto Parts <noreply@...>` | ชื่อผู้ส่งที่จะแสดงในกล่องจดหมายของผู้รับ |
| `OTP_TTL_MINUTES` | `5` | อายุของรหัส OTP และลิงก์รีเซ็ตรหัสผ่าน (นาที) |
| `RATE_LIMIT_MAX` | `1000` | จำกัดการยิง API รวมไม่เกิน 1,000 ครั้ง ต่อนาที ป้องกัน DDoS |
| `AUTH_RATE_LIMIT_MAX` | `10` | ป้องกันการสุ่มรหัสผ่าน (Brute Force) ในหน้า Login / OTP ไม่เกิน 10 ครั้ง ต่อนาที |
| `ENABLE_SWAGGER` | `false` | เปิด/ปิดหน้าคู่มือ API Documentation (`/docs`) ใน Production |

---

## 2. อะไรควรอยู่ใน `.env` vs อะไรอยู่ในระบบหลังบ้าน

เพื่อความปลอดภัยสูงสุดตามมาตรฐานสากล:

### 🔒 ต้องอยู่ใน `.env` เท่านั้น (ห้ามใส่ในหลังบ้านเด็ดขาด)
- รหัสผ่านฐานข้อมูล (`DATABASE_URL`)
- รหัสลับการเข้ารหัสและเซสชัน (`SESSION_COOKIE_SECRET`)
- รหัสผ่านอีเมลส่งออก (`SMTP_PASS`)
- การจำกัด RAM และพอร์ตเครือข่าย (`NODE_OPTIONS`, `PORT`)
- Webhook HMAC Signing Secrets ของธนาคารและการขนส่ง
> **เหตุผล:** หากนำค่าเหล่านี้ไปไว้ในหน้าตั้งค่าหลังบ้าน หากบัญชีแอดมินหรือพนักงานถูกเจาะ หรือเกิดข้อผิดพลาด โครงสร้างทั้งเซิร์ฟเวอร์อาจถูกยึดครองได้ทันที

### ⚙️ อยู่ในระบบตั้งค่าหลังบ้าน (Admin Settings)
- ข้อมูลร้านค้า: ชื่อแบรนด์, โลโก้, เบอร์โทรศัพท์, LINE ID, ที่อยู่
- แบนเนอร์หน้าแรก, ข้อความประชาสัมพันธ์, ข้อมูลเกี่ยวกับเรา (About Us)
- การเปิด/ปิดวิธีชำระเงิน (สวิตช์เปิด/ปิด โอนเงิน, พร้อมเพย์)
- เลขที่บัญชีธนาคารสำหรับให้ลูกค้าโอนเงิน (เป็นข้อมูลสาธารณะที่ต้องแสดงให้ลูกค้าเห็น)
- ยอดสั่งซื้อขั้นต่ำสำหรับจัดส่งฟรี (Free Shipping Threshold)
- การจัดการสินค้า, หมวดหมู่, แบรนด์, และราคาสมาชิก

---

## 3. ขั้นตอนการรันบน Server จริง (Deployment)

### วิธีที่ 1: รันด้วย Docker (แนะนำที่สุด)

การรันด้วย Docker มีการล็อกการใช้งาน Resource ไม่ให้เกิน 768MB RAM และจำกัด 1.5 CPU อัตโนมัติ

1. **ดึงโค้ดล่าสุดบนเซิร์ฟเวอร์**:
   ```bash
   git pull origin main
   ```
2. **สร้างและตรวจสอบไฟล์ `.env`**:
   ```bash
   cp .env.example .env
   # ปรับแต่งค่า DATABASE_URL และ SMTP ใน .env ให้ตรงกับเซิร์ฟเวอร์จริง
   ```
3. **สั่งรันด้วยคำสั่งเดียวผ่านสคริปต์อัตโนมัติ**:
   ```bash
   chmod +x start-docker-api.sh
   ./start-docker-api.sh
   ```
   *หรือสั่งรันผ่าน Docker Compose โดยตรง:*
   ```bash
   docker compose up -d --build
   ```

---

### วิธีที่ 2: รันด้วย PM2 / Node.js บน Plesk หรือ VPS

สำหรับเซิร์ฟเวอร์ที่ติดตั้ง Node.js 20+ ไว้โดยตรง หรือใช้ Plesk Node.js Extension:

1. **ติดตั้ง Dependencies และคอมไพล์ Production Bundle**:
   ```bash
   npm install --production=false
   npm run build
   ```
   *(คำสั่งนี้จะคอมไพล์หน้าบ้านไปยัง `dist/` และคอมไพล์เซิร์ฟเวอร์ไปยัง `dist-server/index.js`)*
2. **รัน API Server ด้วย PM2**:
   ```bash
   pm2 restart car-parts-api || pm2 start server.js --name "car-parts-api"
   pm2 save
   ```

---

## 4. การตรวจสอบสถานะและการประหยัดทรัพยากร

### คำสั่งตรวจสอบสถานะ (Health & Diagnostics)

- **ทดสอบ API Health Check**:
  ```bash
  curl http://127.0.0.1:3000/health
  # ผลลัพธ์: {"status":"ok","timestamp":"...","environment":"production"}
  ```
- **ดูการใช้ RAM / CPU ของ Container**:
  ```bash
  docker stats car_parts_api
  ```
- **ดู Log การทำงานแบบ Real-time**:
  ```bash
  docker logs -f car_parts_api
  # หรือหากใช้ PM2: pm2 logs car-parts-api
  ```

### จุดเด่นด้าน Resource Optimization ที่ทำไว้:
1. **Graceful Shutdown**: รองรับคำสั่ง `SIGINT` และ `SIGTERM` เมื่อสั่งรีสตาร์ตเซิร์ฟเวอร์ Node จะปิด Fastify และคืน Connection ของ PostgreSQL ทันที ป้องกันปัญหา Connection รั่วไหล (Connection Leak)
2. **Bounded In-memory Cache**: ตัวเก็บ OTP มีระบบตัดทิ้งอัตโนมัติเมื่อขนาดเกิน 5,000 รายการ ป้องกันหน่วยความจำเซิร์ฟเวอร์เต็ม (Out-Of-Memory)
3. **Vite Code Splitting**: แยก `admin-bundle` (590 kB) ออกจาก `storefront-bundle` (71 kB gzipped) ผู้ใช้ทั่วไปจะดาวน์โหลดเฉพาะไฟล์ที่จำเป็น โหลดเร็ว ลื่นไหล และประหยัด Bandwidth

---

## 5. ข้อมูลเริ่มต้นสำหรับการเข้าสู่ระบบ

- **URL หน้าบ้าน**: `https://market.autocentric.net/`
- **URL หน้าหลังบ้าน (Admin)**: `https://market.autocentric.net/admin`
- **บัญชีเริ่มต้นสำหรับ SuperAdmin**:
  - **Email**: `admin@mobex.co.th`
  - **Password**: `admin123`
