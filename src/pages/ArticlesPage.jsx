import React, { useState, useEffect } from 'react';
import { FileText, Search, Calendar, Eye, User, ArrowRight, ChevronRight, ArrowLeft } from 'lucide-react';
import ApiClient from '../utils/apiClient';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ArticleDetailModal from '../components/common/ArticleDetailModal';

export default function ArticlesPage({ navigate, user, setUser }) {
  const { lang } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.get('/articles');
        if (res?.articles || res?.data?.articles) {
          setArticles(res.articles || res.data?.articles);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const categories = ['ALL', ...new Set(articles.map((a) => a.category).filter(Boolean))];

  const filteredArticles = articles.filter((a) => {
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const title = (a.titleTh || '') + ' ' + (a.titleEn || '');
    const content = (a.contentTh || '') + ' ' + (a.contentEn || '');
    const matchesSearch =
      !searchQuery.trim() ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <button
            onClick={() => navigate?.('home')}
            className="hover:text-[#0c3175] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Home' : 'หน้าหลัก'}</span>
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">
            {lang === 'en' ? 'News & Articles' : 'ข่าวสาร & บทความ'}
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0c3175] via-[#103d8f] to-[#040e1f] rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-[#f97316] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 shadow-xs">
              MOBEX Knowledge Base
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight">
              {lang === 'en' ? 'Automotive News & Technical Articles' : 'ศูนย์รวมข่าวสาร อะไหล่ และเทคนิคการดูแลรถยนต์'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              {lang === 'en'
                ? 'Stay up-to-date with maintenance tips, OEM fitment guides, and special promotional offers from MOBEX engineers.'
                : 'อัปเดตความรู้ เทคนิคการเลือกใช้อะไหล่ตรงรุ่น วิธีการบำรุงรักษารถยนต์ และโปรโมชันพิเศษจากทีมงานผู้เชี่ยวชาญ'}
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0c3175] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'ALL' ? (lang === 'en' ? 'All Categories' : 'ทั้งหมด') : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search articles...' : 'ค้นหาบทความ...'}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-800 outline-none focus:border-[#0c3175] shadow-xs"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 border border-slate-100 p-4"></div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">
              {lang === 'en' ? 'No articles found' : 'ไม่พบบทความที่ค้นหา'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Try adjusting your search query or filter category.' : 'กรุณาลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const title = lang === 'en' ? (article.titleEn || article.titleTh) : (article.titleTh || article.titleEn);
              const formattedDate = article.createdAt
                ? new Date(article.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              return (
                <article
                  key={article.id}
                  onClick={() => navigate?.('article-detail', { article })}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                >
                  <div className="w-full aspect-[16/9] overflow-hidden relative bg-slate-100">
                    <img
                      src={
                        article.coverImage ||
                        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'
                      }
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-[#2563eb] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded shadow-sm">
                      {article.category || 'Article'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formattedDate}</span>
                    </div>

                    <h2 className="font-black text-sm sm:text-base text-[#0c1a38] group-hover:text-[#2563eb] transition-colors mb-2 leading-snug line-clamp-2">
                      {title}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {lang === 'en' ? article.contentEn : article.contentTh}
                    </p>

                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        {lang === 'en' ? 'MOBEX Team' : 'ทีมงาน MOBEX'}
                      </span>
                      <span className="text-xs font-bold text-[#0c3175] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>{lang === 'en' ? 'Read More' : 'อ่านต่อ'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
