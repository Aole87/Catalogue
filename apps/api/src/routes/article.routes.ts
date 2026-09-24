import { FastifyInstance } from 'fastify';
import { prisma } from '@car-parts/database';

// Clean production article store — articles managed via PostgreSQL prisma.article
const initialArticles: any[] = [];

let inMemoryArticles: any[] = [];

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
