import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Copy, 
  MessageCircle, 
  X, 
  CreditCard, 
  Building2, 
  HelpCircle,
  ChevronDown,
  ArrowLeft,
  Flame,
  Award,
  Layers,
  FileCheck2
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingSectionProps {
  onSelectPlan?: (planId: string, billingCycle: 'monthly' | 'annual') => void;
  onOpenActivationModal?: () => void;
  onLogin?: () => void;
  isLoggedIn?: boolean;
  currentTier?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  onOpenActivationModal,
  onLogin,
  isLoggedIn = false,
  currentTier = 'free',
  isModal = false,
  onClose
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any | null>(null);
  const [paymentTab, setPaymentTab] = useState<'code' | 'bank' | 'whatsapp'>('code');
  const [inputCode, setInputCode] = useState('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} إلى الحافظة`);
  };

  const PLANS = [
    {
      id: 'basic',
      name: 'باقة الأستاذ',
      tagline: 'الأساسية',
      description: 'لتحضير الدروس والوثائق الديداكتيكية الأساسية بسرعة وسلاسة.',
      badge: 'الأساسية',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      priceMonthly: 19,
      priceAnnual: 99,
      periodMonthlyText: 'د.م / شهرياً',
      periodAnnualText: 'د.م / للموسم كاملاً',
      note: billingCycle === 'annual' ? '120 تحميلاً للموسم' : 'حصة 15 جذاذة شهرياً',
      popular: false,
      buttonText: 'اشترك في الباقة',
      featuresMonthly: [
        'توليد الجذاذات الديداكتيكية للإعدادي والتأهيلي',
        'ملخصات الدروس الشاملة والخطاطات المفاهيمية',
        'حصة شهرية: 15 جذاذة + 15 ملخصاً بصيغة Word و PDF',
        'حفظ حتى 30 جذاذة في الأرشيف السحابي الشخصي',
        'مطابقة تامة مع الكتب المدرسية والمقررات الرسمية',
      ],
      featuresAnnual: [
        'توليد الجذاذات الديداكتيكية للإعدادي والتأهيلي',
        'ملخصات الدروس الشاملة والخطاطات المفاهيمية',
        'رصيد سنوي موسع: 120 تحميلاً للموسم الدراسي',
        'حفظ حتى 100 جذاذة في الأرشيف السحابي',
        'توفير كبير مقارنة بالاشتراك الشهري المنفرد',
      ],
      features: [
        'توليد الجذاذات الديداكتيكية للإعدادي والتأهيلي',
        'ملخصات الدروس الشاملة والخطاطات المفاهيمية',
        'تصدير Word (.docx) و PDF جاهز للطباعة',
        'حفظ في الأرشيف السحابي الشخصي',
        'مطابقة تامة مع الكتب المدرسية والمقررات الرسمية',
      ],
      excluded: [
        'التقويم التشخيصي واستيراد مسار',
        'توليد الفروض والامتحانات المتقدمة',
        'ركن إعداديات الريادة'
      ]
    },
    {
      id: 'unlimited',
      name: 'الأستاذ المتميز',
      tagline: 'VIP الشاملة',
      description: 'المنظومة الكاملة والمتكاملة لتدبير مادة الاجتماعيات طيلة الموسم الدراسي.',
      badge: 'الأكثر طلباً ⭐',
      badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30 font-black',
      priceMonthly: 29,
      priceAnnual: 149,
      periodMonthlyText: 'د.م / شهرياً',
      periodAnnualText: 'د.م / للموسم كاملاً',
      savingText: 'أفضل قيمة وتوفير 57% + تحميل غير محدود',
      note: billingCycle === 'annual' ? 'توليد وتحميل غير محدود (∞)' : 'حصة 30 جذاذة + 8 فروض/شهر',
      popular: true,
      buttonText: 'اشترك في VIP الآن',
      featuresMonthly: [
        'كل مزايا المنظومة (جذاذات + فروض + تشخيصي + ريادة)',
        'حصة متقدمة: 30 جذاذة + 8 فروض وامتحانات شهرياً',
        'التقويم التشخيصي واستيراد نقط مسار بنقرة واحدة',
        'مولد الفروض والامتحانات المحروسة والإشهادية بسلالم التنقيط',
        'تصدير بصيغة Word مخصص بالاسم والمؤسسة',
      ],
      featuresAnnual: [
        'كل مزايا المنظومة بدون أي قيود أو حدود',
        'توليد وتحميل غير محدود كلياً (Unlimited ∞) طيلة الموسم كاملاً',
        'لا توجد أي حصص شهرية - حضّر دروس وفروض السنة كاملة متى شئت',
        'المنظومة الكاملة للتقويم التشخيصي واستيراد مسار الفوري',
        'مولد الفروض والامتحانات المحروسة والإشهادية وسلم التنقيط التفاعلي',
        'ركن إعداديات الريادة: التدريس الصريح والدعم والمعالجة',
        'تصدير Word مخصص باسم الأستاذ والمؤسسة والترويسة',
        'أرشيف سحابي غير محدود وأولوية الدعم الفني'
      ],
      features: [
        'كل مزايا الباقة الأساسية السابقة',
        'توليد وتحميل لكافة وثائق المنهاج',
        'المنظومة الكاملة للتقويم التشخيصي واستيراد مسار بنقرة واحدة',
        'مولد الفروض والامتحانات المحروسة والإشهادية وسلم التنقيط',
        'ركن إعداديات الريادة: التدريس الصريح والدعم',
        'تصدير Word مخصص باسم الأستاذ والمؤسسة والترويسة',
        'أرشيف سحابي وأولوية الدعم الفني'
      ]
    },
    {
      id: 'semester',
      name: 'اشتراك الدورة',
      tagline: 'Pass الأسدس',
      description: 'مرونة تامة للتركيز على أسدس دراسي واحد بدون التزام سنوي أو تجديد شهري.',
      badge: 'مرونة الدورة 🎯',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
      priceFixed: 59,
      periodFixedText: 'د.م / لأسدس واحد',
      note: 'صالحة 4 أشهر كاملة (60 تحميلاً)',
      popular: false,
      buttonText: 'اختر باقة الدورة',
      featuresMonthly: [
        'وصول شامل لكافة أدوات المنصة للأسدس المختار',
        'جذاذات وفروض وملخصات وأنشطة الدورة كاملة',
        'رصيد 60 تحميلاً بصيغة Word و PDF بجودة عالية',
        'استيراد نقط المراقبة وإعداد التقارير البيداغوجية',
        'دفعة واحدة بدون أي اقتطاع دوري أو تجديد تلقائي'
      ],
      featuresAnnual: [
        'وصول شامل لكافة أدوات المنصة للأسدس المختار',
        'جذاذات وفروض وملخصات وأنشطة الدورة كاملة',
        'رصيد 60 تحميلاً بصيغة Word و PDF بجودة عالية',
        'استيراد نقط المراقبة وإعداد التقارير البيداغوجية',
        'دفعة واحدة بدون أي اقتطاع دوري أو تجديد تلقائي'
      ],
      features: [
        'وصول كامل وشامل لكافة أدوات المنصة للأسدس المختار',
        'جذاذات وفروض وملخصات وأنشطة الدورة كاملة',
        'رصيد 60 تحميلاً بصيغة Word و PDF بجودة عالية',
        'استيراد نقط المراقبة وإعداد التقارير البيداغوجية',
        'دفعة واحدة بدون أي اقتطاع دوري أو تجديد تلقائي'
      ]
    }
  ];

  const BANK_ACCOUNTS = [
    {
      bank: 'CIH Bank (بنك القرض العقاري والسياحي)',
      accountName: 'منصة الاجتماعيات الذكية',
      rib: '230 780 4567890123456701 44',
      code: 'CIH'
    },
    {
      bank: 'Attijariwafa Bank (التجاري وفا بنك)',
      accountName: 'منصة الاجتماعيات الذكية',
      rib: '007 780 0001234567890123 88',
      code: 'ATTIJARI'
    },
    {
      bank: 'Al Barid Bank (بريد بنك)',
      accountName: 'منصة الاجتماعيات الذكية',
      rib: '350 810 0009876543210987 12',
      code: 'BARID'
    }
  ];

  const FAQS = [
    {
      q: 'لماذا يُنصح بالاشتراك السنوي (VIP) بدلاً من الشهري؟',
      a: 'الاشتراك السنوي يمنحك وصولاً وتحميلاً غير محدود (Unlimited ∞) بدون أي سقف أو حصص شهرية طيلة الموسم الدراسي، مما يتيح لك تحضير دروس وفروض كل المستويات مسبقاً وبأي وقت، بالإضافة إلى توفير أكثر من 57% مقارنة بالتجديد الشهري.'
    },
    {
      q: 'كيف يعمل سقف الحصص في الاشتراكات الشهرية؟',
      a: 'تم تصميم الحصص الشهرية لتغطي بدقة احتياجات الأستاذ خلال الشهر المشترك فيه (15 جذاذة للأساسي، و30 جذاذة + 8 فروض للـ VIP). ويتجدد هذا الرصيد مع كل شهر جديد لضمان خدمة سلسة وعادلة.'
    },
    {
      q: 'كيف يتم تفعيل الحساب بعد الدفع؟',
      a: 'يتم التفعيل فوراً! بعد إتمام التحويل أو التواصل عبر واتساب، يتم إرسال كود التفعيل المباشر، وبمجرد إدخاله في خانة "تفعيل كود" يتم فتح كافة الصلاحيات على الفور.'
    },
    {
      q: 'هل يمكنني العمل على الهاتف والحاسوب بنفس الحساب؟',
      a: 'نعم بالتأكيد! يمكنك تسجيل الدخول ببريدك الإلكتروني من أي هاتف أو حاسوب أو لوحة إلكترونية، وستجد أرشيفك ووثائقك متزامنة تلقائياً.'
    },
    {
      q: 'هل جذاذات وفروض المنصة مطابقة للمقررات والتوجيهات الرسمية؟',
      a: 'نعم 100%، جميع قوالب الجذاذات وصيغ الامتحانات مبنية بدقة وفق التوجيهات التربوية الرسمية المحينة لوزارة التربية الوطنية والتعليم الأولي والرياضة بالمغرب، وتعتمد جميع الكتب المدرسية المعتمدة (الجديد، في رحاب، المنار، النجاح، المسار...).'
    },
    {
      q: 'هل أستطيع تعديل الملفات المحملة؟',
      a: 'نعم، التصدير بصيغة Microsoft Word (.docx) يمنحك ملفاً قابلاً للتعديل والإضافة وتغيير الخطوط والترويسة بكل سهولة.'
    }
  ];

  const handlePlanClick = (plan: any) => {
    if (onSelectPlan) {
      onSelectPlan(plan.id, billingCycle);
    }
    setSelectedPlanForPayment(plan);
  };

  const getWhatsAppUrl = (planName?: string) => {
    const selected = planName || (selectedPlanForPayment ? selectedPlanForPayment.name : 'VIP');
    const cycleText = selectedPlanForPayment?.id === 'semester' ? 'اشتراك الدورة (59 درهم)' : billingCycle === 'annual' ? 'السنوية' : 'الشهرية';
    const text = encodeURIComponent(
      `السلام عليكم، أرغب في الاشتراك في منصة الاجتماعيات الذكية - باقة: ${selected} (${cycleText}). المرجو تزويدي بمعلومات التفعيل وشكراً.`
    );
    return `https://wa.me/212629739500?text=${text}`;
  };

  return (
    <div className={`font-sans ${isModal ? 'bg-white p-6 sm:p-8 rounded-3xl' : 'bg-gradient-to-b from-slate-50/90 via-white to-indigo-50/30 rounded-3xl py-12 px-4 sm:px-8 border border-indigo-100/80 shadow-sm relative overflow-hidden'}`} dir="rtl">
      
      {/* Background Subtle Ambient Aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-0"></div>

      {isModal && onClose && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">باقات واشتراكات المنصة</h3>
              <p className="text-xs text-slate-500">اختر الخطة المناسبة لاحتياجاتك التدريسية</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Header & Toggle Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 relative z-10">
        
        {/* Brand pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>الاجتماعيات الذكية • SMART SOCIAL STUDIES</span>
        </div>

        {/* Big headline */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          خطط واضحة.. وتوفير حقيقي مع <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 bg-clip-text text-transparent">
            الاشتراك السنوي للموسم الدراسي
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          اشترك سنوياً واحصل على تخفيض يصل إلى 40% مع ضمان تحديثات مستمرة لكافة المقررات والكتب المدرسية الرسمية طيلة الموسم الدراسي.
        </p>

        {/* Billing Switch Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="inline-flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>سنوي (موسم كامل)</span>
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                وفر حتى 40%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch relative z-10 mb-12">
        {PLANS.map((plan) => {
          const isVip = plan.popular;
          const displayPrice = plan.priceFixed 
            ? plan.priceFixed 
            : billingCycle === 'annual' 
            ? plan.priceAnnual 
            : plan.priceMonthly;

          const displayPeriod = plan.periodFixedText 
            ? plan.periodFixedText 
            : billingCycle === 'annual' 
            ? plan.periodAnnualText 
            : plan.periodMonthlyText;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-3xl flex flex-col justify-between transition-all overflow-hidden ${
                isVip
                  ? 'bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500 shadow-2xl shadow-indigo-900/30 ring-4 ring-indigo-500/20 lg:-translate-y-2'
                  : 'bg-white border border-slate-200/90 shadow-sm hover:border-indigo-200 hover:shadow-md text-slate-800'
              }`}
            >
              {/* Top Accent / Popular Badge */}
              {isVip && (
                <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 text-center py-1.5 text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-xs">
                  <Flame size={14} className="fill-slate-950" />
                  <span>الخيار الأكثر اختياراً وشعبية بين الأساتذة ⭐</span>
                </div>
              )}

              <div className={`p-6 sm:p-8 space-y-6 ${isVip ? 'pt-10' : ''}`}>
                
                {/* Plan Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${isVip ? 'text-white' : 'text-slate-900'}`}>
                      <span>{plan.name}</span>
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed min-h-[36px] ${isVip ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className={`py-3 border-y space-y-1 ${isVip ? 'border-indigo-800/80' : 'border-slate-100'}`}>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isVip ? 'text-white' : 'text-slate-900'}`}>
                      {displayPrice}
                    </span>
                    <div className="text-right">
                      <span className={`text-xs sm:text-sm font-bold block ${isVip ? 'text-indigo-200' : 'text-slate-700'}`}>
                        {displayPeriod}
                      </span>
                      <span className={`text-[11px] font-medium ${isVip ? 'text-indigo-300' : 'text-slate-400'}`}>
                        {plan.note}
                      </span>
                    </div>
                  </div>
                  {isVip && billingCycle === 'annual' && (
                    <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1 pt-1">
                      <Sparkles size={13} />
                      <span>{plan.savingText}</span>
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${isVip ? 'text-indigo-200' : 'text-slate-400'}`}>
                    المميزات المضمنة في الباقة ({billingCycle === 'annual' ? 'السنوية' : 'الشهرية'}):
                  </p>
                  <ul className={`space-y-2.5 text-xs ${isVip ? 'text-slate-200' : 'text-slate-600'}`}>
                    {((billingCycle === 'annual' ? plan.featuresAnnual : plan.featuresMonthly) || plan.features).map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${isVip ? 'bg-amber-400/20 text-amber-300' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                          <Check size={13} className="stroke-[3]" />
                        </div>
                        <span className={isVip && (idx === 1 || idx === 2) ? 'font-black text-white' : ''}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                    isVip
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-indigo-900/50 hover:scale-[1.02] border border-indigo-400/30'
                      : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100/80 hover:border-indigo-600 shadow-2xs'
                  }`}
                >
                  <Zap size={16} className={isVip ? 'fill-white' : ''} />
                  <span>{plan.buttonText}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Instant Activation Bar */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-900/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative z-10 mb-12 text-white">
        <div className="text-right space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            <ShieldCheck size={14} />
            <span>تفعيل فوري بالأكواد</span>
          </div>
          <h4 className="text-lg font-black text-white">هل تتوفر على كود تفعيل؟</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            أدخل الكود الخاص بك مباشرة للترقية الفورية والاستفادة من كافة الصلاحيات بدون انتظار.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              if (onOpenActivationModal) {
                onOpenActivationModal();
              } else {
                setSelectedPlanForPayment(PLANS[1]);
                setPaymentTab('code');
              }
            }}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl text-xs font-black transition-all shadow-md shadow-indigo-900/40 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <ShieldCheck size={16} />
            <span>إدخال كود التفعيل</span>
          </button>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <MessageCircle size={16} />
            <span>طلب كود عبر واتساب</span>
          </a>
        </div>
      </div>

      {/* Annual vs Monthly Fair-Use Explanatory Banner */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/50 p-5 sm:p-6 rounded-3xl border border-indigo-200/80 shadow-xs relative z-10 mb-12 text-right">
        <div className="flex items-start gap-3.5">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shrink-0 mt-0.5 shadow-xs">
            <Award size={20} />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span>لماذا يفضل 85% من الأساتذة باقة VIP السنوية؟</span>
              <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full">موصى بها</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>الاشتراك الشهري</strong> مخصص لتغطية الحصص والدروس المقررة خلال الشهر المشترك فيه، بينما <strong>الاشتراك السنوي (VIP)</strong> يرفع جميع الحدود والحصص نهائياً ليمنحك <span className="text-indigo-700 font-bold">توليداً وتحميلاً غير محدود (Unlimited ∞)</span> طيلة الموسم الدراسي كاملاً لكافة مستويات الإعدادي والتأهيلي مع توفير أكثر من 57%.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="max-w-4xl mx-auto space-y-4 relative z-10">
        <div className="text-center space-y-1 mb-6">
          <h4 className="text-lg font-black text-slate-900 flex items-center justify-center gap-2">
            <HelpCircle size={18} className="text-indigo-600" />
            <span>الأسئلة الشائعة حول الاشتراكات</span>
          </h4>
          <p className="text-xs text-slate-500">إجابات سريعة وواضحة لتسهيل استخدام المنصة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white p-4.5 rounded-2xl border border-slate-200/80 space-y-2 text-right shadow-2xs hover:border-indigo-200 transition-all"
            >
              <p className="font-bold text-xs sm:text-sm text-slate-900 flex items-start gap-2">
                <span className="text-indigo-600 font-mono font-black text-xs">Q.</span>
                <span>{faq.q}</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed pr-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment / Checkout Modal Drawer */}
      <AnimatePresence>
        {selectedPlanForPayment && (
          <div key="payment-modal-backdrop" className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              key="payment-modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-slate-900"
            >
              <button
                onClick={() => setSelectedPlanForPayment(null)}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 text-right pr-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  تأكيد الاشتراك
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  الاشتراك في {selectedPlanForPayment.name} ({selectedPlanForPayment.tagline})
                </h3>
                <p className="text-xs text-slate-500">
                  اختر وسيلة الدفع أو أدخل كود التفعيل المباشر للبدء فوراً:
                </p>
              </div>

              {/* Payment Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setPaymentTab('code')}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'code' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={15} />
                  <span>كود التفعيل</span>
                </button>
                <button
                  onClick={() => setPaymentTab('bank')}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'bank' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 size={15} />
                  <span>التحويل البنكي (RIB)</span>
                </button>
                <button
                  onClick={() => setPaymentTab('whatsapp')}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    paymentTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageCircle size={15} />
                  <span>واتساب مباشر</span>
                </button>
              </div>

              {/* Tab 1: Code input */}
              {paymentTab === 'code' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      إذا حصلت على كود تفعيل مسبقاً، أدخله هنا لتفعيل باقتك مباشرة:
                    </p>
                    <input
                      type="text"
                      placeholder="JADHA-XXXX-XXXX"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-center text-sm font-mono font-bold text-slate-900 uppercase outline-none focus:border-indigo-600"
                    />
                    <button
                      onClick={() => {
                        if (!inputCode.trim()) {
                          toast.error('يرجى إدخال كود التفعيل أولاً');
                          return;
                        }
                        // Trigger activation in parent
                        if (onOpenActivationModal) {
                          onOpenActivationModal();
                        }
                        setSelectedPlanForPayment(null);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
                    >
                      تفعيل الحساب الآن
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Bank transfer details */}
              {paymentTab === 'bank' && (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    يمكنك إجراء تحويل بنكي (Virement) لأي من الحسابات التالية، ثم إرسال وصل التحويل عبر واتساب للتفعيل الفوري:
                  </p>

                  {BANK_ACCOUNTS.map((acc, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-right">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900">{acc.bank}</span>
                        <button
                          onClick={() => copyToClipboard(acc.rib, 'رقم الحساب (RIB)')}
                          className="text-[11px] text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200"
                        >
                          <Copy size={12} />
                          <span>نسخ الـ RIB</span>
                        </button>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 tracking-wider">
                        {acc.rib}
                      </div>
                    </div>
                  ))}

                  <a
                    href={getWhatsAppUrl(selectedPlanForPayment.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2 shadow-sm"
                  >
                    <MessageCircle size={16} />
                    <span>إرسال الوصل وتأكيد التفعيل عبر واتساب</span>
                  </a>
                </div>
              )}

              {/* Tab 3: Direct WhatsApp */}
              {paymentTab === 'whatsapp' && (
                <div className="space-y-4 text-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <MessageCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">تواصل مباشر مع فريق الدعم</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      فريقنا رهن إشارتكم لتزويدكم برقم الحساب أو تسليم كود التفعيل الفوري.
                    </p>
                  </div>
                  <a
                    href={getWhatsAppUrl(selectedPlanForPayment.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200"
                  >
                    <MessageCircle size={16} />
                    <span>مراسلتنا الآن على واتساب (0629739500)</span>
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
