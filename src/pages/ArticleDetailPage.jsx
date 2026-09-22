import React, { useState, useEffect } from 'react';
import {
  Calendar, Eye, User, Share2, ArrowLeft, Clock, Tag,
  ChevronRight, Check, BookOpen, MessageSquare, Flame, Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';
import ApiClient from '../utils/apiClient';

export default function ArticleDetailPage({ article: initialArticle, navigate, user, setUser }) {
  const { t, lang } = useLanguage();
  const [article, setArticle] = useState(initialArticle || null);
  const [loading, setLoading] = useState(!initialArticle);
  const [copied, setCopied] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);

  // Fetch article if only ID provided or reload fresh data
  useEffect(() => {
    let mounted = true;
    const loadArticle = async () => {
      if (!initialArticle?.id && !initialArticle?.slug) return;
      try {
        const id = initialArticle.id || initialArticle.slug;
        const res = await ApiClient.get(`/articles/${id}`);
        if (mounted && res?.data) {
          setArticle(res.data);
        }
      } catch (e) {
        // Fallback to initialArticle
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadArticle();

    // Fetch related articles
    const loadRelated = async () => {
      try {
        const res = await ApiClient.get('/articles?limit=4');
        if (mounted && res?.data) {
          setRelatedArticles(res.data.filter(a => a.id !== initialArticle?.id).slice(0, 3));
        }
      } catch (e) {
        // Ignored
      }
    };
    loadRelated();

    return () => { mounted = false; };
  }, [initialArticle]);

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Navbar navigate={navigate} user={user} setUser={setUser} />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">ไม่พบบทความที่ต้องการ</h2>
          <p className="text-xs text-slate-500">บทความนี้อาจถูกลบหรือย้ายที่อยู่แล้ว</p>
          <button
            onClick={() => navigate('articles')}
            className="px-5 py-2.5 bg-[#0c3175] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            ย้อนกลับไปยังหน้ารวมบทความ
          </button>
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  const title = lang === 'en' ? (article.titleEn || article.titleTh) : (article.titleTh || article.titleEn);
  const content = lang === 'en' ? (article.contentEn || article.contentTh) : (article.contentTh || article.contentEn);
  const category = article.category || (lang === 'en' ? 'Automotive Knowledge' : 'ความรู้เรื่องรถ');
  const author = article.author || 'ฝ่ายเทคนิคและอะไหล่ โมเบ็กซ์';
  const views = article.viewCount || 854;
  const dateFormatted = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('th-TH');

  const coverImg = article.coverImage || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&q=80';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#0c3175] selection:text-white">
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      {/* Breadcrumbs & Back Bar */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 truncate">
            <button onClick={() => navigate('home')} className="hover:text-[#0c3175] transition-colors">
              {t('home') || 'หน้าแรก'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button onClick={() => navigate('articles')} className="hover:text-[#0c3175] transition-colors">
              {lang === 'th' ? 'ข่าวสารและบทความ' : 'Articles & News'}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>

          <button
            onClick={() => navigate('articles')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0c3175] hover:text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'th' ? 'บทความทั้งหมด' : 'All Articles'}</span>
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 space-y-8">
        
        {/* Article Header */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              {category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {dateFormatted}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {lang === 'th' ? 'เวลาอ่านประมาณ 3 นาที' : '3 min read'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Eye className="w-3.5 h-3.5" />
              {views.toLocaleString()} {lang === 'th' ? 'ครั้ง' : 'views'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {title}
          </h1>

          {/* Author Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0c3175] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                M
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">{author}</div>
                <div className="text-[11px] text-slate-400">{lang === 'th' ? 'ผู้เชี่ยวชาญด้านอะไหล่และวิศวกรรมยานยนต์' : 'Automotive Parts Specialist'}</div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'th' ? 'คัดลอกลิงก์แล้ว!' : 'Copied!') : (lang === 'th' ? 'แชร์บทความ' : 'Share')}</span>
            </button>
          </div>
        </div>

        {/* Featured Cover Image */}
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
          <img
            src={coverImg}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <article className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
          {/* Formatted Content Paragraphs */}
          <div className="prose max-w-none space-y-4">
            {content.split('\n\n').map((paragraph, pIdx) => (
              <p key={pIdx} className="text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Expert Tip Box */}
          <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-5 space-y-2 text-xs sm:text-sm text-blue-950">
            <div className="font-bold flex items-center gap-2 text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{lang === 'th' ? 'คำแนะนำจากช่างเทคนิค MOBEX' : 'Expert Recommendation from MOBEX'}</span>
            </div>
            <p className="text-blue-800 text-xs leading-relaxed">
              {lang === 'th'
                ? 'การเลือกใช้อะไหล่ตรงรุ่นและผ่านการรับรองมาตรฐาน จะช่วยยืดอายุการใช้งานของเครื่องยนต์และระบบส่งกำลังได้อย่างมีประสิทธิภาพสูงสุด สอบถามรหัสอะไหล่กับทีมงานได้ตลอดเวลาทำการ'
                : 'Always choose genuine or certified OEM replacement parts specifically matched to your engine and chassis code for optimal longevity and safety.'}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Tags:</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">#อะไหล่รถยนต์</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">#บำรุงรักษารถ</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">#MOBEX</span>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>{lang === 'th' ? 'บทความที่คุณอาจสนใจ' : 'Related Articles'}</span>
              </h3>
              <button
                onClick={() => navigate('articles')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>{lang === 'th' ? 'ดูทั้งหมด' : 'View All'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => {
                const relTitle = lang === 'en' ? (rel.titleEn || rel.titleTh) : (rel.titleTh || rel.titleEn);
                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setArticle(rel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 mb-3">
                      <img
                        src={rel.coverImage || coverImg}
                        alt={relTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase mb-1">
                      {rel.category || 'Article'}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {relTitle}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
