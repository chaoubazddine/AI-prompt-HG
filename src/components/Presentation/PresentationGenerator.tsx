import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Layers, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Minimize2, 
  Plus, 
  Trash2, 
  FileText, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Compass, 
  Target,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  Timer,
  RotateCcw,
  Printer,
  Wand2,
  Lightbulb,
  Palette,
  CheckSquare,
  Volume2,
  ZoomIn,
  ZoomOut,
  Clock,
  Award,
  X,
  RefreshCw
} from 'lucide-react';
import { PresentationData, PresentationSlide, PresentationThemeStyle } from '../../types/presentation';
import { generateLessonPresentation, enrichSlideWithAI, generateFallbackPresentation } from '../../services/presentationService';
import { exportPresentationToPptx } from '../../utils/presentationPptxExport';
import { LESSONS_DATA } from '../../constants';
import { trackUserUsage, checkAndRecordDownload } from '../../services/usageTracker';
import { toast } from 'sonner';
import { PapyrusSlideRenderer } from './PapyrusSlideRenderer';
import { SimpleSlideRenderer } from './SimpleSlideRenderer';
import { ANCIENT_EGYPT_SHOWCASE_PRESENTATION, SIMPLE_PEDAGOGICAL_SHOWCASE_PRESENTATION } from '../../data/presentationTemplates';

interface PresentationGeneratorProps {
  initialTitle?: string;
  initialSubject?: string;
  initialLevel?: string;
}

