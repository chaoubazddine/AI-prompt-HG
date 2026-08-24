/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  BookOpen, 
  Sparkles, 
  Save, 
  Search, 
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  FileText,
  LogOut,
  User,
  Layout,
  Clock,
  CheckCircle,
  LogIn,
  RefreshCw,
  FileDown,
  Copy,
  Settings,
  AlertCircle,
  ExternalLink,
  Info,
  X,
  History,
  ShieldCheck,
  Printer,
  Plus,
  Trash2,
  Check,
  Layers,
  Award,
  Sliders,
  Compass,
  MapPin,
  Zap,
  Bot,
  FileCheck2,
  ClipboardCheck
} from 'lucide-react';
import { TableJadha, JadhaData } from './components/TableJadha';
import { generateJadha } from './services/geminiService';
import { CYCLES, DOC_TYPES, LESSONS_DATA, CYCLE_LEVELS, TEXTBOOKS } from './constants';
import { downloadWord } from './utils/wordExport';
import { LessonSummaryGenerator } from './components/LessonSummary/LessonSummaryGenerator';
import { ExamGenerator } from './components/ExamGenerator/ExamGenerator';
import { RayadaPioneerHub } from './components/Rayada/RayadaPioneerHub';
import { DiagnosticHub } from './components/Diagnostic/DiagnosticHub';
import { HeaderSocialLinks, FooterSocialSection, ContactSocialBlock } from './components/SocialLinks';
import { AdminDashboardModal } from './components/Admin/AdminDashboardModal';
import { PricingSection } from './components/Pricing/PricingSection';
import { trackUserUsage } from './services/usageTracker';
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError, 
  FirebaseUser
} from './firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Error Boundary Component
class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.error) errorMessage = `خطأ في قاعدة البيانات: ${parsed.error}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-right" dir="rtl">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black mb-4">عذراً، حدث خطأ</h2>
            <p className="text-slate-500 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#4F46E5] text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <JadhaApp />
    </ErrorBoundary>
  );
}

function JadhaApp() {
  const [step, setStep] = useState<'landing' | 'dashboard' | 'form' | 'generate' | 'view' | 'lesson-summary' | 'exam-generator' | 'rayada' | 'diagnostic'>('landing');
  const [formStep, setFormStep] = useState<1 | 2 | 3 | 4>(1);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [jadhaData, setJadhaData] = useState<JadhaData | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [manualKey, setManualKey] = useState(() => localStorage.getItem('user_gemini_key') || '');
  const [downloadCount, setDownloadCount] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'basic' | 'semester' | 'advanced' | 'unlimited'>('free');
  const [activationCode, setActivationCode] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [adminCodes, setAdminCodes] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'history' | 'profile'>('profile');

  const LOADING_TIPS = [
    'جاري تحضير الوثائق والدعامات الديداكتيكية المعتمدة...',
    'جاري مطابقة التوجيهات التربوية الخاصة بمادة الاجتماعيات...',
    'جاري توزيع المهام بين الأستاذ والمتعلم بدقة وصيغ موصى بها...',
    'جاري صياغة الأسئلة والأنشطة والتركيب البيداغوجي...',
    'جاري تنسيق الجذاذة لتكون جاهزة للطباعة والتصدير...'
  ];

  const TIER_LIMITS: Record<string, number> = {
    free: 5,
    basic: 30,
    semester: 60,
    advanced: 60,
    unlimited: Infinity
  };

  const TIER_NAMES: Record<string, string> = {
    free: 'دخول مجاني (5)',
    basic: 'باقة الأستاذ (الأساسية)',
    semester: 'اشتراك الدورة (Pass الأسدس)',
    advanced: 'اشتراك الدورة (الأسدس)',
    unlimited: 'الأستاذ المتميز (VIP)'
  };

  const DOWNLOAD_LIMIT = TIER_LIMITS[subscriptionTier];
  const isAdmin = user?.email === 'chaoub7@gmail.com';

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  // Rotating loading tip timer
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Admin sync
  useEffect(() => {
    if (!isAdmin) {
      setAdminCodes([]);
      setAdminUsers([]);
      return;
    }

    const codesQuery = query(collection(db, 'activationCodes'));
    const unsubscribeCodes = onSnapshot(codesQuery, (snapshot) => {
      const codes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdminCodes(codes);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'activationCodes');
    });

    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const getTime = (u: any) => {
          if (!u || !u.createdAt) return 0;
          if (typeof u.createdAt.toMillis === 'function') return u.createdAt.toMillis();
          if (typeof u.createdAt.toDate === 'function') return u.createdAt.toDate().getTime();
          if (u.createdAt.seconds) return u.createdAt.seconds * 1000;
          if (typeof u.createdAt === 'number') return u.createdAt;
          if (typeof u.createdAt === 'string') return new Date(u.createdAt).getTime() || 0;
          return 0;
        };
        return getTime(b) - getTime(a);
      });
      setAdminUsers(users);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    return () => {
      unsubscribeCodes();
      unsubscribeUsers();
    };
  }, [isAdmin]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة بنجاح');
  };

  const deleteJadhaFromHistory = async (jadhaId: string) => {
    try {
      await deleteDoc(doc(db, 'jadhas', jadhaId));
      toast.success('تم حذف الجذاذة من أرشيفك بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'jadhas');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);

      if (firebaseUser) {
        if (step === 'landing') {
          setStep('dashboard');
        }

        // Sync user data with Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              subscriptionTier: 'free',
              downloadCount: 0,
              createdAt: serverTimestamp()
            });
          } else {
            const data = userDoc.data();
            if (!data.subscriptionTier) {
              await updateDoc(userRef, {
                subscriptionTier: data.isPremium ? 'unlimited' : 'free',
                downloadCount: data.downloadCount || 0
              });
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'users');
        }
      } else {
        setStep('landing');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setDownloadCount(0);
      setSubscriptionTier('free');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setDownloadCount(data.downloadCount || 0);
        setSubscriptionTier(data.subscriptionTier || 'free');
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'jadhas'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'jadhas');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('تم تسجيل الدخول بنجاح! مرحباً بك في فضاء الأستاذ');
      setStep('dashboard');
    } catch (err) {
      toast.error('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setStep('landing');
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (err) {
      toast.error('فشل تسجيل الخروج');
    }
  };

  const handleVerifyCode = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً لتفعيل كود الوصول.');
      return;
    }

    const code = activationCode.trim().toUpperCase();
    if (!code) {
      toast.warning('يرجى إدخال الكود أولاً.');
      return;
    }

    try {
      const codeRef = doc(db, 'activationCodes', code);
      const codeDoc = await getDoc(codeRef);

      if (codeDoc.exists()) {
        const codeData = codeDoc.data();
        if (codeData.isValid) {
          const tier = codeData.tier || 'unlimited';
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { subscriptionTier: tier });
          // Mark code as used if needed, or keep valid
          setShowPremiumModal(false);
          setActivationCode('');
          toast.success(`تم تفعيل حسابك بنجاح! (${TIER_NAMES[tier as keyof typeof TIER_NAMES]})`, {
            description: tier === 'unlimited' ? 'استمتع بالوصول اللامحدود لكافة مزايا الجذاذات.' : `تم زيادة رصيدك إلى ${TIER_LIMITS[tier as keyof typeof TIER_LIMITS]} تحميلاً.`,
            duration: 6000,
          });
        } else {
          toast.error('الكود منتهي الصلاحية أو تم استخدامه سابقاً.', {
            description: 'يرجى التواصل مع الإدارة للحصول على كود جديد.',
          });
        }
      } else {
        toast.error('كود التفعيل غير صحيح!', {
          description: 'تأكد من إدخال الحروف والأرقام بشكل صحيح.',
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const incrementDownloadCount = async () => {
    if (!user) return;
    trackUserUsage('download');

    if (subscriptionTier === 'unlimited') return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        downloadCount: downloadCount + 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const saveJadhaToHistory = async (data: JadhaData) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'jadhas'), {
        userId: user.uid,
        title: data.title,
        data: data,
        createdAt: serverTimestamp()
      });
      trackUserUsage('jadha', `توليد جذاذة: ${data.title}`);
      toast.success('تم حفظ الجذاذة تلقائياً في أرشيفك الشخصي.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'jadhas');
    }
  };

  const checkDownloadLimit = () => {
    if (subscriptionTier !== 'unlimited' && downloadCount >= DOWNLOAD_LIMIT) {
      toast.error('لقد استنفدت رصيدك المتاح في هذه الباقة', {
        description: `بلغت الحد الأقصى (${DOWNLOAD_LIMIT} تحميلاً). يمكنك الترقية إلى باقة VIP السنوية للاستفادة من تحميل وتوليد غير محدود لجميع وثائق الموسم بدون أي سقف شهري.`,
        duration: 7000,
        action: {
          label: 'عرض باقات الترقية',
          onClick: () => setShowPricingModal(true)
        }
      });
      setShowPricingModal(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Error checking API key:", e);
        }
      } else {
        setHasKey(!!manualKey || !!process.env.GEMINI_API_KEY); 
      }
    };
    checkKey();
  }, [manualKey]);

  const handleSaveManualKey = () => {
    if (manualKey.trim().startsWith('AIza')) {
      localStorage.setItem('user_gemini_key', manualKey.trim());
      setHasKey(true);
      setShowKeyHelp(false);
      setError(null);
      toast.success('تم حفظ المفتاح الشخصي بنجاح!', {
        description: 'سيتم استخدامه الآن لتوليد الجذاذات.',
      });
    } else {
      toast.error('خطأ في المفتاح', {
        description: 'يرجى إدخال مفتاح API صالح (يبدأ بـ AIza)',
      });
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('user_gemini_key');
    setManualKey('');
    setHasKey(true);
    toast.info('تم الرجوع للمفتاح الافتراضي للمنصة.');
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
        setError(null);
      } catch (e) {
        console.error("Error opening key selector:", e);
        setShowKeyHelp(true);
      }
    } else {
      setShowKeyHelp(true);
    }
  };

  // Form States
  const [docType, setDocType] = useState('jadha');
  const [profInfo, setProfInfo] = useState(() => {
    const saved = localStorage.getItem('profInfo');
    return saved ? JSON.parse(saved) : {
      name: '',
      academy: 'جهة الدار البيضاء سطات',
      directorate: 'سيدي البرنوصي',
      school: '',
      year: '2025/2026'
    };
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.profInfo) {
            setProfInfo(data.profInfo);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const saveProfInfo = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { profInfo });
        } catch (err) {
          console.error("Failed to save profInfo:", err);
        }
      }
    };
    
    const timeoutId = setTimeout(saveProfInfo, 2000);
    return () => clearTimeout(timeoutId);
  }, [profInfo, user]);

  const [cycle, setCycle] = useState('prep');
  const [level, setLevel] = useState('الأولى إعدادي');
  const [component, setComponent] = useState('التاريخ');
  const [semester, setSemester] = useState('الدورة الأولى');
  const [reference, setReference] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [duration, setDuration] = useState('ساعة واحدة (1س)');

  const getDurationOptions = (cId: string) => {
    if (cId === 'secondary') {
      return ['ساعتان (2س)', '3 ساعات (3س)', '4 ساعات (4س)', '5 ساعات (5س)'];
    }
    return ['ساعة واحدة (1س)', 'ساعتان (2س)', '3 ساعات (3س)'];
  };

  useEffect(() => {
    const levels = CYCLE_LEVELS[cycle] || [];
    if (levels.length > 0) {
      setLevel(levels[0]);
    }
    const options = getDurationOptions(cycle);
    if (!options.includes(duration)) {
      setDuration(options[0]);
    }
  }, [cycle]);

  const getLessonsList = (lvl: string, comp: string, sem: string): string[] => {
    const levelData = (LESSONS_DATA as any)[lvl];
    if (!levelData) return [];
    const compData = levelData[comp];
    if (!compData) return [];
    if (Array.isArray(compData)) return compData;
    return compData[sem] || Object.values(compData).flat() || [];
  };

  useEffect(() => {
    const lessons = getLessonsList(level, component, semester);
    if (lessons.length > 0) {
      setLessonTitle(lessons[0]);
    } else {
      setLessonTitle('');
    }

    const books = TEXTBOOKS[level] || [];
    if (books.length > 0) {
      setReference(books[0]);
    } else {
      setReference('منار الاجتماعيات');
    }
  }, [level, component, semester]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً لتوليد الجذاذة.');
      return;
    }

    if (!lessonTitle) {
      toast.warning('تنبيه', {
        description: 'يرجى اختيار عنوان الدرس قبل متابعة التوليد.',
      });
      return;
    }
    
    setIsGenerating(true);
    setStep('generate');
    
    try {
      const data = await generateJadha(lessonTitle, level, reference);
      
      if (!data) throw new Error("لم يتم استلام بيانات من خدمة التوليد");

      const finalData: JadhaData = {
        ...data,
        level: level,
        year: profInfo.year,
        unit: component,
        duration: duration,
        academy: profInfo.academy,
        directorate: profInfo.directorate,
        school: profInfo.school,
        teacherName: profInfo.name,
        references: reference,
      };
      setJadhaData(finalData);
      await saveJadhaToHistory(finalData);
      setStep('view');
      setError(null);
    } catch (error: any) {
      console.error("Generation failed details:", error);
      let errorMessage = error?.message || "عذراً، فشل توليد الجذاذة. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.";
      
      if (errorMessage.includes("API key not valid") || errorMessage.includes("400") || errorMessage.includes("API_KEY_INVALID")) {
        errorMessage = "مفتاح API غير صالح أو غير مفعل للمستخدم الخارجي. يرجى الضغط على 'تفعيل المفتاح' للحصول على مساعدة.";
        setHasKey(false);
      }
      
      setError(errorMessage);
      setStep('form');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!jadhaData) return;
    if (!checkDownloadLimit()) return;
    
    const promise = downloadWord(jadhaData);
    toast.promise(promise, {
      loading: 'جاري تحضير ملف Word وفق المظهر الرسمي...',
      success: () => {
        incrementDownloadCount();
        return 'تم تحميل ملف Word بنجاح!';
      },
      error: 'عذراً، فشل تحميل ملف Word.',
    });
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('jadha-content');
    if (!element) return;
    if (!checkDownloadLimit()) return;

    toast.loading('جاري تحضير ملف PDF عالي الجودة...', { id: 'pdf-toast' });

    const styleOverride = document.createElement('style');
    styleOverride.id = 'html2canvas-fix';
    styleOverride.innerHTML = `
      * {
        --tw-ring-color: #4F46E5 !important;
        --tw-shadow-color: #000000 !important;
        --tw-border-opacity: 1 !important;
        --tw-bg-opacity: 1 !important;
        --tw-text-opacity: 1 !important;
      }
    `;
    document.head.appendChild(styleOverride);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            let css = styleTags[i].innerHTML;
            if (css.includes('oklch') || css.includes('oklab')) {
              css = css.replace(/oklch\([^)]+\)/g, '#4F46E5');
              css = css.replace(/oklab\([^)]+\)/g, '#4F46E5');
              styleTags[i].innerHTML = css;
            }
          }
        }
      });
      
      document.head.removeChild(styleOverride);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`جذاذة_${(jadhaData?.title || "الدرس").replace(/\s+/g, '_')}.pdf`);

      toast.success('تم تحميل ملف PDF بنجاح!', { id: 'pdf-toast' });
      await incrementDownloadCount();
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error('عذراً، فشل تصدير ملف PDF.', { id: 'pdf-toast' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col justify-between" dir="rtl">
      <Toaster position="top-center" richColors closeButton />
      
      {/* Top Header Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Social Links */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div 
              onClick={() => setStep(user ? 'dashboard' : 'landing')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
            >
              <div className="bg-gradient-to-tr from-[#4F46E5] to-indigo-600 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <BookOpen size={18} className="sm:w-[20px] sm:h-[20px]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900">الاجتماعيات الذكية</h1>
                  <span className="hidden md:inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                    المغرب 🇲🇦
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden lg:block">منصة الجذاذات بالذكاء الاصطناعي</p>
              </div>
            </div>

            <HeaderSocialLinks />
          </div>

          {/* Center Navigation Tabs (Pill style container, streamlined & compact) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
              <button 
                onClick={() => setStep('dashboard')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${step === 'dashboard' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Layout size={14} />
                <span>فضاء الأستاذ</span>
              </button>

              <button 
                onClick={() => setStep('rayada')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  step === 'rayada'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>إعداديات الريادة 🌟</span>
              </button>

              <button 
                onClick={() => setStep('diagnostic')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold ${
                  step === 'diagnostic' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                }`}
              >
                <ClipboardCheck size={14} className="text-indigo-600" />
                <span>التقويم التشخيصي</span>
              </button>

              <button 
                onClick={() => setStep('lesson-summary')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${step === 'lesson-summary' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <FileText size={14} />
                <span>الملخصات</span>
              </button>

              <button 
                onClick={() => setStep('exam-generator')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${step === 'exam-generator' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <FileCheck2 size={14} />
                <span>الامتحانات</span>
              </button>

              <button 
                onClick={() => {
                  setStep('form');
                  setFormStep(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold ${step === 'form' ? 'bg-[#4F46E5] text-white shadow-xs' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                <Plus size={14} />
                <span>جذاذة جديدة</span>
              </button>
            </nav>
          )}

          {/* User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                {/* Mobile Navigation Icons */}
                <div className="flex md:hidden items-center gap-1">
                  <button 
                    onClick={() => setStep('dashboard')}
                    className={`p-2 rounded-xl text-xs font-bold ${step === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
                    title="فضاء الأستاذ"
                  >
                    <Layout size={16} />
                  </button>
                  <button 
                    onClick={() => setStep('rayada')}
                    className={`p-2 rounded-xl text-xs font-bold ${step === 'rayada' ? 'bg-amber-100 text-amber-900' : 'text-amber-700'}`}
                    title="إعداديات الريادة"
                  >
                    <Sparkles size={16} className="text-amber-600" />
                  </button>
                  <button 
                    onClick={() => setStep('diagnostic')}
                    className={`p-2 rounded-xl text-xs font-bold ${step === 'diagnostic' ? 'bg-indigo-100 text-indigo-900' : 'text-indigo-700'}`}
                    title="التقويم التشخيصي"
                  >
                    <ClipboardCheck size={16} className="text-indigo-600" />
                  </button>
                  <button 
                    onClick={() => setStep('lesson-summary')}
                    className={`p-2 rounded-xl text-xs font-bold ${step === 'lesson-summary' ? 'bg-amber-50 text-amber-700' : 'text-slate-600'}`}
                    title="الملخصات"
                  >
                    <FileText size={16} />
                  </button>
                  <button 
                    onClick={() => setStep('exam-generator')}
                    className={`p-2 rounded-xl text-xs font-bold ${step === 'exam-generator' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600'}`}
                    title="الامتحانات"
                  >
                    <FileCheck2 size={16} />
                  </button>
                  <button 
                    onClick={() => { setStep('form'); setFormStep(1); }}
                    className="bg-[#4F46E5] text-white p-2 rounded-xl text-xs font-bold shadow-xs"
                    title="جذاذة جديدة"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* User Badge & Actions */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-2xl">
                  <button 
                    onClick={() => setShowPricingModal(true)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all border border-indigo-100 shadow-2xs"
                    title="عرض باقات الاشتراك والأسعار"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>الاشتراكات</span>
                  </button>

                  <div 
                    onClick={() => setShowPricingModal(true)}
                    className="hidden lg:flex items-center gap-2 px-2.5 py-1 cursor-pointer hover:bg-slate-100/80 rounded-xl transition-all"
                    title="انقر لترقية الباقة أو عرض خطط الاشتراك"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                      {user.displayName ? user.displayName.charAt(0) : 'أ'}
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">
                      {user.displayName || 'الأستاذ'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                      {TIER_NAMES[subscriptionTier]}
                    </span>
                  </div>

                  {isAdmin && (
                    <button 
                      onClick={() => setShowAdminPanel(true)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="لوحة الإدارة"
                    >
                      <ShieldCheck size={16} />
                    </button>
                  )}

                  <button 
                    onClick={() => setShowKeyHelp(true)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="الإعدادات والمفتاح"
                  >
                    <Settings size={16} />
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Sparkles size={14} className="text-amber-600" />
                  <span>خطط الاشتراك</span>
                </button>
                <button 
                  onClick={() => setShowPremiumModal(true)}
                  className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-xs font-bold transition-colors hidden sm:block"
                >
                  تفعيل كود
                </button>
                <button 
                  onClick={handleLogin}
                  className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                >
                  <LogIn size={16} />
                  دخول الأستاذ
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <p className="text-xs sm:text-sm font-bold">{error}</p>
            </div>
            {!hasKey && (
              <button 
                onClick={handleSelectKey}
                className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shrink-0"
              >
                تفعيل المفتاح
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* LANDING PAGE STEP */}
          {step === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10 py-4"
            >
              {/* Clean Hero Section */}
              <div className="bg-gradient-to-b from-white via-slate-50/40 to-slate-100/50 p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500"></div>
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold mb-6">
                  <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                  المنصة التربوية الرقمية المتكاملة لأستاذ مادة الاجتماعيات بالمغرب (إعدادي وتأهيلي)
                </div>

                <h1 className="text-3xl sm:text-5xl font-black mb-6 leading-tight text-slate-900 max-w-4xl mx-auto">
                  كل ما يحتاجه أستاذ الاجتماعيات <br className="hidden sm:inline" />
                  <span className="text-[#4F46E5] bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-emerald-600 to-amber-600">
                    الجذاذات، الامتحانات وعناصر الإجابة، والملخصات
                  </span>
                </h1>

                <p className="text-slate-600 text-sm sm:text-base max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
                  منصة بيداغوجية ذكية تمكّن الأستاذ من توليد الجذاذات التربوية، إعداد الفروض والامتحانات المحروسة وفق الأطر المرجعية المحينة مع عناصر الإجابة والتدبير الديداكتيكي، واستخراج ملخصات الدروس المركزة والتصدير المباشر بصيغتي Word و PDF.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
                  <button 
                    onClick={user ? () => setStep('dashboard') : handleLogin}
                    className="w-full sm:w-auto bg-[#4F46E5] text-white px-8 py-4 rounded-2xl text-base font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-98 transition-all flex items-center justify-center gap-3"
                  >
                    <LogIn size={20} />
                    {user ? 'الانتقال إلى فضاء الأستاذ' : 'دخول الأستاذ واستكشاف المنصة'}
                  </button>

                  <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="w-full sm:w-auto bg-white border border-slate-200/90 text-slate-700 px-6 py-4 rounded-2xl text-base font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} className="text-amber-500" />
                    تفعيل كود الوصول
                  </button>
                </div>
              </div>

              {/* Comprehensive Teacher Services Showcase */}
              <div className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    أدوات بيداغوجية حصرية
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">أدوات وخدمات المنصة الشاملة للأستاذ</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    حزمة متكاملة من أدوات الذكاء الاصطناعي التربوي المصممة خصيصاً لمادة الاجتماعيات بالمنظومة المغربية
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                  {/* Tool 1: Lesson Plans */}
                  <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all group relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                        <BookOpen size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                          التوجيهات التربوية الرسمية
                        </span>
                        <h3 className="text-base font-black text-slate-900 pt-1">مولّد الجذاذات التربوية</h3>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        توليد جذاذات بيداغوجية شاملة وفق النهج التاريخي والجغرافي والتربية على المواطنة مع التدابير الديداكتيكية.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      <ul className="text-xs text-slate-500 space-y-1 font-medium">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-indigo-600 shrink-0" />
                          <span>النهج والمقاطع البيداغوجية</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-indigo-600 shrink-0" />
                          <span>تحديد المهام والتقويمات</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          if (user) {
                            setStep('form');
                            setFormStep(1);
                          } else {
                            handleLogin();
                          }
                        }}
                        className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        <span>إنشاء جذاذة جديدة</span>
                      </button>
                    </div>
                  </div>

                  {/* Tool 2: Pioneer Schools Section */}
                  <div className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 p-5 rounded-3xl border-2 border-amber-300/80 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-amber-500 transition-all group relative overflow-hidden">
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      الريادة 🌟
                    </div>
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
                        <Sparkles size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                          إعداديات الريادة • التدريس الصريح
                        </span>
                        <h3 className="text-base font-black text-slate-900 pt-1">إعداديات الريادة</h3>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        قسم خاص بمدارس وإعداديات الريادة: جذاذات التدريس الصريح، امتحانات معيارية، ودعم TaRL.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-amber-100 space-y-3">
                      <ul className="text-xs text-slate-600 space-y-1 font-medium">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0" />
                          <span>النمذجة والممارسة الموجهة</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0" />
                          <span>فروض معيارية وعلاج بيداغوجي</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          if (user) {
                            setStep('rayada');
                          } else {
                            handleLogin();
                          }
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Sparkles size={14} />
                        <span>دخول فضاء الريادة</span>
                      </button>
                    </div>
                  </div>

                  {/* Tool 3: Diagnostic Assessment & Remediation */}
                  <div className="bg-gradient-to-b from-blue-50/60 via-white to-indigo-50/40 p-5 rounded-3xl border-2 border-indigo-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-400 transition-all group relative overflow-hidden">
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      بداية السنة 📋
                    </div>
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                        <ClipboardCheck size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200">
                          المقرر الوزاري • الأطر المرجعية
                        </span>
                        <h3 className="text-base font-black text-slate-900 pt-1">التقويم التشخيصي والدعم</h3>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        إعداد روائز التقويم التشخيصي، شبكات تفريغ النقط، التقارير الإحصائية، وخطط وجذاذات الدعم والاستدراك.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      <ul className="text-xs text-slate-500 space-y-1 font-medium">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-indigo-600 shrink-0" />
                          <span>رائز + تقرير + شبكة تفيؤ</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-indigo-600 shrink-0" />
                          <span>خطة علاجية وجذاذة دعم</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          if (user) {
                            setStep('diagnostic');
                          } else {
                            handleLogin();
                          }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Sparkles size={14} />
                        <span>فضاء التقويم التشخيصي</span>
                      </button>
                    </div>
                  </div>

                  {/* Tool 4: Exam & Official Answer Keys */}
                  <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all group relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                        <FileCheck2 size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          الأطر المرجعية المحينة
                        </span>
                        <h3 className="text-base font-black text-slate-900 pt-1">مولّد الامتحانات والإجابة</h3>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        إعداد فروض بـ 3 وضعيات اختبارية معتمدة مع عناصر الإجابة الرسمية وسُلم التنقيط.
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      <ul className="text-xs text-slate-500 space-y-1 font-medium">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                          <span>التعاريف، الوثائق والمقال</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                          <span>شبكة التدبير الديداكتيكي</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          if (user) {
                            setStep('exam-generator');
                          } else {
                            handleLogin();
                          }
                        }}
                        className="w-full bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        <span>توليد فرض أو امتحان</span>
                      </button>
                    </div>
                  </div>

                  {/* Tool 5: Lesson Summaries */}
                  <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-amber-300 transition-all group relative overflow-hidden">
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-105 transition-transform">
                        <FileText size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-100">
                          هيكلة بيداغوجية مركزة
                        </span>
                        <h3 className="text-base font-black text-slate-900 pt-1">مولّد ملخصات الدروس</h3>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        استخراج وتنسيق ملخصات دروس الاجتماعيات المركزة (مقدمة، محاور، مصطلحات وخاتمة).
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      <ul className="text-xs text-slate-500 space-y-1 font-medium">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0" />
                          <span>مفاهيم ومصطلحات موحدة</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-amber-600 shrink-0" />
                          <span>تصدير Word و PDF</span>
                        </li>
                      </ul>
                      <button 
                        onClick={() => {
                          if (user) {
                            setStep('lesson-summary');
                          } else {
                            handleLogin();
                          }
                        }}
                        className="w-full bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        <span>إعداد ملخص درس</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-start text-right hover:border-indigo-200 transition-all group">
                  <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">توفير الوقت والجهد</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    إنجاز الجذاذات والفروض والملخصات بأسلوب بيداغوجي رصين ومطابق للتوجيهات في ثوانٍ معدودة لكل مستويات السلكين الإعدادي والتأهيلي.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-start text-right hover:border-emerald-200 transition-all group">
                  <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">مطابقة الأطر المرجعية</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    احترام تام لمبادئ النهج التاريخي والنهج الجغرافي وقواعد التربية على المواطنة والأطر المرجعية المحينة للامتحانات.
                  </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-start text-right hover:border-purple-200 transition-all group">
                  <div className="bg-purple-50 p-3.5 rounded-2xl text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileDown size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">تصدير Word و PDF وتخزين سحابي</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    تصدير مباشر بضغطة زر لملفات Word (.docx) منسقة بجداول رسمية قابلة للتعديل والطباعة مع حفظ المستندات في أرشيف فضاء الأستاذ.
                  </p>
                </div>
              </div>

              {/* 3-Step Interactive Workflow */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">طريقة استخدام المنصة في 3 خطوات بسيطة</h3>
                  <p className="text-xs sm:text-sm text-slate-500">مسار إعداد مرن وسريع يراعي الخصوصيات الديداكتيكية لكل مرحلة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="p-6 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-3 relative overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      1
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">اختيار الخدمة المطلوبة</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      تحديد الأداة (جذاذة درس، فرض امتحان مع عناصر الإجابة، أو ملخص درس) من فضاء الأستاذ.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-3 relative overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      2
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">اختيار المادة والدرس والسلك</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      تحديد المستوى الدراسي (إعدادي أو تأهيلي)، المقرر المعتمد والدرس أو الوضعيات الاختبارية.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-3 relative overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      3
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">التوليد والتصدير إلى Word</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      معاينة الوثيقة وتصديرها فوراً بصيغة Word (.docx) أو PDF منسقة ومؤطرة بالكامل وجاهزة للطباعة والتعديل.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Subscriptions Section */}
              <div id="pricing-section" className="pt-6">
                <PricingSection 
                  onOpenActivationModal={() => setShowPremiumModal(true)}
                  onLogin={handleLogin}
                  isLoggedIn={!!user}
                  currentTier={subscriptionTier}
                />
              </div>
            </motion.div>
          )}

          {/* DASHBOARD STEP */}
          {step === 'dashboard' && user && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="space-y-6"
            >
              {/* Teacher Welcome Banner */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-100 shrink-0">
                    {user.displayName ? user.displayName.charAt(0) : 'أ'}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      مرحباً بك، {profInfo.name || user.displayName || 'الأستاذ(ة)'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {profInfo.school ? `${profInfo.school} • ` : ''}{profInfo.academy || 'مادة الاجتماعيات'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setStep('form');
                      setFormStep(1);
                    }}
                    className="flex-1 sm:flex-none bg-[#4F46E5] text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    إنشاء جذاذة جديدة
                  </button>
                </div>
              </div>

              {/* Quick Launchpad for Teacher Tools */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-600" />
                    <span>الخدمات البيداغوجية السريعة</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">اختر الأداة للبدء فوراً</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Tool 1: Lesson Plan */}
                  <div className="bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 p-5 rounded-3xl border border-indigo-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xs">
                          <BookOpen size={20} />
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                          جذاذات رسمية
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">مولّد الجذاذات</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        بناء جذاذة بيداغوجية كاملة مع تحديد المقاطع والأهداف والنهج المعتمد.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setStep('form');
                        setFormStep(1);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus size={15} />
                      <span>جذاذة جديدة</span>
                    </button>
                  </div>

                  {/* Tool 2: Pioneer Schools Section */}
                  <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-5 rounded-3xl border-2 border-amber-300 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500 transition-all relative overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-xs">
                          <Sparkles size={20} />
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-full border border-amber-200">
                          إعداديات الريادة 🌟
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">إعداديات الريادة</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        جذاذات التدريس الصريح، نماذج امتحانات معيارية، واختبارات TaRL.
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('rayada')}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles size={15} />
                      <span>فضاء الريادة</span>
                    </button>
                  </div>

                  {/* Tool 3: Diagnostic Assessment & Remediation */}
                  <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 p-5 rounded-3xl border-2 border-indigo-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xs">
                          <ClipboardCheck size={20} />
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                          بداية السنة 📋
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">التقويم التشخيصي</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        روائز التقويم، شبكات التنقيط، التقارير الإحصائية، وخطط وجذاذات الدعم.
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('diagnostic')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ClipboardCheck size={15} />
                      <span>فضاء التقويم</span>
                    </button>
                  </div>

                  {/* Tool 4: Exam & Official Answer Keys */}
                  <div className="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs">
                          <FileCheck2 size={20} />
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          الأطر المرجعية
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">مولّد الامتحانات</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        إعداد فروض بـ 3 وضعيات اختبارية مع عناصر الإجابة الرسمية.
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('exam-generator')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles size={15} />
                      <span>توليد فرض</span>
                    </button>
                  </div>

                  {/* Tool 5: Lesson Summaries */}
                  <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 p-5 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-xs">
                          <FileText size={20} />
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          ملخصات بيداغوجية
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">ملخصات الدروس</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        ملخصات دروس بالهيكلة المعتمدة (محاور، مصطلحات وخاتمة).
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('lesson-summary')}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles size={15} />
                      <span>إعداد ملخص</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Quick Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">الجذاذات المنشأة</p>
                    <p className="text-2xl font-black text-slate-900">{history.length}</p>
                  </div>
                  <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600">
                    <FileText size={22} />
                  </div>
                </div>

                <div 
                  onClick={() => setShowPricingModal(true)}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
                  title="انقر لترقية الباقة أو عرض الاشتراكات"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-xs font-bold text-slate-400">مستوى الاشتراك</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        ترقية
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-black text-emerald-600 truncate">{TIER_NAMES[subscriptionTier]}</p>
                  </div>
                  <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 group-hover:scale-105 transition-transform">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                <div 
                  onClick={() => setShowPricingModal(true)}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group"
                  title="انقر لزيادة رصيدك"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">الرصيد المتاح</p>
                    <p className="text-2xl font-black text-slate-900">
                      {subscriptionTier === 'unlimited' ? 'غير محدود' : `${Math.max(0, DOWNLOAD_LIMIT - downloadCount)} / ${DOWNLOAD_LIMIT}`}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3.5 rounded-2xl text-purple-600 group-hover:scale-105 transition-transform">
                    <Award size={22} />
                  </div>
                </div>
              </div>

              {/* Dashboard Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-6 text-sm font-bold text-slate-500">
                <button 
                  onClick={() => setDashboardTab('profile')}
                  className={`pb-3 transition-colors border-b-2 ${dashboardTab === 'profile' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent hover:text-slate-800'}`}
                >
                  المعلومات المهنية والحساب
                </button>
                <button 
                  onClick={() => setDashboardTab('overview')}
                  className={`pb-3 transition-colors border-b-2 ${dashboardTab === 'overview' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent hover:text-slate-800'}`}
                >
                  الجذاذات الأخيرة ({history.length})
                </button>
              </div>

              {/* Tab 1: Recent History */}
              {dashboardTab === 'overview' && (
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                        <FileText size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">لا توجد جذاذات محفوطة في أرشيفك حتى الآن</h3>
                      <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                        ابدأ بتوليد جذاذتك الأولى لمادة الاجتماعيات وفق الدرجات والمستويات التعليمية الرسمية.
                      </p>
                      <button 
                        onClick={() => {
                          setStep('form');
                          setFormStep(1);
                        }}
                        className="bg-[#4F46E5] text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                      >
                        <Plus size={16} />
                        إنشاء أول جذاذة الآن
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.map((item, idx) => (
                        <div 
                          key={item.id ? `${item.id}-${idx}` : `hist-${idx}`}
                          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between gap-4 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600 shrink-0 mt-0.5">
                                <FileText size={20} />
                              </div>
                              <div className="text-right">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-indigo-600 transition-colors">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1">
                                  {item.data?.level || 'الاجتماعيات'} • {item.data?.unit || 'التاريخ'}
                                </p>
                              </div>
                            </div>

                            <button 
                              onClick={() => deleteJadhaFromHistory(item.id)}
                              className="text-slate-300 hover:text-red-500 p-1.5 rounded-xl transition-colors shrink-0"
                              title="حذف الجذاذة"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                            <span className="text-slate-400 text-[11px]">
                              {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('ar-MA') : 'محفوظة'}
                            </span>

                            <button 
                              onClick={() => {
                                setJadhaData(item.data);
                                setStep('view');
                              }}
                              className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              استعراض الجذاذة
                              <ChevronLeft size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Profile Settings */}
              {dashboardTab === 'profile' && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">المعلومات المهنية للأستاذ</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم الأستاذ(ة) الكامل</label>
                      <input 
                        type="text" 
                        value={profInfo.name}
                        onChange={(e) => setProfInfo({...profInfo, name: e.target.value})}
                        placeholder="الاسم والنسب"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">الأكاديمية الجهوية</label>
                      <input 
                        type="text" 
                        value={profInfo.academy}
                        onChange={(e) => setProfInfo({...profInfo, academy: e.target.value})}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">المديرية الإقليمية</label>
                      <input 
                        type="text" 
                        value={profInfo.directorate}
                        onChange={(e) => setProfInfo({...profInfo, directorate: e.target.value})}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">المؤسسة التعليمية</label>
                      <input 
                        type="text" 
                        value={profInfo.school}
                        onChange={(e) => setProfInfo({...profInfo, school: e.target.value})}
                        placeholder="اسم الثانوية الإعدادية أو التأهيلية"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => toast.success('تم حفظ البيانات المهنية بنجاح!')}
                      className="bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      حفظ المعلومات
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEPPER GENERATION FORM (4 STEP WIZARD) */}
          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="space-y-6"
            >
              {/* Stepper Header Bar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      الخطوة {formStep} من 4
                    </span>
                    <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                      {formStep === 1 && 'المعلومات الشخصية والمهنية للأستاذ'}
                      {formStep === 2 && 'تحديد السلك والمستوى والمكون'}
                      {formStep === 3 && 'اختيار الدرس والكتاب والغلاف الزمني'}
                      {formStep === 4 && 'مراجعة الخيارات وتوليد الجذاذة'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setStep(user ? 'dashboard' : 'landing')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors"
                  >
                    إلغاء والعودة
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { step: 1, title: '1. بيانات الأستاذ' },
                    { step: 2, title: '2. السلك والمستوى' },
                    { step: 3, title: '3. الدرس والغلاف' },
                    { step: 4, title: '4. مراجعة وتوليد' }
                  ].map((s) => (
                    <button 
                      key={s.step}
                      type="button"
                      onClick={() => setFormStep(s.step as any)}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                        s.step === formStep 
                          ? 'bg-[#4F46E5] border-indigo-600 text-white font-bold shadow-sm shadow-indigo-100' 
                          : s.step < formStep 
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-800 font-semibold' 
                          : 'bg-slate-50 border-slate-200/80 text-slate-400 font-medium hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{s.title}</span>
                      <div className={`h-1 w-full rounded-full ${
                        s.step === formStep ? 'bg-white/80' : s.step < formStep ? 'bg-indigo-400' : 'bg-slate-200'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Wizard Form Container */}
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
                {/* STEP 1: Teacher & School Personal Info */}
                {formStep === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-black text-slate-900">الخطوة 1: المعلومات الشخصية والمهنية للأستاذ</h3>
                      <p className="text-xs text-slate-500 mt-1">إدخال وتأكيد بيانات الأستاذ والمؤسسة لتضمينها في ترويسة الجذاذة الرسمية</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الأستاذ(ة) الكامل</label>
                        <input 
                          type="text" 
                          value={profInfo.name}
                          onChange={(e) => setProfInfo({...profInfo, name: e.target.value})}
                          placeholder="الاسم والنسب"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المؤسسة التعليمية</label>
                        <input 
                          type="text" 
                          value={profInfo.school}
                          onChange={(e) => setProfInfo({...profInfo, school: e.target.value})}
                          placeholder="اسم الثانوية الإعدادية أو التأهيلية"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الأكاديمية الجهوية</label>
                        <input 
                          type="text" 
                          value={profInfo.academy}
                          onChange={(e) => setProfInfo({...profInfo, academy: e.target.value})}
                          placeholder="جهة الدار البيضاء سطات"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المديرية الإقليمية</label>
                        <input 
                          type="text" 
                          value={profInfo.directorate}
                          onChange={(e) => setProfInfo({...profInfo, directorate: e.target.value})}
                          placeholder="المديرية الإقليمية"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الموسم الدراسي</label>
                        <input 
                          type="text" 
                          value={profInfo.year}
                          onChange={(e) => setProfInfo({...profInfo, year: e.target.value})}
                          placeholder="2025/2026"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Cycle, Level & Subject Component */}
                {formStep === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-black text-slate-900">الخطوة 2: تحديد السلك، المستوى والمكون الدراسي</h3>
                      <p className="text-xs text-slate-500 mt-1">اختر السلك التعليمي والمستوى والمكون المطلوب لإعداد الجذاذة</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-700">السلك التعليمي</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CYCLES.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCycle(c.id)}
                            className={`p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3 ${
                              cycle === c.id 
                              ? 'border-[#4F46E5] bg-indigo-50/50 text-indigo-900' 
                              : 'border-slate-100 hover:border-slate-200 text-slate-600'
                            }`}
                          >
                            <c.icon size={22} className={cycle === c.id ? 'text-[#4F46E5]' : 'text-slate-400'} />
                            <div>
                              <p className="font-bold text-sm">{c.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{c.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المستوى الدراسي</label>
                        <select 
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                          value={level}
                          onChange={e => setLevel(e.target.value)}
                        >
                          {(CYCLE_LEVELS[cycle] || []).map((lvl, lIdx) => (
                            <option key={`lvl-${lIdx}-${lvl}`} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المكون الدراسي</label>
                        <select 
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                          value={component}
                          onChange={e => setComponent(e.target.value)}
                        >
                          <option value="التاريخ">التاريخ</option>
                          <option value="الجغرافيا">الجغرافيا</option>
                          <option value="التربية على المواطنة">التربية على المواطنة</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Lesson Title & Textbooks */}
                {formStep === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-black text-slate-900">الخطوة 3: تحديد الدرس والمرجع والغلاف الزمني</h3>
                      <p className="text-xs text-slate-500 mt-1">حدد عنوان الدرس من المقرر الدراسي المعتمد رسمياً</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الدورة الدراسية</label>
                        <select 
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                          value={semester}
                          onChange={e => setSemester(e.target.value)}
                        >
                          <option value="الدورة الأولى">الدورة الأولى</option>
                          <option value="الدورة الثانية">الدورة الثانية</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الكتاب المدرسي / المرجع المعتمد</label>
                        <select 
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                          value={reference}
                          onChange={e => setReference(e.target.value)}
                        >
                          {(TEXTBOOKS[level] || []).map((book, bIdx) => (
                            <option key={`book-${bIdx}-${book}`} value={book}>{book}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الدرس الرسمـي</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                      >
                        {getLessonsList(level, component, semester).length > 0 ? (
                          getLessonsList(level, component, semester).map((lesson, lIdx) => (
                            <option key={`lesson-${lIdx}-${lesson}`} value={lesson}>{lesson}</option>
                          ))
                        ) : (
                          <option value="">لا توجد دروس متوفرة لهذه الدورة والمكون حالياً</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700">الغلاف الزمني المخصص للحصة / الدرس</label>
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                          {cycle === 'secondary' ? 'مخصص للثانوي التأهيلي (2س - 5س)' : 'مخصص للتعليم الإعدادي (1س - 3س)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {getDurationOptions(cycle).map((d, dIdx) => (
                          <button
                            key={`dur-${dIdx}-${d}`}
                            type="button"
                            onClick={() => setDuration(d)}
                            className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-center ${
                              duration === d 
                                ? 'bg-[#4F46E5] border-indigo-600 text-white shadow-sm shadow-indigo-100' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review & Confirmation */}
                {formStep === 4 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-black text-slate-900">الخطوة 4: تأكيد الخيارات وتوليد الجذاذة</h3>
                      <p className="text-xs text-slate-500 mt-1">مراجعة معلومات الجذاذة قبل البدء في التوليد التربوي الذكي</p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm space-y-3">
                      <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span className="text-slate-500">اسم الأستاذ(ة):</span>
                        <span className="font-bold text-slate-900">{profInfo.name || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span className="text-slate-500">المؤسسة / الأكاديمية:</span>
                        <span className="font-bold text-slate-900">{profInfo.school || 'غير محددة'} - {profInfo.academy}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span className="text-slate-500">المستوى والمكون:</span>
                        <span className="font-bold text-slate-900">{level} - {component}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                        <span className="text-slate-500">عنوان الدرس:</span>
                        <span className="font-bold text-indigo-700">{lessonTitle}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">المرجع والغلاف الزمني:</span>
                        <span className="font-bold text-slate-900">{reference} • {duration}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Navigation Controls */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  {formStep > 1 ? (
                    <button 
                      type="button"
                      onClick={() => setFormStep((prev) => (prev - 1) as any)}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                      <ChevronRight size={16} />
                      الخطوة السابقة
                    </button>
                  ) : <div />}

                  {formStep < 4 ? (
                    <button 
                      type="button"
                      onClick={() => setFormStep((prev) => (prev + 1) as any)}
                      className="px-8 py-3 bg-[#4F46E5] text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                    >
                      متابعة للخطوة التالية
                      <ChevronLeft size={16} />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleGenerate}
                      disabled={!lessonTitle}
                      className="px-8 py-4 bg-[#4F46E5] text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                      <Sparkles size={18} />
                      توليد الجذاذة بالذكاء الاصطناعي
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* GENERATION LOADING STEP */}
          {step === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center space-y-6 max-w-lg mx-auto"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-[#4F46E5] rounded-full animate-spin"></div>
                <Sparkles size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#4F46E5] animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">جاري صياغة جذاذة تربوية متكاملة...</h3>
                <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-2xl inline-block border border-indigo-100">
                  {LOADING_TIPS[loadingTipIndex]}
                </p>
              </div>

              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                يتم الآن توظيف نماذج ذكاء اصطناعي متخصصة في منهاج مادة الاجتماعيات المغربي لبناء سيناريو بيداغوجي دقيق.
              </p>
            </motion.div>
          )}

          {/* VIEW RESULT STEP */}
          {step === 'view' && jadhaData && (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Actions Header Bar */}
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setStep('dashboard')}
                    className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="العودة لفضاء الأستاذ"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">{jadhaData.title}</h2>
                    <p className="text-xs text-slate-500">{jadhaData.level} • {jadhaData.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={() => copyToClipboard(`جذاذة درس: ${jadhaData.title}\nالمستوى: ${jadhaData.level}\nالمكون: ${jadhaData.unit}`)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Copy size={16} />
                    نسخ النص
                  </button>

                  <button 
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Printer size={16} />
                    طباعة
                  </button>

                  <button 
                    onClick={handleDownloadWord}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FileDown size={16} />
                    تصدير Word
                  </button>

                  <button 
                    onClick={handleDownloadPDF}
                    className="px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText size={16} />
                    تصدير PDF
                  </button>
                </div>
              </div>

              {/* Rendered Printable TableJadha */}
              <div id="jadha-content" className="bg-white rounded-3xl border border-slate-200/80 p-2 sm:p-6 shadow-xs overflow-hidden">
                <TableJadha data={jadhaData} />
              </div>

              <div className="flex justify-center pt-4 no-print">
                <button 
                  onClick={() => {
                    setStep('form');
                    setFormStep(1);
                  }}
                  className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  إنشاء جذاذة جديدة
                </button>
              </div>
            </motion.div>
          )}

          {/* RAYADA PIONEER SCHOOLS STEP (MIDDLE SCHOOL FOCUS) */}
          {step === 'rayada' && (
            <motion.div
              key="rayada"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RayadaPioneerHub />
            </motion.div>
          )}

          {/* LESSON SUMMARY STEP (EXPERIMENTAL) */}
          {step === 'lesson-summary' && (
            <motion.div
              key="lesson-summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LessonSummaryGenerator />
            </motion.div>
          )}

          {/* DIAGNOSTIC ASSESSMENT & REMEDIATION STEP */}
          {step === 'diagnostic' && (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DiagnosticHub profInfo={profInfo} onBack={() => setStep('dashboard')} />
            </motion.div>
          )}

          {/* EXAM GENERATOR STEP (MIDDLE SCHOOL & SECONDARY) */}
          {step === 'exam-generator' && (
            <motion.div
              key="exam-generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ExamGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-400 no-print mt-12 space-y-6">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <p className="font-bold text-slate-600">منصة الاجتماعيات الذكية • السياق التربوي والتوجيهات الرسمية بالمغرب</p>
          <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto">
            المنظومة التربوية الرقمية المتكاملة للجذاذات، الفروض المحروسة والامتحانات، والملخصات وفق التوجيهات الرسمية بالمغرب 🇲🇦
          </p>
          <FooterSocialSection />
          <p className="text-[11px] pt-2">Chaoub.az.etu@gmail.com © 2026 جميع الحقوق محفوظة</p>
        </div>
      </footer>

      {/* Premium Activation Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <div key="premium-modal-backdrop" className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div 
              key="premium-modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative space-y-4"
            >
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center text-amber-600 mx-auto">
                <ShieldCheck size={32} />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">تفعيل كود الوصول للمنصة</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  أدخل كود التفعيل لتوسيع رصيد التحميلات أو الحصول على دخول غير محدود لكافة الميزات.
                </p>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="أدخل كود التفعيل هنا"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-sm outline-none focus:border-indigo-500 uppercase"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                />
                
                <button 
                  onClick={handleVerifyCode}
                  className="w-full bg-[#4F46E5] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  تفعيل الحساب الآن
                </button>

                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    setShowPricingModal(true);
                  }}
                  className="w-full py-2.5 text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors flex items-center justify-center gap-1"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>لا تملك كوداً؟ استكشف خطط وباقات الاشتراك</span>
                </button>
              </div>

              <ContactSocialBlock />

              <div className="pt-2 text-[11px] text-slate-400">
                أو التواصل عبر البريد الإلكتروني:<br />
                <span className="font-bold text-indigo-600">Chaoub.az.etu@gmail.com</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Subscriptions & Pricing Modal */}
        {showPricingModal && (
          <div key="pricing-modal-backdrop" className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              key="pricing-modal-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-5xl my-auto"
            >
              <PricingSection
                isModal={true}
                onClose={() => setShowPricingModal(false)}
                onOpenActivationModal={() => {
                  setShowPricingModal(false);
                  setShowPremiumModal(true);
                }}
                onLogin={handleLogin}
                isLoggedIn={!!user}
                currentTier={subscriptionTier}
              />
            </motion.div>
          </div>
        )}

        {/* API Key Modal */}
        {showKeyHelp && (
          <div key="key-help-modal-backdrop" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div 
              key="key-help-modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900">إعدادات مفتاح التوليد</h3>
                <button onClick={() => setShowKeyHelp(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  تعتمد المنصة على مفتاح منصة افتراضي لإنشاء الجذاذات. يمكن إضافة مفتاح شخصي اختياري للحصول على استجابة أسرع.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المفتاح الشخصي (AIza...)</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      placeholder="AIzaSy..."
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 font-mono"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                    />
                    <button 
                      onClick={handleSaveManualKey}
                      className="px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                      حفظ
                    </button>
                  </div>
                  {manualKey && (
                    <button 
                      onClick={handleClearKey}
                      className="mt-2 text-[10px] text-red-500 hover:underline block"
                    >
                      حذف المفتاح الشخصي
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Admin Dashboard Modal */}
        {showAdminPanel && isAdmin && (
          <AdminDashboardModal 
            key="admin-dashboard-modal"
            isOpen={true}
            onClose={() => setShowAdminPanel(false)}
            users={adminUsers}
            codes={adminCodes}
            allJadhas={history}
            currentUserEmail={user?.email}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
