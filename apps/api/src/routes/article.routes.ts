import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initial mock articles fallback for seeded demonstration
// Initial fallback articles for automotive parts catalog
const initialArticles = [
  {
    id: 'art-1',
    titleTh: 'คู่มือเลือกซื้อผ้าเบรกเซรามิกตรงรุ่นและวิธีตรวจสอบความหนาจานเบรก',
    titleEn: 'Ceramic Brake Pads Selection & Brake Rotor Thickness Inspection Guide',
    slug: 'ceramic-brake-pads-and-rotor-thickness-guide',
    contentTh: 'การเลือกผ้าเบรกให้ตรงกับลักษณะการใช้งานและรุ่นรถเป็นสิ่งสำคัญอย่างยิ่ง สำหรับรถยนต์ใช้งานทั่วไปในเมือง ผ้าเบรกเซรามิก (Ceramic Brake Pads) ให้ประสิทธิภาพการเบรกที่นุ่มนวล เงียบ ไร้เสียงรบกวน และมีปริมาณฝุ่นผงเบรกเกาะล้อน้อยกว่าผ้าเบรกประเภทกึ่งโลหะ (Semi-Metallic) อย่างเห็นได้ชัด นอกจากนี้ควรตรวจเช็กความหนาขั้นต่ำ (Minimum Thickness) ของจานดิสก์เบรกทุกครั้งที่เปลี่ยนผ้าเบรก เพื่อความปลอดภัยสูงสุดในการหยุดรถ',
    contentEn: 'Choosing the correct brake pad formulation for your vehicle and driving conditions is critical for safety. Ceramic brake pads offer smooth deceleration, minimal noise, and low brake dust compared to semi-metallic alternatives. Always inspect rotor minimum thickness when replacing pads to ensure safe braking distances.',
    coverImage: 'https://images.unsplash.com/photo-1600706432502-778e34279b90?w=600&auto=format&fit=crop&q=80',
    category: 'Brake System',
    published: true,
    author: 'MOBEX Technical Specialist',
    views: 1250,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'art-2',
    titleTh: '5 สัญญาณเตือนเมื่อถึงเวลาต้องเปลี่ยนหัวเทียนรถยนต์',
    titleEn: '5 Critical Warning Signs Your Engine Spark Plugs Need Replacement',
    slug: '5-warning-signs-spark-plugs-need-replacement',
    contentTh: 'หัวเทียนเป็นชิ้นส่วนสำคัญในห้องเผาไหม้ของเครื่องยนต์เบนซิน สัญญาณเตือนที่บ่งบอกว่าหัวเทียนเสื่อมสภาพ ได้แก่: 1. เครื่องยนต์สตาร์ทติดยาก โดยเฉพาะช่วงเช้า 2. รอบเดินเบาสั่น กระตุก หรือสะดุด 3. อัตราเร่งอืด ตอบสนองช้าลงเมื่อเหยียบคันเร่ง 4. สิ้นเปลืองน้ำมันเชื้อเพลิงมากกว่าปกติ และ 5. มีไฟรูปเครื่องยนต์ (Check Engine Light) โชว์ที่หน้าปัด แนะนำให้ตรวจเช็กตามรอบทุก 20,000 - 100,000 กม. ขึ้นอยู่กับชนิดหัวเทียน (Standard / Platinum / Iridium)',
    contentEn: 'Spark plugs are vital for combustion efficiency. Key symptoms of worn plugs include rough idling, hard starting, sluggish acceleration, decreased fuel economy, and check engine lights (misfire codes). Iridium plugs typically last up to 100,000 km.',
    coverImage: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop&q=80',
    category: 'Engine & Ignition',
    published: true,
    author: 'MOBEX Technical Specialist',
    views: 2480,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'art-3',
    titleTh: 'เลือกน้ำมันเครื่องสังเคราะห์แท้ 100% เบอร์ความหนืดใดที่เหมาะกับเครื่องยนต์ของคุณ',
    titleEn: 'Fully Synthetic Engine Oil Viscosity Guide: 0W-20 vs 5W-30 vs 0W-40',
    slug: 'fully-synthetic-engine-oil-viscosity-guide',
    contentTh: 'ตัวเลขความหนืด SAE เช่น 0W-20, 5W-30 หรือ 0W-40 มีความหมายต่อการปกป้องเครื่องยนต์อย่างยิ่ง ตัวเลขหน้าตัว W แสดงความสามารถในการไหลเวียนของน้ำมันที่อุณหภูมิต่ำ ขณะที่ตัวเลขด้านหลังแสดงความหนืดของฟิล์มน้ำมันที่อุณหภูมิการทำงานของเครื่องยนต์ (100°C) สำหรับรถยนต์ Eco Car และ Hybrid รุ่นใหม่นิยมใช้ 0W-20 เพื่อลดแรงเสียดทานและประหยัดน้ำมัน ส่วนรถยนต์สมรรถนะสูงหรือเครื่องยนต์ที่มีเลขไมล์สูงแนะนำใช้เบอร์ความหนืดสูงขึ้นเพื่อรักษาแรงดันน้ำมันเครื่อง',
    contentEn: 'Selecting the proper motor oil viscosity is crucial for longevity and performance. Modern eco and hybrid engines thrive on low-viscosity 0W-20 for maximum fuel economy, while high-mileage or turbo engines benefit from higher film strength like 5W-30 or 0W-40.',
    coverImage: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&auto=format&fit=crop&q=80',
    category: 'Lubricants & Fluids',
    published: true,
    author: 'Engineering Team',
    views: 3120,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'art-4',
    titleTh: 'การตรวจเช็กและบำรุงรักษาระบบช่วงล่าง ยางบูช และลูกหมาก เพื่อการควบคุมที่มั่นใจ',
    titleEn: 'Suspension, Bushing & Ball Joint Health Inspection Best Practices',
    slug: 'suspension-bushing-and-ball-joint-maintenance',
    contentTh: 'ระบบช่วงล่างรถยนต์ต้องรับแรงกระแทกจากพื้นผิวถนนตลอดเวลา หากรู้สึกว่าพวงมาลัยสั่น ยางสึกไม่สม่ำเสมอ หรือมีเสียงดังกุกกักเวลาข้ามลูกระนาด อาจเป็นสัญญาณของลูกหมากปีกนก ยางกันโคลง หรือบูชยางเสื่อมสภาพ การตรวจเช็กและเปลี่ยนอะไหล่ช่วงล่างที่ได้มาตรฐานจะช่วยฟื้นฟูเสถียรภาพการควบคุมและการเกาะถนนให้กลับมาสมบูรณ์แบบเหมือนรถใหม่อีกครั้ง',
    contentEn: 'Suspension components absorb relentless road shock. Clunking over bumps, steering wander, and uneven tire wear indicate worn ball joints, control arm bushings, or stabilizer links. Regular inspection maintains driving comfort and handling precision.',
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    category: 'Suspension & Steering',
    published: true,
    author: 'Service Operations',
    views: 1890,
    createdAt: new Date().toISOString(),
  },
];

