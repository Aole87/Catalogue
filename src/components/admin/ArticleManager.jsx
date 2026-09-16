import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Save,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';

export default function ArticleManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    titleTh: '',
    titleEn: '',
    slug: '',
    category: 'Hardware',
    contentTh: '',
    contentEn: '',
    coverImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
    published: true,
  });

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/articles');
      if (res?.data?.articles || res?.articles) {
        setArticles(res.data?.articles || res.articles);
      }
    } catch (e) {
      console.error('Failed to fetch articles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      titleTh: '',
      titleEn: '',
      slug: `article-${Date.now()}`,
      category: 'Hardware',
      contentTh: '',
      contentEn: '',
      coverImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
      published: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setFormData({
      titleTh: art.titleTh || '',
      titleEn: art.titleEn || '',
      slug: art.slug || '',
      category: art.category || 'General',
      contentTh: art.contentTh || '',
      contentEn: art.contentEn || '',
      coverImage: art.coverImage || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
      published: art.published !== undefined ? art.published : true,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบบทความนี้ใช่หรือไม่?')) return;
    try {
      await ApiClient.delete(`/articles/${id}`);
      fetchArticles();
    } catch (e) {
      alert('ลบบทความไม่สำเร็จ: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await ApiClient.put(`/articles/${editingArticle.id}`, formData);
      } else {
        await ApiClient.post('/articles', formData);
      }
      setIsFormOpen(false);
      fetchArticles();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0d3c90] mb-1">
            <FileText className="w-4 h-4" />
            <span>Article CMS Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            การจัดการบทความ & ข่าวสาร (Articles)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            สร้าง แก้ไข ลบ และเผยแพร่บทความหน้าเว็บไซต์ รองรับระบบ 2 ภาษา (TH / EN)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-6 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างบทความใหม่</span>
        </button>
      </div>

      {/* Article List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-slate-900">
            รายการบทความทั้งหมด ({articles.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">บทความ</th>
                <th className="px-6 py-3.5">หมวดหมู่</th>
                <th className="px-6 py-3.5">ภาษาไทย / English</th>
                <th className="px-6 py-3.5">สถานะ</th>
                <th className="px-6 py-3.5 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={art.coverImage}
                      alt={art.titleTh}
                      className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 line-clamp-1">{art.titleTh}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{art.titleEn}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0d3c90] text-[10px] font-bold">
                      {art.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Globe className="w-3 h-3 text-[#f97316]" />
                      <span>TH & EN Ready</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {art.published ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Published
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="p-1.5 rounded-lg bg-blue-50 text-[#0d3c90] hover:bg-blue-100 transition-colors"
                        title="แก้ไข"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0d3c90]" />
              <span>{editingArticle ? 'แก้ไขบทความ' : 'สร้างบทความใหม่'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หัวข้อบทความ (ภาษาไทย) *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleTh}
                    onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Article Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่บทความ</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                  >
                    <option>Hardware</option>
                    <option>Reviews</option>
                    <option>Guides</option>
                    <option>Auto Parts</option>
                    <option>General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL รูปภาพหน้าปก (Cover Image URL)</label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เนื้อหาบทความ (ภาษาไทย)</label>
                <textarea
                  rows={3}
                  value={formData.contentTh}
                  onChange={(e) => setFormData({ ...formData, contentTh: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Content (English)</label>
                <textarea
                  rows={3}
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-[#0d3c90] rounded"
                />
                <label htmlFor="published" className="font-bold text-slate-700 cursor-pointer">
                  เผยแพร่ทันที (Published)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#0d3c90] hover:bg-[#072a63] text-white font-extrabold shadow-md"
                >
                  บันทึกบทความ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
