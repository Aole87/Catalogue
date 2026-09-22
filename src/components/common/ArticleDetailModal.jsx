import React from 'react';
import { X, Calendar, User, Eye, Tag, Share2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ArticleDetailModal({ article, isOpen, onClose }) {
  const { lang } = useLanguage();

  if (!isOpen || !article) return null;

  const title = lang === 'en' ? (article.titleEn || article.titleTh) : (article.titleTh || article.titleEn);
  const content = lang === 'en' ? (article.contentEn || article.contentTh) : (article.contentTh || article.contentEn);
  const formattedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : (lang === 'en' ? 'Recent' : 'ล่าสุด');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert(lang === 'en' ? 'Link copied to clipboard!' : 'คัดลอกลิงก์บทความเรียบร้อยแล้ว!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'en' ? 'Back' : 'กลับ'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Article Cover Image */}
          {article.coverImage && (
            <div className="w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden shadow-md relative bg-slate-100">
              <img
                src={article.coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#2563eb] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                {article.category || (lang === 'en' ? 'Article' : 'บทความ')}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 font-semibold border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>{article.author || 'MOBEX Editorial'}</span>
            </div>
            {article.views !== undefined && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{article.views} {lang === 'en' ? 'views' : 'ครั้ง'}</span>
                </div>
              </>
            )}
          </div>

          {/* Article Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {title}
          </h1>

          {/* Article Content */}
          <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 font-sans whitespace-pre-line">
            {content || (
              <p className="text-slate-400 italic">
                {lang === 'en' ? 'No content details available.' : 'ไม่มีเนื้อหารายละเอียด'}
              </p>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-bold">
            MOBEX Knowledge & Auto Tips
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#0c3175] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            {lang === 'en' ? 'Close' : 'ปิดหน้าต่าง'}
          </button>
        </div>
      </div>
    </div>
  );
}
