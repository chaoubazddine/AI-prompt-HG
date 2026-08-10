import React, { useState } from 'react';
import { TeacherVision } from '../../types/smartAssistant';
import { Lightbulb, Sparkles, Wand2, RefreshCw } from 'lucide-react';

interface TeacherVisionStepProps {
  visionData: TeacherVision;
  onChange: (data: TeacherVision) => void;
  onNext: () => void;
  onBack: () => void;
}

const DIVERSE_EXAMPLES = [
  {
    title: 'تصور نهج ديداكتيكي بالوثائق',
    text: 'أريد أن أبدأ الحصة بوضعية مشكلة مستمدة من واقع المتعلمين، ثم أستعمل وثيقتين (نص وخريطة) لتحليل الظاهرة، وبعد ذلك أترك المتعلمين يستنتجون العناصر الأساسية في مجموعات صغيرة، وأنهي الحصة بتقويم فردي سريع.'
  },
  {
    title: 'تصور النهج الجغرافي الثلاثي',
    text: 'أتصور الحصة وفق خطوات النهج الجغرافي الثلاث (الوصف، التفسير، والتعميم): البدء بخريطة للوصف الفضائي، ثم جدول إحصائي للتفسير الاستكشافي، وتركيب الخلاصة في خطاطة ذهنية جامعة.'
  },
  {
    title: 'تصور النقد والتحليل التاريخي',
    text: 'أريد تطبيق النهج التاريخي من خلال معالجة وثيقتين تاريخيتين متكاملتين، وتحديد السياق التاريخي، ثم صياغة الفرضيات مع المتعلمين وتمحيصها عبر أسئلة ديداكتيكية موجهة.'
  },
  {
    title: 'تصور مجموعات العمل والحل الاستكشافي',
    text: 'أفضل الاعتماد على التعلم التفاعلي والحل الجماعي للمشكلات: وضعية استكشافية محفزة في التمهيد، تقسيم الفصل إلى 3 مجموعات عمل لتدارس الدعامات، ومناقشة النتائج على السبورة.'
  },
  {
    title: 'تصور القيم والمواطنة النشيطة',
    text: 'أستهدف تفعيل نهج مادة التربية على المواطنة: البدء بنص حقوقي أو حالة واقعية، مناقشة الموقف والسلوك المواطن، وإنجاز بطاقة توعوية أو تطبيق عملي ينمي الحس النقدي لدى المتعلم.'
  },
  {
    title: 'تصور المرونة والدعم الفوري',
    text: 'أريد بناء الحصة بأسلوب ديداكتيكي مرن يتضمن مراجعة تشخيصية سريعة، استثمار الدعامات الرقمية والمبيانات المصورة، وختم الدرس بتمارين تقويم تكويني ودعم فوري للصعوبات.'
  }
];

export const TeacherVisionStep: React.FC<TeacherVisionStepProps> = ({
  visionData,
  onChange,
  onNext,
  onBack,
}) => {
  const [exampleIndex, setExampleIndex] = useState(0);

  const handleCycleExample = () => {
    const nextIdx = (exampleIndex + 1) % DIVERSE_EXAMPLES.length;
    setExampleIndex(nextIdx);
    onChange({ visionText: DIVERSE_EXAMPLES[nextIdx].text });
  };

  const handleSelectIdeaTag = (tagText: string) => {
    const current = visionData.visionText ? `${visionData.visionText.trim()} ` : '';
    onChange({ visionText: `${current}${tagText}` });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3">
        <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 shadow-sm">
          <Lightbulb size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950">الخطوة 2: التصور البيداغوجي للأستاذ</h3>
          <p className="text-xs text-amber-800">
            «الذكاء الاصطناعي يقترح، والأستاذ يقرر.» عبر عن رؤيتك الخاصة لطريقة سير الدرس ليقوم المساعد بصياغتها بيداغوجياً.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-black text-slate-900">
            كيف تتصور هذه الحصة؟
          </label>

          <button
            type="button"
            onClick={handleCycleExample}
            className="text-xs text-indigo-700 font-bold hover:bg-indigo-100 inline-flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all shadow-2xs"
          >
            <RefreshCw size={13} className="text-indigo-600 animate-spin-once" />
            <span>استعراض مثال تجريبي جديد ({exampleIndex + 1}/{DIVERSE_EXAMPLES.length})</span>
          </button>
        </div>

        {/* Current Example Badge Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-900 bg-indigo-50/90 px-3 py-1.5 rounded-xl border border-indigo-100">
          <Wand2 size={13} className="text-indigo-600" />
          <span>النموذج المقترح: </span>
          <span className="text-indigo-700 font-black">{DIVERSE_EXAMPLES[exampleIndex].title}</span>
        </div>

        <textarea
          rows={6}
          value={visionData.visionText}
          onChange={(e) => onChange({ visionText: e.target.value })}
          placeholder="اكتب تصورك للحصة بطريقتك الخاصة...&#10;مثلاً: أريد أن أبدأ الحصة بوضعية مشكلة، ثم أستعمل وثيقتين لتحليل الظاهرة، وبعد ذلك أترك المتعلمين يستنتجون العناصر الأساسية في مجموعات، وأنهي الحصة بتقويم فردي..."
          className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-4 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white leading-relaxed resize-y shadow-inner"
        />

        {/* Quick Idea Tags */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500">أفكار سريعة لإضافتها لتصورك (اضغط للإضافة):</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'الاعتماد على وضعية مشكلة واقعية',
              'تطبيق النهج التاريخي (التعريف، التفسير، التركيب)',
              'تطبيق النهج الجغرافي (الوصف، التفسير، التعميم)',
              'الاشتغال في مجموعات صغرى',
              'استثمار خريطة ومبيان إحصائي',
              'إنجاز تقويم تكويني مرحلي',
              'تطوير حس المواطنة والسلوك الإيجابي'
            ].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSelectIdeaTag(tag)}
                className="text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-900 px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100/70 p-3 rounded-2xl">
          <Sparkles size={16} className="text-amber-500 shrink-0" />
          <span>
            لا تحتاج إلى صياغة Prompt معقد. اكتب فكرتك كما تفكر فيها بسيطة، وسيساعدك المساعد الذكي على تحويلها إلى تدبير ديداكتيكي دقيق.
          </span>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
        >
          → العودة للدرس
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-indigo-100"
        >
          المتابعة إلى الاختيارات البيداغوجية ←
        </button>
      </div>
    </div>
  );
};
