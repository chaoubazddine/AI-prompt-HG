import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Printer, 
  Check, 
  Edit3, 
  BookOpen, 
  Layers, 
  RotateCcw, 
  Share2, 
  Info,
  HelpCircle,
  Book,
  Calendar
} from 'lucide-react';
import { LessonSummaryData } from '../../types/summary';
import { generateLessonSummary } from '../../services/summaryService';
import { downloadSummaryWord } from '../../utils/summaryWordExport';
import { LESSONS_DATA } from '../../constants';

interface LessonSummaryGeneratorProps {
  initialTitle?: string;
  initialSubject?: string;
  initialLevel?: string;
}

export const LessonSummaryGenerator: React.FC<LessonSummaryGeneratorProps> = ({
  initialTitle = '',
  initialSubject = 'التاريخ',
  initialLevel = 'الأولى بكالوريا علوم'
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [level, setLevel] = useState(initialLevel);
  const [term, setTerm] = useState<'الدورة الأولى' | 'الدورة الثانية'>('الدورة الأولى');
  const [lessonTitle, setLessonTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<LessonSummaryData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Helper to map UI level name to LESSONS_DATA key
  const normalizeLevelKey = (rawLevel: string): string => {
    if (rawLevel.includes('الأولى') && rawLevel.includes('إعدادي')) return 'الأولى إعدادي';
    if (rawLevel.includes('الثانية') && rawLevel.includes('إعدادي')) return 'الثانية إعدادي';
    if (rawLevel.includes('الثالثة') && rawLevel.includes('إعدادي')) return 'الثالثة إعدادي';
    if (rawLevel.includes('الجذع المشترك')) return 'الجذع المشترك';
    if (rawLevel.includes('الأولى') && (rawLevel.includes('باك') || rawLevel.includes('بكالوريا'))) return 'الأولى باك';
    if (rawLevel.includes('الثانية') && (rawLevel.includes('باك') || rawLevel.includes('بكالوريا'))) return 'الثانية باك';
    return 'الأولى باك';
  };

  const levelKey = normalizeLevelKey(level);
  const currentLessons = LESSONS_DATA[levelKey]?.[subject]?.[term] || [];

  // Always scroll to top when mounting LessonSummaryGenerator component
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // When level, subject, or term changes, auto-select first lesson if none selected or not matching
  useEffect(() => {
    if (currentLessons.length > 0) {
      if (!lessonTitle || !currentLessons.includes(lessonTitle)) {
        setLessonTitle(currentLessons[0]);
      }
    }
  }, [subject, level, term]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lessonTitle.trim()) {
      setError('يرجى اختيار أو كتابة عنوان الدرس أولاً.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateLessonSummary(lessonTitle, subject, level, term);
      setSummaryData(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء توليد ملخص الدرس. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!summaryData) return;

    let text = `مادة ${summaryData.subject} - ملخص درس: ${summaryData.title}\n`;
    text += `المستوى: ${summaryData.level}\n\n`;
    text += `■ مقدمة والتمهيد الإشكالي:\n${summaryData.introduction.context}\n`;
    text += `الأسئلة الإشكالية:\n` + summaryData.introduction.questions.map(q => `• ${q}`).join('\n') + `\n\n`;

    summaryData.sections.forEach(sec => {
      text += `■ ${sec.mainTitle}\n`;
      sec.subsections.forEach(sub => {
        text += `  ● ${sub.subTitle}\n`;
        sub.content.forEach(p => {
          text += `    - ${p}\n`;
        });
      });
      text += `\n`;
    });

    text += `■ خاتمة وتركيب عام:\n${summaryData.conclusion}\n\n`;

    // Collect terms
    const allTerms: { term: string; definition: string }[] = [];
    if (summaryData.keyTerms && summaryData.keyTerms.length > 0) {
      allTerms.push(...summaryData.keyTerms);
    }
    summaryData.sections.forEach(sec => {
      sec.subsections.forEach(sub => {
        if (sub.keyTerms) allTerms.push(...sub.keyTerms);
      });
    });

    if (allTerms.length > 0) {
      text += `■ المفاهيم والمصطلحات الأساسية:\n`;
      allTerms.forEach(k => {
        text += `  ▫ ${k.term}: ${k.definition}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-right dir-rtl p-2 sm:p-4" dir="rtl">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/30 text-indigo-300 rounded-2xl shrink-0 border border-indigo-400/30">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  قسم تجريبي جديد
                </span>
                <span className="text-xs text-indigo-200">وفق التوجيهات التربوية الرسمية</span>
              </div>
              <h2 className="text-base sm:text-xl font-black mt-1">مولّد ملخصات الدروس (مادة الاجتماعيات)</h2>
            </div>
          </div>
          
          <div className="text-xs bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
            <Info size={14} className="text-indigo-400 shrink-0" />
            <span>مطابق لنمط الجذاذات بالهيكلة المعتمدة</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          قم بإنشاء ملخصات مجهزة للتدوين أو الطباعة تتضمن: مقدمة إشكالية، محاور رئيسية (أولاً، ثانياً، ثالثاً...)، فقرات فرعية بنقاط مكثفة ودقيقة، مفاهيم محورية وخاتمة استخلاصية.
        </p>
      </div>

      {/* Lesson Summary Input Form */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Subject Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Book size={14} className="text-indigo-600" />
                <span>المكون / المادة:</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="التاريخ">التاريخ</option>
                <option value="الجغرافيا">الجغرافيا</option>
                <option value="التربية على المواطنة">التربية على المواطنة</option>
              </select>
            </div>

            {/* Level Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-600" />
                <span>المستوى الدراسي:</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <optgroup label="الثانوي الإعدادي">
                  <option value="الأولى ثانوي إعدادي">الأولى ثانوي إعدادي</option>
                  <option value="الثانية ثانوي إعدادي">الثانية ثانوي إعدادي</option>
                  <option value="الثالثة ثانوي إعدادي">الثالثة ثانوي إعدادي</option>
                </optgroup>
                <optgroup label="الثانوي التأهيلي">
                  <option value="الجذع المشترك أدبي / علمي">الجذع المشترك</option>
                  <option value="الأولى بكالوريا علوم">الأولى بكالوريا علوم</option>
                  <option value="الأولى بكالوريا آداب">الأولى بكالوريا آداب</option>
                  <option value="الثانية بكالوريا علوم">الثانية بكالوريا علوم</option>
                  <option value="الثانية بكالوريا آداب وعلوم إنسانية">الثانية بكالوريا آداب</option>
                </optgroup>
              </select>
            </div>

            {/* Term Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                <span>الدورة الدراسية:</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTerm('الدورة الأولى')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${term === 'الدورة الأولى' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  الدورة الأولى
                </button>
                <button
                  type="button"
                  onClick={() => setTerm('الدورة الثانية')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${term === 'الدورة الثانية' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  الدورة الثانية
                </button>
              </div>
            </div>

          </div>

          {/* Lesson Title Select & Custom Input */}
          <div className="bg-indigo-50/40 p-3.5 sm:p-4 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <BookOpen size={16} className="text-indigo-600" />
                <span>اختيار درس من المقرر الرسمي ({subject} - {term}):</span>
              </label>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-md">
                {currentLessons.length} دروس متاحة
              </span>
            </div>

            {currentLessons.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none shadow-2xs"
                >
                  {currentLessons.map((t, idx) => (
                    <option key={idx} value={t}>
                      الدرس {idx + 1}: {t}
                    </option>
                  ))}
                </select>

                {/* Lesson Pills for Direct Click Selection */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentLessons.map((t, idx) => {
                    const isSelected = lessonTitle === t;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLessonTitle(t)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white hover:bg-indigo-100/70 text-slate-700 border-indigo-200/80'
                        }`}
                      >
                        <span className="opacity-60 text-[10px]">{idx + 1}.</span>
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-800 font-medium">لم يتم العثور على دروس محددة لهذا الخيار. يمكنك كتابة اسم الدرس في الحقل أدناه.</p>
            )}

            {/* Custom Edit Input if needed */}
            <div className="pt-2 border-t border-indigo-100 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">عنوان الدرس المعتمد للتوليد (يمكنك التعديل عليه إذا أردت):</span>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="عنوان الدرس..."
                className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري صياغة الملخص بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>توليد ملخص الدرس الآن</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}
      </div>

      {/* Generated Summary Document Result */}
      {summaryData && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Action Header Bar */}
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Check size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{summaryData.title}</h3>
                <span className="text-[11px] text-slate-400">
                  {summaryData.subject} • {summaryData.level}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isEditing 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'إنهاء التعديل' : 'تعديل النص'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                type="button"
                onClick={() => downloadSummaryWord(summaryData)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Download size={14} />
                <span>تصدير Word</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl transition-all"
                title="طباعة"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>

          {/* Clean Printable Lesson Summary Paper Document */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
            
            {/* Header Title */}
            <div className="text-center border-b border-slate-200 pb-6 space-y-2">
              <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
                مادة {summaryData.subject} • {summaryData.level}
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ملخص درس: {summaryData.title}
              </h1>
            </div>

            {/* Introduction Section */}
            <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                <BookOpen size={18} className="text-indigo-600 shrink-0" />
                <span>مقدمة والتمهيد الإشكالي:</span>
              </div>

              {isEditing ? (
                <textarea
                  value={summaryData.introduction.context}
                  onChange={(e) => setSummaryData({
                    ...summaryData,
                    introduction: { ...summaryData.introduction, context: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs leading-relaxed font-bold text-slate-800"
                  rows={3}
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {summaryData.introduction.context}
                </p>
              )}

              {/* Guiding Questions */}
              <div className="pt-2 space-y-1">
                <span className="text-xs font-bold text-indigo-950 block">الأسئلة الإشكالية الموجهة:</span>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-800 font-bold pr-2">
                  {summaryData.introduction.questions.map((q, qIdx) => (
                    <li key={qIdx} className="text-indigo-900">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Content Sections (أولاً، ثانياً، ثالثاً...) */}
            <div className="space-y-8">
              {summaryData.sections.map((sec, secIdx) => (
                <div key={secIdx} className="space-y-4">
                  
                  {/* Main Section Header */}
                  <div className="bg-indigo-950 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                    <h2 className="text-sm sm:text-base font-black flex items-center gap-2">
                      <Layers size={18} className="text-amber-400 shrink-0" />
                      <span>{sec.mainTitle}</span>
                    </h2>
                    <span className="text-[10px] bg-white/10 text-indigo-200 px-2.5 py-0.5 rounded-full">
                      المقطع {secIdx + 1}
                    </span>
                  </div>

                  {/* Subsections */}
                  <div className="space-y-4 pr-2 sm:pr-4">
                    {sec.subsections.map((sub, subIdx) => (
                      <div key={subIdx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                        <h3 className="text-xs sm:text-sm font-black text-indigo-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                          <span>{sub.subTitle}</span>
                        </h3>

                        {/* Bullet Points */}
                        <ul className="space-y-2 pr-2">
                          {sub.content.map((point, pIdx) => (
                            <li key={pIdx} className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed flex items-start gap-2">
                              <span className="text-indigo-500 font-bold shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Conclusion Section */}
            <div className="bg-emerald-50/80 p-4 sm:p-6 rounded-2xl border border-emerald-200/80 space-y-2">
              <h3 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-2">
                <Check size={18} className="text-emerald-600 shrink-0" />
                <span>خاتمة وتركيب عام:</span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                {summaryData.conclusion}
              </p>
            </div>

            {/* Key Terms & Definitions Section (Placed AFTER Conclusion) */}
            {(() => {
              const terms: { term: string; definition: string }[] = [];
              if (summaryData.keyTerms && summaryData.keyTerms.length > 0) {
                terms.push(...summaryData.keyTerms);
              }
              summaryData.sections.forEach(sec => {
                sec.subsections.forEach(sub => {
                  if (sub.keyTerms && sub.keyTerms.length > 0) terms.push(...sub.keyTerms);
                });
              });

              if (terms.length === 0) return null;

              return (
                <div className="bg-amber-50/80 p-4 sm:p-6 rounded-2xl border border-amber-200/80 space-y-3">
                  <h3 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2 border-b border-amber-200/80 pb-2">
                    <HelpCircle size={18} className="text-amber-700 shrink-0" />
                    <span>المفاهيم والمصطلحات الأساسية للدرس:</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {terms.map((t, tIdx) => (
                      <div key={tIdx} className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
                        <span className="font-black text-amber-950 text-xs sm:text-sm block">{t.term}:</span>
                        <p className="text-slate-700 text-xs leading-relaxed font-medium">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      )}

    </div>
  );
};
