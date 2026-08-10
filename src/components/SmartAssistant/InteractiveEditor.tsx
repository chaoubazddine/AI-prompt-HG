import React, { useState } from 'react';
import { 
  StructuredLessonPlan, 
  PhaseItem 
} from '../../types/smartAssistant';
import { SectionRefinementModal } from './SectionRefinementModal';
import { AIAssistantPanel } from './AIAssistantPanel';
import { downloadWord } from '../../utils/wordExport';
import { executeAssistantCommand } from '../../services/smartAssistantService';
import { JadhaData } from '../TableJadha';
import { 
  Edit3, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  CheckCircle, 
  Printer, 
  FileDown, 
  Copy, 
  Save, 
  BookOpen, 
  Clock, 
  Check, 
  Layers, 
  Info, 
  Bot,
  ExternalLink
} from 'lucide-react';

interface InteractiveEditorProps {
  plan: StructuredLessonPlan;
  onUpdatePlan: (updated: StructuredLessonPlan) => void;
  onApproveAndSave: () => void;
  onSaveDraft: () => void;
  isSaving: boolean;
}

export const InteractiveEditor: React.FC<InteractiveEditorProps> = ({
  plan,
  onUpdatePlan,
  onApproveAndSave,
  onSaveDraft,
  isSaving,
}) => {
  // Modal state for AI Section Refinement
  const [refinementModal, setRefinementModal] = useState<{
    isOpen: boolean;
    sectionKey: string;
    sectionTitle: string;
    currentValue: any;
  }>({
    isOpen: false,
    sectionKey: '',
    sectionTitle: '',
    currentValue: ''
  });

  // Assistant panel toggle state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);
  const [quickActionStatus, setQuickActionStatus] = useState<string | null>(null);

  const smartButtons = [
    { label: 'تحسين الجذاذة', prompt: 'قم بتحسين الجذاذة ككل والارتقاء بصياغة الأنشطة والأهداف ديداكتيكياً' },
    { label: 'تبسيط المحتوى', prompt: 'قم بتبسيط الصياغة والأنشطة والأسئلة لتناسب قدرات المتعلمين المتوسطة' },
    { label: 'تعميق المحتوى', prompt: 'قم بتعميق المحتوى والأسئلة الموجهة وإضافة مفاهيم دقيقة وتحليل أعمق للوثائق' },
    { label: 'تحسين الأنشطة', prompt: 'قم بتحسين وتحديث أنشطة الأستاذ والمتعلم لتصبح أكثر تفاعلية واستجراراً للتعلمات' },
    { label: 'تحسين الأسئلة', prompt: 'قم بتطوير الأسئلة الموجهة لتصبح أسئلة استكشافية حوارية دقيقة ومشجعة على التفكير النقدي' },
    { label: 'إضافة وضعية مشكلة', prompt: 'أضف وضعية مشكلة استهلالية محفزة ومستمدة من واقع المتعلم مع تساؤلات إشكالية' },
    { label: 'إضافة تقويم تكويني', prompt: 'أضف أسئلة تقويم تكويني مرحلي دقيقة لكل نشاط ومقطع تعلمي' },
    { label: 'إضافة دعم للمتعثرين', prompt: 'أضف خطة دعم ومعالجة بيداغوجية مخصصة للتعثرات المتوقعة' },
    { label: 'مراجعة الانسجام التربوي', prompt: 'راجع الانسجام التربوي والديداكتيكي بين الأهداف والأنشطة والأسئلة والتقويم' },
    { label: 'التحقق من المعلومات', prompt: 'تحقق من صحة الدقة العلمية والمعطيات والتواريخ والمفاهيم وفق المنهاج المغربي' }
  ];

  const handleRunSmartQuickAction = async (promptText: string, labelText: string) => {
    setIsQuickActionLoading(true);
    setQuickActionStatus(`جاري تطبيق: "${labelText}" بالذكاء الاصطناعي...`);
    try {
      const { updatedPlan, affectedSectionName } = await executeAssistantCommand(plan, promptText);
      onUpdatePlan(updatedPlan);
      setQuickActionStatus(`تم تطبيق "${labelText}" بنجاح على ${affectedSectionName || 'الجذاذة'}`);
      setTimeout(() => setQuickActionStatus(null), 4000);
    } catch (err: any) {
      setQuickActionStatus(`حدث خطأ أثناء تطبيق "${labelText}". يرجى المحاولة مرة أخرى.`);
      setTimeout(() => setQuickActionStatus(null), 4000);
    } finally {
      setIsQuickActionLoading(false);
    }
  };

  const defaultIntroSteps: PhaseItem[] = [
    {
      id: 'intro-1',
      phaseName: 'مراجعة الدرس السابق',
      subPhase: 'ربط المكتسبات',
      resources: 'الذاكرة الدراسية',
      teacherActivity: 'تذكير المتعلمين بالتحولات والمفاهيم الأساسية المكتسبة في الدرس السابق كتمهيد وتوطئة لدرس اليوم.',
      learnerActivity: 'يستحضر المتعلمون المعطيات السابقة ويوظفونها كعامل ممهد وممهد للدرس الجديد.',
      workForm: 'عمل جماعي حواري'
    },
    {
      id: 'intro-2',
      phaseName: 'تقديم عنوان الدرس',
      subPhase: 'تأطير الموضوع',
      resources: 'السبورة',
      teacherActivity: 'أكتب عنوان الدرس بوضوح على السبورة ووضح دلالات المفاهيم والمصطلحات الكبرى للدرس.',
      learnerActivity: 'يدون المتعلمون العنوان في الدفاتر ويستعدون للمناقشة وتحديد المحاور.',
      workForm: 'عمل موجه ومؤطر'
    },
    {
      id: 'intro-3',
      phaseName: 'تقويم تشخيصي',
      subPhase: 'رصد التمثلات',
      resources: 'أسئلة شفهية',
      teacherActivity: 'طرح أسئلة شفهية استكشافية للوقوف على المعارف والتمثلات الأولية حول الموضوع.',
      learnerActivity: 'تقديم إجابات متباينة تحاول ربط المفهوم بالمجال الجغرافي أو التاريخي المدروس.',
      workForm: 'عمل جماعي حواري'
    },
    {
      id: 'intro-4',
      phaseName: 'أهداف التعلم',
      subPhase: 'التعاقد الديداكتيكي',
      resources: 'الكتاب المدرسي',
      teacherActivity: 'اقرأ أهداف التعلم المذكورة في الكتاب ووجه المتعلمين إلى ما سيتم تحقيقه خلال الحصة.',
      learnerActivity: 'قراءة الأهداف وتحديد مسار التعلم مع الأستاذ.',
      workForm: 'عمل موجه ومؤطر'
    },
    {
      id: 'intro-5',
      phaseName: 'التمهيد (صياغة الإشكالية)',
      subPhase: 'صياغة الإشكالية',
      resources: 'مقدمة الكتاب المدرسي',
      teacherActivity: 'حلل نص التمهيد واستخرج التساؤلات الجوهرية المؤطرة للدرس وصياغتها على السبورة.',
      learnerActivity: 'المساهمة في صياغة إشكالية الدرس وتدوين التساؤلات المؤطرة في الدفاتر.',
      workForm: 'عمل جماعي حواري'
    }
  ];

  const currentIntroSteps = (plan.introductionSteps && plan.introductionSteps.length > 0)
    ? plan.introductionSteps
    : defaultIntroSteps;

  const handleUpdateIntroStep = (index: number, updatedStep: PhaseItem) => {
    const newIntro = [...currentIntroSteps];
    newIntro[index] = updatedStep;
    onUpdatePlan({ ...plan, introductionSteps: newIntro });
  };

  const handleAddIntroStep = () => {
    const newStep: PhaseItem = {
      id: `intro-${Date.now()}`,
      phaseName: 'وضعيات التعلم',
      subPhase: 'أهداف التعلم',
      resources: 'السبورة / الدعامات',
      teacherActivity: 'مهام الأستاذ والأسئلة التوجيهية...',
      learnerActivity: 'مهام واستجابات المتعلمين...',
      workForm: 'عمل جماعي حواري'
    };
    onUpdatePlan({ ...plan, introductionSteps: [...currentIntroSteps, newStep] });
  };

  const handleDeleteIntroStep = (index: number) => {
    const newIntro = currentIntroSteps.filter((_, i) => i !== index);
    onUpdatePlan({ ...plan, introductionSteps: newIntro });
  };

  const handleMoveIntroStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentIntroSteps.length) return;
    const newIntro = [...currentIntroSteps];
    const temp = newIntro[index];
    newIntro[index] = newIntro[targetIndex];
    newIntro[targetIndex] = temp;
    onUpdatePlan({ ...plan, introductionSteps: newIntro });
  };

  // Convert StructuredLessonPlan to JadhaData helper for Word & Print
  const getJadhaData = (): JadhaData => ({
    title: plan.title,
    level: plan.level,
    year: plan.year || '2025/2026',
    duration: plan.duration,
    unit: plan.component || plan.unit || 'الاجتماعيات',
    module: plan.unit || '',
    academy: plan.academy,
    directorate: plan.directorate,
    school: plan.school,
    teacherName: plan.teacherName,
    references: plan.references,
    competencies: plan.competencies || [],
    capabilities: plan.capabilities || [],
    objectives: plan.objectives || { cognitive: [], skill: [], affective: [] },
    problematic: plan.problemSituation,
    introductionSteps: (plan.introductionSteps || []).map(s => ({
      phase: s.phaseName,
      subPhase: s.subPhase,
      teacherActivities: s.teacherActivity,
      studentActivities: s.learnerActivity,
      tools: s.resources,
      workForm: s.workForm,
      isHeader: s.isHeader,
      isSynthesis: s.isSynthesis,
      isEvaluation: s.isEvaluation
    })),
    steps: (plan.phases || []).map(p => ({
      phase: p.phaseName,
      subPhase: p.subPhase,
      teacherActivities: p.teacherActivity,
      studentActivities: p.learnerActivity,
      tools: p.resources,
      workForm: p.workForm,
      isHeader: p.isHeader,
      isSynthesis: p.isSynthesis,
      isEvaluation: p.isEvaluation
    })),
    finalEvaluation: plan.finalEvaluation || []
  });

  const handleRefineSection = (sectionKey: string, sectionTitle: string, currentValue: any) => {
    setRefinementModal({
      isOpen: true,
      sectionKey,
      sectionTitle,
      currentValue
    });
  };

  const handleApplyRefinedSection = (key: string, newValue: any) => {
    onUpdatePlan({
      ...plan,
      [key]: newValue
    });
  };

  // Inline Phase editing
  const handleUpdatePhase = (index: number, updatedPhase: PhaseItem) => {
    const newPhases = [...plan.phases];
    newPhases[index] = updatedPhase;
    onUpdatePlan({ ...plan, phases: newPhases });
  };

  const handleAddPhase = () => {
    const newPhase: PhaseItem = {
      id: `phase-${Date.now()}`,
      phaseName: `النشاط ${plan.phases.filter(p => !p.isHeader).length + 1}`,
      subPhase: 'هدف تعلمي مخصص',
      duration: '15 دقيقة',
      teacherActivity: 'توجيه تعليمات الأستاذ والأسئلة...',
      learnerActivity: 'إجابات واستنتاجات المتعلمين...',
      resources: 'الكتاب المدرسي والوثائق',
      workForm: 'عمل فردي / جماعي'
    };
    onUpdatePlan({ ...plan, phases: [...plan.phases, newPhase] });
  };

  const handleDeletePhase = (index: number) => {
    const newPhases = plan.phases.filter((_, i) => i !== index);
    onUpdatePlan({ ...plan, phases: newPhases });
  };

  const handleMovePhase = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= plan.phases.length) return;
    const newPhases = [...plan.phases];
    const temp = newPhases[index];
    newPhases[index] = newPhases[targetIndex];
    newPhases[targetIndex] = temp;
    onUpdatePlan({ ...plan, phases: newPhases });
  };

  const handleCopyText = () => {
    const text = `جذاذة درس: ${plan.title}\nالمكون: ${plan.component} | المستوى: ${plan.level}\nالوضعية المشكلة:\n${plan.problemSituation}\nالأهداف:\n${(plan.objectives?.cognitive || []).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black">{plan.title}</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                مسودة متاحة للتحرير
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {plan.subject} • {plan.component} • {plan.level} ({plan.duration})
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onSaveDraft}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Save size={15} />
            حفظ مسودة
          </button>

          <button
            type="button"
            onClick={() => downloadWord(getJadhaData())}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <FileDown size={15} />
            تصدير Word
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Printer size={15} />
            طباعة / PDF
          </button>

          <button
            type="button"
            onClick={onApproveAndSave}
            disabled={isSaving}
            className="bg-[#4F46E5] hover:bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            اعتماد الجذاذة النهائية
          </button>
        </div>
      </div>

      {/* Smart Review & Editing Actions Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white p-4 rounded-2xl shadow-lg border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs font-black text-white">أزرار المراجعة والتعديل الذكي</span>
              <p className="text-[11px] text-slate-400">انقر على أي زر لإجراء تعديلات فورية مستهدفة بالذكاء الاصطناعي على الجذاذة</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Bot size={15} />
            {isAssistantOpen ? 'إغلاق المحادثة' : 'محادثة المساعد المباشرة'}
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {smartButtons.map(btn => (
            <button
              key={btn.label}
              type="button"
              disabled={isQuickActionLoading}
              onClick={() => handleRunSmartQuickAction(btn.prompt, btn.label)}
              className="bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white disabled:opacity-50 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-indigo-500 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles size={13} className="text-indigo-400" />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Action Status Notification */}
        {quickActionStatus && (
          <div className="p-2.5 bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            {isQuickActionLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Check size={14} className="text-emerald-400 shrink-0" />
            )}
            <span>{quickActionStatus}</span>
          </div>
        )}
      </div>

      {/* Main Lesson Plan Document Paper */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
        
        {/* Header Metadata Grid */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold">المؤسسة / الأكاديمية:</span>
            <span className="font-bold text-slate-800">{plan.school || '................'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold">الأستاذ(ة):</span>
            <span className="font-bold text-slate-800">{plan.teacherName || '................'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold">الغلاف الزمني:</span>
            <span className="font-bold text-indigo-700">{plan.duration}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-semibold">المقرر الدراسي:</span>
            <span className="font-bold text-slate-800">{plan.references}</span>
          </div>
        </div>

        {/* Competencies & Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              الكفايات والأهداف التعلمية
            </h3>
            <button
              type="button"
              onClick={() => handleRefineSection('objectives', 'الأهداف الكفايات', plan.objectives)}
              className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1 transition-colors"
            >
              <Sparkles size={13} />
              تحسين بالذكاء الاصطناعي
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="font-bold text-indigo-900 block">الأهداف المعرفية:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {(plan.objectives?.cognitive || []).map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="font-bold text-indigo-900 block">الأهداف المهارتية:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {(plan.objectives?.skill || []).map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="font-bold text-indigo-900 block">الأهداف الوجدانية/الحسية:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {(plan.objectives?.affective || []).map((o, idx) => (
                  <li key={idx}>{o}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Problem Situation Section */}
        <div className="space-y-3 bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
              <Info size={18} className="text-amber-600" />
              الوضعية المشكلة والتمهيد الإشكالي
            </h3>
            <button
              type="button"
              onClick={() => handleRefineSection('problemSituation', 'الوضعية المشكلة', plan.problemSituation)}
              className="text-xs font-bold text-amber-800 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors"
            >
              <Sparkles size={13} />
              تحسين بالذكاء الاصطناعي
            </button>
          </div>

          <textarea
            rows={3}
            value={plan.problemSituation}
            onChange={(e) => onUpdatePlan({ ...plan, problemSituation: e.target.value })}
            className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        {/* Introduction Activities Table Section (أنشطة التمهيد) */}
        <div className="space-y-4 bg-slate-50/70 p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />
                أنشطة التمهيد والوضعيات الاستهلالية (التدبير الديداكتيكي)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                موزعة حسب المعايير الرسمية (وضعيات التعلم، أهداف التعلم، الدعامات، مهام المدرس والمتعلم، أشكال العمل) وتستطيع تعديل كل خلية مباشرة.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRefineSection('introductionSteps', 'أنشطة التمهيد', currentIntroSteps)}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={14} />
                تحسين بالذكاء الاصطناعي
              </button>

              <button
                type="button"
                onClick={handleAddIntroStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus size={14} />
                إضافة وضعية جديدة
              </button>
            </div>
          </div>

          {/* Desktop / Tablet Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-300 shadow-2xs bg-white">
            <table className="w-full border-collapse text-xs text-right" dir="rtl">
              <thead>
                <tr className="bg-indigo-100/80 text-indigo-950 font-black border-b border-slate-300 text-[11px]">
                  <th className="p-2.5 border-l border-slate-300 w-[14%]">وضعيات التعلم</th>
                  <th className="p-2.5 border-l border-slate-300 w-[14%]">أهداف التعلم</th>
                  <th className="p-2.5 border-l border-slate-300 w-[12%]">الدعامات الديداكتيكية</th>
                  <th className="p-2.5 border-l border-slate-300 w-[24%]">التدبير الديداكتيكي: مهام المدرس</th>
                  <th className="p-2.5 border-l border-slate-300 w-[22%]">التدبير الديداكتيكي: مهام المتعلم</th>
                  <th className="p-2.5 border-l border-slate-300 w-[10%]">أشكال العمل</th>
                  <th className="p-2.5 w-[4%] text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentIntroSteps.map((step, idx) => (
                  <tr key={step.id || idx} className="border-b border-slate-200/90 hover:bg-indigo-50/30 transition-colors">
                    {/* وضعيات التعلم */}
                    <td className="p-2 border-l border-slate-200 align-top">
                      <input
                        type="text"
                        value={step.phaseName}
                        onChange={(e) => handleUpdateIntroStep(idx, { ...step, phaseName: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 outline-none"
                      />
                    </td>

                    {/* أهداف التعلم */}
                    <td className="p-2 border-l border-slate-200 align-top">
                      <input
                        type="text"
                        value={step.subPhase || ''}
                        onChange={(e) => handleUpdateIntroStep(idx, { ...step, subPhase: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                      />
                    </td>

                    {/* الدعامات الديداكتيكية */}
                    <td className="p-2 border-l border-slate-200 align-top">
                      <input
                        type="text"
                        value={step.resources || ''}
                        onChange={(e) => handleUpdateIntroStep(idx, { ...step, resources: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none"
                      />
                    </td>

                    {/* مهام المدرس */}
                    <td className="p-2 border-l border-slate-200 align-top">
                      <textarea
                        rows={3}
                        value={step.teacherActivity}
                        onChange={(e) => handleUpdateIntroStep(idx, { ...step, teacherActivity: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 rounded-lg p-2 text-xs text-slate-900 outline-none leading-relaxed resize-y"
                      />
                    </td>

                    {/* مهام المتعلم */}
                    <td className="p-2 border-l border-slate-200 align-top">
                      <textarea
                        rows={3}
                        value={step.learnerActivity}
                        onChange={(e) => handleUpdateIntroStep(idx, { ...step, learnerActivity: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 rounded-lg p-2 text-xs text-slate-900 outline-none leading-relaxed resize-y"
                      />
                    </td>

                    {/* أشكال العمل */}
                    <td className="p-2 border-l border-slate-200 align-top">
                      <input
                        type="text"
                        value={step.workForm || ''}
                        onChange={(e) => handleUpdateIntroStep(idx, { ...step, workForm: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 focus:border-indigo-500 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-800 outline-none text-center"
                      />
                    </td>

                    {/* Actions */}
                    <td className="p-1.5 align-middle text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveIntroStep(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveIntroStep(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteIntroStep(idx)}
                          className="p-1 text-red-400 hover:text-red-600 rounded"
                          title="حذف الوضعية"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3">
            {currentIntroSteps.map((step, idx) => (
              <div key={step.id || idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    وضعية {idx + 1}: {step.phaseName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMoveIntroStep(idx, 'up')} className="p-1 text-slate-400"><ArrowUp size={14} /></button>
                    <button onClick={() => handleMoveIntroStep(idx, 'down')} className="p-1 text-slate-400"><ArrowDown size={14} /></button>
                    <button onClick={() => handleDeleteIntroStep(idx)} className="p-1 text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">وضعيات التعلم:</label>
                    <input
                      type="text"
                      value={step.phaseName}
                      onChange={(e) => handleUpdateIntroStep(idx, { ...step, phaseName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">أهداف التعلم:</label>
                    <input
                      type="text"
                      value={step.subPhase || ''}
                      onChange={(e) => handleUpdateIntroStep(idx, { ...step, subPhase: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الدعامات:</label>
                    <input
                      type="text"
                      value={step.resources || ''}
                      onChange={(e) => handleUpdateIntroStep(idx, { ...step, resources: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">أشكال العمل:</label>
                    <input
                      type="text"
                      value={step.workForm || ''}
                      onChange={(e) => handleUpdateIntroStep(idx, { ...step, workForm: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">مهام المدرس:</label>
                    <textarea
                      rows={2}
                      value={step.teacherActivity}
                      onChange={(e) => handleUpdateIntroStep(idx, { ...step, teacherActivity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">مهام المتعلم:</label>
                    <textarea
                      rows={2}
                      value={step.learnerActivity}
                      onChange={(e) => handleUpdateIntroStep(idx, { ...step, learnerActivity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Phases & Learning Steps Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                مراحل وبناء التعلمات (التدبير الديداكتيكي)
              </h3>
              <p className="text-[11px] text-slate-500">يمكنك تعديل أي نشاط، إضافته، تحريكه للأعلى/أسفل، أو تحسينه منفصلاً عبر AI.</p>
            </div>

            <button
              type="button"
              onClick={handleAddPhase}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-indigo-100"
            >
              <Plus size={15} />
              إضافة نشاط جديد
            </button>
          </div>

          <div className="space-y-4">
            {plan.phases.map((phase, idx) => {
              if (phase.isHeader) {
                return (
                  <div key={phase.id || idx} className="bg-slate-900 text-white p-3.5 rounded-xl font-black text-xs flex items-center justify-between">
                    <input
                      type="text"
                      value={phase.phaseName}
                      onChange={(e) => {
                        const updated = { ...phase, phaseName: e.target.value };
                        handleUpdatePhase(idx, updated);
                      }}
                      className="bg-transparent text-white font-black text-xs outline-none w-full"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleMovePhase(idx, 'up')} className="p-1 hover:text-indigo-300"><ArrowUp size={14} /></button>
                      <button onClick={() => handleMovePhase(idx, 'down')} className="p-1 hover:text-indigo-300"><ArrowDown size={14} /></button>
                      <button onClick={() => handleDeletePhase(idx)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={phase.id || idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={phase.phaseName}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, phaseName: e.target.value })}
                        className="font-bold text-xs text-indigo-900 bg-indigo-50/50 border border-indigo-100 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="المدة (مثال: 15 دقيقة)"
                        value={phase.duration || ''}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, duration: e.target.value })}
                        className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none w-28 text-center"
                      />
                    </div>

                    {/* Phase item toolbar */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRefineSection(`phase-${idx}`, phase.phaseName, phase)}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-100 flex items-center gap-1"
                        title="تحسين هذا النشاط عبر AI"
                      >
                        <Sparkles size={11} />
                        تحسين
                      </button>

                      <button onClick={() => handleMovePhase(idx, 'up')} className="p-1 text-slate-400 hover:text-slate-700"><ArrowUp size={14} /></button>
                      <button onClick={() => handleMovePhase(idx, 'down')} className="p-1 text-slate-400 hover:text-slate-700"><ArrowDown size={14} /></button>
                      <button onClick={() => handleDeletePhase(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Teacher & Learner Activities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">مهام وأنشطة الأستاذ:</label>
                      <textarea
                        rows={3}
                        value={phase.teacherActivity}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, teacherActivity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">مهام وأنشطة المتعلمين:</label>
                      <textarea
                        rows={3}
                        value={phase.learnerActivity}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, learnerActivity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Work Form & Resources */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold">صيغة العمل:</span>
                      <input
                        type="text"
                        value={phase.workForm || ''}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, workForm: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold">الوسائل والموارد:</span>
                      <input
                        type="text"
                        value={phase.resources || ''}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, resources: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold">نوع التقويم المرحلي:</span>
                      <input
                        type="text"
                        value={phase.assessment || ''}
                        onChange={(e) => handleUpdatePhase(idx, { ...phase, assessment: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment & Remediation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">التقويم الإجمالي والختامي:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
              {(plan.finalEvaluation || []).map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>

          {plan.remediation && (
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
              <h4 className="text-xs font-bold text-emerald-950">الدعم والمعالجة المخصصة:</h4>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {plan.remediation}
              </p>
            </div>
          )}
        </div>

        {/* Knowledge Sources Attribution */}
        {plan.sources && plan.sources.length > 0 && (
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block">مرجعيات مكتبة المعرفة المستند عليها:</span>
            <div className="flex flex-wrap gap-2">
              {plan.sources.map(s => (
                <div key={s.id} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-indigo-600" />
                  <span>{s.title} ({s.source})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* In-Editor AI Chat Assistant */}
      <AIAssistantPanel
        plan={plan}
        onPlanUpdated={(newPlan, affectedSection) => {
          onUpdatePlan(newPlan);
        }}
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)}
      />

      {/* Section Refinement Modal */}
      <SectionRefinementModal
        isOpen={refinementModal.isOpen}
        onClose={() => setRefinementModal({ ...refinementModal, isOpen: false })}
        plan={plan}
        sectionKey={refinementModal.sectionKey}
        sectionTitle={refinementModal.sectionTitle}
        currentValue={refinementModal.currentValue}
        onApplyProposal={handleApplyRefinedSection}
      />
    </div>
  );
};
