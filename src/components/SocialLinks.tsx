import React from 'react';

export const SOCIAL_LINKS = {
  whatsapp: {
    name: 'الواتساب',
    number: '0646662690',
    url: 'https://wa.me/212646662690',
    color: '#25D366',
    bgHover: 'hover:bg-emerald-50 hover:text-emerald-600 border-emerald-200'
  },
  instagram: {
    name: 'الانستغرام',
    handle: '@prof_histoire_geographie',
    url: 'https://www.instagram.com/prof_histoire_geographie?igsh=ZjFuMmFlZXZjM21w&utm_source=qr',
    color: '#E4405F',
    bgHover: 'hover:bg-pink-50 hover:text-pink-600 border-pink-200'
  },
  youtube: {
    name: 'اليوتيوب',
    handle: '@prof.History.Geography',
    url: 'https://www.youtube.com/@prof.History.Geography',
    color: '#FF0000',
    bgHover: 'hover:bg-red-50 hover:text-red-600 border-red-200'
  }
};

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.763.459 3.483 1.332 5.001l-1.417 5.176 5.298-1.389c1.463.798 3.111 1.218 4.773 1.219h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.175-2.925-7.063a9.922 9.922 0 0 0-7.064-2.943zm0 1.667c4.587 0 8.32 3.733 8.322 8.318 0 2.227-.867 4.32-2.443 5.898-1.577 1.578-3.67 2.446-5.897 2.446h-.003c-1.442 0-2.86-.381-4.102-1.101l-.294-.173-3.053.801.815-2.977-.19-.302a8.277 8.277 0 0 1-1.267-4.391c.002-4.584 3.736-8.32 8.32-8.32zm-3.6 4.331c-.198 0-.521.074-.794.372-.272.298-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.471-.149-.67.149-.198.298-.768.967-.942 1.165-.173.198-.347.223-.645.074-.298-.149-1.258-.464-2.398-1.48-0.887-.792-1.486-1.77-1.66-2.068-.173-.298-.018-.459.13-.607.134-.133.298-.347.447-.521.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.074-.149-.67-1.613-.918-2.208-.241-.58-.487-.501-.67-.51-.173-.008-.372-.01-.57-.01z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/** Compact Social Bar for Navigation Header */
export const HeaderSocialLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-slate-200">
      <a
        href={SOCIAL_LINKS.whatsapp.url}
        target="_blank"
        rel="noopener noreferrer"
        title="تواصل عبر الواتساب: 0646662690"
        className="p-1.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center"
      >
        <WhatsAppIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </a>
      <a
        href={SOCIAL_LINKS.instagram.url}
        target="_blank"
        rel="noopener noreferrer"
        title="تابعنا على الانستغرام"
        className="p-1.5 rounded-xl text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center"
      >
        <InstagramIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </a>
      <a
        href={SOCIAL_LINKS.youtube.url}
        target="_blank"
        rel="noopener noreferrer"
        title="قناتنا على اليوتيوب"
        className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
      >
        <YouTubeIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </a>
    </div>
  );
};

/** Full Detailed Social Cards for Footer */
export const FooterSocialSection: React.FC = () => {
  return (
    <div className="space-y-3 pt-4 border-t border-slate-100 max-w-2xl mx-auto">
      <p className="text-xs font-bold text-slate-700">تواصل معنا وتابع جديد المنصة على وسائل التواصل الاجتماعي:</p>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <a
          href={SOCIAL_LINKS.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-xs"
        >
          <WhatsAppIcon className="w-4 h-4" />
          <span>الواتساب: {SOCIAL_LINKS.whatsapp.number}</span>
        </a>

        <a
          href={SOCIAL_LINKS.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-pink-50 text-pink-800 border border-pink-200 rounded-xl text-xs font-bold hover:bg-pink-600 hover:text-white transition-all shadow-xs"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>الانستغرام</span>
        </a>

        <a
          href={SOCIAL_LINKS.youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-xs"
        >
          <YouTubeIcon className="w-4 h-4" />
          <span>قناة اليوتيوب</span>
        </a>
      </div>
    </div>
  );
};

/** Contact Section for Modals / Cards */
export const ContactSocialBlock: React.FC = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
      <span className="text-xs font-bold text-slate-800 block">للتواصل المباشر وطلب كود التفعيل:</span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <a
          href={SOCIAL_LINKS.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-xs"
        >
          <WhatsAppIcon className="w-4 h-4" />
          <span>0646662690</span>
        </a>

        <a
          href={SOCIAL_LINKS.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-xs"
        >
          <InstagramIcon className="w-4 h-4" />
          <span>الانستغرام</span>
        </a>

        <a
          href={SOCIAL_LINKS.youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-xs"
        >
          <YouTubeIcon className="w-4 h-4" />
          <span>اليوتيوب</span>
        </a>
      </div>
    </div>
  );
};
