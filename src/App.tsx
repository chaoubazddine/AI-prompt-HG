/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  BookOpen, 
  Sparkles, 
  Download, 
  Save, 
  Search, 
  GraduationCap,
  ChevronRight,
  FileText,
  LogOut,
  Share2,
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
  Map,
  Globe,
  Compass,
  ShieldCheck,
  Star
} from 'lucide-react';
import { TableJadha, JadhaData } from './components/TableJadha';
import { generateJadha } from './services/geminiService';
import { CYCLES, DOC_TYPES, LESSONS_DATA, CYCLE_LEVELS, TEXTBOOKS } from './constants';
import { downloadWord } from './utils/wordExport';
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError, 
  FirebaseUser,
  Timestamp
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
          <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center">
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
  const [step, setStep] = useState<'landing' | 'form' | 'generate' | 'view'>('landing');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jadhaData, setJadhaData] = useState<JadhaData | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [manualKey, setManualKey] = useState(() => localStorage.getItem('user_gemini_key') || '');
  const [downloadCount, setDownloadCount] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'basic' | 'advanced' | 'unlimited'>('free');
  const [activationCode, setActivationCode] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [adminCodes, setAdminCodes] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'codes' | 'users'>('codes');
  const [adminSelectedTier, setAdminSelectedTier] = useState<'basic' | 'advanced' | 'unlimited'>('basic');


  const TIER_LIMITS = {
    free: 5,
    basic: 10,
    advanced: 25,
    unlimited: Infinity
  };

  const TIER_NAMES = {
    free: 'دخول مجاني',
    basic: 'الدخول البسيط',
    advanced: 'الدخول المتقدم',
    unlimited: 'دخول غير محدود'
  };

  const DOWNLOAD_LIMIT = TIER_LIMITS[subscriptionTier];
  const isAdmin = user?.email === 'chaoub7@gmail.com';

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
      }));
      setAdminUsers(users);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    return () => {
      unsubscribeCodes();
      unsubscribeUsers();
    };
  }, [isAdmin]);

  const generateNewCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'JADHA-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
      await setDoc(doc(db, 'activationCodes', code), {
        isValid: true,
        tier: adminSelectedTier,
        createdAt: serverTimestamp(),
        createdBy: user?.email
      });
      toast.success(`تم توليد كود (${adminSelectedTier}): ${code}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'activationCodes');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ الكود بنجاح');
  };

  const deleteCode = async (codeId: string) => {
    try {
      await deleteDoc(doc(db, 'activationCodes', codeId));
      toast.success('تم حذف الكود');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'activationCodes');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);

      if (firebaseUser) {
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
              // Migrate old user schema
              await updateDoc(userRef, {
                subscriptionTier: data.isPremium ? 'unlimited' : 'free',
                downloadCount: data.downloadCount || 0
              });
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'users');
        }
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
      limit(10)
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
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (err) {
      toast.error('فشل تسجيل الدخول');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setStep('landing');
      toast.success('تم تسجيل الخروج');
    } catch (err) {
      toast.error('فشل تسجيل الخروج');
    }
  };

  const handleVerifyCode = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    const code = activationCode.trim().toUpperCase();
    if (!code) return;

    try {
      const codeRef = doc(db, 'activationCodes', code);
      const codeDoc = await getDoc(codeRef);

      if (codeDoc.exists() && codeDoc.data().isValid) {
        const tier = codeDoc.data().tier || 'unlimited';
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { subscriptionTier: tier });
        setShowPremiumModal(false);
        toast.success(`تم تفعيل ${TIER_NAMES[tier as keyof typeof TIER_NAMES]} بنجاح!`, {
          description: tier === 'unlimited' ? 'استمتع بجميع ميزات المنصة دون قيود.' : `لديك الآن ${TIER_LIMITS[tier as keyof typeof TIER_LIMITS]} تحميلاً متاحاً.`,
          duration: 5000,
        });
      } else {
        toast.error('كود التفعيل غير صحيح', {
          description: 'يرجى التأكد من الكود أو التواصل مع الإدارة.',
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const incrementDownloadCount = async () => {
    if (!user || subscriptionTier === 'unlimited') return;

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
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'jadhas');
    }
  };

  const checkDownloadLimit = () => {
    if (subscriptionTier !== 'unlimited' && downloadCount >= DOWNLOAD_LIMIT) {
      setShowPremiumModal(true);
      return false;
    }
    return true;
  };

  const incrementDownload = () => {
    if (subscriptionTier !== 'unlimited') {
      setDownloadCount(prev => prev + 1);
    }
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
        // If external, check if we have a manual key
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
      toast.success('تم حفظ مفتاحك الشخصي بنجاح!', {
        description: 'سيتم استخدامه الآن بدلاً من المفتاح الافتراضي.',
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
    setHasKey(true); // Fallback to admin key
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

  // Form State
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

  // Update profInfo when user data changes
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

  // Save profInfo to Firestore whenever it changes
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
    
    const timeoutId = setTimeout(saveProfInfo, 2000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [profInfo, user]);

  const [cycle, setCycle] = useState('prep');
  const [level, setLevel] = useState('الأولى إعدادي');
  const [component, setComponent] = useState('التاريخ');
  const [semester, setSemester] = useState('الدورة الأولى');
  const [reference, setReference] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');

  // Update level when cycle changes
  useEffect(() => {
    const levels = CYCLE_LEVELS[cycle] || [];
    if (levels.length > 0) {
      setLevel(levels[0]);
    }
  }, [cycle]);

  // Helper to safely extract lessons list based on level, component, and semester
  const getLessonsList = (lvl: string, comp: string, sem: string): string[] => {
    const levelData = (LESSONS_DATA as any)[lvl];
    if (!levelData) return [];
    const compData = levelData[comp];
    if (!compData) return [];
    if (Array.isArray(compData)) return compData;
    return compData[sem] || Object.values(compData).flat() || [];
  };

  // Update reference and lesson title when level, component, or semester changes
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
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!lessonTitle) {
      toast.warning('تنبيه', {
        description: 'يرجى اختيار عنوان الدرس أولاً.',
      });
      return;
    }
    
    setIsGenerating(true);
    setStep('generate');
    
    try {
      console.log("Starting generation for:", lessonTitle, level, reference);
      const data = await generateJadha(lessonTitle, level, reference);
      
      if (!data) throw new Error("لم يتم استلام بيانات من الخدمة");

      // Merge professional info into the generated data
      const finalData: JadhaData = {
        ...data,
        level: level,
        year: profInfo.year,
        unit: component,
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
      loading: 'جاري تحضير ملف Word...',
      success: () => {
        incrementDownloadCount();
        return 'تم تحميل ملف Word بنجاح!';
      },
      error: 'عذراً، فشل تحميل الملف.',
    });
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('jadha-content');
    if (!element) return;
    if (!checkDownloadLimit()) return;

    toast.loading('جاري تحضير ملف PDF...', { id: 'pdf-toast' });

    // Temporary style to fix html2canvas oklch issue globally during capture
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
          // Additional cleaning in the clone
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
      
      // Cleanup the temporary style
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
      pdf.save(`Jadha_${(jadhaData?.title || "Lesson").replace(/\s+/g, '_')}.pdf`);

      toast.success('تم تحميل ملف PDF بنجاح!', { id: 'pdf-toast' });
      await incrementDownloadCount();
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error('عذراً، فشل تصدير ملف PDF.', { id: 'pdf-toast' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900" dir="rtl">
      <Toaster position="top-center" richColors closeButton />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-4 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#4F46E5] p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">منصة الاجتماعيات الذكية</h1>
              <p className="text-[10px] text-slate-400 mt-1">توليد الجذاذات التربوية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900">{user.displayName}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-black flex items-center gap-1 ${subscriptionTier === 'free' ? 'text-slate-400' : 'text-emerald-600'}`}>
                        <ShieldCheck size={10} />
                        {TIER_NAMES[subscriptionTier]}
                      </span>
                      {subscriptionTier !== 'unlimited' && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          • {downloadCount}/{DOWNLOAD_LIMIT}
                        </span>
                      )}
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAdminPanel(true)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="لوحة التحكم"
                    >
                      <ShieldCheck size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowKeyHelp(true)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="الإعدادات"
                  >
                    <Settings size={20} />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-[#4F46E5] text-white px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
              >
                <LogIn size={18} />
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden text-right"
              dir="rtl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-2xl font-black">لوحة التحكم</h3>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setAdminTab('codes')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === 'codes' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                  >
                    الأكواد
                  </button>
                  <button 
                    onClick={() => setAdminTab('users')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adminTab === 'users' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                  >
                    المستخدمين
                  </button>
                </div>
                <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                {adminTab === 'codes' ? (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div>
                        <p className="text-slate-500">إدارة أكواد التفعيل للمستخدمين</p>
                        <div className="flex gap-2 mt-2">
                          {(['basic', 'advanced', 'unlimited'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setAdminSelectedTier(t)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${adminSelectedTier === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                              {TIER_NAMES[t]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={generateNewCode}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                      >
                        <RefreshCw size={18} />
                        توليد كود {TIER_NAMES[adminSelectedTier]}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {adminCodes.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">لا توجد أكواد حالياً</div>
                      ) : (
                        adminCodes.map((code) => (
                          <div key={code.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4">
                              <code className="bg-white px-4 py-2 rounded-xl font-mono font-bold text-indigo-600 border border-slate-200">
                                {code.id}
                              </code>
                              <div className="flex flex-col">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit ${code.isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                  {code.isValid ? 'صالح' : 'غير صالح'}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-1 font-bold">
                                  المستوى: {TIER_NAMES[code.tier as keyof typeof TIER_NAMES] || code.tier}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => copyToClipboard(code.id)}
                                className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="نسخ الكود"
                              >
                                <Copy size={18} />
                              </button>
                              <button 
                                onClick={() => deleteCode(code.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="حذف الكود"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-slate-500">قائمة المستخدمين المسجلين في المنصة</p>
                      <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm">
                        إجمالي المستخدمين: {adminUsers.length}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {adminUsers.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">لا يوجد مستخدمون حالياً</div>
                      ) : (
                        adminUsers.map((u) => (
                          <div key={u.id} className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <User size={24} />
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-900">{u.displayName || 'مستخدم غير معروف'}</p>
                                <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold mb-1">المستوى</p>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-black ${u.subscriptionTier === 'free' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {TIER_NAMES[u.subscriptionTier as keyof typeof TIER_NAMES] || u.subscriptionTier}
                                </span>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold mb-1">التحميلات</p>
                                <p className="text-sm font-black text-slate-900">{u.downloadCount || 0}</p>
                              </div>
                              
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold mb-1">تاريخ الانضمام</p>
                                <p className="text-[10px] font-bold text-slate-500">
                                  {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('ar-MA') : 'غير متوفر'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setShowAdminPanel(false)}
                  className="text-slate-500 font-bold hover:text-slate-700"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <p className="text-sm font-bold">{error}</p>
              {!hasKey && (
                <button 
                  onClick={handleSelectKey}
                  className="px-4 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  تفعيل الآن
                </button>
              )}
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-12"
            >
              <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
                منصة جذاذات <br />
                <span className="text-[#4F46E5]">الاجتماعيات الذكية</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl mb-12 leading-relaxed">
                نحن نعيد ابتكار طريقة تحضير الدروس. منصة متكاملة توفر وصولاً مباشراً للمحتوى، مصممة خصيصاً لأساتذة الاجتماعيات بالمغرب لإنتاج جذاذات تربوية احترافية في ثوانٍ.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center group transition-all hover:shadow-xl hover:shadow-indigo-50"
                >
                  <div className="bg-yellow-50 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <Clock className="text-yellow-600" size={32} />
                  </div>
                  <p className="text-slate-400 text-sm font-bold mb-2">توفير الوقت</p>
                  <p className="text-3xl font-black text-slate-900">60 ثانية</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center group transition-all hover:shadow-xl hover:shadow-emerald-50"
                >
                  <div className="bg-emerald-50 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <CheckCircle className="text-emerald-600" size={32} />
                  </div>
                  <p className="text-slate-400 text-sm font-bold mb-2">الدقة</p>
                  <p className="text-3xl font-black text-slate-900">100%</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center group transition-all hover:shadow-xl hover:shadow-blue-50"
                >
                  <div className="bg-blue-50 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="text-blue-600" size={32} />
                  </div>
                  <p className="text-slate-400 text-sm font-bold mb-2">الموثوقية</p>
                  <p className="text-3xl font-black text-slate-900">رسمي</p>
                </motion.div>
              </div>

              <div className="bg-white w-full max-w-2xl p-12 rounded-[56px] shadow-2xl shadow-indigo-100 flex flex-col items-center border border-slate-50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="bg-indigo-600 p-5 rounded-3xl text-white mb-8 shadow-xl shadow-indigo-200 animate-float">
                  <LogIn size={36} />
                </div>
                <h2 className="text-4xl font-black mb-4">فضاء الأساتذة</h2>
                <p className="text-slate-500 mb-12 text-lg">اضغط على الزر أدناه للولوج مباشرة إلى فضاء العمل الخاص بك والبدء في توليد الجذاذات التربوية الاحترافية.</p>
                <button 
                  onClick={user ? () => setStep('form') : handleLogin}
                  className="w-full bg-[#4F46E5] text-white py-6 rounded-3xl text-2xl font-black shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                >
                  {user ? 'دخول الأستاذ' : 'تسجيل الدخول للبدء'}
                  <ChevronRight size={28} className="rotate-180 group-hover:translate-x-[-4px] transition-transform" />
                </button>
                <p className="text-xs text-slate-400 mt-10 font-medium">المنصة مخصصة حصرياً لأساتذة مادة الاجتماعيات بالمغرب</p>
                
                {history.length > 0 && (
                  <div className="mt-12 w-full text-right">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                        <History size={20} />
                      </div>
                      <h3 className="text-xl font-black">آخر الجذاذات المولدة</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setJadhaData(item.data);
                            setStep('view');
                          }}
                          className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-indigo-600 transition-colors">
                              <FileText size={18} />
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{item.title}</p>
                              <p className="text-[10px] text-slate-400">
                                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('ar-MA') : 'قيد المعالجة...'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors rotate-180" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-16 bg-slate-50 border border-slate-100 p-10 rounded-[40px] text-right w-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">نظام الوصول المتقدم</h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4 p-2 bg-white rounded-3xl border border-slate-200 shadow-sm focus-within:border-indigo-500 transition-colors">
                    <div className="flex-1 px-4 py-2 w-full">
                      <p className="text-[10px] text-slate-400 mb-1 font-bold">هل لديك كود تفعيل؟</p>
                      <input 
                        type="text" 
                        placeholder="أدخل الكود هنا"
                        className="w-full bg-transparent border-none outline-none text-lg font-black text-slate-900 placeholder:text-slate-300"
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={handleVerifyCode}
                      className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                      تفعيل الآن
                    </button>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 py-3 px-5 rounded-2xl border border-amber-100 flex-1">
                      <Info size={16} />
                      <p className="text-xs font-bold">
                        للحصول على الكود، يرجى التواصل عبر البريد الإلكتروني.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('SOCIAL-PRO-2026');
                        toast.success('تم نسخ كود التجربة!', { description: 'يمكنك استخدامه الآن لتفعيل الميزات.' });
                      }}
                      className="bg-white border border-slate-200 text-slate-400 px-4 py-3 rounded-2xl text-[10px] font-bold hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2"
                    >
                      <Copy size={14} />
                      نسخ كود التجربة
                    </button>
                  </div>
                </div>

                {/* Subscription Tiers Bento Section */}
                <div className="mt-12 w-full max-w-2xl">
                  <div className="flex items-center gap-3 mb-6 justify-center">
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                      <ShieldCheck size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">مستويات الدخول المتاحة</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] flex flex-col items-center text-center group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm group-hover:text-indigo-500 transition-colors">
                        <User size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 mb-1">بسيط</p>
                      <p className="text-xl font-black text-slate-900">10 تحميلات</p>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] flex flex-col items-center text-center group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm group-hover:text-indigo-500 transition-colors">
                        <Sparkles size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 mb-1">متقدم</p>
                      <p className="text-xl font-black text-slate-900">25 تحميلاً</p>
                    </div>
                    
                    <div className="bg-indigo-600 p-6 rounded-[32px] flex flex-col items-center text-center shadow-xl shadow-indigo-100 transform hover:scale-[1.05] transition-all">
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 backdrop-blur-sm">
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-xs font-bold text-indigo-100 mb-1">احترافي</p>
                      <p className="text-xl font-black text-white">غير محدود</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Doc Type */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-50 p-2 rounded-xl text-[#4F46E5]">
                    <Layout size={20} />
                  </div>
                  <h3 className="font-bold">نوع الوثيقة</h3>
                </div>
                <div className="space-y-3">
                  {DOC_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setDocType(type.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        docType === type.id 
                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-50 text-slate-600 hover:border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon size={20} />
                        <span className="font-bold">{type.name}</span>
                      </div>
                      {docType === type.id && <CheckCircle size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professional Info */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-indigo-50 p-2 rounded-xl text-[#4F46E5]">
                    <User size={20} />
                  </div>
                  <h3 className="font-bold">المعلومات المهنية</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 mr-2">اسم الأستاذ(ة)</label>
                    <input 
                      type="text"
                      placeholder="الاسم الكامل"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profInfo.name}
                      onChange={e => setProfInfo({...profInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 mr-2">الأكاديمية</label>
                    <input 
                      type="text"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profInfo.academy}
                      onChange={e => setProfInfo({...profInfo, academy: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 mr-2">المديرية الإقليمية</label>
                    <input 
                      type="text"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profInfo.directorate}
                      onChange={e => setProfInfo({...profInfo, directorate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 mr-2">المؤسسة</label>
                    <input 
                      type="text"
                      placeholder="اسم الثانوية/الإعدادية"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profInfo.school}
                      onChange={e => setProfInfo({...profInfo, school: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-2 mr-2">الموسم الدراسي</label>
                    <input 
                      type="text"
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={profInfo.year}
                      onChange={e => setProfInfo({...profInfo, year: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Jadha Config */}
              <div className="bg-[#1E1B4B] p-12 rounded-[48px] text-white shadow-2xl">
                <h2 className="text-4xl font-black mb-4">إعداد الجذاذة التربوية</h2>
                <p className="text-indigo-200 mb-12">حدد تفاصيل الدرس لإنشاء محتوى بيداغوجي احترافي</p>

                <div className="space-y-10">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-indigo-500/20 p-2 rounded-xl">
                        <GraduationCap size={20} />
                      </div>
                      <h3 className="font-bold">اختر السلك الدراسي</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {CYCLES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setCycle(c.id)}
                          className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 text-center ${
                            cycle === c.id 
                            ? 'bg-white border-white text-[#4F46E5] shadow-xl' 
                            : 'bg-transparent border-white/10 text-white hover:border-white/20'
                          }`}
                        >
                          <div className={`p-3 rounded-2xl ${cycle === c.id ? 'bg-indigo-50' : 'bg-white/5'}`}>
                            <c.icon size={28} />
                          </div>
                          <span className="text-lg font-bold">{c.name}</span>
                          <p className={`text-[10px] leading-relaxed ${cycle === c.id ? 'text-slate-500' : 'text-indigo-200/60'}`}>
                            {c.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 mr-2">
                        <Layout size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold">المستوى الدراسي</span>
                      </div>
                      <select 
                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 transition-all appearance-none"
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                      >
                        {Object.keys(LESSONS_DATA).map(lvl => (
                          <option key={lvl} className="text-slate-900" value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 mr-2">
                        <Layout size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold">المكون</span>
                      </div>
                      <select 
                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 transition-all appearance-none"
                        value={component}
                        onChange={e => setComponent(e.target.value)}
                      >
                        <option className="text-slate-900">التاريخ</option>
                        <option className="text-slate-900">الجغرافيا</option>
                        <option className="text-slate-900">التربية على المواطنة</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 mr-2">
                        <Layout size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold">الدورة</span>
                      </div>
                      <select 
                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 transition-all appearance-none"
                        value={semester}
                        onChange={e => setSemester(e.target.value)}
                      >
                        <option className="text-slate-900">الدورة الأولى</option>
                        <option className="text-slate-900">الدورة الثانية</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 mr-2">
                        <BookOpen size={16} className="text-indigo-400" />
                        <span className="text-sm font-bold">المرجع المعتمد</span>
                      </div>
                      <select 
                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 transition-all appearance-none"
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                      >
                        {(TEXTBOOKS[level] || []).map(book => (
                          <option key={book} className="text-slate-900" value={book}>{book}</option>
                        ))}
                        {(TEXTBOOKS[level] || []).length === 0 && (
                          <>
                            <option className="text-slate-900">منار الاجتماعيات</option>
                            <option className="text-slate-900">الفضاء في الاجتماعيات</option>
                            <option className="text-slate-900">المسار في الاجتماعيات</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2 mr-2">
                      <Search size={16} className="text-indigo-400" />
                      <span className="text-sm font-bold">عنوان الدرس</span>
                    </div>
                    <select 
                      className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:bg-white/10 transition-all appearance-none"
                      value={lessonTitle}
                      onChange={e => setLessonTitle(e.target.value)}
                    >
                      {getLessonsList(level, component, semester).length > 0 ? (
                        getLessonsList(level, component, semester).map(lesson => (
                          <option key={lesson} className="text-slate-900" value={lesson}>{lesson}</option>
                        ))
                      ) : (
                        <option className="text-slate-900" value="">لا توجد دروس متوفرة لهذا المكون حالياً</option>
                      )}
                    </select>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    disabled={!lessonTitle}
                    className="w-full bg-[#4F46E5] text-white py-6 rounded-[32px] text-2xl font-black shadow-2xl shadow-indigo-900/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    <RefreshCw size={28} />
                    إنشاء الجذاذة التربوية
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-100 border-t-[#4F46E5] rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#4F46E5] animate-pulse" size={32} />
              </div>
              <h2 className="text-3xl font-black mt-10 mb-4">جاري بناء جذاذة احترافية...</h2>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                يقوم الذكاء الاصطناعي الآن بتحليل التوجيهات التربوية الرسمية، واستخراج الوثائق المناسبة، وبناء سيناريو ديداكتيكي متكامل وغني بالمعطيات. قد يستغرق هذا بضع ثوانٍ لضمان أعلى جودة.
              </p>
            </motion.div>
          )}

          {step === 'view' && jadhaData && (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-[#4F46E5]">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{jadhaData.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{jadhaData.level} • {jadhaData.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 no-print">
                  <button 
                    onClick={handleDownloadWord}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-bold shadow-xl shadow-blue-100"
                  >
                    <FileDown size={18} />
                    تحميل Word
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#4F46E5] text-white hover:opacity-90 transition-all text-sm font-bold shadow-xl shadow-indigo-100"
                  >
                    <FileText size={18} />
                    تحميل PDF
                  </button>
                </div>
              </div>

              <div id="jadha-content" className="overflow-hidden print:shadow-none print:border-none" style={{ backgroundColor: '#ffffff', borderRadius: '48px', border: '1px solid #F1F5F9' }}>
                <TableJadha data={jadhaData} />
              </div>

              <div className="flex justify-center py-12">
                <button 
                  onClick={() => setStep('form')}
                  className="text-slate-400 hover:text-[#4F46E5] font-bold transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  توليد جذاذة أخرى
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center border-t border-slate-100 bg-white mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-slate-500 font-bold">للتواصل والاستفسار:</p>
            <a 
              href="mailto:Chaoub.az.etu@gmail.com" 
              className="text-indigo-600 font-mono text-lg hover:underline flex items-center gap-2"
            >
              Chaoub.az.etu@gmail.com
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-[10px] text-slate-300 mt-8">المنصة مخصصة حصرياً لأساتذة مادة الاجتماعيات بالمغرب</p>
          <p className="text-[10px] text-slate-300 mt-1">© 2026 جميع الحقوق محفوظة</p>
        </div>
      </footer>

      {/* Key Help Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 text-center shadow-2xl"
            >
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black mb-4">لقد وصلت للحد الأقصى!</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                لقد استهلكت جميع التحميلات المجانية المتاحة ({DOWNLOAD_LIMIT} تحميلات). يرجى إدخال كود التفعيل لمتابعة العمل والحصول على وصول أوسع.
              </p>
              
              <div className="grid grid-cols-1 gap-3 mb-8 text-right">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-emerald-700">دخول بسيط</span>
                  <span className="text-xs text-emerald-600">10 تحميلات</span>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-indigo-700">دخول متقدم</span>
                  <span className="text-xs text-indigo-600">25 تحميلاً</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-amber-700">دخول غير محدود</span>
                  <span className="text-xs text-amber-600">بدون قيود</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="أدخل كود التفعيل هنا"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                />
                <button 
                  onClick={handleVerifyCode}
                  className="w-full bg-[#4F46E5] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all"
                >
                  تفعيل الكود
                </button>
                <button 
                  onClick={() => setShowPremiumModal(false)}
                  className="w-full py-2 text-slate-400 text-sm font-bold hover:text-slate-600"
                >
                  إغلاق
                </button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">لطلب كود التفعيل، تواصل معنا عبر:</p>
                <p className="font-bold text-indigo-600">Chaoub.az.etu@gmail.com</p>
              </div>
            </motion.div>
          </div>
        )}

        {showKeyHelp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                    <Info size={24} />
                  </div>
                  <button onClick={() => setShowKeyHelp(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                  </button>
                </div>
                
                <h3 className="text-2xl font-black mb-4">إعدادات تفعيل المنصة</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  تستخدم المنصة حالياً <b>{manualKey ? 'مفتاحك الشخصي' : 'المفتاح الافتراضي للمنصة'}</b>. يمكنك تغيير الإعدادات أدناه:
                </p>
                
                <div className="space-y-4 mb-8">
                  {!manualKey && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1 text-sm">
                        <CheckCircle size={16} />
                        المفتاح الافتراضي يعمل
                      </div>
                      <p className="text-xs text-emerald-600">يمكنك استخدام المنصة مباشرة، أو إضافة مفتاحك الخاص لتجنب ضغط الاستخدام.</p>
                    </div>
                  )}

                  <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-indigo-600 shadow-sm shrink-0">1</div>
                    <p className="text-sm text-slate-600">احصل على مفتاح مجاني من <b>Google AI Studio</b>.</p>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-indigo-600 shadow-sm shrink-0">2</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-3">أدخل مفتاحك الشخصي هنا:</p>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          placeholder="AIza..."
                          className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                          value={manualKey}
                          onChange={(e) => setManualKey(e.target.value)}
                        />
                        <button 
                          onClick={handleSaveManualKey}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                        >
                          حفظ
                        </button>
                      </div>
                      {manualKey && (
                        <button 
                          onClick={handleClearKey}
                          className="mt-2 text-[10px] text-red-500 hover:underline"
                        >
                          حذف المفتاح الشخصي والرجوع للافتراضي
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#4F46E5] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    الحصول على مفتاح مجاني الآن
                    <ExternalLink size={18} />
                  </a>
                  <button 
                    onClick={() => setShowKeyHelp(false)}
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
