import React, { useState } from 'react';
import { LessonSetupData } from '../../types/smartAssistant';
import { CYCLE_LEVELS, LESSONS_DATA, TEXTBOOKS } from '../../constants';
import { Search, BookOpen, Sparkles, Filter, Layers } from 'lucide-react';

interface LessonSetupStepProps {
  setupData: LessonSetupData;
  onChange: (data: LessonSetupData) => void;
  onNext: () => void;
}

export const LessonSetupStep: React.FC<LessonSetupStepProps> = ({ setupData, onChange, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState<'all' | 'الدورة الأولى' | 'الدورة الثانية'>('all');

  const currentCycleKey = setupData.cycle === 'secondary' ? 'secondary' : 'prep';
  const currentLevels = CYCLE_LEVELS[currentCycleKey] || [];

  // Get lessons categorized by Term for current level & component
  const term1Lessons = LESSONS_DATA[setupData.level]?.[setupData.component]?.['الدورة الأولى'] || [];
  const term2Lessons = LESSONS_DATA[setupData.level]?.[setupData.component]?.['الدورة الثانية'] || [];

  const handleCycleChange = (cycle: 'middle' | 'secondary') => {
    const cycleKey = cycle === 'secondary' ? 'secondary' : 'prep';
    const newLevels = CYCLE_LEVELS[cycleKey] || [];
    const newLevel = newLevels[0] || 'الأولى إعدادي';
    
    const t1 = LESSONS_DATA[newLevel]?.[setupData.component]?.['الدورة الأولى'] || [];
    const defaultLesson = t1[0] || `درس نموذجي في ${setupData.component}`;

    onChange({
      ...setupData,
      cycle,
      level: newLevel,
      lessonTitle: defaultLesson,
      textbook: (TEXTBOOKS[newLevel] || [])[0] || 'المقرر الدراسي المعتمد'
    });
  };

  const handleLevelChange = (level: string) => {
    const t1 = LESSONS_DATA[level]?.[setupData.component]?.['الدورة الأولى'] || [];
    const defaultLesson = t1[0] || `درس نموذجي في ${setupData.component}`;
    onChange({
      ...setupData,
      level,
      lessonTitle: defaultLesson,
      textbook: (TEXTBOOKS[level] || [])[0] || 'المقرر الدراسي المعتمد'
    });
  };

  const handleComponentChange = (component: string) => {
    const t1 = LESSONS_DATA[setupData.level]?.[component]?.['الدورة الأولى'] || [];
    const defaultLesson = t1[0] || `درس نموذجي في ${component}`;
    onChange({
      ...setupData,
      component,
      lessonTitle: defaultLesson
    });
  };

  // Filter lessons based on search and term filter
  const filterList = (lessons: string[]) => {
    if (!searchTerm.trim()) return lessons;
    return lessons.filter(l => l.includes(searchTerm.trim()));
  };

  const filteredTerm1 = filterList(term1Lessons);
  const filteredTerm2 = filterList(term2Lessons);

  const durationOptions = [
    '45 دقيقة',
    '50 دقيقة',
    '55 دقيقة',
    '60 دقيقة (ساعة واحدة)',
    '120 دقيقة (ساعتان)'
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-950">الخطوة 1: تحديد المعطيات الرسمية والدرس</h3>
          <p className="text-xs text-indigo-700">اختر المادة، السلك، المستوى، المكون، والدرس للربط مع مكتبة المعرفة المنهاجية.</p>
        </div>
      </div>

      {/* Subject & Cycle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">المادة الدراسية</label>
          <div className="relative">
            <input
              type="text"
              value={setupData.subject}
              onChange={(e) => onChange({ ...setupData, subject: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <span className="absolute left-3 top-3.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
              رسمي
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">السلك الدراسي</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCycleChange('middle')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                setupData.cycle === 'middle'
                  ? 'bg-[#4F46E5] border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              التعليم الإعدادي
            </button>
            <button
              type="button"
              onClick={() => handleCycleChange('secondary')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                setupData.cycle === 'secondary'
                  ? 'bg-[#4F46E5] border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              الثانوي التأهيلي
            </button>
          </div>
        </div>
      </div>

      {/* Level & Component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">المستوى الدراسي</label>
          <select
            value={setupData.level}
            onChange={(e) => handleLevelChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
          >
            {currentLevels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">المكون / المادة الفرعية</label>
          <div className="grid grid-cols-3 gap-2">
            {['التاريخ', 'الجغرافيا', 'التربية على المواطنة'].map(comp => (
              <button
                key={comp}
                type="button"
                onClick={() => handleComponentChange(comp)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all truncate ${
                  setupData.component === comp
                    ? 'bg-[#4F46E5] border-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Selection Section: Hierarchical Dropdown & Term Filter */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Layers size={16} className="text-indigo-600" />
            <span>اختر الدرس حسب الدورة والمكون ({setupData.component} - {setupData.level}):</span>
          </label>

          {/* Term Filter Buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setTermFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                termFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              جميع الدروس
            </button>
            <button
              type="button"
              onClick={() => setTermFilter('الدورة الأولى')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                termFilter === 'الدورة الأولى' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الدورة الأولى
            </button>
            <button
              type="button"
              onClick={() => setTermFilter('الدورة الثانية')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                termFilter === 'الدورة الثانية' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              الدورة الثانية
            </button>
          </div>
        </div>

        {/* Primary Hierarchical Select Dropdown */}
        <div>
          <select
            value={setupData.lessonTitle}
            onChange={(e) => onChange({ ...setupData, lessonTitle: e.target.value })}
            className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-indigo-950 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
          >
            {(termFilter === 'all' || termFilter === 'الدورة الأولى') && term1Lessons.length > 0 && (
              <optgroup label="📂 الدورة الأولى (السداسي الأول)">
                {term1Lessons.map(lesson => (
                  <option key={lesson} value={lesson}>
                    درس: {lesson}
                  </option>
                ))}
              </optgroup>
            )}

            {(termFilter === 'all' || termFilter === 'الدورة الثانية') && term2Lessons.length > 0 && (
              <optgroup label="📂 الدورة الثانية (السداسي الثاني)">
                {term2Lessons.map(lesson => (
                  <option key={lesson} value={lesson}>
                    درس: {lesson}
                  </option>
                ))}
              </optgroup>
            )}

            {term1Lessons.length === 0 && term2Lessons.length === 0 && (
              <option value={`درس نموذجي في ${setupData.component}`}>
                درس نموذجي في {setupData.component}
              </option>
            )}
          </select>
        </div>

        {/* Search Bar for Direct Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="أو ابحث بالاسم المباشر للدرس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
          />
          <Search size={16} className="absolute right-3 top-3 text-slate-400" />
        </div>

        {/* Visual Categorized Lesson Cards */}
        <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
          {(termFilter === 'all' || termFilter === 'الدورة الأولى') && filteredTerm1.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-md inline-block">
                الدورة الأولى ({filteredTerm1.length} دروس)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredTerm1.map(lesson => (
                  <button
                    key={lesson}
                    type="button"
                    onClick={() => onChange({ ...setupData, lessonTitle: lesson })}
                    className={`text-right p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      setupData.lessonTitle === lesson
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {lesson}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(termFilter === 'all' || termFilter === 'الدورة الثانية') && filteredTerm2.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-md inline-block">
                الدورة الثانية ({filteredTerm2.length} دروس)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredTerm2.map(lesson => (
                  <button
                    key={lesson}
                    type="button"
                    onClick={() => onChange({ ...setupData, lessonTitle: lesson })}
                    className={`text-right p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      setupData.lessonTitle === lesson
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {lesson}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredTerm1.length === 0 && filteredTerm2.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              لم نجد درساً مطابخاً لـ "{searchTerm}". يمكنك اعتماد العنوان المكتوب:
              <button
                type="button"
                onClick={() => onChange({ ...setupData, lessonTitle: searchTerm })}
                className="block mx-auto mt-2 text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles size={12} />
                اعتماد العنوان المخصص: "{searchTerm}"
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Duration and Textbook */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">مدة الحصة / الدرس</label>
          <select
            value={setupData.duration}
            onChange={(e) => onChange({ ...setupData, duration: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
          >
            {durationOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">الكتاب أو المقرر المدرسي المعتمد</label>
          <input
            type="text"
            placeholder="مثال: التجديد في الاجتماعيات / المنار / النجاح..."
            value={setupData.textbook}
            onChange={(e) => onChange({ ...setupData, textbook: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Selected Lesson Summary Pill */}
      <div className="bg-indigo-950 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">الدرس المختار حالياً:</span>
          <span className="font-black text-indigo-100">{setupData.lessonTitle}</span>
        </div>
        <span className="text-[10px] bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-lg">
          {setupData.component} - {setupData.level}
        </span>
      </div>

      {/* Action button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!setupData.lessonTitle}
          className="bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-indigo-100"
        >
          المتابعة إلى تصور الأستاذ ←
        </button>
      </div>
    </div>
  );
};
