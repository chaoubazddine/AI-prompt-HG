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
  FileSpreadsheet,
  Mail,
  Send,
  AlertTriangle,
  MessageSquare,
  Megaphone,
  CheckCircle
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

  // Email Outreach State (Single)
  const [emailModalUser, setEmailModalUser] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplateType, setEmailTemplateType] = useState<'limit_reached' | 'special_offer' | 'vip_invitation' | 'custom'>('limit_reached');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState<string | null>(null);

  // Bulk Email Outreach for Limit-Reached Users
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkAudience, setBulkAudience] = useState<'limit_reached' | 'near_limit'>('limit_reached');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkTemplate, setBulkTemplate] = useState<'limit_reached_support' | 'limit_reached_vip' | 'limit_reached_discount' | 'custom'>('limit_reached_support');
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Track recipients who have received emails in this outreach round to prevent repetition
  const [sentBatchEmails, setSentBatchEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jadha_admin_sent_emails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markEmailsAsSent = (emailsToSend: string[]) => {
    if (!Array.isArray(emailsToSend) || emailsToSend.length === 0) return;
    setSentBatchEmails(prev => {
      const updated = Array.from(new Set([...prev, ...emailsToSend]));
      try {
        localStorage.setItem('jadha_admin_sent_emails', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist sent emails:', e);
      }
      return updated;
    });
  };

  const handleResetBatchCycle = () => {
    setSentBatchEmails([]);
    try {
      localStorage.removeItem('jadha_admin_sent_emails');
    } catch {}
    toast.success('تمت إعادة تعيين دورة الإرسال بنجاح. يمكنك الآن بدء إرسال الدفعات من البداية.');
  };

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
  
  // Count users who reached limit on free tier
  const limitReachedUsersCount = users.filter(u => {
    const tier = u?.subscriptionTier || 'free';
    const downloads = u?.downloadCount || 0;
    const limit = TIER_LIMITS[tier] || 5;
    return tier === 'free' && downloads >= limit;
  }).length;

  // Filter and Sort Users
  const filteredUsers = users
    .filter(u => {
      const name = (u?.displayName || u?.profInfo?.name || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const school = (u?.profInfo?.school || u?.profInfo?.directorate || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || name.includes(term) || email.includes(term) || school.includes(term);
      
      let matchesTier = true;
      if (tierFilter === 'all') {
        matchesTier = true;
      } else if (tierFilter === 'limit_reached') {
        const tier = u?.subscriptionTier || 'free';
        const downloads = u?.downloadCount || 0;
        const limit = TIER_LIMITS[tier] || 5;
        matchesTier = tier === 'free' && downloads >= limit;
      } else if (tierFilter === 'near_limit') {
        const tier = u?.subscriptionTier || 'free';
        const downloads = u?.downloadCount || 0;
        matchesTier = tier === 'free' && downloads >= 3;
      } else {
        matchesTier = u?.subscriptionTier === tierFilter || (!u?.subscriptionTier && tierFilter === 'free');
      }

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

  // Action: Open Email Composer for a User
  const handleOpenEmailComposer = (user: any, template: 'limit_reached' | 'special_offer' | 'vip_invitation' = 'limit_reached') => {
    setEmailModalUser(user);
    setEmailTemplateType(template);

    const teacherName = user?.displayName || user?.profInfo?.name || 'أستاذنا الفاضل';
    const downloads = user?.downloadCount || 0;
    const tier = user?.subscriptionTier || 'free';
    const tierName = TIER_NAMES[tier] || 'المجانية';

    if (template === 'limit_reached') {
      setEmailSubject(`🚀 ترقية حسابك في منصة الاجتماعيات الذكية - وصولك للحد الأقصى المجاني`);
      setEmailBody(`تحية طيبة وتقدير أستاذنا الفاضل ${teacherName}،

نود إعلامكم بأنكم قد بلغتم الحد الأقصى من الرصيد المجاني المتاح في منصة الاجتماعيات الذكية (${downloads} تحميلات من أصل 5).

نظراً لاقتناعكم بجودة وأهمية أدوات المنصة في تيسير التحضير التربوي اليومي، يسعدنا دعوتكم للاستفادة من الباقات المتقدمة:

⭐ باقة الأستاذ المتميز (VIP السنوية - 149 درهم للموسم كاملاً):
- توليد وتحميل غير محدود كلياً (∞) للجذاذات والامتحانات والملخصات
- المنظومة الكاملة للتقويم التشخيصي واستيراد نقط مسار بنقرة واحدة
- مولد الفروض المحروسة والإشهادية بسلالم التنقيط
- ركن إعداديات الريادة والتصدير بصيغة Word قابلة للتعديل

🎯 اشتراك الدورة / الأسدس (59 درهم):
- رصيد 60 تحميلاً شاملاً لكافة الوثائق طيلة 4 أشهر.

لترقية حسابكم فوراً أو استلام كود التفعيل المباشر:
- الرد على هذه الرسالة البريدية
- أو التواصل المباشر عبر واتساب: 0646662690 (https://wa.me/212646662690)

مع خالص المتمنيات بموسم دراسي حافل بالتميز والنجاح.`);
    } else if (template === 'special_offer') {
      setEmailSubject(`🎁 عرض استثنائي لترقية حسابك في منصة الاجتماعيات الذكية`);
      setEmailBody(`تحية تربوية خالصة أستاذنا الفاضل ${teacherName}،

تقديراً لثقتكم المستمرة واستعمالكم لمنصة الاجتماعيات الذكية، يسعدنا تقديم عرض حصري ومخفض لترقية حسابكم:

🌟 باقة VIP السنوية الشاملة مع أولوية الدعم التقني والتربوي
- وصول غير محدود لكافة الجذاذات والفروض المحينة (2025/2026)
- استيراد سريع لنقط مسار وإعداد تقارير الدعم والمعالجة

للاستفادة وتفعيل الكود المباشر، يرجى التواصل معنا عبر واتساب:
0646662690 (https://wa.me/212646662690)

دمتم في خدمة المنظومة التربوية.`);
    } else if (template === 'vip_invitation') {
      setEmailSubject(`👑 دعوة خاصة للانضمام إلى نخبة أساتذة الاجتماعيات VIP`);
      setEmailBody(`أستاذنا العزيز ${teacherName}،

ندعوكم للانضمام إلى شبكة الأساتذة المتميزين على منصة الاجتماعيات الذكية.
استمتعوا بتحضير رقمي متكامل، وتوليد أوتوماتيكي لكافة الوثائق الديداكتيكية وفق التوجيهات الرسمية المغربية.

للتفعيل الفوري لحسابكم:
واتساب: 0646662690 (https://wa.me/212646662690)

تحيات فريق منصة الاجتماعيات الذكية.`);
    }
  };

  // Helper to switch email templates dynamically
  const handleChangeEmailTemplate = (template: 'limit_reached' | 'special_offer' | 'vip_invitation') => {
    if (!emailModalUser) return;
    handleOpenEmailComposer(emailModalUser, template);
  };

  // Action: Open in Gmail Web directly
  const handleSendViaGmail = () => {
    if (!emailModalUser?.email) {
      toast.error('البريد الإلكتروني للأستاذ غير متوفر');
      return;
    }
    const recipient = emailModalUser.email;
    navigator.clipboard.writeText(emailBody);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    toast.success(`تم فتح Gmail بنجاح مع محتوى الرسالة للأستاذ: ${recipient} 🚀`);
  };

  // Action: Open in Outlook / Hotmail Web directly
  const handleSendViaOutlook = () => {
    if (!emailModalUser?.email) {
      toast.error('البريد الإلكتروني للأستاذ غير متوفر');
      return;
    }
    const recipient = emailModalUser.email;
    navigator.clipboard.writeText(emailBody);

    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
    toast.success(`تم فتح صفحة الإرسال في Outlook مع نص الرسالة`);
  };

  // Action: Send Email via standard mailto
  const handleSendViaMailto = () => {
    if (!emailModalUser?.email) {
      toast.error('البريد الإلكتروني للأستاذ غير متوفر');
      return;
    }

    const recipient = emailModalUser.email;
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    const a = document.createElement('a');
    a.href = mailtoUrl;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success(`تم تشغيل تطبيق البريد مع نص الرسالة إلى: ${recipient}`);
  };

  // Action: Send directly via Server API (SMTP)
  const handleSendViaServer = async () => {
    if (!emailModalUser?.email) {
      toast.error('البريد الإلكتروني للأستاذ غير متوفر');
      return;
    }

    setIsSendingEmail(true);
    setEmailSendStatus(null);

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailModalUser.email,
          subject: emailSubject,
          body: emailBody
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ تم إرسال البريد الإلكتروني بنجاح إلى ${emailModalUser.email}`);
        setEmailSendStatus('success');
      } else if (data.mode === 'webmail_fallback') {
        // SMTP not configured on server yet, automatically open Gmail Web directly
        toast.info('جاري فتح شاشة الإرسال المباشرة في Gmail...');
        handleSendViaGmail();
      } else {
        toast.error(data.error || 'تعذر الإرسال التلقائي، جاري الفتح عبر Gmail');
        handleSendViaGmail();
      }
    } catch (err: any) {
      console.warn('Server email dispatch fallback to Gmail:', err);
      toast.info('جاري فتح شاشة الإرسال المباشرة في Gmail...');
      handleSendViaGmail();
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Action: Copy Email Text & Subject
  const handleCopyEmailContent = () => {
    const fullText = `الموضوع: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    toast.success('تم نسخ نص وموضوع الرسالة بالكامل إلى الحافظة');
  };

  // Action: Send via WhatsApp
  const handleSendViaWhatsApp = () => {
    const teacherName = emailModalUser?.displayName || emailModalUser?.profInfo?.name || 'أستاذنا الفاضل';
    const text = encodeURIComponent(`تحية طيبة أستاذنا الفاضل ${teacherName}،\n\nبخصوص ترقية حسابكم في منصة الاجتماعيات الذكية:\n\n${emailBody}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // ==========================================
  // OUTREACH FOR LIMIT-REACHED USERS HANDLERS
  // ==========================================
  const getBulkRecipients = (audience?: string): string[] => {
    const targetAudience = typeof audience === 'string' ? audience : bulkAudience;
    if (!Array.isArray(users)) return [];
    let list = users.filter(u => u?.email && typeof u.email === 'string' && u.email.includes('@'));
    if (targetAudience === 'near_limit') {
      list = list.filter(u => (!u.subscriptionTier || u.subscriptionTier === 'free') && (u.downloadCount || 0) >= 3);
    } else {
      // Default: free tier users who have reached the maximum limit (5/5 or downloadCount >= 5)
      list = list.filter(u => (!u.subscriptionTier || u.subscriptionTier === 'free') && (u.downloadCount || 0) >= 5);
    }
    // Extract unique valid trimmed emails
    const unique = Array.from(new Set(list.map(u => String(u.email).trim()))).filter(Boolean);
    return unique;
  };

  const handleOpenBulkEmailModal = (
    template: 'limit_reached_support' | 'limit_reached_vip' | 'limit_reached_discount' = 'limit_reached_support',
    audience: 'limit_reached' | 'near_limit' = 'limit_reached'
  ) => {
    setBulkAudience(audience);
    setBulkTemplate(template);
    setShowBulkEmailModal(true);

    if (template === 'limit_reached_support') {
      setBulkSubject(`🚀 إشعار هام: بلوغ الحد الأقصى المجاني في منصة الاجتماعيات الذكية (5/5)`);
      setBulkBody(`السلام عليكم ورحمة الله وبركاته،
أستاذنا الفاضل / أستاذتنا الفاضلة،

نود إعلامكم بأنكم قد بلغتم الحد الأقصى من الرصيد المجاني المتاح في منصة الاجتماعيات الذكية (5 تحميلات من أصل 5).

نظراً لاقتناعكم بجودة وأهمية أدوات المنصة في تيسير التخطيط والتحضير الديداكتيكي، يسعدنا مرافقتكم لمواصلة الاستفادة دون انقطاع:

🌟 خيارات ترقية الحساب المتاحة:
• باقة VIP غير المحدودة (السنوية): تحميل وتوليد غير محدود طيلة الموسم الدراسي 2025/2026 لكافة الجذاذات والفروض والروائز والملخصات.
• باقة الدورة / الأسدس: رصيد 60 تحميلاً شاملاً لكافة الأدوات.

📲 لتفعيل حسابكم واستلام كود الترقية الفوري:
• التواصل المباشر عبر واتساب: 0646662690
• رابط واتساب المباشر: https://wa.me/212646662690
• أو الرد المباشر على هذه الرسالة البريدية.

مع خالص التحيات والتقدير لجهودكم التربوية،
فريق منصة الاجتماعيات الذكية`);
    } else if (template === 'limit_reached_vip') {
      setBulkSubject(`👑 دعوة خاصة للترقية إلى باقة VIP غير المحدودة بعد استنفاد الرصيد المجاني`);
      setBulkBody(`تحية تربوية خالصة أستاذنا الفاضل / أستاذتنا الفاضلة،

بعد استنفادكم للرصيد المجاني في منصة الاجتماعيات الذكية، يسعدنا دعوتكم للانضمام إلى باقة VIP غير المحدودة للاستفادة من:
- تحميلات وتوليد غير محدود بصيغة Word و PDF طيلة الموسم الدراسي 2025/2026.
- المنظومة الكاملة للفروض والتقويم التشخيصي واستيراد نقط مسار بنقرة واحدة.
- وثائق إعداديات الريادة وملخصات الدروس والخطاطات المفاهيمية.

🚀 لتفعيل حسابكم واستلام كود التفعيل الفوري:
تواصلوا معنا عبر واتساب: 0646662690 (https://wa.me/212646662690)

مع فائق التقدير والاحترام،
إدارة منصة الاجتماعيات الذكية`);
    } else if (template === 'limit_reached_discount') {
      setBulkSubject(`⚡ عرض ميسر وخاص لترقية حسابكم بعد بلوغ الحد الأقصى (5/5)`);
      setBulkBody(`السلام عليكم ورحمة الله وبركاته،

أستاذنا العزيز، نلاحظ وصولكم للحد الأقصى المجاني (5/5) واستعمالكم المتكرر للمنصة.
تقديراً لثقتكم واهتمامكم بالمنصة، يسرنا تقديم كود خصم استثنائي لتفعيل اشتراككم في باقة VIP السنوية أو باقة الدورة.

للحصول على كود التخفيض المباشر وتفعيل الحساب:
واتساب: 0646662690 (https://wa.me/212646662690)

منصة الاجتماعيات الذكية - رفيقكم الرقمي للتميز الديداكتيكي.`);
    }
  };

  const handleChangeBulkTemplate = (template: 'limit_reached_support' | 'limit_reached_vip' | 'limit_reached_discount') => {
    handleOpenBulkEmailModal(template, bulkAudience);
  };

  // 1-Click Gmail BCC Bulk Compose (Guaranteed with pre-filled body text)
  const handleSendBulkViaGmail = (customEmails?: any) => {
    const emails: string[] = Array.isArray(customEmails) ? customEmails : getBulkRecipients();
    if (!Array.isArray(emails) || emails.length === 0) {
      toast.error('لا توجد عناوين بريد إلكتروني صالحة في الفئة المحددة');
      return;
    }

    navigator.clipboard.writeText(bulkBody);

    const encodedSubject = encodeURIComponent(bulkSubject);
    const encodedBody = encodeURIComponent(bulkBody);

    // If recipient list is up to 15, put all in BCC with full text
    if (emails.length <= 15) {
      const bccList = emails.join(',');
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bccList)}&su=${encodedSubject}&body=${encodedBody}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      markEmailsAsSent(emails);
      toast.success(`✅ تم فتح Gmail بنجاح مع إدراج نص الرسالة والموضوع و ${emails.length} أستاذ في (BCC)! 🚀`);
    } else {
      // For larger lists, pick first 15 unsent or primary chunk
      const primaryChunk = emails.slice(0, 15);
      const bccList = primaryChunk.join(',');
      const fullList = emails.join(', ');
      navigator.clipboard.writeText(fullList);

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bccList)}&su=${encodedSubject}&body=${encodedBody}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      markEmailsAsSent(primaryChunk);
      toast.success(
        `✅ تم فتح Gmail لدفعة من ${primaryChunk.length} أستاذ في BCC! (تم حفظ الدفعة ونسخ كافة الـ ${emails.length} إيميل للحافظة)`,
        { duration: 8000 }
      );
    }
  };

  // 1-Click Outlook Web BCC Bulk Compose
  const handleSendBulkViaOutlook = (customEmails?: any) => {
    const emails: string[] = Array.isArray(customEmails) ? customEmails : getBulkRecipients();
    if (!Array.isArray(emails) || emails.length === 0) {
      toast.error('لا توجد عناوين بريد إلكتروني صالحة');
      return;
    }
    navigator.clipboard.writeText(bulkBody);
    const primaryList = emails.slice(0, 15);
    const encodedSubject = encodeURIComponent(bulkSubject);
    const encodedBody = encodeURIComponent(bulkBody);

    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?bcc=${encodeURIComponent(primaryList.join(';'))}&subject=${encodedSubject}&body=${encodedBody}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
    markEmailsAsSent(primaryList);
    toast.success(`تم فتح Outlook مع نص الرسالة ووضع ${primaryList.length} أستاذ في (BCC)`);
  };

  // 1-Click Mailto App
  const handleSendBulkViaMailto = (customEmails?: any) => {
    const emails: string[] = Array.isArray(customEmails) ? customEmails : getBulkRecipients();
    if (!Array.isArray(emails) || emails.length === 0) {
      toast.error('لا توجد عناوين بريد إلكتروني');
      return;
    }
    navigator.clipboard.writeText(bulkBody);
    const targetChunk = emails.slice(0, 25);
    const bccList = targetChunk.join(',');
    const encodedSubject = encodeURIComponent(bulkSubject);
    const encodedBody = encodeURIComponent(bulkBody);

    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodedSubject}&body=${encodedBody}`;
    const a = document.createElement('a');
    a.href = mailtoUrl;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    markEmailsAsSent(targetChunk);
    toast.success(`تم فتح تطبيق البريد مع إدراج نص الرسالة والموضوع لـ ${targetChunk.length} أستاذ`);
  };

  // Automated Server Batch Dispatch
  const handleSendBulkViaServer = async () => {
    const emails = getBulkRecipients();
    if (!Array.isArray(emails) || emails.length === 0) {
      toast.error('لا توجد عناوين بريد إلكتروني');
      return;
    }

    setIsSendingBulk(true);
    try {
      const response = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: emails,
          subject: bulkSubject,
          body: bulkBody
        })
      });

      const data = await response.json();
      if (data.success) {
        markEmailsAsSent(emails);
        toast.success(`✅ تم إرسال رسائل المتابعة بنجاح إلى ${emails.length} أستاذ(ة) وصلوا للحد الأقصى عبر الخادم`);
      } else if (data.mode === 'webmail_fallback') {
        toast.info(`جاري فتح شاشة الإرسال في Gmail (BCC) لـ ${emails.length} أستاذ(ة)...`);
        handleSendBulkViaGmail();
      } else {
        toast.error(data.error || 'تعذر الإرسال التلقائي، جاري الفتح عبر Gmail');
        handleSendBulkViaGmail();
      }
    } catch (err: any) {
      console.warn('Server bulk email fallback to Gmail:', err);
      toast.info('جاري فتح شاشة الإرسال في Gmail (BCC)...');
      handleSendBulkViaGmail();
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Copy All Recipient Emails
  const handleCopyBulkEmails = () => {
    const emails = getBulkRecipients();
    if (!Array.isArray(emails) || emails.length === 0) {
      toast.error('لا توجد عناوين بريد للنسخ');
      return;
    }
    navigator.clipboard.writeText(emails.join(', '));
    toast.success(`تم نسخ ${emails.length} عنوان بريد إلكتروني إلى الحافظة بنجاح 📋`);
  };

  // Copy Bulk Email Text & Subject
  const handleCopyBulkContent = () => {
    const fullText = `الموضوع: ${bulkSubject}\n\n${bulkBody}`;
    navigator.clipboard.writeText(fullText);
    toast.success('تم نسخ نص وموضوع الرسالة بالكامل إلى الحافظة');
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
        <div className="bg-indigo-900/5 px-4 sm:px-6 py-3 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold">إجمالي الأساتذة</p>
              <p className="text-base font-black text-slate-900">{totalUsersCount} أستاذ(ة)</p>
            </div>
          </div>

          {/* Limit reached quick card / filter */}
          <button 
            onClick={() => {
              setActiveTab('users');
              setTierFilter('limit_reached');
            }}
            className={`p-3 rounded-2xl border transition-all text-right flex items-center gap-3 ${
              tierFilter === 'limit_reached' 
                ? 'bg-red-600 text-white border-red-700 shadow-sm' 
                : 'bg-red-50 hover:bg-red-100/80 border-red-200 text-red-900 shadow-2xs'
            }`}
            title="انقر لفلترة وعرض الأساتذة الذين وصلوا للحد الأقصى ومراسلتهم"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              tierFilter === 'limit_reached' ? 'bg-white/20 text-white' : 'bg-red-200/80 text-red-700'
            }`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className={`text-[11px] font-bold ${tierFilter === 'limit_reached' ? 'text-red-100' : 'text-red-600'}`}>
                بلغوا الحد (5/5)
              </p>
              <p className="text-base font-black flex items-center gap-1">
                <span>{limitReachedUsersCount}</span>
                <span className="text-[10px] font-medium opacity-90">مراسلة 📧</span>
              </p>
            </div>
          </button>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold">إجمالي العمليات</p>
              <p className="text-base font-black text-indigo-700">{totalPlatformUsage}</p>
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
              <p className="text-[11px] text-slate-500 font-bold">المشتركون</p>
              <p className="text-base font-black text-amber-800">{premiumUsersCount} VIP</p>
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
                    <option value="all">كل الحسابات ({users.length})</option>
                    <option value="limit_reached">⚠️ وصلوا للحد المجاني 5/5 ({limitReachedUsersCount})</option>
                    <option value="near_limit">⚡ أوشكوا على بلوغ الحد (≥3) ({users.filter(u => (!u.subscriptionTier || u.subscriptionTier === 'free') && (u.downloadCount || 0) >= 3).length})</option>
                    <option value="free">المجاني العام ({users.filter(u => !u.subscriptionTier || u.subscriptionTier === 'free').length})</option>
                    <option value="basic">البسيط ({users.filter(u => u.subscriptionTier === 'basic').length})</option>
                    <option value="semester">الدورة ({users.filter(u => u.subscriptionTier === 'semester').length})</option>
                    <option value="unlimited">VIP غير المحدود ({users.filter(u => u.subscriptionTier === 'unlimited').length})</option>
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

                  {/* Outreach Button for Limit-Reached Users */}
                  <button
                    onClick={() => handleOpenBulkEmailModal('limit_reached_support', 'limit_reached')}
                    className="px-3.5 py-2 bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-xl text-xs font-black hover:from-red-700 hover:to-amber-700 transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
                    title="مراسلة وتواصل مع الأساتذة الذين وصلوا للحد الأقصى المجاني (5/5) لترقية حساباتهم"
                  >
                    <Mail size={14} />
                    <span>مراسلة من وصلوا للحد الأقصى ({getBulkRecipients('limit_reached').length} أستاذ) ⚡</span>
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
                        <th className="p-3.5 min-w-[220px]">الأستاذ(ة) والحساب</th>
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
                        <th className="p-3.5 text-center w-28">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">
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

                              {/* Actions Buttons */}
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* Email button (Highlighted if reached or close to limit) */}
                                  <button
                                    onClick={() => handleOpenEmailComposer(u, tier === 'free' && downloads >= tierLimit ? 'limit_reached' : 'special_offer')}
                                    className={`p-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 ${
                                      tier === 'free' && downloads >= tierLimit
                                        ? 'bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200'
                                        : 'bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white'
                                    }`}
                                    title={
                                      tier === 'free' && downloads >= tierLimit
                                        ? 'مراسلة الأستاذ عبر البريد لترقية الحساب بعد بلوغ الحد (5/5)'
                                        : 'مراسلة الأستاذ عبر البريد الإلكتروني'
                                    }
                                  >
                                    <Mail size={14} />
                                  </button>

                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl transition-colors font-bold text-xs"
                                    title="عرض تفاصيل الأستاذ وسجل استعمالاته"
                                  >
                                    تفاصيل
                                  </button>
                                </div>
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
                
                {/* Email Outreach for user */}
                <button
                  onClick={() => {
                    const isLimitReached = (selectedUser.subscriptionTier === 'free' || !selectedUser.subscriptionTier) && (selectedUser.downloadCount || 0) >= 5;
                    handleOpenEmailComposer(selectedUser, isLimitReached ? 'limit_reached' : 'special_offer');
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Mail size={15} />
                  <span>
                    {(selectedUser.subscriptionTier === 'free' || !selectedUser.subscriptionTier) && (selectedUser.downloadCount || 0) >= 5
                      ? 'مراسلة الأستاذ عبر البريد لترقية الحساب (بلغ الحد 5/5)'
                      : 'مراسلة الأستاذ عبر البريد الإلكتروني'}
                  </span>
                </button>

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

      {/* ======================================================== */}
      {/* EMAIL OUTREACH / UPGRADE PROMOTION COMPOSER MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {emailModalUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans text-right" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Email Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">مراسلة الأستاذ(ة) عبر البريد الإلكتروني</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      إرسال رسالة مباشرة لتشجيع الأستاذ على ترقية الحساب والاستفادة من الباقات
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEmailModalUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Email Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                {/* Teacher Info Snapshot */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-900 text-sm">
                      {emailModalUser.displayName || emailModalUser.profInfo?.name || 'أستاذ(ة)'}
                    </p>
                    <p className="text-slate-500 font-mono text-xs">{emailModalUser.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700">
                      التحميلات: {emailModalUser.downloadCount || 0} / {TIER_LIMITS[emailModalUser.subscriptionTier || 'free'] || 5}
                    </span>
                    {(emailModalUser.subscriptionTier === 'free' || !emailModalUser.subscriptionTier) && (emailModalUser.downloadCount || 0) >= 5 && (
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1">
                        <AlertTriangle size={12} />
                        <span>بلغ الحد الأقصى</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Templates Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">اختر نموذج الرسالة الجاهزة:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangeEmailTemplate('limit_reached')}
                      className={`p-2.5 rounded-xl border text-right transition-all ${
                        emailTemplateType === 'limit_reached'
                          ? 'bg-red-50 border-red-300 text-red-900 font-black shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <p className="text-xs font-black">⚠️ وصول للحد الأقصى</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">تنبيه بالـ 5 تحميلات وعرض VIP</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeEmailTemplate('special_offer')}
                      className={`p-2.5 rounded-xl border text-right transition-all ${
                        emailTemplateType === 'special_offer'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-black shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <p className="text-xs font-black">🎁 عرض ترقية استثنائي</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">خصم الموسم والتفعيل الفوري</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeEmailTemplate('vip_invitation')}
                      className={`p-2.5 rounded-xl border text-right transition-all ${
                        emailTemplateType === 'vip_invitation'
                          ? 'bg-amber-50 border-amber-300 text-amber-900 font-black shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <p className="text-xs font-black">👑 دعوة لنخبة VIP</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">دعوة للانضمام للشبكة المتميزة</p>
                    </button>
                  </div>
                </div>

                {/* Email Subject Input */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">عنوان / موضوع البريد (Subject):</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    placeholder="موضوع الرسالة..."
                  />
                </div>

                {/* Email Body Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">محتوى ونص الرسالة (يمكنك التعديل والإضافة):</label>
                    <span className="text-[10px] text-slate-400">يدعم الروابط والتنسيق المباشر</span>
                  </div>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed focus:outline-hidden focus:border-indigo-500 font-sans"
                    placeholder="اكتب نص الرسالة هنا..."
                  />
                </div>
              </div>

              {/* Email Modal Footer Buttons */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                {/* Primary Fast Send Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Direct Gmail Web Compose Button */}
                    <button
                      type="button"
                      onClick={handleSendViaGmail}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md"
                      title="فتح صفحة إنشاء الرسالة مباشرة في Gmail مع العنوان والمحتوى الجاهز بنقرة واحدة"
                    >
                      <Mail size={15} />
                      <span>فتح في Gmail 🚀</span>
                    </button>

                    {/* Direct Outlook Web Compose Button */}
                    <button
                      type="button"
                      onClick={handleSendViaOutlook}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      title="فتح صفحة إنشاء الرسالة في Outlook / Hotmail"
                    >
                      <ExternalLink size={13} />
                      <span>Outlook Web</span>
                    </button>

                    {/* Standard Mail App (mailto) */}
                    <button
                      type="button"
                      onClick={handleSendViaMailto}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      title="فتح تطبيق البريد الافتراضي على الحاسوب أو الهاتف"
                    >
                      <Send size={13} />
                      <span>تطبيق البريد</span>
                    </button>

                    {/* Server Automated Dispatch */}
                    <button
                      type="button"
                      onClick={handleSendViaServer}
                      disabled={isSendingEmail}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="إرسال مباشر من الخادم عبر SMTP"
                    >
                      {isSendingEmail ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>إرسال تلقائي عبر الخادم</span>
                    </button>
                  </div>

                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={() => setEmailModalUser(null)}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    إغلاق
                  </button>
                </div>

                {/* Secondary Copy and WhatsApp options */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEmailContent}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      title="نسخ نص الرسالة والموضوع لإرساله يدوياً عبر أي وسيلة"
                    >
                      <Copy size={12} />
                      <span>نسخ النص كاملاً</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendViaWhatsApp}
                      className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white text-emerald-800 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      title="إرسال نص العرض كرسالة عبر واتساب"
                    >
                      <MessageSquare size={12} />
                      <span>إرسال عبر واتساب</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    💡 انقر «فتح في Gmail» ليتم فتح الرسالة فوراً في حسابك ببريد المعني والمحتوى معبأين تلقائياً.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* ======================================================== */}
        {/* MODAL 3: OUTREACH TO LIMIT-REACHED USERS MODAL           */}
        {/* ======================================================== */}
        {showBulkEmailModal && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans text-right" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Bulk Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-red-900/10 via-rose-900/5 to-amber-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-200 shrink-0">
                    <Mail size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <span>التواصل مع الأساتذة الذين وصلوا للحد الأقصى</span>
                      <span className="bg-red-100 text-red-700 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                        {getBulkRecipients(bulkAudience).length} أستاذ
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      مراسلة موجهة للأساتذة الذين استنفدوا رصيدهم المجاني (5 تحميلات) لمساعدتهم في ترقية الحساب وتفعيل الاشتراك
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkEmailModal(false)}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Bulk Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                {/* Audience Filter Pills */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">
                    🎯 الفئة المستهدفة من الأساتذة:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkAudience('limit_reached')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-between gap-2 ${
                        bulkAudience === 'limit_reached'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-right">
                        <p className="font-black">من وصلوا للحد الأقصى (5/5)</p>
                        <p className={`text-[10px] ${bulkAudience === 'limit_reached' ? 'text-red-100' : 'text-slate-500'}`}>الأساتذة الذين استهلكوا كامل الرصيد المجاني</p>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-md ${bulkAudience === 'limit_reached' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
                        {getBulkRecipients('limit_reached').length} أستاذ
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkAudience('near_limit')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-between gap-2 ${
                        bulkAudience === 'near_limit'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-right">
                        <p className="font-black">من قاربوا بلوغ الحد (≥3 تحميلات)</p>
                        <p className={`text-[10px] ${bulkAudience === 'near_limit' ? 'text-red-100' : 'text-slate-500'}`}>الأساتذة النشطون برصيد 3 أو 4 تحميلات</p>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-md ${bulkAudience === 'near_limit' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {getBulkRecipients('near_limit').length} أستاذ
                      </span>
                    </button>
                  </div>
                </div>

                {/* Templates Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">
                    📑 اختيار نموذج رسالة المتابعة:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangeBulkTemplate('limit_reached_support')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        bulkTemplate === 'limit_reached_support'
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>🚀 إشعار بلوغ الحد والمساعدة بالترقية</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeBulkTemplate('limit_reached_vip')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        bulkTemplate === 'limit_reached_vip'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>👑 دعوة باقة VIP غير المحدودة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChangeBulkTemplate('limit_reached_discount')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        bulkTemplate === 'limit_reached_discount'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>⚡ عرض ميسر وكود تخفيض</span>
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">
                    عنوان البريد الإلكتروني (الموضوع):
                  </label>
                  <input
                    type="text"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-red-500"
                    placeholder="عنوان الرسالة..."
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-slate-700">
                      محتوى الرسالة (يمكنك التعديل والإضافة بحرية):
                    </label>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      واتساب معتمد: 0646662690 ✅
                    </span>
                  </div>
                  <textarea
                    rows={9}
                    value={bulkBody}
                    onChange={(e) => setBulkBody(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:border-red-500 font-mono"
                    placeholder="اكتب نص الرسالة هنا..."
                  />
                </div>

                {/* Info Note & Step-by-Step Guide */}
                <div className="p-3.5 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 text-amber-950 text-xs space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-amber-900 mb-0.5">
                        طريقة الإرسال المباشرة والآمنة (BCC) بدون تكرار:
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        يتم تقسيم المستلمين تلقائياً إلى دفعات منظمة (15 أستاذ في كل دفعة). عند إرسال أي دفعة، يتم <strong>استبعاد من تم الإرسال لهم تلقائياً</strong> حتى لا يتكرر أي أستاذ في الدفعة التالية إلى حين إتمام القائمة كاملة.
                      </p>
                    </div>
                  </div>

                  {/* Batch Progress Bar & Statistics */}
                  {(() => {
                    const allRecipients = getBulkRecipients(bulkAudience);
                    const totalCount = allRecipients.length;
                    const sentCount = allRecipients.filter(email => sentBatchEmails.includes(email)).length;
                    const unsentList = allRecipients.filter(email => !sentBatchEmails.includes(email));
                    const nextChunk = unsentList.slice(0, 15);
                    const percent = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;
                    const isAllFinished = totalCount > 0 && sentCount >= totalCount;

                    return (
                      <div className="pt-2.5 border-t border-amber-200/70 space-y-2.5">
                        {/* Progress Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2 font-bold text-amber-900">
                            <span>📊 تقدم إرسال الدفعات:</span>
                            <span className="bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-full font-black">
                              {sentCount} / {totalCount} أستاذ ({percent}%)
                            </span>
                          </div>

                          {sentCount > 0 && (
                            <button
                              type="button"
                              onClick={handleResetBatchCycle}
                              className="text-[10px] text-amber-800 hover:text-red-700 underline font-bold transition-colors cursor-pointer"
                            >
                              إعادة تعيين دورة الإرسال ↺
                            </button>
                          )}
                        </div>

                        {/* Progress Track */}
                        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-linear-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Next Unsent Batch Action Banner */}
                        {!isAllFinished && unsentList.length > 0 && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-300/80 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                            <div className="text-[11px] text-slate-800 font-bold">
                              <span>الدفعة التالية الجاهزة: </span>
                              <span className="text-amber-700 font-black">{nextChunk.length} أستاذ جديد (غير مكرر)</span>
                              <span className="text-slate-500 text-[10px] mr-1.5">(متبقي {unsentList.length} أستاذ)</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSendBulkViaGmail(nextChunk)}
                              className="px-3.5 py-1.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Mail size={13} />
                              <span>إرسال الدفعة التالية في Gmail 🚀</span>
                            </button>
                          </div>
                        )}

                        {/* All Batches Finished Celebration Banner */}
                        {isAllFinished && (
                          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                            <div className="text-[11px] font-black flex items-center gap-1.5">
                              <span>🎉 تم الانتهاء من مراسلة كافة الأساتذة في هذه الفئة ({totalCount} أستاذ) دون أي تكرار!</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleResetBatchCycle}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              بدء دورة إرسال جديدة ↺
                            </button>
                          </div>
                        )}

                        {/* Batch Partition Chips */}
                        {totalCount > 15 && (
                          <div className="pt-1">
                            <p className="text-[10px] font-bold text-amber-900 mb-1">
                              قائمة الدفعات المرتبة (15 أستاذ بالدفعة):
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {Array.from({ length: Math.ceil(totalCount / 15) }).map((_, idx) => {
                                const start = idx * 15;
                                const chunk = allRecipients.slice(start, start + 15);
                                const isChunkFullySent = chunk.every(email => sentBatchEmails.includes(email));
                                const isChunkPartiallySent = !isChunkFullySent && chunk.some(email => sentBatchEmails.includes(email));

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSendBulkViaGmail(chunk)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                                      isChunkFullySent
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                                        : isChunkPartiallySent
                                        ? 'bg-amber-100 text-amber-900 border border-amber-400 hover:bg-amber-200'
                                        : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                                    }`}
                                    title={isChunkFullySent ? 'تم إرسال هذه الدفعة بالكامل' : 'إرسال هذه الدفعة'}
                                  >
                                    <span>
                                      {isChunkFullySent ? '✓ ' : ''}دفعة {idx + 1} ({chunk.length})
                                    </span>
                                    {isChunkFullySent ? (
                                      <CheckCircle size={11} className="text-emerald-700" />
                                    ) : (
                                      <Mail size={11} className="text-amber-700" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Bulk Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Direct Gmail BCC Compose */}
                    <button
                      type="button"
                      onClick={() => handleSendBulkViaGmail()}
                      className="px-4 py-2.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-red-200 hover:shadow-lg cursor-pointer"
                      title="فتح Gmail فوراً مع وضع كافة إيميلات الأساتذة الذين وصلوا للحد في خانة النسخة المخفية BCC"
                    >
                      <Mail size={16} />
                      <span>فتح في Gmail لمن وصل للحد الأقصى (BCC) 🚀</span>
                    </button>

                    {/* Direct Outlook BCC Compose */}
                    <button
                      type="button"
                      onClick={() => handleSendBulkViaOutlook()}
                      className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      title="فتح Outlook Web كنسخة مخفية"
                    >
                      <ExternalLink size={14} />
                      <span>Outlook Web</span>
                    </button>

                    {/* Server Automated Dispatch */}
                    <button
                      type="button"
                      onClick={() => handleSendBulkViaServer()}
                      disabled={isSendingBulk}
                      className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="إرسال دفعة أوتوماتيكية عبر الخادم"
                    >
                      {isSendingBulk ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>إرسال أوتوماتيكي عبر الخادم</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBulkEmailModal(false)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    إغلاق
                  </button>
                </div>

                {/* Secondary tools: Copy emails, copy text */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyBulkEmails()}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="نسخ قائمة عناوين البريد مفصولة بفواصل"
                    >
                      <Copy size={13} />
                      <span>نسخ قائمة كافة الإيميلات ({getBulkRecipients(bulkAudience).length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyBulkContent()}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="نسخ نص الرسالة والموضوع بالكامل"
                    >
                      <FileText size={13} />
                      <span>نسخ نص الرسالة</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    💡 يمكنك أيضاً نسخ قائمة الإيميلات واستخدامها في أي برنامج نشرات أو بريد خارجي.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

