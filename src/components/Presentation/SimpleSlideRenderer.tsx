import React from 'react';
import { PresentationSlide, PresentationData } from '../../types/presentation';
import { 
  BookOpen, 
  Target, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  CheckSquare, 
  Eye, 
  EyeOff, 
  Award, 
  Compass, 
  PenTool, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';

interface SimpleSlideRendererProps {
  slide: PresentationSlide;
  slideIndex: number;
  totalSlides: number;
  presentation: PresentationData;
  isEditing?: boolean;
  onUpdateSlide?: (field: keyof PresentationSlide, value: any) => void;
  revealedAnswers?: Record<string, boolean>;
  userSelectedAnswers?: Record<string, string>;
  onSelectOption?: (slideId: string, option: string) => void;
  onToggleAnswerReveal?: (slideId: string) => void;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const SimpleSlideRenderer: React.FC<SimpleSlideRendererProps> = ({
  slide,
  slideIndex,
  totalSlides,
  presentation,
  isEditing = false,
  onUpdateSlide,
  revealedAnswers = {},
  userSelectedAnswers = {},
  onSelectOption,
  onToggleAnswerReveal,
  onNextSlide,
  onPrevSlide
}) => {
  // Theme color accents based on subject
  const getSubjectTheme = () => {
    if (presentation.subject.includes('تاريخ')) {
      return {
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        sectionBg: 'bg-rose-800 text-white',
        highlightBorder: 'border-rose-300',
        bulletDot: 'bg-rose-600',
        accentText: 'text-rose-900',
        softBg: 'bg-rose-50/70',
        headerBorder: 'border-rose-200'
      };
    }
    if (presentation.subject.includes('جغرافيا')) {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        sectionBg: 'bg-emerald-800 text-white',
        highlightBorder: 'border-emerald-300',
        bulletDot: 'bg-emerald-600',
        accentText: 'text-emerald-900',
        softBg: 'bg-emerald-50/70',
        headerBorder: 'border-emerald-200'
      };
    }
    return {
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      sectionBg: 'bg-indigo-800 text-white',
      highlightBorder: 'border-indigo-300',
      bulletDot: 'bg-indigo-600',
      accentText: 'text-indigo-900',
      softBg: 'bg-indigo-50/70',
      headerBorder: 'border-indigo-200'
    };
  };

  const theme = getSubjectTheme();

  return (
    <div className="relative w-full aspect-video bg-white rounded-2xl p-5 sm:p-7 flex flex-col justify-between text-slate-900 overflow-hidden border-2 border-slate-300 shadow-md">
      
      {/* 1. TOP HEADER (Unified Clean Bar) */}
      <div className={`flex items-center justify-between border-b ${theme.headerBorder} pb-2.5 shrink-0`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black border ${theme.badgeBg}`}>
            {slide.badge || `شريحة ${slide.slideNumber}`}
          </span>
          <span className="text-xs text-slate-600 font-bold hidden sm:inline">
            {presentation.subject} • {presentation.level}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono font-bold">
            {slideIndex + 1} / {totalSlides}
          </span>
        </div>
      </div>

      {/* 2. MAIN SLIDE CONTENT BODY */}
      <div className="my-auto py-2 overflow-y-auto max-h-[78%] pr-1 space-y-3.5 custom-scrollbar">
        
        {/* ========================================================================= */}
        {/* CASE A: TITLE SLIDE (العنوان والتأطير العام) */}
        {/* ========================================================================= */}
        {(slide.type === 'title' || slide.type === 'general_info' || slideIndex === 0) && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold mb-2">
                مادة {presentation.subject} • {presentation.level} • {presentation.term}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {slide.title || presentation.title}
              </h2>
              {slide.subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* Framing Box */}
            <div className={`rounded-xl p-4 border ${theme.highlightBorder} ${theme.softBg} space-y-2`}>
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <BookOpen size={14} className="text-slate-700" />
                <span>التأطير الديداكتيكي والكفاية المستهدفة</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                🎯 <strong className="text-slate-900">الكفاية المستهدفة: </strong>
                {presentation.targetCompetency || 'بناء المفاهيم المهيكلة وتطبيق خطوات النهج التخصصي وفق التوجيهات التربوية الرسمية.'}
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-2">
              {(slide.bulletPoints || []).map((bp, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>{bp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE B: OBJECTIVES SLIDE (أهداف التعلم) */}
        {/* ========================================================================= */}
        {slide.type === 'objectives' && (
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Target size={20} className="text-rose-600" />
                <span>{slide.title || 'أهداف التعلم'}</span>
              </h2>
              {slide.subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{slide.subtitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Cognitive Objectives */}
              <div className="bg-rose-50/80 rounded-xl p-3.5 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 border-b border-rose-200 pb-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>🎯 أهداف معرفية</span>
                </div>
                <ul className="text-xs text-slate-800 space-y-2">
                  {(slide.objectivesGroup?.cognitive || (slide.bulletPoints || []).slice(0, 2)).map((obj, oIdx) => (
                    <li key={oIdx} className="flex items-start gap-1.5 leading-relaxed font-medium">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methodological Objectives */}
              <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 border-b border-amber-200 pb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>🛠️ أهداف منهجية ومهارية</span>
                </div>
                <ul className="text-xs text-slate-800 space-y-2">
                  {(slide.objectivesGroup?.methodological || (slide.bulletPoints || []).slice(2, 4)).map((obj, oIdx) => (
                    <li key={oIdx} className="flex items-start gap-1.5 leading-relaxed font-medium">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attitudinal Objectives */}
              <div className="bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 border-b border-emerald-200 pb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>🌟 أهداف وجدانية وقيمية</span>
                </div>
                <ul className="text-xs text-slate-800 space-y-2">
                  {(slide.objectivesGroup?.attitudinal || (slide.bulletPoints || []).slice(4, 6)).map((obj, oIdx) => (
                    <li key={oIdx} className="flex items-start gap-1.5 leading-relaxed font-medium">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE C: ACTIVITY SLIDE (عنوان المقطع + عنوان النشاط + رؤوس أقلام) */}
        {/* ========================================================================= */}
        {slide.type === 'activity' && (
          <div className="space-y-3">
            {/* Section Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-slate-600" />
                <span>{slide.sectionTitle || `المقطع التعلمي ${slide.moduleIndex || 1}`}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {slide.pedagogicalStep || 'خطوات النهج الديداكتيكي'}
              </span>
            </div>

            {/* Activity Title */}
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {slide.activityTitle || slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{slide.subtitle}</p>
              )}
            </div>

            {/* Bullet Points of the Activity Content (رؤوس أقلام لما يتضمنه النشاط) */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-2 shadow-xs">
              <h4 className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1">
                <PenTool size={13} className="text-slate-600" />
                <span>رؤوس أقلام النشاط والمضامين الأساسية:</span>
              </h4>
              <div className="space-y-2.5">
                {(slide.bulletPoints || []).map((bp, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    <span className={`w-2 h-2 rounded-full ${theme.bulletDot} mt-1.5 shrink-0`} />
                    <p>{bp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlight Box if available */}
            {slide.highlightBox && (
              <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="font-semibold">{slide.highlightBox}</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE D: SECTION SYNTHESIS & GUIDANCE SLIDE (توجيه المتعلمين لتركيب التعلمات) */}
        {/* ========================================================================= */}
        {slide.type === 'synthesis' && (
          <div className="space-y-3">
            {/* Section Header */}
            <div className="bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-slate-600" />
                <span>{slide.sectionTitle || `المقطع التعلمي ${slide.moduleIndex || 1}`}</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                استخلاص وتركيب المقطع 📝
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {slide.title || 'تركيب تعلمات المقطع واستخلاص الحصيلة'}
            </h2>

            {/* 1. GUIDANCE BOX: توجيه المتعلمين لتركيب التعلمات لما تم إنجازه في أنشطة المقطع */}
            <div className="bg-indigo-50/90 rounded-xl p-3.5 border-2 border-indigo-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                <Compass size={15} className="text-indigo-700" />
                <span>🧭 توجيه المتعلمين لتركيب التعلمات لما تم إنجازه في أنشطة المقطع:</span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed font-semibold pr-5">
                {slide.synthesisGuidance || 
                 'بناءً على ما تم إنجازه في أنشطة هذا المقطع، يوجه الأستاذ المتعلمين إلى استخلاص الفكرة المحورية وصياغة فقرة تركيبية مركزة تدون في دفتر الدروس.'}
              </p>
            </div>

            {/* 2. SYNTHESIS BULLETS: خلاصات المقطع والمفاهيم */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                <PenTool size={13} className="text-slate-700" />
                <span>خلاصة التعلمات المركبة للمقطع:</span>
              </h4>
              <div className="space-y-1.5">
                {(slide.bulletPoints || []).map((bp, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-medium">
                    <CheckCircle2 size={14} className="text-indigo-600 mt-1 shrink-0" />
                    <p>{bp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE E: FORMATIVE EVALUATION SLIDE (تقويم مرحلي للمقطع) */}
        {/* ========================================================================= */}
        {slide.type === 'formative_eval' && (
          <div className="space-y-3">
            <div className="bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-amber-700" />
                <span>{slide.sectionTitle || `المقطع التعلمي ${slide.moduleIndex || 1}`} • تقويم مرحلي</span>
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                فحص المكتسبات المرحلية
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {slide.title || 'التقويم المرحلي للمقطع التعلمي'}
            </h2>

            {/* Interactive Question Card */}
            {slide.interactiveQuestion ? (
              <div className="bg-white rounded-xl p-4 border border-amber-200 space-y-3 shadow-xs">
                <div className="text-xs sm:text-sm font-black text-slate-900 flex items-start gap-1.5">
                  <span className="text-amber-600 text-base leading-none">❓</span>
                  <p>{slide.interactiveQuestion.question}</p>
                </div>

                {/* Multiple choice options */}
                {slide.interactiveQuestion.options && Array.isArray(slide.interactiveQuestion.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {slide.interactiveQuestion.options.map((opt, oIdx) => {
                      const isSelected = userSelectedAnswers[slide.id] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => onSelectOption && onSelectOption(slide.id, opt)}
                          className={`text-right p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between font-medium ${
                            isSelected
                              ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span>• {opt}</span>
                          {isSelected && <CheckSquare size={14} className="text-amber-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Check & Reveal Button */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => onToggleAnswerReveal && onToggleAnswerReveal(slide.id)}
                    className="text-xs font-black text-amber-800 hover:text-amber-900 flex items-center gap-1.5 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors"
                  >
                    {revealedAnswers[slide.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{revealedAnswers[slide.id] ? 'إخفاء الإجابة والتعليل' : 'تحقق وكشف الإجابة والتعليل'}</span>
                  </button>
                </div>

                {/* Revealed Answer Box */}
                {revealedAnswers[slide.id] && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-black">
                      <Award size={14} className="text-emerald-700" />
                      <span>الإجابة الصحيحة: {slide.interactiveQuestion.correctAnswer}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      💡 <strong>التعليل البيداغوجي: </strong>{slide.interactiveQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                {(slide.bulletPoints || []).map((bp, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                    <span className="text-amber-600 font-bold">•</span>
                    <p>{bp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE F: SUMMATIVE SYNTHESIS (التركيب الإجمالي لحصيلة مقاطع الدرس) */}
        {/* ========================================================================= */}
        {(slide.type === 'evaluation' || slide.title.includes('التركيب الإجمالي') || slide.badge?.includes('تركيب إجمالي')) && (
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap size={20} className="text-indigo-600" />
                  <span>{slide.title || 'التركيب الإجمالي لحصيلة مقاطع الدرس'}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {slide.subtitle || 'الربط التركيبي بين كافة مقاطع وأنشطة الدرس'}
                </p>
              </div>
              <span className="text-[11px] font-black bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
                تركيب إجمالي
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
              <h4 className="text-xs font-black text-slate-800 mb-1">
                📌 الحصيلة الإجمالية الشاملة للدرس:
              </h4>
              <div className="space-y-2">
                {(slide.bulletPoints || []).map((bp, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    <CheckCircle2 size={15} className="text-indigo-600 mt-0.5 shrink-0" />
                    <p>{bp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE G: CONCLUSION SLIDE (الخاتمة والامتدادات) */}
        {/* ========================================================================= */}
        {slide.type === 'conclusion' && (
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-600" />
                  <span>{slide.title || 'خاتمة الدرس والامتدادات'}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {slide.subtitle || 'الحصيلة العامة وأفق الدرس اللاحق'}
                </p>
              </div>
              <span className="text-[11px] font-black bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">
                خاتمة الدرس
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2.5 shadow-xs">
              <h4 className="text-xs font-black text-slate-800">
                خلاصة ختامية:
              </h4>
              <div className="space-y-2">
                {(slide.bulletPoints || []).map((bp, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                    <p>{bp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlight box / Opening prospective question */}
            {slide.highlightBox && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-300 text-xs text-amber-950 font-semibold flex items-start gap-2">
                <span className="text-base leading-none">🚀</span>
                <p><strong>امتداد وانفتاح: </strong>{slide.highlightBox}</p>
              </div>
            )}
          </div>
        )}

        {/* Fallback for other slide types */}
        {slide.type !== 'title' && 
         slide.type !== 'general_info' && 
         slide.type !== 'objectives' && 
         slide.type !== 'activity' && 
         slide.type !== 'synthesis' && 
         slide.type !== 'formative_eval' && 
         slide.type !== 'evaluation' && 
         slide.type !== 'conclusion' && 
         slideIndex !== 0 && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">{slide.title}</h2>
            {slide.subtitle && <p className="text-xs text-slate-500">{slide.subtitle}</p>}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {(slide.bulletPoints || []).map((bp, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                  <p>{bp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 3. BOTTOM CLEAN FOOTER BAR */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] text-slate-500 shrink-0">
        <span className="font-semibold">
          {presentation.title} • {presentation.term}
        </span>
        <div className="flex items-center gap-2">
          {onPrevSlide && slideIndex > 0 && (
            <button
              onClick={onPrevSlide}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
              title="الشريحة السابقة"
            >
              <ChevronRight size={16} />
            </button>
          )}
          <span>{slideIndex + 1} من {totalSlides}</span>
          {onNextSlide && slideIndex < totalSlides - 1 && (
            <button
              onClick={onNextSlide}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
              title="الشريحة التالية"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
