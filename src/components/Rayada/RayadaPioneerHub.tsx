import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Layers, 
  Grid, 
  RotateCcw, 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Tv, 
  Target,
  RefreshCw,
  Sliders,
  ChevronRight,
  Flame
} from 'lucide-react';
import { LESSONS_DATA, TEXTBOOKS } from '../../constants';
import { 
  RayadaJadhaData, 
  RayadaExamData, 
  RayadaTarlTest 
} from '../../types/rayada';
import { 
  generateRayadaJadha, 
  generateRayadaExam, 
  generateRayadaTarlDiagnostic 
} from '../../services/rayadaService';
import { RayadaJadhaView } from './RayadaJadhaView';
import { RayadaExamView } from './RayadaExamView';
import { RayadaTarlView } from './RayadaTarlView';
import { toast } from 'sonner';

export const RayadaPioneerHub: React.FC = () => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'jadha' | 'exam' | 'tarl'>('jadha');

  // Shared Level State (Focused on Middle School / الإعدادي as requested)
  const [level, setLevel] = useState<string>('الأولى إعدادي');
  const [term, setTerm] = useState<'الدورة الأولى' | 'الدورة الثانية'>('الدورة الأولى');
  const [subject, setSubject] = useState<'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة'>('التاريخ');

  // Jadha Tab State
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [customLesson, setCustomLesson] = useState<string>('');
  const [selectedTextbook, setSelectedTextbook] = useState<string>('كراسة الأنشطة لريادة الاجتماعيات + منار الاجتماعيات');
  const [isGeneratingJadha, setIsGeneratingJadha] = useState<boolean>(false);
  const [generatedJadha, setGeneratedJadha] = useState<RayadaJadhaData | null>(null);

  // Exam Tab State
  const [examTitle, setExamTitle] = useState<string>('الفرض الكتابي المحروس رقم 1 - نموذج إعداديات الريادة');
  const [selectedExamLessons, setSelectedExamLessons] = useState<string[]>([]);
  const [situation1Comp, setSituation1Comp] = useState<'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة'>('التربية على المواطنة');
  const [situation2Comp, setSituation2Comp] = useState<'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة'>('التاريخ');
  const [situation3Comp, setSituation3Comp] = useState<'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة'>('الجغرافيا');
  const [isGeneratingExam, setIsGeneratingExam] = useState<boolean>(false);
  const [generatedExam, setGeneratedExam] = useState<RayadaExamData | null>(null);

  // TaRL Tab State
  const [tarlDomain, setTarlDomain] = useState<string>('قراءة واستثمار الوثائق والدعامات الجغرافية والتاريخية');
  const [isGeneratingTarl, setIsGeneratingTarl] = useState<boolean>(false);
  const [generatedTarl, setGeneratedTarl] = useState<RayadaTarlTest | null>(null);

  // Available lessons for current level & term & subject
  const currentLessons = LESSONS_DATA[level]?.[subject]?.[term] || [];

  // All lessons for the level across all subjects for exam selection
  const allLevelLessons = [
    ...(LESSONS_DATA[level]?.['التاريخ']?.[term] || []).map(l => `(تاريخ) ${l}`),
    ...(LESSONS_DATA[level]?.['الجغرافيا']?.[term] || []).map(l => `(جغرافيا) ${l}`),
    ...(LESSONS_DATA[level]?.['التربية على المواطنة']?.[term] || []).map(l => `(مواطنة) ${l}`),
  ];

  // Set default lesson when lessons change
  React.useEffect(() => {
    if (currentLessons.length > 0 && !selectedLesson) {
      setSelectedLesson(currentLessons[0]);
    }
  }, [level, term, subject, currentLessons]);

  // Handle Jadha Generation
  const handleGenerateJadha = async () => {
    const lessonToUse = customLesson.trim() || selectedLesson || currentLessons[0] || "درس الاجتماعيات";
    try {
      setIsGeneratingJadha(true);
      toast.loading('جاري صياغة جذاذة التدريس الصريح وفق هندسة إعداديات الريادة...', { id: 'jadha-gen' });
      const data = await generateRayadaJadha(lessonToUse, level, subject, selectedTextbook, term);
      setGeneratedJadha(data);
      toast.success('تم توليد جذاذة الريادة بنجاح تام!', { id: 'jadha-gen' });
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء توليد الجذاذة', { id: 'jadha-gen' });
    } finally {
      setIsGeneratingJadha(false);
    }
  };

  // Handle Exam Generation
  const handleGenerateExam = async () => {
    try {
      setIsGeneratingExam(true);
      toast.loading('جاري إعداد الفرض المعياري وشبكة التنقيط وخطة المعالجة البعدية...', { id: 'exam-gen' });
      const data = await generateRayadaExam(
        level,
        term,
        examTitle,
        selectedExamLessons,
        {
          situation1: situation1Comp,
          situation2: situation2Comp,
          situation3: situation3Comp,
        }
      );
      setGeneratedExam(data);
      toast.success('تم توليد فرض الريادة المعياري بنجاح!', { id: 'exam-gen' });
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء إعداد الفرض', { id: 'exam-gen' });
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Handle TaRL Generation
  const handleGenerateTarl = async () => {
    try {
      setIsGeneratingTarl(true);
      toast.loading('جاري بناء رائز TaRL ومصفوفة التفيؤ والدعم المندمج...', { id: 'tarl-gen' });
      const data = await generateRayadaTarlDiagnostic(level, subject, tarlDomain);
      setGeneratedTarl(data);
      toast.success('تم توليد رائز TaRL بنجاح!', { id: 'tarl-gen' });
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء توليد رائز TaRL', { id: 'tarl-gen' });
    } finally {
      setIsGeneratingTarl(false);
    }
  };

  const toggleExamLesson = (lessonName: string) => {
    if (selectedExamLessons.includes(lessonName)) {
      setSelectedExamLessons(selectedExamLessons.filter(l => l !== lessonName));
    } else {
      setSelectedExamLessons([...selectedExamLessons, lessonName]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300" dir="rtl">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-10 border border-indigo-800/40 shadow-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles size={15} className="text-slate-950" />
              فضاء إعداديات الريادة (Collèges Pionniers)
            </span>
            <span className="text-xs text-indigo-200 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10 font-bold">
              السلك الثانوي الإعدادي • التدريس الصريح • التقويم المعياري
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            هندسة التدريس الصريح والفروض المعيارية لمادة الاجتماعيات
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            بناء جذاذات بيداغوجية دقيقة وفق النموذج الصريح الثلاثي (النمذجة "أنا أفعل"، الممارسة الموجهة "نحن نفعل"، والممارسة المستقلة "أنت تفعل")، بالإضافة إلى فروض معيارية شاملة بشبكات التصحيح وخطط المعالجة البعدية للتعثرات.
          </p>

          {/* 3 Core Pillars Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                <Target size={16} />
                <span>1. التدريس الصريح (Enseignement Explicite)</span>
              </div>
              <p className="text-xs text-slate-300">
                تفكيك التعلمات، التفكير بصوت عالٍ، التحقق السريع من الفهم (CFU)، وتثبيت التعلمات الفردية.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-indigo-300 font-black text-xs">
                <Grid size={16} />
                <span>2. الفروض وشبكات التنقيط المعيارية</span>
              </div>
              <p className="text-xs text-slate-300">
                3 وضعيات تقويمية معيارية محكمة، شبكة مستويات التحكم الثلاثة، وخطة لمعالجة التعثرات.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                <Award size={16} />
                <span>3. مقاربة TaRL والدعم المندمج</span>
              </div>
              <p className="text-xs text-slate-300">
                روائز تموضع مهارية لمهارات الاجتماعيات وتفيؤ المتعلمين لأنشطة الدعم الموجهة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('jadha')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'jadha'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={18} />
          <span>جذاذات التدريس الصريح (إعداديات الريادة)</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'exam'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={18} />
          <span>فروض الريادة وشبكات التصحيح المعيارية</span>
        </button>

        <button
          onClick={() => setActiveTab('tarl')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tarl'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award size={18} />
          <span>بنك روائز TaRL والدعم المندمج</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: JADHA GENERATOR (جذاذة التدريس الصريح) */}
      {/* ========================================================================= */}
      {activeTab === 'jadha' && (
        <div className="space-y-6">
          {/* Generator Controls Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sliders size={20} className="text-indigo-600" />
                  إعداد وتخصيص جذاذة التدريس الصريح
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  اختر المستوى والمكون والدرس لتوليد الجذاذة المكتملة بعناصرها البيداغوجية
                </p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-black px-3 py-1 rounded-full">
                المرجع: كراسة الريادة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Level Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">المستوى الدراسي (الإعدادي):</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="الأولى إعدادي">الأولى ثانوي إعدادي (1AC)</option>
                  <option value="الثانية إعدادي">الثانية ثانوي إعدادي (2AC)</option>
                  <option value="الثالثة إعدادي">الثالثة ثانوي إعدادي (3AC)</option>
                </select>
              </div>

              {/* Term Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">الدورة الدراسية:</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as any)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="الدورة الأولى">الدورة الأولى</option>
                  <option value="الدورة الثانية">الدورة الثانية</option>
                </select>
              </div>

              {/* Subject Component Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">المكون الدراسي:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="التاريخ">التاريخ</option>
                  <option value="الجغرافيا">الجغرافيا</option>
                  <option value="التربية على المواطنة">التربية على المواطنة</option>
                </select>
              </div>
            </div>

            {/* Lesson Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">اختر الدرس من المنهاج الرسمي:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {currentLessons.map((les, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedLesson(les);
                      setCustomLesson('');
                    }}
                    className={`p-2.5 rounded-xl text-right text-xs font-bold transition-all border ${
                      selectedLesson === les && !customLesson
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    • {les}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Lesson Title Option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">أو أدخل عنوان درس مخصص:</label>
                <input
                  type="text"
                  placeholder="مثال: التدرب على رسم مقطع طبوغرافي..."
                  value={customLesson}
                  onChange={(e) => setCustomLesson(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">الدعامات والمراجع المعتمدة:</label>
                <input
                  type="text"
                  value={selectedTextbook}
                  onChange={(e) => setSelectedTextbook(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={handleGenerateJadha}
                disabled={isGeneratingJadha}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingJadha ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>جاري توليد جذاذة الريادة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-amber-300" />
                    <span>توليد جذاذة التدريس الصريح الآن 🌟</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Result Container */}
          {generatedJadha && (
            <RayadaJadhaView jadhaData={generatedJadha} onUpdate={(up) => setGeneratedJadha(up)} />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EXAM GENERATOR (فروض الريادة المعيارية) */}
      {/* ========================================================================= */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Grid size={20} className="text-indigo-600" />
                  إعداد الفرض المحروس المعياري وشبكة التنقيط
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  فرض كتابي محروس يتضمن الوضعيات الثلاث، شبكة التنقيط المعيارية، وعناصر الإجابة وخطة المعالجة
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-900 border border-indigo-200 font-black px-3 py-1 rounded-full">
                شبكة التقويم المعياري
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">المستوى الدراسي (الإعدادي):</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="الأولى إعدادي">الأولى ثانوي إعدادي (1AC)</option>
                  <option value="الثانية إعدادي">الثانية ثانوي إعدادي (2AC)</option>
                  <option value="الثالثة إعدادي">الثالثة ثانوي إعدادي (3AC)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">الدورة الدراسية:</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as any)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="الدورة الأولى">الدورة الأولى</option>
                  <option value="الدورة الثانية">الدورة الثانية</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">عنوان الفرض:</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Situation Components Allocation */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-black text-slate-900">توزيع الوضعيات الاختبارية الثلاث (بمجموع 20 نقطة):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-black text-indigo-900">الوضعية 1 (6ن): أسئلة المفاهيم والموضوعية</label>
                  <select
                    value={situation1Comp}
                    onChange={(e) => setSituation1Comp(e.target.value as any)}
                    className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="التربية على المواطنة">التربية على المواطنة</option>
                    <option value="التاريخ">التاريخ</option>
                    <option value="الجغرافيا">الجغرافيا</option>
                  </select>
                </div>

                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-black text-indigo-900">الوضعية 2 (7ن): الاشتغال على وثيقة</label>
                  <select
                    value={situation2Comp}
                    onChange={(e) => setSituation2Comp(e.target.value as any)}
                    className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="التاريخ">التاريخ</option>
                    <option value="الجغرافيا">الجغرافيا</option>
                    <option value="التربية على المواطنة">التربية على المواطنة</option>
                  </select>
                </div>

                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-[11px] font-black text-indigo-900">الوضعية 3 (7ن): إنتاج فقرة / موضوع موجز</label>
                  <select
                    value={situation3Comp}
                    onChange={(e) => setSituation3Comp(e.target.value as any)}
                    className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="الجغرافيا">الجغرافيا</option>
                    <option value="التاريخ">التاريخ</option>
                    <option value="التربية على المواطنة">التربية على المواطنة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Select Lessons for the Exam */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700">حدد الدروس المشمولة بالفرض:</label>
                <span className="text-[11px] text-indigo-600 font-bold">
                  تم تحديد {selectedExamLessons.length} دروس
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {allLevelLessons.map((les, idx) => {
                  const isSelected = selectedExamLessons.includes(les);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleExamLesson(les)}
                      className={`p-2 rounded-xl text-right text-xs font-bold transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{les}</span>
                      {isSelected && <CheckCircle2 size={14} className="shrink-0 mr-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={handleGenerateExam}
                disabled={isGeneratingExam}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingExam ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>جاري إعداد الفرض وشبكة التصحيح...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-amber-300" />
                    <span>توليد الفرض المعياري وشبكة التنقيط 🌟</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Exam Result */}
          {generatedExam && (
            <RayadaExamView examData={generatedExam} />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TARL & DIAGNOSTIC BANK (روائز وبنك الدعم) */}
      {/* ========================================================================= */}
      {activeTab === 'tarl' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award size={20} className="text-emerald-600" />
                  بنك روائز TaRL وشبكات التموضع والتفيؤ
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  روائز تشخيصية سريعة لمهارات مادة الاجتماعيات وتحديد خطط التدخل الموجهة
                </p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 font-black px-3 py-1 rounded-full">
                بروتوكول TaRL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">المستوى الدراسي:</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="الأولى إعدادي">الأولى ثانوي إعدادي (1AC)</option>
                  <option value="الثانية إعدادي">الثانية ثانوي إعدادي (2AC)</option>
                  <option value="الثالثة إعدادي">الثالثة ثانوي إعدادي (3AC)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">المكون الدراسي:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="التاريخ">التاريخ</option>
                  <option value="الجغرافيا">الجغرافيا</option>
                  <option value="التربية على المواطنة">التربية على المواطنة</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">مجال المهارة المستهدف:</label>
                <select
                  value={tarlDomain}
                  onChange={(e) => setTarlDomain(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="قراءة واستثمار الوثائق والدعامات الجغرافية والتاريخية">قراءة واستثمار الوثائق والدعامات</option>
                  <option value="قراءة الخريطة واستخراج معطيات المفتاح والتوطين">قراءة الخرائط والتوطين الجغرافي</option>
                  <option value="إدراك الزمن التاريخي وقراءة الخط الزمني">إدراك الزمن التاريخي والخط الزمني</option>
                  <option value="استيعاب المفاهيم والمصطلحات المهيكلة للمادة">استيعاب المفاهيم والمصطلحات</option>
                  <option value="التحرير والربط المنطقي في إنتاج فقرة متماسكة">التحرير والربط المنطقي للفقرات</option>
                </select>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={handleGenerateTarl}
                disabled={isGeneratingTarl}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingTarl ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>جاري بناء رائز TaRL...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-amber-300" />
                    <span>توليد رائز TaRL وشبكة التفيؤ الآن 🌟</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated TaRL Result */}
          {generatedTarl && (
            <RayadaTarlView tarlData={generatedTarl} />
          )}
        </div>
      )}
    </div>
  );
};
