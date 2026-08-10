import React from 'react';
import { LessonSetupData, TeacherVision, PedagogicalChoices } from '../../types/smartAssistant';
import { CheckCircle2, Edit3, Sparkles, BookOpen, Clock, Lightbulb, Sliders } from 'lucide-react';

interface ReviewStepProps {
  setupData: LessonSetupData;
  visionData: TeacherVision;
  choices: PedagogicalChoices;
  onEditStep: (stepNumber: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  setupData,
  visionData,
  choices,
  onEditStep,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-indigo-900 text-white p-5 rounded-3xl shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl text-amber-400 shrink-0 border border-white/20">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-base font-black">الخطوة 4: مراجعة المعطيات قبل التوليد</h3>
            <p className="text-xs text-indigo-200">تأكد من دقة الاختيارات وتصورك البيداغوجي قبل البدء في بناء مسودة الجذاذة.</p>
          </div>
        </div>
      </div>

      {/* Grid of summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lesson Setup Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 relative group">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
              <BookOpen size={16} />
              معطيات الدرس والمنهاج
            </span>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
            >
              <Edit3 size={13} />
              تعديل
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="text-slate-500">المادة: <strong className="text-slate-900">{setupData.subject}</strong></p>
            <p className="text-slate-500">السلك والمستوى: <strong className="text-slate-900">{setupData.level} ({setupData.cycle === 'secondary' ? 'تأهيلي' : 'إعدادي'})</strong></p>
            <p className="text-slate-500">المكون: <strong className="text-indigo-700 font-black">{setupData.component}</strong></p>
            <p className="text-slate-500">عنوان الدرس: <strong className="text-slate-900 font-black text-sm block mt-0.5">{setupData.lessonTitle}</strong></p>
            <p className="text-slate-500">الغلاف الزمني: <strong className="text-slate-900">{setupData.duration}</strong></p>
            <p className="text-slate-500">الكتاب المعتمد: <strong className="text-slate-900">{setupData.textbook || 'المقرر المعتمد'}</strong></p>
          </div>
        </div>

        {/* Teacher Vision Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 relative group">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
              <Lightbulb size={16} />
              التصور البيداغوجي للأستاذ
            </span>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-[11px] font-bold text-slate-400 hover:text-amber-600 flex items-center gap-1"
            >
              <Edit3 size={13} />
              تعديل
            </button>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-amber-50/50 p-3 rounded-xl border border-amber-100">
            {visionData.visionText || 'لم يتم إدخال تصور خاص (سيتم اعتماد التصور الديداكتيكي النموذجي).'}
          </p>
        </div>

        {/* Pedagogical Choices Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <Sliders size={16} />
              الاختيارات البيداغوجية
            </span>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1"
            >
              <Edit3 size={13} />
              تعديل
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">طريقة البداية:</span>
              <span className="font-bold text-slate-800">{choices.startApproach}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">الأنشطة المفضلة:</span>
              <span className="font-bold text-slate-800">
                {choices.preferredActivities?.length > 0 ? choices.preferredActivities.join('، ') : 'اقتراح الذكاء الاصطناعي'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">نوع التقويم:</span>
              <span className="font-bold text-slate-800">{choices.assessmentType}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">إدراج الدعم:</span>
              <span className="font-bold text-slate-800">{choices.includeRemediation ? 'نعم (مدرج)' : 'غير مطلوب'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-5 py-3 rounded-2xl bg-white"
        >
          تعديل المعطيات
        </button>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="flex-1 bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري هندسة التصور الديداكتيكي بالذكاء الاصطناعي...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              توليد التصور الديداكتيكي المقترح
            </>
          )}
        </button>
      </div>
    </div>
  );
};