export const PresentationGenerator: React.FC<PresentationGeneratorProps> = ({
  initialTitle = '',
  initialSubject = 'التاريخ',
  initialLevel = 'الثالثة إعدادي'
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [level, setLevel] = useState(initialLevel);
  const [term, setTerm] = useState<'الدورة الأولى' | 'الدورة الثانية'>('الدورة الأولى');
  const [lessonTitle, setLessonTitle] = useState(initialTitle);
  const [customTitle, setCustomTitle] = useState('');
  const [isCustomLesson, setIsCustomLesson] = useState(false);
  const [templateModel, setTemplateModel] = useState<'simple_sequential' | 'jaddadha_sequential' | 'standard_interactive'>('simple_sequential');

  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Record<string, string>>({});
  
  // Theme & Presenter options
  const [themeStyle, setThemeStyle] = useState<PresentationThemeStyle>('simple_clean');
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showTeacherNotes, setShowTeacherNotes] = useState(false);
  const [showPrintHandout, setShowPrintHandout] = useState(false);

  // Classroom Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  const handleLoadAncientEgyptPreset = () => {
    setSubject('التاريخ');
    setLevel('الأولى إعدادي');
    setTerm('الدورة الأولى');
    setLessonTitle('حضارة مصر القديمة');
    setTemplateModel('jaddadha_sequential');
    setThemeStyle('papyrus_heritage');
    setPresentation(JSON.parse(JSON.stringify(ANCIENT_EGYPT_SHOWCASE_PRESENTATION)));
    setActiveSlideIndex(0);
    toast.success('تم تحميل نموذج حضارة مصر القديمة المطابق للنموذج التراثي والوثائقي بنجاح! 📜');
  };

  const handleLoadSimpleModelPreset = () => {
    setSubject('الجغرافيا');
    setLevel('الأولى إعدادي');
    setTerm('الدورة الأولى');
    setLessonTitle('المغرب: موقع استراتيجي');
    setTemplateModel('simple_sequential');
    setThemeStyle('simple_clean');
    setPresentation(JSON.parse(JSON.stringify(SIMPLE_PEDAGOGICAL_SHOWCASE_PRESENTATION)));
    setActiveSlideIndex(0);
    toast.success('تم تحميل النموذج الديداكتيكي المرجعي (المغرب: موقع استراتيجي) بنجاح! 🎯');
  };

  // Normalize level key for LESSONS_DATA
  const normalizeLevelKey = (rawLevel: string): string => {
    if (rawLevel.includes('الأولى') && rawLevel.includes('إعدادي')) return 'الأولى إعدادي';
    if (rawLevel.includes('الثانية') && rawLevel.includes('إعدادي')) return 'الثانية إعدادي';
    if (rawLevel.includes('الثالثة') && rawLevel.includes('إعدادي')) return 'الثالثة إعدادي';
    if (rawLevel.includes('الجذع المشترك')) return 'الجذع المشترك';
    if (rawLevel.includes('الأولى') && (rawLevel.includes('باك') || rawLevel.includes('بكالوريا'))) return 'الأولى باك';
    if (rawLevel.includes('الثانية') && (rawLevel.includes('باك') || rawLevel.includes('بكالوريا'))) return 'الثانية باك';
    return 'الثالثة إعدادي';
  };

  const levelKey = normalizeLevelKey(level);
  const currentLessons = LESSONS_DATA[levelKey]?.[subject]?.[term] || [];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (currentLessons.length > 0 && !isCustomLesson) {
      if (!lessonTitle || !currentLessons.includes(lessonTitle)) {
        setLessonTitle(currentLessons[0]);
      }
    }
  }, [subject, level, term, isCustomLesson]);

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            toast.info('⏱️ انتهى وقت النشاط الصفي المحدد!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const handleStartTimer = (seconds: number) => {
    setInitialTimerSeconds(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(initialTimerSeconds);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(initialTimerSeconds);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!presentation) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (activeSlideIndex < presentation.slides.length - 1) {
          setActiveSlideIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (activeSlideIndex > 0) {
          setActiveSlideIndex(prev => prev - 1);
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation, activeSlideIndex, isFullscreen]);

  const activeTitle = isCustomLesson ? customTitle : lessonTitle;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeTitle.trim()) {
      setError('يرجى اختيار أو كتابة عنوان الدرس أولاً.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: PresentationData;
      try {
        data = await generateLessonPresentation(activeTitle, subject, level, term, templateModel);
      } catch (genErr) {
        console.warn("Presentation generation fallback triggered:", genErr);
        data = generateFallbackPresentation(activeTitle, subject, level, term);
      }

      setPresentation(data);
      setActiveSlideIndex(0);
      trackUserUsage('summary', `عرض PPTX الجذاذة: ${activeTitle}`);
      setError(null);
      toast.success('تم توليد عرض PowerPoint البيداغوجي وفق هندسة الجذاذة بنجاح!');
    } catch (err: any) {
      console.error("Presentation generation error:", err);
      const fallback = generateFallbackPresentation(activeTitle, subject, level, term);
      setPresentation(fallback);
      setActiveSlideIndex(0);
      setError(null);
      toast.success('تم إعداد عرض PowerPoint وفق الهندسة الديداكتيكية الرسمية!');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichActiveSlide = async () => {
    if (!presentation || !activeSlide) return;
    setEnriching(true);
    try {
      const enrichedSlide = await enrichSlideWithAI(activeSlide, presentation.title, presentation.subject, presentation.level);
      const updatedSlides = [...presentation.slides];
      updatedSlides[activeSlideIndex] = enrichedSlide;
      setPresentation({
        ...presentation,
        slides: updatedSlides
      });
      toast.success('تم إثراء وتعميق محتوى الشريحة بنجاح!');
    } catch (err: any) {
      toast.error('حدث خطأ أثناء إثراء الشريحة.');
    } finally {
      setEnriching(false);
    }
  };

  const handleDownloadPptx = async () => {
    if (!presentation) return;

    const allowed = await checkAndRecordDownload(`تحميل عرض PPTX: ${presentation.title}`);
    if (!allowed) return;

    try {
      setIsExporting(true);
      await exportPresentationToPptx({
        ...presentation,
        themeStyle: themeStyle || presentation.themeStyle
      });
      toast.success('تم تجهيز وتحميل ملف PowerPoint (.pptx) بالألوان والتنسيقات المحفوظة بنجاح!');
    } catch (err: any) {
      console.error(err);
      toast.error('حدث خطأ أثناء تصدير العرض التقديمي.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyAll = () => {
    if (!presentation) return;
    let fullText = `عرض PowerPoint البيداغوجي: ${presentation.title}\nالمادة: ${presentation.subject} | المستوى: ${presentation.level}\nالنهج المعتمد: ${presentation.pedagogicalApproach || 'النهج الديداكتيكي التخصصي'}\n\n`;
    presentation.slides.forEach((s, idx) => {
      fullText += `--- الشريحة ${idx + 1}: ${s.title} (${s.badge || s.pedagogicalStep || ''}) ---\n`;
      if (s.subtitle) fullText += `${s.subtitle}\n`;
      (s.bulletPoints || []).forEach(b => {
        fullText += `• ${b}\n`;
      });
      if (s.activityDoc) {
        fullText += `[دعامة ${s.activityDoc.docType}]: ${s.activityDoc.title}\nالسؤال: ${s.activityDoc.question}\nالاستنتاج: ${s.activityDoc.conclusion}\n`;
      }
      if (s.keyConcepts && s.keyConcepts.length > 0) {
        fullText += `[المفاهيم]:\n` + s.keyConcepts.map(k => `• ${k.term}: ${k.definition}`).join('\n') + '\n';
      }
      if (s.interactiveQuestion) {
        fullText += `[سؤال تقويمي]: ${s.interactiveQuestion.question}\nالإجابة: ${s.interactiveQuestion.correctAnswer}\n`;
      }
      if (s.highlightBox) fullText += `[خلاصة]: ${s.highlightBox}\n`;
      if (s.teacherNotes) fullText += `[إضاءة الأستاذ]: ${s.teacherNotes}\n`;
      fullText += `\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('تم نسخ نصوص العرض بالكامل!');
    setTimeout(() => setCopied(false), 2500);
  };

  const activeSlide: PresentationSlide | undefined = presentation?.slides?.[activeSlideIndex];

  const toggleAnswerReveal = (slideId: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [slideId]: !prev[slideId]
    }));
  };

  const handleSelectOption = (slideId: string, option: string) => {
    setUserSelectedAnswers(prev => ({
      ...prev,
      [slideId]: option
    }));
  };

  // Helper to update current slide in state
  const updateActiveSlide = (field: keyof PresentationSlide, value: any) => {
    if (!presentation || !presentation.slides) return;
    const updated = [...presentation.slides];
    if (!updated[activeSlideIndex]) return;
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      [field]: value
    };
    setPresentation({ ...presentation, slides: updated });
  };

  const handleAddBullet = () => {
    if (!activeSlide) return;
    const currentBullets = Array.isArray(activeSlide.bulletPoints) ? activeSlide.bulletPoints : [];
    const updatedBullets = [...currentBullets, 'نقطة جديدة مضافة للتحليل والشرح...'];
    updateActiveSlide('bulletPoints', updatedBullets);
  };

  const handleRemoveBullet = (index: number) => {
    if (!activeSlide || !Array.isArray(activeSlide.bulletPoints)) return;
    const updatedBullets = activeSlide.bulletPoints.filter((_, i) => i !== index);
    updateActiveSlide('bulletPoints', updatedBullets);
  };

  const handleUpdateBullet = (index: number, val: string) => {
    if (!activeSlide || !Array.isArray(activeSlide.bulletPoints)) return;
    const updatedBullets = [...activeSlide.bulletPoints];
    updatedBullets[index] = val;
    updateActiveSlide('bulletPoints', updatedBullets);
  };

  const handleAddSlide = () => {
    if (!presentation || !Array.isArray(presentation.slides)) return;
    const newSlide: PresentationSlide = {
      id: `slide-${presentation.slides.length + 1}`,
      slideNumber: presentation.slides.length + 1,
      type: 'activity',
      badge: `مقطع تعلمي جديد`,
      pedagogicalStep: 'التحليل والاستنتاج',
      title: 'عنوان الشريحة الجديدة',
      subtitle: 'وصف المحور أو النشاط التعلمي',
      bulletPoints: ['العنصر الأول للتحليل والشرح', 'العنصر الثاني المستخلص'],
      highlightBox: 'استنتاج ديداكتيكي لهذه المرحلة.',
      activityTimerMinutes: 3
    };
    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide]
    });
    setActiveSlideIndex(presentation.slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length <= 1) return;
    const updatedSlides = presentation.slides.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      slideNumber: idx + 1
    }));
    setPresentation({
      ...presentation,
      slides: updatedSlides
    });
    setActiveSlideIndex(prev => Math.max(0, Math.min(prev, updatedSlides.length - 1)));
  };

  // Get current slide dynamic background style based on theme
  const getSlideThemeClasses = () => {
    if (themeStyle === 'papyrus_heritage') {
      return 'from-[#F5EEDB] via-[#EBDCB9] to-[#DFCE9F] border-[#C5A059] text-[#291B0E]';
    }
    if (themeStyle === 'disciplinary') {
      if (subject.includes('تاريخ')) return 'from-rose-950 via-slate-950 to-stone-900 border-rose-900/60';
      if (subject.includes('جغرافيا')) return 'from-emerald-950 via-slate-950 to-teal-950 border-emerald-900/60';
      return 'from-indigo-950 via-slate-950 to-purple-950 border-indigo-900/60';
    }
    if (themeStyle === 'blackboard') {
      return 'from-emerald-950 via-zinc-950 to-emerald-950 border-emerald-800/80';
    }
    if (themeStyle === 'warm_amber') {
      return 'from-amber-950 via-stone-950 to-slate-900 border-amber-900/60';
    }
    if (themeStyle === 'modern_clean') {
      return 'from-slate-900 via-slate-950 to-slate-900 border-slate-700/60';
    }
    return 'from-slate-900 via-slate-950 to-indigo-950 border-slate-700/60';
  };

  const getTextScaleClass = () => {
    if (fontSizeScale === 'large') return 'text-base';
    if (fontSizeScale === 'xlarge') return 'text-lg';
    return 'text-xs sm:text-sm';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold mb-4">
            <Sparkles size={14} className="animate-pulse" />
            <span>هندسة الجذاذة البيداغوجية المتسلسلة التفاعلية 🇲🇦</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            منظومة العروض التقديمية التفاعلية وفق المنهاج المغربي
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            توليد عروض رقمية تفاعلية مشحونة بالمضامين والوثائق الرسمية، مزودة بـ: <strong>مؤقت الأنشطة الصفية ⏱️</strong>، و<strong>التقويم المرحلي التفاعلي QCM</strong>، و<strong>إثراء الشريحة بالذكاء الاصطناعي</strong>، وتصدير PowerPoint ملون ودقيق متوافق مع العارض الضوئي.
          </p>
        </div>
      </div>

      {/* Generation Config Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          
          {/* Architecture Model Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">هندسة ونموذج العرض التقديمي</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Standard Reference Pedagogical Model */}
              <button
                type="button"
                onClick={() => {
                  setTemplateModel('simple_sequential');
                  setThemeStyle('simple_clean');
                }}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                  templateModel === 'simple_sequential'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  templateModel === 'simple_sequential' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <CheckSquare size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900">النموذج الديداكتيكي المرجعي (وفق الجذاذة) 🎯</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">النموذج الأساسي</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    العنوان ➔ الأهداف ➔ عنوان المقطع والنشاط مع رؤوس أقلام ➔ توجيه المتعلمين لتركيب التعلمات ➔ تقويم مرحلي ➔ تركيب إجمالي وخاتمة.
                  </p>
                </div>
              </button>

              {/* Option 2: Extended Heritage/Documentary Model */}
              <button
                type="button"
                onClick={() => setTemplateModel('jaddadha_sequential')}
                className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                  templateModel === 'jaddadha_sequential'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  templateModel === 'jaddadha_sequential' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <Layers size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900">النموذج الوثائقي الموسع (الدعامات والخطاطات) 📚</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    يتضمن التمهيد الإشكالي، نصوص وشهادات تاريخية موثقة، خطاطات بنيوية، هرم اجتماعي تفاعلي، ومفاهيم مصطلحية.
                  </p>
                </div>
              </button>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">المادة</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="التاريخ">التاريخ 📜</option>
                <option value="الجغرافيا">الجغرافيا 🌍</option>
                <option value="التربية على المواطنة">التربية على المواطنة ⚖️</option>
              </select>
            </div>

            {/* Level Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">المستوى الدراسي</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="الأولى إعدادي">الأولى ثانوي إعدادي</option>
                <option value="الثانية إعدادي">الثانية ثانوي إعدادي</option>
                <option value="الثالثة إعدادي">الثالثة ثانوي إعدادي (إشهادي)</option>
                <option value="الجذع المشترك">الجذع المشترك</option>
                <option value="الأولى باك">الأولى باكالوريا</option>
                <option value="الثانية باك">الثانية باكالوريا (وطني)</option>
              </select>
            </div>

            {/* Term Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">الدورة الدراسية</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="الدورة الأولى">الدورة الأولى</option>
                <option value="الدورة الثانية">الدورة الثانية</option>
              </select>
            </div>

            {/* Lesson Source Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">مصدر الدرس</label>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsCustomLesson(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    !isCustomLesson ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  منهاج رسمي
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomLesson(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    isCustomLesson ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  عنوان مخصص
                </button>
              </div>
            </div>

          </div>

          {/* Model Architecture Indicator */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <ListOrdered size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-indigo-950">نموذج هندسة الجذاذة البيداغوجية المتسلسلة (نشاط ➔ تركيب ➔ تقويم مرحلي)</h4>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  العنوان والمعلومات العامة ➔ أهداف الدرس ➔ التمهيد الإشكالي ➔ مقاطع وأنشطة الدرس يليه تركيب ثم تقويم مرحلي ➔ الخاتمة ➔ تقويم إجمالي.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[11px] font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
              نموذج تفاعلي معتمد 🇲🇦
            </span>
          </div>

          {/* Lesson Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">عنوان الدرس المعتمد</label>
            {!isCustomLesson ? (
              <select
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {currentLessons.map((les, idx) => (
                  <option key={idx} value={les}>{les}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="أدخل عنوان الدرس أو الموضوع الخاص..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
              {error}
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري إعداد شرائح الجذاذة البيداغوجية بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-amber-300" />
                  <span>توليد العرض التقديمي التفاعلي 🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Presentation Preview & Presenter Tools */}
      {presentation && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8 space-y-6">
          
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  عرض: {presentation.title}
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {presentation.slides.length} شرائح
                </span>
                {presentation.pedagogicalApproach && (
                  <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Compass size={12} />
                    <span>{presentation.pedagogicalApproach}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                مادة {presentation.subject} • {presentation.level} ({presentation.term}) • نموذج الجذاذة المتسلسلة
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Theme Selector */}
              <div className="relative inline-block">
                <select
                  value={themeStyle}
                  onChange={(e) => setThemeStyle(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none"
                  title="تغيير النمط البصري للعرض"
                >
                  <option value="simple_clean">🎯 النموذج الديداكتيكي المرجعي (Standard Pedagogical Format)</option>
                  <option value="papyrus_heritage">📜 النموذج التراثي والوثائقي (Ancient Papyrus & Heritage)</option>
                  <option value="disciplinary">🎨 النمط التخصصي ({subject})</option>
                  <option value="classic_slate">🏛️ كلاسيكي داكن (Navy Slate)</option>
                  <option value="blackboard">📗 سبورة صفية (Chalkboard)</option>
                  <option value="warm_amber">☀️ ترابي ذهبي (Warm Amber)</option>
                  <option value="modern_clean">🏢 رمادي عصري (Modern Slate)</option>
                </select>
              </div>

              {/* Print Handout Button */}
              <button
                onClick={() => setShowPrintHandout(true)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
                title="طباعة كراسة أنشطة الدرس للتلاميذ"
              >
                <Printer size={14} className="text-slate-600" />
                <span>كراسة الأنشطة</span>
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isEditing 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'إنهاء التعديل' : 'تعديل المحتوى'}</span>
              </button>

              <button
                onClick={() => setIsFullscreen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Play size={14} className="text-amber-400 fill-amber-400" />
                <span>بدء العرض التفاعلي (F5)</span>
              </button>

              <button
                onClick={handleCopyAll}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>نسخ النصوص</span>
              </button>

              <button
                onClick={handleDownloadPptx}
                disabled={isExporting}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                <span>تحميل PowerPoint (.pptx)</span>
              </button>
            </div>
          </div>

          {/* Interactive Slide Viewer Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Thumbnails Sidebar */}
            <div className="lg:col-span-1 space-y-2 max-h-[660px] overflow-y-auto pl-1 pr-1 custom-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">فهرس شرائح الجذاذة</span>
                <button
                  onClick={handleAddSlide}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>إضافة شريحة</span>
                </button>
              </div>

              {presentation.slides.map((s, idx) => {
                const getSlideBadgeStyle = () => {
                  if (s.type === 'title') return 'bg-rose-100 text-rose-800 border-rose-200';
                  if (s.type === 'objectives') return 'bg-amber-100 text-amber-800 border-amber-200';
                  if (s.type === 'problematic') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                  if (s.type === 'synthesis') return 'bg-purple-100 text-purple-800 border-purple-200';
                  if (s.type === 'formative_eval') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (s.type === 'conclusion') return 'bg-teal-100 text-teal-800 border-teal-200';
                  if (s.type === 'evaluation') return 'bg-blue-100 text-blue-800 border-blue-200';
                  return 'bg-slate-200 text-slate-800 border-slate-300';
                };

                return (
                  <div
                    key={s.id || idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all relative group ${
                      activeSlideIndex === idx
                        ? 'bg-indigo-50/90 border-indigo-500 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        activeSlideIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border truncate max-w-[140px] ${getSlideBadgeStyle()}`}>
                        {s.badge || s.pedagogicalStep || 'شريحة'}
                      </span>
                      {presentation.slides.length > 1 && isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(idx);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="حذف الشريحة"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {s.title}
                    </h4>
                  </div>
                );
              })}
            </div>

            {/* Main Active Slide Display & Controls */}
            <div className="lg:col-span-3 space-y-3">
              
              {/* Classroom Interactive Toolbar (Timer & AI Enrich) */}
              <div className="bg-slate-900 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white border border-slate-800 shadow-sm">
                
                {/* Classroom Activity Timer */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono font-bold">
                    <Timer size={14} className={isTimerRunning ? "text-amber-400 animate-spin" : "text-slate-400"} />
                    <span className={timerSeconds === 0 && isTimerRunning ? "text-rose-400" : "text-amber-300"}>
                      {formatTimer(timerSeconds > 0 ? timerSeconds : initialTimerSeconds)}
                    </span>
                  </div>

                  <button
                    onClick={handleToggleTimer}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30 transition-all"
                  >
                    {isTimerRunning ? 'إيقاف مؤقت' : 'بدء المؤقت'}
                  </button>

                  <button
                    onClick={handleResetTimer}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-all"
                    title="إعادة ضبط المؤقت"
                  >
                    <RotateCcw size={13} />
                  </button>

                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 pr-2 border-r border-slate-700">
                    <button onClick={() => handleStartTimer(60)} className="hover:text-amber-300">1د</button>
                    <span>•</span>
                    <button onClick={() => handleStartTimer(120)} className="hover:text-amber-300">2د</button>
                    <span>•</span>
                    <button onClick={() => handleStartTimer(180)} className="hover:text-amber-300">3د</button>
                    <span>•</span>
                    <button onClick={() => handleStartTimer(300)} className="hover:text-amber-300">5د</button>
                  </div>
                </div>

                {/* AI Enrich & Teacher Light buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTeacherNotes(!showTeacherNotes)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      showTeacherNotes ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Lightbulb size={13} className={showTeacherNotes ? "text-amber-400" : "text-slate-400"} />
                    <span>إضاءة الأستاذ</span>
                  </button>

                  <button
                    onClick={handleEnrichActiveSlide}
                    disabled={enriching}
                    className="px-3.5 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {enriching ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Wand2 size={13} className="text-amber-300" />
                    )}
                    <span>إثراء الشريحة بالذكاء الاصطناعي</span>
                  </button>
                </div>

              </div>

              {/* Teacher Notes Panel (Expandable) */}
              {showTeacherNotes && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center justify-between font-black text-amber-300 border-b border-amber-500/20 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Lightbulb size={14} />
                      <span>توجيهات وإضاءة بيداغوجية خاصة بالأستاذ لهاته المرحلة:</span>
                    </span>
                    <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      توجيه ديداكتيكي
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {activeSlide?.teacherNotes || `التركيز في هذه الشريحة على تطبيق خطوات ${presentation.pedagogicalApproach || 'النهج التخصصي'}، مع حث التلاميذ على قراءة المعطيات قبل صياغة الخلاصة، واستثمار التساؤلات التوجيهية في بناء المفهوم.`}
                  </p>
                </div>
              )}

              {/* Main Slide Canvas Container */}
              {activeSlide && (
                <div className="bg-slate-950 rounded-2xl p-3 sm:p-5 shadow-xl border border-slate-800">
                  
                  {presentation.templateModel === 'simple_sequential' || themeStyle === 'simple_clean' ? (
                    <SimpleSlideRenderer
                      slide={activeSlide}
                      slideIndex={activeSlideIndex}
                      totalSlides={presentation.slides.length}
                      presentation={presentation}
                      isEditing={isEditing}
                      onUpdateSlide={updateActiveSlide}
                      revealedAnswers={revealedAnswers}
                      userSelectedAnswers={userSelectedAnswers}
                      onSelectOption={handleSelectOption}
                      onToggleAnswerReveal={toggleAnswerReveal}
                      onNextSlide={activeSlideIndex < presentation.slides.length - 1 ? () => setActiveSlideIndex(prev => prev + 1) : undefined}
                      onPrevSlide={activeSlideIndex > 0 ? () => setActiveSlideIndex(prev => prev - 1) : undefined}
                    />
                  ) : themeStyle === 'papyrus_heritage' ? (
                    <PapyrusSlideRenderer
                      slide={activeSlide}
                      slideIndex={activeSlideIndex}
                      totalSlides={presentation.slides.length}
                      presentation={presentation}
                      isEditing={isEditing}
                      onUpdateSlide={updateActiveSlide}
                      revealedAnswers={revealedAnswers}
                      userSelectedAnswers={userSelectedAnswers}
                      onSelectOption={handleSelectOption}
                      onToggleAnswerReveal={toggleAnswerReveal}
                      onNextSlide={activeSlideIndex < presentation.slides.length - 1 ? () => setActiveSlideIndex(prev => prev + 1) : undefined}
                      onPrevSlide={activeSlideIndex > 0 ? () => setActiveSlideIndex(prev => prev - 1) : undefined}
                    />
                  ) : (
                    /* The Slide Frame (16:9 Ratio Container) */
                    <div className={`relative w-full aspect-video bg-gradient-to-br ${getSlideThemeClasses()} rounded-xl p-5 sm:p-8 flex flex-col justify-between text-white overflow-hidden border shadow-inner`}>
                    
                    {/* Slide Top Bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                          {activeSlide.badge || activeSlide.pedagogicalStep || `شريحة ${activeSlide.slideNumber}`}
                        </span>
                        <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                          مادة {presentation.subject} • {presentation.level}
                        </span>
                      </div>
                      <span className="text-xs text-indigo-300 font-mono font-bold">
                        {activeSlideIndex + 1} / {presentation.slides.length}
                      </span>
                    </div>

                    {/* Slide Content Area */}
                    <div className="my-auto py-2 space-y-4 overflow-y-auto max-h-[75%] pr-1 custom-scrollbar">
                      
                      {/* Title & Subtitle */}
                      <div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={activeSlide.title}
                            onChange={(e) => updateActiveSlide('title', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-lg sm:text-2xl font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        ) : (
                          <h3 className="text-lg sm:text-2xl font-black text-amber-300 tracking-tight">
                            {activeSlide.title}
                          </h3>
                        )}

                        {activeSlide.subtitle && (
                          <p className="text-xs sm:text-sm text-indigo-200 font-medium mt-1">
                            {activeSlide.subtitle}
                          </p>
                        )}
                      </div>

                      {/* 1. TITLE / GENERAL INFO SPECIAL LAYOUT */}
                      {(activeSlide.type === 'title' || activeSlide.type === 'general_info' || activeSlideIndex === 0) && (
                        <div className="space-y-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
                            <h4 className="text-xs font-bold text-amber-300 mb-3 flex items-center gap-1.5">
                              <BookOpen size={14} />
                              <span>بطاقة المعلومات العامة والتأطير الديداكتيكي للدرس</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                                <span className="text-[10px] text-slate-400 block font-bold">المادة والمستوى:</span>
                                <span className="font-bold text-slate-100">{presentation.subject} • {presentation.level}</span>
                              </div>
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                                <span className="text-[10px] text-slate-400 block font-bold">الدورة والغلاف الزمني:</span>
                                <span className="font-bold text-slate-100">{presentation.term} • {presentation.duration || 'ساعتان'}</span>
                              </div>
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                                <span className="text-[10px] text-slate-400 block font-bold">المكون / المجزوءة:</span>
                                <span className="font-bold text-slate-100">{presentation.module || presentation.subject}</span>
                              </div>
                              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                                <span className="text-[10px] text-slate-400 block font-bold">الكفاية المستهدفة:</span>
                                <span className="font-bold text-amber-200">{presentation.targetCompetency || 'بناء المفاهيم المهيكلة والنهج التخصصي'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {(activeSlide.bulletPoints || []).map((bp, bIdx) => (
                              <div key={bIdx} className="flex items-center gap-2 text-xs text-slate-200">
                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                <span>{bp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. OBJECTIVES SPECIAL LAYOUT */}
                      {activeSlide.type === 'objectives' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-rose-950/40 rounded-xl p-3 border border-rose-500/30 space-y-2">
                            <span className="text-xs font-black text-rose-300 block border-b border-rose-500/20 pb-1">
                              🎯 الأهداف المعرفية
                            </span>
                            <ul className="text-xs text-slate-200 space-y-1.5">
                              {(activeSlide.objectivesGroup?.cognitive || (activeSlide.bulletPoints || []).slice(0, 2)).map((obj, oIdx) => (
                                <li key={oIdx} className="flex items-start gap-1.5">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-500/30 space-y-2">
                            <span className="text-xs font-black text-amber-300 block border-b border-amber-500/20 pb-1">
                              🛠️ الأهداف المنهجية والمهارية
                            </span>
                            <ul className="text-xs text-slate-200 space-y-1.5">
                              {(activeSlide.objectivesGroup?.methodological || (activeSlide.bulletPoints || []).slice(2, 4)).map((obj, oIdx) => (
                                <li key={oIdx} className="flex items-start gap-1.5">
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/30 space-y-2">
                            <span className="text-xs font-black text-emerald-300 block border-b border-emerald-500/20 pb-1">
                              🌟 الأهداف الوجدانية والقيمية
                            </span>
                            <ul className="text-xs text-slate-200 space-y-1.5">
                              {(activeSlide.objectivesGroup?.attitudinal || (activeSlide.bulletPoints || []).slice(4, 6)).map((obj, oIdx) => (
                                <li key={oIdx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* 3. SYNTHESIS (التركيب الجزئي للمقطع) */}
                      {activeSlide.type === 'synthesis' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="bg-purple-950/40 rounded-xl p-3.5 border border-purple-500/30 space-y-2">
                              <span className="text-xs font-black text-purple-300 block">📝 خلاصة وحصيلة المقطع:</span>
                              {(activeSlide.bulletPoints || []).map((bp, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                  <p>{bp}</p>
                                </div>
                              ))}
                            </div>
                            {activeSlide.highlightBox && (
                              <div className="bg-white/10 rounded-xl p-3 border border-white/15 text-xs text-amber-200">
                                <span className="font-bold text-amber-400 block mb-0.5">💡 إضاءة واستنتاج:</span>
                                {activeSlide.highlightBox}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {activeSlide.keyConcepts && activeSlide.keyConcepts.length > 0 && (
                              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2">
                                <span className="font-black text-amber-300 block">📖 المفاهيم والمصطلحات المهيكلة:</span>
                                {activeSlide.keyConcepts.map((kc, kIdx) => (
                                  <div key={kIdx} className="bg-white/5 p-2 rounded-lg border border-white/10 text-[11px]">
                                    <span className="font-black text-white">{kc.term}: </span>
                                    <span className="text-slate-300">{kc.definition}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4. FORMATIVE EVALUATION (التقويم المرحلي التفاعلي) */}
                      {activeSlide.type === 'formative_eval' && (
                        <div className="bg-amber-950/40 rounded-xl p-4 border border-amber-500/30 text-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                            <span className="font-black text-amber-300 flex items-center gap-1">
                              <HelpCircle size={14} />
                              <span>فحص الاستيعاب والتقويم المرحلي للمقطع (تفاعلي)</span>
                            </span>
                            {activeSlide.interactiveQuestion?.targetSkill && (
                              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                                {activeSlide.interactiveQuestion.targetSkill}
                              </span>
                            )}
                          </div>

                          {activeSlide.interactiveQuestion && (
                            <>
                              <p className="font-bold text-white text-sm">❓ {activeSlide.interactiveQuestion.question}</p>
                              
                              {/* Clickable Multi-Choice Options */}
                              {activeSlide.interactiveQuestion.options && Array.isArray(activeSlide.interactiveQuestion.options) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {activeSlide.interactiveQuestion.options.map((opt, oIdx) => {
                                    const isSelected = userSelectedAnswers[activeSlide.id] === opt;
                                    const isCorrect = activeSlide.interactiveQuestion?.correctAnswer === opt;
                                    const showOutcome = isSelected && revealedAnswers[activeSlide.id];

                                    return (
                                      <button
                                        key={oIdx}
                                        onClick={() => handleSelectOption(activeSlide.id, opt)}
                                        className={`text-right p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                                          isSelected
                                            ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold shadow-xs'
                                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                                        }`}
                                      >
                                        <span>• {opt}</span>
                                        {isSelected && <CheckSquare size={13} className="text-amber-400 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="pt-2 flex items-center gap-3">
                                <button
                                  onClick={() => toggleAnswerReveal(activeSlide.id)}
                                  className="text-xs font-black text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30"
                                >
                                  {revealedAnswers[activeSlide.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                                  <span>{revealedAnswers[activeSlide.id] ? 'إخفاء الإجابة والتعليل' : 'تحقق وكشف الإجابة والتعليل'}</span>
                                </button>
                              </div>

                              {revealedAnswers[activeSlide.id] && (
                                <div className="mt-2 p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-200 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <Award size={15} className="text-emerald-400" />
                                    <p><strong className="text-emerald-400">الإجابة الصحيحة: </strong>{activeSlide.interactiveQuestion.correctAnswer}</p>
                                  </div>
                                  <p className="text-slate-300 text-[11px]"><strong className="text-emerald-400">التعليل البيداغوجي: </strong>{activeSlide.interactiveQuestion.explanation}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* 5. CONCLUSION & SUMMATIVE EVALUATION & STANDARD ACTIVITIES */}
                      {activeSlide.type !== 'title' && activeSlide.type !== 'general_info' && activeSlide.type !== 'objectives' && activeSlide.type !== 'synthesis' && activeSlide.type !== 'formative_eval' && activeSlideIndex !== 0 && (
                        <div className={`grid gap-4 ${
                          activeSlide.activityDoc || activeSlide.visualDiagram || activeSlide.interactiveQuestion
                            ? 'grid-cols-1 md:grid-cols-2'
                            : 'grid-cols-1'
                        }`}>
                          
                          {/* Right Column: Bullets List */}
                          <div className="space-y-2">
                            {activeSlide.bulletPoints.map((bp, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                {isEditing ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="text"
                                      value={bp}
                                      onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs sm:text-sm text-white focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleRemoveBullet(bIdx)}
                                      className="text-rose-400 hover:text-rose-300"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <p className="leading-relaxed">{bp}</p>
                                )}
                              </div>
                            ))}

                            {isEditing && (
                              <button
                                onClick={handleAddBullet}
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 pt-1"
                              >
                                <Plus size={13} />
                                <span>إضافة نقطة للشريحة</span>
                              </button>
                            )}

                            {/* Highlight box */}
                            {activeSlide.highlightBox && (
                              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs text-amber-200 leading-relaxed mt-2">
                                <span className="font-black text-amber-400 block mb-1">💡 استنتاج وخلاصة:</span>
                                {activeSlide.highlightBox}
                              </div>
                            )}
                          </div>

                          {/* Left Column: Rich Aids (Docs / Diagram / Questions) */}
                          <div className="space-y-3">
                            
                            {/* Activity Document Card */}
                            {activeSlide.activityDoc && (
                              <div className="bg-indigo-950/70 rounded-xl p-3.5 border border-indigo-400/30 text-xs space-y-2 shadow-sm">
                                <div className="flex items-center justify-between border-b border-indigo-400/20 pb-1.5">
                                  <span className="font-black text-amber-300 flex items-center gap-1">
                                    <FileText size={13} />
                                    <span>دعامة: {activeSlide.activityDoc.docType}</span>
                                  </span>
                                  {activeSlide.activityDoc.source && (
                                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                      {activeSlide.activityDoc.source}
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-white text-xs">{activeSlide.activityDoc.title}</p>
                                {activeSlide.activityDoc.contentSnippet && (
                                  <p className="text-[11px] text-slate-300 italic bg-black/30 p-2 rounded-lg border border-white/5">
                                    "{activeSlide.activityDoc.contentSnippet}"
                                  </p>
                                )}
                                <div className="text-[11px] text-emerald-300 pt-1">
                                  <span className="font-bold block text-amber-400">❓ السؤال الموجه:</span>
                                  <span>{activeSlide.activityDoc.question}</span>
                                </div>
                                {activeSlide.activityDoc.conclusion && (
                                  <div className="text-[10px] text-slate-300 bg-white/5 p-2 rounded-lg border border-white/10">
                                    <span className="font-bold text-emerald-400">✓ الاستنتاج: </span>
                                    {activeSlide.activityDoc.conclusion}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Visual Diagram */}
                            {activeSlide.visualDiagram && (
                              <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2.5">
                                <div className="flex items-center gap-1.5 font-black text-amber-300 border-b border-slate-800 pb-1.5">
                                  <Layers size={13} />
                                  <span>خطاطة ديداكتيكية: {activeSlide.visualDiagram.title}</span>
                                </div>
                                <div className="space-y-1.5">
                                  {activeSlide.visualDiagram.nodes.map((node, nIdx) => (
                                    <div key={nIdx} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                        {node.badge || nIdx + 1}
                                      </span>
                                      <div>
                                        <h5 className="font-bold text-white text-xs">{node.title}</h5>
                                        {node.desc && <p className="text-[10px] text-slate-300">{node.desc}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Interactive Question */}
                            {activeSlide.interactiveQuestion && (
                              <div className="bg-amber-950/40 rounded-xl p-3.5 border border-amber-500/30 text-xs space-y-2">
                                <div className="flex items-center justify-between border-b border-amber-500/20 pb-1">
                                  <span className="font-black text-amber-300 flex items-center gap-1">
                                    <HelpCircle size={13} />
                                    <span>سؤال تقويمي تفاعلي</span>
                                  </span>
                                  {activeSlide.interactiveQuestion.targetSkill && (
                                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                      {activeSlide.interactiveQuestion.targetSkill}
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-white">{activeSlide.interactiveQuestion.question}</p>
                                
                                <div className="pt-1">
                                  <button
                                    onClick={() => toggleAnswerReveal(activeSlide.id)}
                                    className="text-[10px] font-black text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
                                  >
                                    {revealedAnswers[activeSlide.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                    <span>{revealedAnswers[activeSlide.id] ? 'إخفاء الإجابة النموذجية' : 'كشف الإجابة والتعليل'}</span>
                                  </button>

                                  {revealedAnswers[activeSlide.id] && (
                                    <div className="mt-2 p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-200 space-y-1">
                                      {activeSlide.interactiveQuestion.correctAnswer && (
                                        <p><strong className="text-emerald-400">الإجابة: </strong>{activeSlide.interactiveQuestion.correctAnswer}</p>
                                      )}
                                      <p><strong className="text-emerald-400">التعليل: </strong>{activeSlide.interactiveQuestion.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>

                        </div>
                      )}

                    </div>

                    {/* Slide Footer */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400">
                      <span>الدرس: {presentation.title}</span>
                      <span>منصة الاجتماعيات الذكية (HG-PROF.MA)</span>
                    </div>

                  </div>
                  )}

                  {/* Slide Carousel Controls */}
                  <div className="flex items-center justify-between mt-3 px-2">
                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeSlideIndex === 0}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 transition-all flex items-center gap-1 text-xs font-bold"
                    >
                      <ChevronRight size={16} />
                      <span>السابق</span>
                    </button>

                    <span className="text-xs text-slate-400 font-bold">
                      شريحة {activeSlideIndex + 1} من {presentation.slides.length}
                    </span>

                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
                      disabled={activeSlideIndex === presentation.slides.length - 1}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 transition-all flex items-center gap-1 text-xs font-bold"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Fullscreen Presentation Mode Modal */}
      {isFullscreen && presentation && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 text-white" dir="rtl">
          
          {/* Top Control Overlay */}
          <div className="flex items-center justify-between bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-amber-400 text-black px-2.5 py-0.5 rounded-md">
                {activeSlide?.badge || activeSlide?.pedagogicalStep || 'شريحة'}
              </span>
              <span className="text-sm font-black truncate max-w-md">{presentation.title}</span>
            </div>

            {/* Timer in Fullscreen */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-300">
                <Timer size={14} className={isTimerRunning ? "animate-spin" : ""} />
                <span>{formatTimer(timerSeconds > 0 ? timerSeconds : initialTimerSeconds)}</span>
              </div>
              <button
                onClick={handleToggleTimer}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
              >
                {isTimerRunning ? 'إيقاف' : 'تشغيل'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-bold text-slate-300">
                {activeSlideIndex + 1} / {presentation.slides.length}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                title="إنهاء العرض (Esc)"
              >
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          {/* Centered Large Slide */}
          <div className="flex-1 flex items-center justify-center my-4 overflow-y-auto w-full max-w-5xl mx-auto">
            {presentation.templateModel === 'simple_sequential' || themeStyle === 'simple_clean' ? (
              <div className="w-full max-w-5xl">
                <SimpleSlideRenderer
                  slide={activeSlide!}
                  slideIndex={activeSlideIndex}
                  totalSlides={presentation.slides.length}
                  presentation={presentation}
                  isEditing={false}
                  onUpdateSlide={updateActiveSlide}
                  revealedAnswers={revealedAnswers}
                  userSelectedAnswers={userSelectedAnswers}
                  onSelectOption={handleSelectOption}
                  onToggleAnswerReveal={toggleAnswerReveal}
                  onNextSlide={activeSlideIndex < presentation.slides.length - 1 ? () => setActiveSlideIndex(prev => prev + 1) : undefined}
                  onPrevSlide={activeSlideIndex > 0 ? () => setActiveSlideIndex(prev => prev - 1) : undefined}
                />
              </div>
            ) : themeStyle === 'papyrus_heritage' ? (
              <div className="w-full max-w-5xl">
                <PapyrusSlideRenderer
                  slide={activeSlide!}
                  slideIndex={activeSlideIndex}
                  totalSlides={presentation.slides.length}
                  presentation={presentation}
                  isEditing={false}
                  onUpdateSlide={updateActiveSlide}
                  revealedAnswers={revealedAnswers}
                  userSelectedAnswers={userSelectedAnswers}
                  onSelectOption={handleSelectOption}
                  onToggleAnswerReveal={toggleAnswerReveal}
                  onNextSlide={activeSlideIndex < presentation.slides.length - 1 ? () => setActiveSlideIndex(prev => prev + 1) : undefined}
                  onPrevSlide={activeSlideIndex > 0 ? () => setActiveSlideIndex(prev => prev - 1) : undefined}
                />
              </div>
            ) : (
            <div className={`w-full max-w-5xl aspect-video bg-gradient-to-br ${getSlideThemeClasses()} rounded-3xl p-8 sm:p-12 flex flex-col justify-between border border-white/10 shadow-2xl overflow-y-auto`}>
              
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block mb-1">
                  مادة {presentation.subject} • {presentation.level}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
                  {activeSlide?.title}
                </h2>
                {activeSlide?.subtitle && (
                  <p className="text-sm text-indigo-200">{activeSlide.subtitle}</p>
                )}
              </div>

              {/* Slide Body Fullscreen */}
              <div className="my-auto py-4">
                {(activeSlide?.type === 'title' || activeSlide?.type === 'general_info' || activeSlideIndex === 0) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">المادة والمستوى:</span>
                        <span className="font-bold text-white">{presentation.subject} • {presentation.level}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">الدورة والغلاف الزمني:</span>
                        <span className="font-bold text-white">{presentation.term} • {presentation.duration || 'ساعتان'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">المكون:</span>
                        <span className="font-bold text-white">{presentation.module || presentation.subject}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-bold">الكفاية المستهدفة:</span>
                        <span className="font-bold text-amber-300">{presentation.targetCompetency || 'النهج التخصصي والمفاهيم المهيكلة'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSlide?.type === 'objectives' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-rose-950/60 p-4 rounded-2xl border border-rose-500/40 text-sm space-y-2">
                      <span className="font-black text-rose-300 block">🎯 معرفية:</span>
                      {(activeSlide?.objectivesGroup?.cognitive || (activeSlide?.bulletPoints || []).slice(0, 2))?.map((o, idx) => (
                        <p key={idx} className="text-slate-200">• {o}</p>
                      ))}
                    </div>
                    <div className="bg-amber-950/60 p-4 rounded-2xl border border-amber-500/40 text-sm space-y-2">
                      <span className="font-black text-amber-300 block">🛠️ منهجية:</span>
                      {(activeSlide?.objectivesGroup?.methodological || (activeSlide?.bulletPoints || []).slice(2, 4))?.map((o, idx) => (
                        <p key={idx} className="text-slate-200">• {o}</p>
                      ))}
                    </div>
                    <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 text-sm space-y-2">
                      <span className="font-black text-emerald-300 block">🌟 وجدانية:</span>
                      {(activeSlide?.objectivesGroup?.attitudinal || (activeSlide?.bulletPoints || []).slice(4, 6))?.map((o, idx) => (
                        <p key={idx} className="text-slate-200">• {o}</p>
                      ))}
                    </div>
                  </div>
                )}

                {activeSlide?.type === 'synthesis' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2 bg-purple-950/60 p-4 rounded-2xl border border-purple-500/40">
                      <span className="font-black text-purple-300 block">📝 خلاصة المقطع:</span>
                      {(activeSlide?.bulletPoints || []).map((bp, idx) => (
                        <p key={idx} className="text-slate-100 leading-relaxed">• {bp}</p>
                      ))}
                    </div>
                    <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                      <span className="font-black text-amber-300 block">📖 المفاهيم المهيكلة:</span>
                      {activeSlide?.keyConcepts?.map((kc, idx) => (
                        <p key={idx} className="text-slate-200 text-xs">
                          <strong className="text-amber-400">{kc.term}: </strong>{kc.definition}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {activeSlide?.type !== 'title' && activeSlide?.type !== 'general_info' && activeSlide?.type !== 'objectives' && activeSlide?.type !== 'synthesis' && activeSlideIndex !== 0 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {(activeSlide?.bulletPoints || []).map((bp, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-base text-slate-100 leading-relaxed">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <p>{bp}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {activeSlide?.activityDoc && (
                        <div className="bg-indigo-950/80 rounded-2xl p-4 border border-indigo-400/40 text-sm space-y-2">
                          <span className="font-black text-amber-300 block">📑 دعامة: {activeSlide.activityDoc.title}</span>
                          <p className="text-xs text-emerald-300 font-bold">❓ {activeSlide.activityDoc.question}</p>
                          {activeSlide.activityDoc.conclusion && (
                            <p className="text-xs text-slate-200 bg-white/5 p-2 rounded-xl">✓ {activeSlide.activityDoc.conclusion}</p>
                          )}
                        </div>
                      )}

                      {activeSlide?.interactiveQuestion && (
                        <div className="bg-amber-950/50 rounded-2xl p-4 border border-amber-500/40 text-sm space-y-2">
                          <span className="font-black text-amber-300 block">🎯 سؤال تقويمي:</span>
                          <p className="font-bold text-white">{activeSlide.interactiveQuestion.question}</p>
                          <button
                            onClick={() => toggleAnswerReveal(activeSlide.id)}
                            className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30"
                          >
                            {revealedAnswers[activeSlide.id] ? 'إخفاء الإجابة' : 'كشف الإجابة والتعليل'}
                          </button>
                          {revealedAnswers[activeSlide.id] && (
                            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
                              <p><strong>الإجابة:</strong> {activeSlide.interactiveQuestion.correctAnswer}</p>
                              <p><strong>التعليل:</strong> {activeSlide.interactiveQuestion.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
                <span>{presentation.title}</span>
                <span>منصة الاجتماعيات الذكية (HG-PROF.MA)</span>
              </div>

            </div>
            )}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-20 transition-all flex items-center gap-2"
            >
              <ChevronRight size={18} />
              <span>الشريحة السابقة</span>
            </button>

            <span className="text-sm font-bold text-slate-400">
              {activeSlideIndex + 1} / {presentation.slides.length}
            </span>

            <button
              onClick={() => setActiveSlideIndex(prev => Math.min(presentation.slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === presentation.slides.length - 1}
              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-20 transition-all flex items-center gap-2"
            >
              <span>الشريحة التالية</span>
              <ChevronLeft size={18} />
            </button>
          </div>

        </div>
      )}

      {/* Printable Student Handout Modal */}
      {showPrintHandout && presentation && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            
            {/* Handout Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Printer size={18} className="text-indigo-600" />
                  <span>كراسة أنشطة المتعلم المرافقة للعرض: {presentation.title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ورقة عمل صفية جاهزة للطباعة والتوزيع على المتعلمين لمتابعة أنشطة الدرس.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer size={14} />
                  <span>طباعة فورية</span>
                </button>
                <button
                  onClick={() => setShowPrintHandout(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Handout Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-sm print:p-0">
              
              {/* Document Official Header */}
              <div className="border-2 border-slate-800 rounded-2xl p-4 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">المملكة المغربية • وزارة التربية الوطنية</p>
                  <p className="text-slate-600">المادة: {presentation.subject} | المستوى: {presentation.level}</p>
                </div>
                <div className="text-center">
                  <h4 className="text-base font-black text-indigo-900">{presentation.title}</h4>
                  <span className="text-[11px] text-slate-500">كراسة أنشطة التلميذ</span>
                </div>
                <div className="text-left">
                  <p>الاسم: .......................................</p>
                  <p>القسم: ........... / الرقم: ............</p>
                </div>
              </div>

              {/* Handout Activities List */}
              {presentation.slides.filter(s => s.type !== 'title' && s.type !== 'general_info').map((s, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-black text-indigo-950 text-xs">
                      [المحطة {idx + 1}] {s.title}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {s.badge || s.pedagogicalStep}
                    </span>
                  </div>

                  {s.activityDoc && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <p className="font-bold text-slate-900">📄 دعامة ({s.activityDoc.docType}): {s.activityDoc.title}</p>
                      {s.activityDoc.contentSnippet && (
                        <p className="text-slate-600 italic">"{s.activityDoc.contentSnippet}"</p>
                      )}
                      <p className="font-bold text-indigo-700">❓ السؤال: {s.activityDoc.question}</p>
                      <div className="pt-2">
                        <div className="h-10 border-b border-dashed border-slate-300 text-slate-400 text-[10px]">
                          مساحة إجابة التلميذ: ........................................................................................................................
                        </div>
                      </div>
                    </div>
                  )}

                  {s.keyConcepts && s.keyConcepts.length > 0 && (
                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 text-xs space-y-1">
                      <span className="font-bold text-amber-900 block">📖 مصطلحات ومفاهيم أساسية:</span>
                      {s.keyConcepts.map((kc, kIdx) => (
                        <p key={kIdx} className="text-slate-700 text-[11px]">• <strong>{kc.term}:</strong> {kc.definition}</p>
                      ))}
                    </div>
                  )}

                  {s.interactiveQuestion && (
                    <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs space-y-2">
                      <p className="font-bold text-slate-900">🎯 مهمة تقويمية: {s.interactiveQuestion.question}</p>
                      {s.interactiveQuestion.options && (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {s.interactiveQuestion.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 border border-slate-400 rounded-full inline-block" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
