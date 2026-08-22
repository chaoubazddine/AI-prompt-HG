import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Key, 
  BarChart3, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Sparkles, 
  FileText, 
  ClipboardCheck, 
  FileCheck2, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  Copy, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  ChevronDown,
  Layers,
  Award,
  Zap,
  TrendingUp,
  UserCheck,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  codes: any[];
  allJadhas?: any[];
  currentUserEmail?: string | null;
}

const TIER_NAMES: Record<string, string> = {
  free: 'دخول مجاني (5)',
  basic: 'باقة الأستاذ (الأساسية - 30)',
  semester: 'اشتراك الدورة (الأسدس - 60)',
  advanced: 'اشتراك الدورة (الأسدس - 60)',
  unlimited: 'الأستاذ المتميز (VIP غير محدود)'
};

const TIER_LIMITS: Record<string, number> = {
  free: 5,
  basic: 30,
  semester: 60,
  advanced: 60,
  unlimited: 9999
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  basic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  semester: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  advanced: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  unlimited: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  users = [],
  codes = [],
  allJadhas = [],
  currentUserEmail
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'codes' | 'stats'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'usage' | 'downloads' | 'recent' | 'name'>('usage');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Selected user for detail modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // New Code Generation State
  const [newCodeTier, setNewCodeTier] = useState<'basic' | 'semester' | 'unlimited'>('unlimited');
  const [customCodePrefix, setCustomCodePrefix] = useState('');

  if (!isOpen) return null;

  // Format Dates
  const formatDate = (val: any) => {
    if (!val) return 'غير متوفر';
    let ms = 0;
    if (typeof val?.toMillis === 'function') ms = val.toMillis();
    else if (typeof val?.toDate === 'function') ms = val.toDate().getTime();
    else if (val?.seconds) ms = val.seconds * 1000;
    else if (typeof val === 'number') ms = val;
    else if (typeof val === 'string') ms = new Date(val).getTime();

    if (!ms || isNaN(ms)) return 'غير متوفر';

    return new Date(ms).toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (val: any) => {
    if (!val) return 'لا يوجد نشاط مسجل';
    let ms = 0;
    if (typeof val?.toMillis === 'function') ms = val.toMillis();
    else if (typeof val?.toDate === 'function') ms = val.toDate().getTime();
    else if (val?.seconds) ms = val.seconds * 1000;
    else if (typeof val === 'number') ms = val;
    else if (typeof val === 'string') ms = new Date(val).getTime();

    if (!ms || isNaN(ms)) return 'لا يوجد نشاط';

    const diffSec = Math.floor((Date.now() - ms) / 1000);
    if (diffSec < 60) return 'الآن';
    if (diffSec < 3600) return `منذ ${Math.floor(diffSec / 60)} دقيقة`;
    if (diffSec < 86400) return `منذ ${Math.floor(diffSec / 3600)} ساعة`;
    if (diffSec < 604800) return `منذ ${Math.floor(diffSec / 86400)} يوم`;
    return new Date(ms).toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' });
  };

  // Helper to extract total usage for a user
  const getUserTotalUsage = (u: any): number => {
    if (typeof u?.usageCount === 'number') return u.usageCount;
    // Fallback: sum of toolsUsage or downloadCount
    const tools = (u && typeof u.toolsUsage === 'object' && u.toolsUsage !== null) ? u.toolsUsage : {};
    let sum = 0;
    for (const key of Object.keys(tools)) {
      const val = tools[key];
      if (typeof val === 'number') sum += val;
    }
    const downloads = typeof u?.downloadCount === 'number' ? u.downloadCount : 0;
    return Math.max(sum, downloads);
  };

  // Calculate Aggregated Metrics
  const totalUsersCount = users.length;
  const totalPlatformUsage = users.reduce((acc, u) => acc + getUserTotalUsage(u), 0);
  const totalPlatformDownloads = users.reduce((acc, u) => acc + (u?.downloadCount || 0), 0);
  const premiumUsersCount = users.filter(u => u?.subscriptionTier && u.subscriptionTier !== 'free').length;

  // Filter and Sort Users
  const filteredUsers = users
    .filter(u => {
      const name = (u?.displayName || u?.profInfo?.name || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const school = (u?.profInfo?.school || u?.profInfo?.directorate || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || name.includes(term) || email.includes(term) || school.includes(term);
      const matchesTier = tierFilter === 'all' || u?.subscriptionTier === tierFilter;

      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'usage') {
        const usageA = getUserTotalUsage(a);
        const usageB = getUserTotalUsage(b);
        comparison = usageB - usageA;
      } else if (sortBy === 'downloads') {
        comparison = (b?.downloadCount || 0) - (a?.downloadCount || 0);
      } else if (sortBy === 'name') {
        const nameA = a?.displayName || a?.profInfo?.name || a?.email || '';
        const nameB = b?.displayName || b?.profInfo?.name || b?.email || '';
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'recent') {
        const getMs = (u: any) => {
          const val = u?.lastActiveAt || u?.createdAt;
          if (!val) return 0;
          if (typeof val?.toMillis === 'function') return val.toMillis();
          if (typeof val?.toDate === 'function') return val.toDate().getTime();
          if (val?.seconds) return val.seconds * 1000;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return new Date(val).getTime() || 0;
          return 0;
        };
        comparison = getMs(b) - getMs(a);
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

  // Action: Update User Subscription Tier
  const handleUpdateUserTier = async (userId: string, newTier: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscriptionTier: newTier,
        updatedAt: serverTimestamp()
      });
      toast.success(`تم تحديث باقة الأستاذ بنجاح إلى: ${TIER_NAMES[newTier] || newTier}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      toast.error('فشل تحديث باقة الأستاذ');
    }
  };

  // Action: Reset or set user download count
  const handleSetUserDownloadCount = async (userId: string, count: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        downloadCount: Math.max(0, count),
        updatedAt: serverTimestamp()
      });
      toast.success(`تم تعديل رصيد التحميلات إلى ${count}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      toast.error('فشل تعديل رصيد التحميلات');
    }
  };

  // Action: Generate New Code
  const handleGenerateCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = customCodePrefix.trim().toUpperCase() || 'JADHA';
    const code = `${prefix}-${randomPart}`;

    try {
      await setDoc(doc(db, 'activationCodes', code), {
        isValid: true,
        tier: newCodeTier,
        createdAt: serverTimestamp(),
        createdBy: currentUserEmail || 'Admin',
        description: `كود تفعيل باقة ${TIER_NAMES[newCodeTier]}`
      });
      setCustomCodePrefix('');
      toast.success(`تم توليد كود التفعيل: ${code}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'activationCodes');
      toast.error('فشل توليد كود التفعيل');
    }
  };

  // Action: Delete Code
  const handleDeleteCode = async (codeId: string) => {
    try {
      await deleteDoc(doc(db, 'activationCodes', codeId));
      toast.success('تم حذف الكود بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'activationCodes');
      toast.error('فشل حذف الكود');
    }
  };

  // Action: Copy text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة بنجاح');
  };

  // Action: Export CSV of users and their usage statistics
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.warning('لا توجد بيانات لتصديرها');
      return;
    }

    const headers = [
      'الترتيب',
      'الاسم الكامل',
      'البريد الإلكتروني',
      'المؤسسة',
      'المديرية',
      'نوع الباقة',
      'إجمالي الاستعمالات والتوليدات',
      'عدد التحميلات',
      'جذاذات',
      'تقويم تشخيصي',
      'فروض وامتحانات',
      'ملخصات',
      'مدارس الريادة',
      'تاريخ التسجيل',
      'آخر نشاط'
    ];

    const rows = filteredUsers.map((u, index) => {
      const tools = u?.toolsUsage || {};
      return [
        index + 1,
        `"${u?.displayName || u?.profInfo?.name || 'أستاذ'}"`,
        `"${u?.email || ''}"`,
        `"${u?.profInfo?.school || 'غير محدد'}"`,
        `"${u?.profInfo?.directorate || 'غير محدد'}"`,
        `"${TIER_NAMES[u?.subscriptionTier] || u?.subscriptionTier || 'free'}"`,
        getUserTotalUsage(u),
        u?.downloadCount || 0,
        tools.jadha || 0,
        tools.diagnostic || 0,
        tools.exam || 0,
        tools.summary || 0,
        tools.rayada || 0,
        `"${formatDate(u?.createdAt)}"`,
        `"${formatDate(u?.lastActiveAt)}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `احصائيات_استعمالات_الاساتذة_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير تقرير استعمالات الأساتذة بنجاح بصيغة CSV');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs text-right font-sans" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">لوحة تحكم وإدارة المنصة</h3>
                <span className="bg-indigo-100 text-indigo-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  المسؤول (Admin)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">متابعة إحصائيات واستعمالات الأساتذة وتدبير الرخص والأكواد</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'users' ? 'bg-white shadow-xs text-indigo-700 font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={15} />
                <span>استعمالات الأساتذة ({totalUsersCount})</span>
              </button>

              <button 
                onClick={() => setActiveTab('codes')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'codes' ? 'bg-white shadow-xs text-indigo-700 font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key size={15} />
                <span>أكواد التفعيل ({codes.length})</span>
              </button>

              <button 
                onClick={() => setActiveTab('stats')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'stats' ? 'bg-white shadow-xs text-indigo-700 font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 size={15} />
                <span>المؤشرات والنمو</span>
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Executive Stats Bar */}
        <div className="bg-indigo-900/5 px-4 sm:px-6 py-3 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold">إجمالي الأساتذة</p>
              <p className="text-base font-black text-slate-900">{totalUsersCount} أستاذ(ة)</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold">إجمالي الاستعمالات</p>
              <p className="text-base font-black text-indigo-700">{totalPlatformUsage} عملية</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Download size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold">تحميلات الوثائق</p>
              <p className="text-base font-black text-emerald-700">{totalPlatformDownloads} ملف</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold">الحسابات المفعّلة</p>
              <p className="text-base font-black text-amber-800">{premiumUsersCount} مشترك VIP</p>
            </div>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ======================================================== */}
          {/* TAB 1: TEACHERS & USAGE ANALYTICS TABLE */}
          {/* ======================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search, Filter, and Export Controls Bar */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                
                {/* Search input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الأستاذ، البريد الإلكتروني، المؤسسة، أو المديرية..."
                    className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filters and Sorters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tier filter */}
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                  >
                    <option value="all">كل الباقات ({users.length})</option>
                    <option value="free">المجاني ({users.filter(u => !u.subscriptionTier || u.subscriptionTier === 'free').length})</option>
                    <option value="basic">البسيط ({users.filter(u => u.subscriptionTier === 'basic').length})</option>
                    <option value="advanced">المتقدم ({users.filter(u => u.subscriptionTier === 'advanced').length})</option>
                    <option value="unlimited">غير المحدود ({users.filter(u => u.subscriptionTier === 'unlimited').length})</option>
                  </select>

                  {/* Sort criteria */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                  >
                    <option value="usage">الفرز: الأكثر استعمالاً (الأعلى نشاطاً)</option>
                    <option value="downloads">الفرز: الأكثر تحميلاً للوثائق</option>
                    <option value="recent">الفرز: آخر نشاط أو تسجيل</option>
                    <option value="name">الفرز: الاسم الأبجدي</option>
                  </select>

                  {/* Sort Order Toggle */}
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    title={sortOrder === 'desc' ? 'تنازلي' : 'تصاعدي'}
                  >
                    <ArrowUpDown size={15} />
                  </button>

                  {/* Export CSV Button */}
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <FileSpreadsheet size={14} />
                    <span>تصدير Excel/CSV</span>
                  </button>
                </div>
              </div>

              {/* Users Usage Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100/90 text-slate-700 font-black border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 text-center w-12">#</th>
                        <th className="p-3.5 min-w-[200px]">الأستاذ(ة) والحساب</th>
                        <th className="p-3.5 min-w-[170px]">المؤسسة والمديرية</th>
                        <th className="p-3.5 text-center min-w-[130px]">
                          <span className="inline-flex items-center gap-1 text-indigo-900">
                            <Zap size={13} className="text-amber-500" />
                            <span>عدد الاستعمالات</span>
                          </span>
                        </th>
                        <th className="p-3.5 text-center min-w-[110px]">التحميلات المنفذة</th>
                        <th className="p-3.5 text-center min-w-[180px]">توزيع الاستعمال بالأدوات</th>
                        <th className="p-3.5 text-center min-w-[120px]">آخر نشاط</th>
                        <th className="p-3.5 text-center min-w-[140px]">الباقة الحالية</th>
                        <th className="p-3.5 text-center w-24">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                            <Users size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                            لا توجد نتائج مطابقة لخيارات البحث أو الفلترة
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u, idx) => {
                          const totalUsage = getUserTotalUsage(u);
                          const downloads = u?.downloadCount || 0;
                          const tier = u?.subscriptionTier || 'free';
                          const tierLimit = TIER_LIMITS[tier] || 5;
                          const tierColor = TIER_COLORS[tier] || TIER_COLORS.free;
                          const tools = u?.toolsUsage || {};
                          const userKey = u?.id ? `${u.id}-${idx}` : `user-${idx}`;

                          return (
                            <tr key={userKey} className="hover:bg-indigo-50/30 transition-colors">
                              {/* Index */}
                              <td className="p-3 text-center text-slate-400 font-bold">
                                {idx + 1}
                              </td>

                              {/* Teacher info */}
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black flex items-center justify-center text-xs shrink-0">
                                    {(u?.displayName || u?.profInfo?.name || u?.email || 'أ')[0]?.toUpperCase()}
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="font-black text-slate-900 truncate">
                                      {u?.displayName || u?.profInfo?.name || 'أستاذ(ة)'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-mono truncate">{u?.email}</p>
                                  </div>
                                </div>
                              </td>

                              {/* School & Directorate */}
                              <td className="p-3 text-slate-600">
                                {u?.profInfo?.school ? (
                                  <div>
                                    <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                                      <Building2 size={12} className="text-slate-400 shrink-0" />
                                      <span className="truncate">{u.profInfo.school}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {u.profInfo.directorate || u.profInfo.academy || 'المغرب'}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[11px] italic">لم تُحدد المؤسسة بعد</span>
                                )}
                              </td>

                              {/* Usage Count (Highlight KPI) */}
                              <td className="p-3 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-xs rounded-xl border border-indigo-200/80 shadow-2xs">
                                    {totalUsage} استعمال
                                  </span>
                                  {u?.lastAction && (
                                    <span className="text-[10px] text-slate-400 max-w-[130px] truncate mt-0.5" title={u.lastAction}>
                                      {u.lastAction}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Downloads with limit */}
                              <td className="p-3 text-center">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-800 text-xs">
                                    {downloads} {tier === 'unlimited' ? '/ ∞' : `/ ${tierLimit}`}
                                  </span>
                                  {tier !== 'unlimited' && (
                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${downloads >= tierLimit ? 'bg-red-500' : 'bg-indigo-600'}`}
                                        style={{ width: `${Math.min(100, (downloads / tierLimit) * 100)}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Usage Breakdown by Tools */}
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100" title="جذاذات ديداكتيكية">
                                    جذاذة: {tools.jadha || (totalUsage > 0 && !tools.diagnostic && !tools.exam ? totalUsage : 0)}
                                  </span>
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100" title="تقويم تشخيصي ودعم">
                                    تشخيص: {tools.diagnostic || 0}
                                  </span>
                                  <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-100" title="فروض وامتحانات">
                                    فروض: {tools.exam || 0}
                                  </span>
                                  {(tools.summary > 0 || tools.rayada > 0) && (
                                    <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-100" title="ملخصات وريادة">
                                      أخرى: {(tools.summary || 0) + (tools.rayada || 0)}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Last active date */}
                              <td className="p-3 text-center">
                                <p className="font-bold text-slate-700 text-[11px]">{getTimeAgo(u?.lastActiveAt || u?.createdAt)}</p>
                                <p className="text-[10px] text-slate-400">{formatDate(u?.lastActiveAt || u?.createdAt).split(',')[0]}</p>
                              </td>

                              {/* Subscription Tier selector */}
                              <td className="p-3 text-center">
                                <select
                                  value={tier}
                                  onChange={(e) => handleUpdateUserTier(u.id, e.target.value)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black border cursor-pointer outline-hidden transition-all ${tierColor.bg} ${tierColor.text} ${tierColor.border}`}
                                >
                                  <option value="free">مجاني (5)</option>
                                  <option value="basic">أساسي (30)</option>
                                  <option value="semester">الدورة (60)</option>
                                  <option value="unlimited">VIP غير محدود</option>
                                </select>
                              </td>

                              {/* Actions Button */}
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  className="p-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl transition-colors font-bold text-xs"
                                  title="عرض تفاصيل الأستاذ وسجل استعمالاته"
                                >
                                  تفاصيل
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer info */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between font-medium">
                  <span>عرض {filteredUsers.length} من أصل {users.length} أستاذ(ة)</span>
                  <span>متوسط الاستعمال لكل أستاذ: {(totalPlatformUsage / (users.length || 1)).toFixed(1)} عملية</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ACTIVATION CODES GENERATION & MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'codes' && (
            <div className="space-y-4">
              {/* Code Generator Box */}
              <div className="bg-indigo-50/80 p-5 rounded-3xl border border-indigo-100 space-y-4">
                <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                  <Key size={18} className="text-indigo-600" />
                  <span>توليد كود تفعيل جديد للحسابات</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  {/* Select Tier */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الباقة المستهدفة:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['basic', 'semester', 'unlimited'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewCodeTier(t)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                            newCodeTier === t 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {t === 'basic' ? 'أساسي (30)' : t === 'semester' ? 'الدورة (60)' : 'VIP غير محدود'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prefix (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">بادئة الكود (اختياري):</label>
                    <input
                      type="text"
                      placeholder="مثال: PROF أو JADHA"
                      value={customCodePrefix}
                      onChange={(e) => setCustomCodePrefix(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* Generate Button */}
                  <div>
                    <button
                      onClick={handleGenerateCode}
                      className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                    >
                      <Sparkles size={16} />
                      <span>توليد وحفظ الكود فوراً</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Codes List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-700">قائمة الأكواد المولدة ({codes.length}):</h4>
                {codes.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-bold">
                    لا توجد أكواد مولدة حالياً. قم بتوليد أول كود من الأعلى.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {codes.map((code, cIdx) => {
                      const tier = code.tier || 'unlimited';
                      const tierColor = TIER_COLORS[tier] || TIER_COLORS.unlimited;
                      const codeKey = code.id ? `${code.id}-${cIdx}` : `code-${cIdx}`;

                      return (
                        <div 
                          key={codeKey} 
                          className="p-3.5 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <code className="font-mono font-black text-indigo-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                              {code.id}
                            </code>
                            <div>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${tierColor.bg} ${tierColor.text}`}>
                                {TIER_NAMES[tier]}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(code.createdAt)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => copyToClipboard(code.id)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition-colors"
                              title="نسخ الكود"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCode(code.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                              title="حذف الكود"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PLATFORM OVERVIEW & STATS */}
          {/* ======================================================== */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-500">توزيع الاشتراكات</p>
                  <div className="space-y-1.5 text-xs font-bold">
                    <div className="flex justify-between">
                      <span className="text-slate-600">مجاني:</span>
                      <strong className="text-slate-900">{users.filter(u => !u.subscriptionTier || u.subscriptionTier === 'free').length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">بسيط (10):</span>
                      <strong className="text-blue-700">{users.filter(u => u.subscriptionTier === 'basic').length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">متقدم (25):</span>
                      <strong className="text-purple-700">{users.filter(u => u.subscriptionTier === 'advanced').length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">غير محدود (VIP):</span>
                      <strong className="text-amber-700">{users.filter(u => u.subscriptionTier === 'unlimited').length}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-500">أكثر 3 أساتذة نشاطاً في المنصة</p>
                  <div className="space-y-1.5 text-xs">
                    {users
                      .slice()
                      .sort((a, b) => getUserTotalUsage(b) - getUserTotalUsage(a))
                      .slice(0, 3)
                      .map((topUser, i) => (
                        <div key={topUser.id ? `${topUser.id}-${i}` : `top-${i}`} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 truncate max-w-[140px]">
                            {i + 1}. {topUser.displayName || topUser.profInfo?.name || topUser.email}
                          </span>
                          <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                            {getUserTotalUsage(topUser)} عملية
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-500">أهم أدوات المنصة استعمالاً</p>
                  <div className="space-y-1.5 text-xs font-bold">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">توليد الجذاذات الديداكتيكية:</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">الأعلى طلباً</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">التقويم التشخيصي والدعم:</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">مستجد</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">الفروض والامتحانات المحروسة:</span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">مطلوب</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>المنظومة الإدارية لمنصة الاجتماعيات الذكية • 2026</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            إغلاق لوحة التحكم
          </button>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* TEACHER DETAIL MODAL / DRAWER */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedUser && (
          <div key="admin-user-detail-backdrop" className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              key="admin-user-detail-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-right border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {selectedUser.displayName || selectedUser.profInfo?.name || 'الأستاذ(ة)'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Usage stats breakdown card */}
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">إجمالي عدد الاستعمالات:</span>
                  <span className="text-base font-black text-indigo-700 bg-white px-3 py-0.5 rounded-xl shadow-2xs border border-indigo-100">
                    {getUserTotalUsage(selectedUser)} عملية
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/70">
                    <p className="text-slate-400 text-[10px]">التحميلات المنفذة</p>
                    <p className="font-black text-slate-800 text-sm mt-0.5">{selectedUser.downloadCount || 0} ملف</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100/70">
                    <p className="text-slate-400 text-[10px]">تاريخ الانضمام</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{formatDate(selectedUser.createdAt).split(',')[0]}</p>
                  </div>
                </div>
              </div>

              {/* Institution details */}
              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-slate-700">بيانات المؤسسة والتدريس:</h5>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                  <p><span className="text-slate-400">المؤسسة:</span> <strong className="text-slate-800">{selectedUser.profInfo?.school || 'غير محددة'}</strong></p>
                  <p><span className="text-slate-400">المديرية الإقليمية:</span> <strong className="text-slate-800">{selectedUser.profInfo?.directorate || 'غير محددة'}</strong></p>
                  <p><span className="text-slate-400">الأكاديمية الجهوية:</span> <strong className="text-slate-800">{selectedUser.profInfo?.academy || 'غير محددة'}</strong></p>
                </div>
              </div>

              {/* Quick Manage Actions */}
              <div className="space-y-2 text-xs pt-1">
                <h5 className="font-bold text-slate-700">إجراءات سريعة على الحساب:</h5>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleUpdateUserTier(selectedUser.id, 'unlimited');
                      setSelectedUser({ ...selectedUser, subscriptionTier: 'unlimited' });
                    }}
                    className="flex-1 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Award size={14} />
                    <span>ترقية إلى VIP غير محدود</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSetUserDownloadCount(selectedUser.id, 0);
                      setSelectedUser({ ...selectedUser, downloadCount: 0 });
                    }}
                    className="py-2 px-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    تصفير عداد التحميلات
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  إغلاق البطاقة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
