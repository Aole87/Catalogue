"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleRoutes = articleRoutes;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Initial mock articles fallback for seeded demonstration
const initialArticles = [
    {
        id: 'art-1',
        titleTh: 'Logitech MX Master 3S สำหรับโต๊ะทำงานและเวิร์กสเตชัน',
        titleEn: 'Logitech MX Master 3S Desk Workstation Setup Guide',
        slug: 'logitech-mx-master-3s-setup',
        contentTh: 'แนะนำการตั้งค่าอุปกรณ์และคีย์บอร์ด เมาส์ Ergonomics เพื่อเพิ่มประสิทธิภาพการทำงานสูงสุด',
        contentEn: 'Comprehensive guide to configuring ergonomic desk workstation peripherals for maximum productivity.',
        coverImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
        category: 'Hardware',
        published: true,
        author: 'MOBEX Tech Team',
        views: 1420,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'art-2',
        titleTh: 'AirPods Max และแท่นชาร์จแม่เหล็ก Qi2 ล่าสุด',
        titleEn: 'AirPods Max and 100+ Magnetic Qi Charging Stands Compared',
        slug: 'airpods-max-qi2-charging-guide',
        contentTh: 'เปรียบเทียบแท่นชาร์จไร้สายแม่เหล็กมาตรฐาน Qi2 ที่รองรับสมาร์ตโฟนและหูฟังไร้สาย',
        contentEn: 'In-depth review of Qi2 magnetic wireless charging stands for flagship smartphones and headphones.',
        coverImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80',
        category: 'Reviews',
        published: true,
        author: 'Catalog Editor',
        views: 980,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'art-3',
        titleTh: 'เลือก USB-C Multiport Dock สำหรับแล็ปท็อปประสิทธิภาพสูง',
        titleEn: 'What USB-C Multiport Dock Is Ideal For Pro Laptops',
        slug: 'usb-c-multiport-dock-selection-guide',
        contentTh: 'เจาะลึกพอร์ตเชื่อมต่อ Thunderbolt 4 และ USB4 พร้อมระบบจ่ายไฟ PD 100W+',
        contentEn: 'Technical breakdown of Thunderbolt 4 and USB4 multiport docks with high power delivery.',
        coverImage: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600&q=80',
        category: 'Guides',
        published: true,
        author: 'Tech Specialist',
        views: 2150,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'art-4',
        titleTh: 'คู่มือเลือกซื้อผ้าเบรกเซรามิก Brembo ตรงรุ่นกับจานเบรกขยาย',
        titleEn: 'Brembo Ceramic Brake Pad & Rotors Fitment Guide',
        slug: 'brembo-ceramic-brake-pad-guide',
        contentTh: 'วิธีตรวจสอบเบอร์ผ้าเบรกและจานเบรกตรงรุ่นด้วย Vehicle Hierarchy เพื่อการเบรกที่นุ่มนวลและปลอดภัย',
        contentEn: 'Step-by-step fitment mapping for Brembo performance braking systems using vehicle hierarchy.',
        coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        category: 'Auto Parts',
        published: true,
        author: 'Engineering Team',
        views: 3410,
        createdAt: new Date().toISOString(),
    },
];
let inMemoryArticles = [...initialArticles];
async function articleRoutes(fastify) {
    // GET /api/v1/articles - List published articles
    fastify.get('/api/v1/articles', async (req, reply) => {
        try {
            const articles = await prisma.article.findMany({
                orderBy: { createdAt: 'desc' },
            });
            if (articles && articles.length > 0) {
                return reply.send({ success: true, articles });
            }
        }
        catch (e) {
            // Fallback to in-memory store if DB table not yet migrated
        }
        return reply.send({ success: true, articles: inMemoryArticles });
    });
    // GET /api/v1/articles/:id - Get single article
    fastify.get('/api/v1/articles/:id', async (req, reply) => {
        const { id } = req.params;
        try {
            const article = await prisma.article.findUnique({ where: { id } });
            if (article)
                return reply.send({ success: true, article });
        }
        catch (e) { }
        const found = inMemoryArticles.find((a) => a.id === id || a.slug === id);
        if (!found)
            return reply.status(404).send({ success: false, message: 'Article not found' });
        return reply.send({ success: true, article: found });
    });
    // POST /api/v1/articles - Admin create article
    fastify.post('/api/v1/articles', async (req, reply) => {
        const body = req.body;
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
        }
        catch (e) {
            inMemoryArticles.unshift(newArticle);
            return reply.send({ success: true, article: newArticle });
        }
    });
    // PUT /api/v1/articles/:id - Admin update article
    fastify.put('/api/v1/articles/:id', async (req, reply) => {
        const { id } = req.params;
        const body = req.body;
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
        }
        catch (e) {
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
        const { id } = req.params;
        try {
            await prisma.article.delete({ where: { id } });
        }
        catch (e) {
            inMemoryArticles = inMemoryArticles.filter((a) => a.id !== id);
        }
        return reply.send({ success: true, message: 'Article deleted successfully' });
    });
}
exports.default = articleRoutes;
//# sourceMappingURL=article.routes.js.map