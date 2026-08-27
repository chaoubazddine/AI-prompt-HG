import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setErrorMessage(null);
    setResetSent(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صالح، يرجى التأكد من كتابته بشكل صحيح.';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني.';
      case 'auth/user-not-found':
        return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يمكنك إنشاء حساب جديد.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'كلمة المرور غير صحيحة أو بيانات الدخول غير مطابقة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول مباشرة.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف أو أرقام على الأقل.';
      case 'auth/popup-closed-by-user':
        return 'تم إغلاق نافذة تسجيل الدخول بجوجل قبل إتمام العملية.';
      case 'auth/unauthorized-domain':
        return 'الدومين الحالي يحتاج تفعيلاً في قائمة النطاقات المصرح بها لدى Firebase Auth.';
      case 'auth/network-request-failed':
        return 'فشل الاتصال بالشبكة، يرجى التحقق من اتصال الإنترنت.';
      default:
        return 'حدث خطأ أثناء إتمام العملية. يرجى المحاولة مجدداً.';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        setResetSent(true);
        toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!');
      } catch (err: any) {
        console.error('Password reset error:', err);
        setErrorMessage(getFirebaseErrorMessage(err?.code || ''));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setErrorMessage('يرجى إدخال اسم الأستاذ(ة) الكامل.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('يجب أن تتكون كلمة المرور من 6 خانات على الأقل.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('كلمتا المرور غير متطابقتين.');
        return;
      }

      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: displayName.trim()
          });
        }
        toast.success(`مرحباً بك أستاذ(ة) ${displayName.trim()}! تم إنشاء حسابك بنجاح.`);
        handleClose();
        if (onSuccess) onSuccess();
      } catch (err: any) {
        console.error('Registration error:', err);
        setErrorMessage(getFirebaseErrorMessage(err?.code || ''));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login Mode
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        toast.success('تم تسجيل الدخول بنجاح! مرحباً بك في فضاء الأستاذ.');
        handleClose();
        if (onSuccess) onSuccess();
      } catch (err: any) {
        console.error('Login error:', err);
        setErrorMessage(getFirebaseErrorMessage(err?.code || ''));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('تم تسجيل الدخول بحساب Google بنجاح!');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMessage(getFirebaseErrorMessage(err?.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden my-6 relative"
        id="teacher-auth-modal"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white relative">
          <button 
            onClick={handleClose}
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title="إغلاق"
            id="close-auth-modal-btn"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sparkles size={20} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">فضاء أستاذ الاجتماعيات</h2>
              <p className="text-xs text-indigo-200">الولوج للمنصة وتوليد الجذاذات والفروض والملخصات</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Login / Register) */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1.5">
            <button 
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                mode === 'login' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-login-btn"
            >
              <LogIn size={15} />
              <span>تسجيل الدخول</span>
            </button>
            <button 
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                mode === 'register' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-register-btn"
            >
              <UserPlus size={15} />
              <span>إنشاء حساب جديد</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <div>
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-xs active:scale-98 disabled:opacity-50"
                id="google-login-btn"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>الدخول السريع بحساب Google</span>
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400">
                  أو بالبريد الإلكتروني وكلمة المرور
                </span>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forgot Password Confirmation */}
          {mode === 'forgot' && resetSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 mb-1">تم إرسال رابط الاستعادة!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  يرجى تفقد بريدك الإلكتروني (<span className="font-bold text-slate-800">{email}</span>) والضغط على الرابط لإعادة تعيين كلمة المرور.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all"
              >
                العودة إلى تسجيل الدخول
              </button>
            </div>
          ) : (
            /* Auth Form */
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {/* Display Name (Register Mode Only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User size={13} className="text-indigo-600" />
                    <span>الاسم الكامل للأستاذ(ة)</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: ذ. عبد الرحيم الشاوب"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800 outline-none transition-all"
                    id="input-display-name"
                  />
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail size={13} className="text-indigo-600" />
                  <span>البريد الإلكتروني</span>
                </label>
                <input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800 outline-none transition-all"
                  dir="ltr"
                  id="input-email"
                />
              </div>

              {/* Password */}
              {mode !== 'forgot' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock size={13} className="text-indigo-600" />
                      <span>كلمة المرور</span>
                    </label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => { setMode('forgot'); setErrorMessage(null); }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                        id="forgot-password-link"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800 outline-none transition-all pl-10"
                      dir="ltr"
                      id="input-password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Register Mode Only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-indigo-600" />
                    <span>تأكيد كلمة المرور</span>
                  </label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800 outline-none transition-all"
                    dir="ltr"
                    id="input-confirm-password"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
                id="submit-auth-form-btn"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {mode === 'login' && (
                      <>
                        <LogIn size={16} />
                        <span>دخول فضاء الأستاذ</span>
                      </>
                    )}
                    {mode === 'register' && (
                      <>
                        <UserPlus size={16} />
                        <span>إنشاء الحساب والمتابعة</span>
                      </>
                    )}
                    {mode === 'forgot' && (
                      <>
                        <KeyRound size={16} />
                        <span>إرسال رابط إعادة التعيين</span>
                      </>
                    )}
                  </>
                )}
              </button>

              {/* Back to Login from Forgot */}
              {mode === 'forgot' && (
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(null); }}
                  className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-1 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={13} />
                  <span>العودة إلى تسجيل الدخول</span>
                </button>
              )}
            </form>
          )}

          {/* Footer Notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              منصة آمنة ومشفرة بالكامل مخصصة لأساتذة مادة الاجتماعيات بالمغرب
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