let inMemoryArticles = [...initialArticles];

export async function articleRoutes(fastify: FastifyInstance) {
  // GET /api/v1/articles - List published articles
  fastify.get('/api/v1/articles', async (req, reply) => {
    try {
      const articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (articles && articles.length > 0) {
        return reply.send({ success: true, articles });
      }
    } catch (e) {
      // Fallback to in-memory store if DB table not yet migrated
    }
    return reply.send({ success: true, articles: inMemoryArticles });
  });

  // GET /api/v1/articles/:id - Get single article
  fastify.get('/api/v1/articles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const article = await prisma.article.findUnique({ where: { id } });
      if (article) return reply.send({ success: true, article });
    } catch (e) {}

    const found = inMemoryArticles.find((a) => a.id === id || a.slug === id);
    if (!found) return reply.status(404).send({ success: false, message: 'Article not found' });
    return reply.send({ success: true, article: found });
  });

  // POST /api/v1/articles - Admin create article
  fastify.post('/api/v1/articles', async (req, reply) => {
    const body = req.body as any;
    const newArticle = {
      id: `art-${Date.now()}`,
      titleTh: body.titleTh || body.title || 'หัวข้อใหม่',
      titleEn: body.titleEn || body.title || 'New Title',
      slug: body.slug || `article-${Date.now()}`,
      contentTh: body.contentTh || body.content || '',
      contentEn: body.contentEn || body.content || '',
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
      category: body.category || 'General',
      published: body.published !== undefined ? body.published : true,
      author: body.author || 'Admin',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const created = await prisma.article.create({
        data: {
          titleTh: newArticle.titleTh,
          titleEn: newArticle.titleEn,
          slug: newArticle.slug,
          contentTh: newArticle.contentTh,
          contentEn: newArticle.contentEn,
          coverImage: newArticle.coverImage,
          category: newArticle.category,
          published: newArticle.published,
          author: newArticle.author,
        },
      });
      return reply.send({ success: true, article: created });
    } catch (e) {
      inMemoryArticles.unshift(newArticle);
      return reply.send({ success: true, article: newArticle });
    }
  });

  // PUT /api/v1/articles/:id - Admin update article
  fastify.put('/api/v1/articles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;

    try {
      const updated = await prisma.article.update({
        where: { id },
        data: {
          titleTh: body.titleTh,
          titleEn: body.titleEn,
          contentTh: body.contentTh,
          contentEn: body.contentEn,
          coverImage: body.coverImage,
          category: body.category,
          published: body.published,
        },
      });
      return reply.send({ success: true, article: updated });
    } catch (e) {
      const idx = inMemoryArticles.findIndex((a) => a.id === id);
      if (idx !== -1) {
        inMemoryArticles[idx] = { ...inMemoryArticles[idx], ...body, updatedAt: new Date().toISOString() };
        return reply.send({ success: true, article: inMemoryArticles[idx] });
      }
      return reply.status(404).send({ success: false, message: 'Article not found' });
    }
  });

  // DELETE /api/v1/articles/:id - Admin delete article
  fastify.delete('/api/v1/articles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await prisma.article.delete({ where: { id } });
    } catch (e) {
      inMemoryArticles = inMemoryArticles.filter((a) => a.id !== id);
    }
    return reply.send({ success: true, message: 'Article deleted successfully' });
  });
}

export default articleRoutes;
