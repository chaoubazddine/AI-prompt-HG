import React from 'react';
import { PedagogicalChoices } from '../../types/smartAssistant';
import { Sliders, Check, HelpCircle } from 'lucide-react';

interface PedagogicalPreferencesStepProps {
  choices: PedagogicalChoices;
  onChange: (choices: PedagogicalChoices) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PedagogicalPreferencesStep: React.FC<PedagogicalPreferencesStepProps> = ({
  choices,
  onChange,
  onNext,
  onBack,
}) => {
  const sessionTypeOptions = ['تقديم درس', 'بناء التعلمات', 'تحليل وثائق', 'تقويم', 'دعم'];
  const durationOptions = ['30 دقيقة', '45 دقيقة', '55 دقيقة', 'ساعة'];
  const densityOptions = ['مختصرة', 'قياسية', 'مفصلة'];

  const startOptions = [
    'وضعية مشكلة',
    'صورة معبرة',
    'وثيقة مؤطرة',
    'سؤال محفز',
    'مراجعة المكتسبات السابقة',
    'اترك للمساعد اقتراح الأنسب'
  ];

  const activityOptions = [
    'تحليل الوثائق',
    'العمل الفردي',
    'العمل الثنائي',
    'العمل في مجموعات',
    'المناقشة الحوارية',
    'الاستنتاج الصياغي',
    'البحث والتقصي',
    'حل مشكلة',
    'نشاط كتابي وتدوين'
  ];

  const assessmentOptions = [
    'تقويم تشخيصي',
    'تقويم تكويني مرحلي',
    'تقويم ختامي',
    'أسئلة مباشرة',
    'نشاط تطبيقي',
    'اترك للمساعد اقتراح الأنسب'
  ];

  const toggleActivity = (activity: string) => {
    const current = choices.preferredActivities || [];
    if (current.includes(activity)) {
      onChange({
        ...choices,
        preferredActivities: current.filter(a => a !== activity)
      });
    } else {
      onChange({
        ...choices,
        preferredActivities: [...current, activity]
      });
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">الخطوة 3: الاختيارات البيداغوجية الموجهة (اختيارية)</h3>
            <p className="text-xs text-emerald-800">حدد نوع الحصة والمدة وتفاصيل التدبير البيداغوجي، أو جاوز مباشرة للاعتماد على الاستنتاج الذكي.</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-2.5 py-1 rounded-full shrink-0">
          إعدادات اختيارية
        </span>
      </div>

      {/* Quick Optional Controls: Session Type & Duration & Density */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Session Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">نوع الحصة / النشاط:</label>
            <div className="flex flex-wrap gap-1.5">
              {sessionTypeOptions.map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onChange({ ...choices, sessionType: st })}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    choices.sessionType === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">المدة الزمنية:</label>
            <div className="flex flex-wrap gap-1.5">
              {durationOptions.map(dur => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => onChange({ ...choices, sessionDuration: dur })}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    choices.sessionDuration === dur
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Density */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">نمط وعمق الجذاذة:</label>
            <div className="flex flex-wrap gap-1.5">
              {densityOptions.map(den => (
                <button
                  key={den}
                  type="button"
                  onClick={() => onChange({ ...choices, planDensity: den })}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    choices.planDensity === den
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {den}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Component Toggles */}
        <div className="pt-2 border-t border-slate-200/60">
          <label className="block text-xs font-bold text-slate-800 mb-2">عناصر ترغب بإدراجها في الجذاذة:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => onChange({ ...choices, enableProblemSituation: !choices.enableProblemSituation })}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                choices.enableProblemSituation !== false
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <Check size={14} className={choices.enableProblemSituation !== false ? 'text-indigo-600' : 'opacity-0'} />
              <span>وضعية مشكلة</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...choices, enableDocumentsQuestions: !choices.enableDocumentsQuestions })}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                choices.enableDocumentsQuestions !== false
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <Check size={14} className={choices.enableDocumentsQuestions !== false ? 'text-indigo-600' : 'opacity-0'} />
              <span>وثائق وأسئلة</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...choices, enableFormativeAssessment: !choices.enableFormativeAssessment })}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                choices.enableFormativeAssessment !== false
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <Check size={14} className={choices.enableFormativeAssessment !== false ? 'text-indigo-600' : 'opacity-0'} />
              <span>تقويم تكويني</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...choices, enableRemediationToggle: !choices.enableRemediationToggle })}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                choices.enableRemediationToggle !== false
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <Check size={14} className={choices.enableRemediationToggle !== false ? 'text-indigo-600' : 'opacity-0'} />
              <span>دعم ومعالجة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Q1: How to start */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">كيف تريد أن تبدأ الحصة؟</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {startOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ ...choices, startApproach: opt })}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-between ${
                choices.startApproach === opt
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{opt}</span>
              {choices.startApproach === opt && <Check size={14} className="shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Q2: Preferred Activities (Multi-select) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">ما الأنشطة التي تفضلها؟ (يمكنك اختيار أكثر من نشاط)</label>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            اختيار متعدد
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activityOptions.map(act => {
            const isSelected = (choices.preferredActivities || []).includes(act);
            return (
              <button
                key={act}
                type="button"
                onClick={() => toggleActivity(act)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{act}</span>
                {isSelected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Q3: Assessment Type */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">ما نوع التقويم الذي تفضله؟</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {assessmentOptions.map(ass => (
            <button
              key={ass}
              type="button"
              onClick={() => onChange({ ...choices, assessmentType: ass })}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-between ${
                choices.assessmentType === ass
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{ass}</span>
              {choices.assessmentType === ass && <Check size={14} className="shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Q4 & Q5: Remediation & Custom Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">هل تريد إدراج الدعم والمعالجة؟</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...choices, includeRemediation: true })}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                choices.includeRemediation
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              نعم، أدرج الدعم
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...choices, includeRemediation: false })}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                !choices.includeRemediation
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              لا، غير مطلوب
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">وسائل أو وثائق خاصة تريد اعتمادها</label>
          <input
            type="text"
            placeholder="مثال: خريطة جدارية رقمية، شريط وثائقي قصيرة..."
            value={choices.customResources || ''}
            onChange={(e) => onChange({ ...choices, customResources: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Navigation actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
        >
          → العودة لتصور الأستاذ
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-indigo-100"
        >
          مراجعة المعطيات قبل التوليد ←
        </button>
      </div>
    </div>
  );
};
