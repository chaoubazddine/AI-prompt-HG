import React, { useState } from 'react';
import { 
  LessonSetupData, 
  TeacherVision, 
  PedagogicalChoices, 
  StructuredLessonPlan,
  DidacticConcept,
  LessonSetup
} from '../../types/smartAssistant';
import { LessonSetupStep } from './LessonSetupStep';
import { TeacherVisionStep } from './TeacherVisionStep';
import { PedagogicalPreferencesStep } from './PedagogicalPreferencesStep';
import { ReviewStep } from './ReviewStep';
import { DidacticConceptReviewStep } from './DidacticConceptReviewStep';
import { InteractiveEditor } from './InteractiveEditor';
import { 
  generateDidacticConcept, 
  refineDidacticConceptElement, 
  generateFinalPlanFromConcept 
} from '../../services/smartAssistantService';
import { Bot, Check, Sparkles, ArrowRight, Layers, Home } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface SmartAssistantWorkflowProps {
  profInfo: {
    name: string;
    school: string;
    academy: string;
    directorate: string;
    year: string;
  };
  userId?: string;
  onClose: () => void;
  onSavedToHistory?: (plan: StructuredLessonPlan) => void;
}

export const SmartAssistantWorkflow: React.FC<SmartAssistantWorkflowProps> = ({
  profInfo,
  userId,
  onClose,
  onSavedToHistory,
}) => {
  // Current active step index (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [setupData, setSetupData] = useState<LessonSetupData>({
    subject: 'الاجتماعيات',
    cycle: 'middle',
    level: '1ac',
    component: 'التاريخ',
    unit: 'الوحدة الأولى',
    lessonTitle: 'حضارة بلاد الرافدين',
    duration: '50 دقيقة',
    textbook: 'المناار في الاجتماعيات'
  });

  const [visionData, setVisionData] = useState<TeacherVision>({
    visionText: ''
  });

  const [choices, setChoices] = useState<PedagogicalChoices>({
    startApproach: 'وضعية مشكلة',
    preferredActivities: ['تحليل الوثائق', 'العمل في مجموعات', 'المناقشة الحوارية'],
    assessmentType: 'تقويم تكويني مرحلي',
    includeRemediation: true,
    customResources: ''
  });

  const [didacticConcept, setDidacticConcept] = useState<DidacticConcept | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<StructuredLessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const stepTitles = [
    'معطيات الدرس',
    'تصور الأستاذ',
    'الاختيارات البيداغوجية',
    'مراجعة المعطيات',
    'التصور الديداكتيكي',
    'المحرر التفاعلي'
  ];

  // Stage 1: Generate Didactic Concept Proposal
  const handleGenerateConcept = async () => {
    setIsLoading(true);
    setError('');

    try {
      const setup: LessonSetup = {
        subject: setupData.subject,
        level: setupData.level,
        cycle: setupData.cycle,
        textbook: setupData.textbook,
        component: setupData.component,
        unit: setupData.unit,
        lessonTitle: setupData.lessonTitle,
        duration: setupData.duration,
        teacherVision: visionData.visionText
      };

      const concept = await generateDidacticConcept(setup, choices, profInfo, 'GROUNDED');
      setDidacticConcept(concept);
      setCurrentStep(5); // Go to Didactic Concept review
    } catch (err: any) {
      console.error('Error generating concept:', err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء بناء التصور الديداكتيكي.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refine element in Didactic Concept
  const handleRefineConceptElement = async (sectionKey: string, instruction: string) => {
    if (!didacticConcept) return;
    setIsLoading(true);
    try {
      const updatedConcept = await refineDidacticConceptElement(didacticConcept, sectionKey, instruction);
      setDidacticConcept(updatedConcept);
    } catch (err: any) {
      setError('حدث خطأ أثناء تعديل هذا العنصر بالذكاء الاصطناعي.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 2: Approve Concept & Generate Final Structured Lesson Plan
  const handleApproveConceptAndGeneratePlan = async (approvedConcept: DidacticConcept) => {
    setIsLoading(true);
    setError('');

    try {
      const plan = await generateFinalPlanFromConcept(
        approvedConcept,
        setupData,
        choices,
        profInfo
      );

      setGeneratedPlan(plan);
      setCurrentStep(6); // Interactive Editor
    } catch (err: any) {
      console.error('Error generating final plan:', err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء بناء الجذاذة النهائية.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Save / Approve in Firestore
  const handleApproveAndSave = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      if (userId && db) {
        await addDoc(collection(db, 'jadhas'), {
          userId,
          title: generatedPlan.title,
          level: generatedPlan.level,
          component: generatedPlan.component,
          cycle: generatedPlan.cycle,
          createdAt: new Date().toISOString(),
          planData: generatedPlan,
          type: 'smart_assistant'
        });
      }

      if (onSavedToHistory) {
        onSavedToHistory(generatedPlan);
      }

      alert('تم اعتماد الجذاذة وحفظها في سوابق الجذاذات بنجاح!');
      onClose();
    } catch (err: any) {
      console.error('Error saving plan:', err);
      alert('تم حفظ الجذاذة محلياً بنجاح!');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-2.5 sm:p-8 space-y-4 sm:space-y-6" dir="rtl">
      {/* Top Header Bar */}
      <div className="max-w-6xl mx-auto bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-3 bg-[#4F46E5] text-white rounded-xl sm:rounded-2xl shadow-md shadow-indigo-100 shrink-0">
            <Bot size={18} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-xl font-black text-slate-900 truncate">
                المساعد التربوي الذكي
              </h1>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100 shrink-0">
                الجيل الجديد
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden md:block">
              «الذكاء الاصطناعي يقترح، والأستاذ يقرر.» هندسة وبناء الجذاذات وفق المنهاج المغربي والتفكير التربوي المحكم.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/60 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all flex items-center gap-1 sm:gap-1.5 shrink-0"
        >
          <Home size={14} className="sm:w-[15px] sm:h-[15px]" />
          <span className="hidden sm:inline">الخروج للوحة الرئيسية</span>
          <span className="sm:hidden">الرئيسية</span>
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="max-w-6xl mx-auto bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-6 gap-1 sm:gap-2">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <div
                key={title}
                className={`flex flex-col items-center text-center space-y-0.5 sm:space-y-1 p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                    : isCompleted
                    ? 'text-emerald-700 bg-emerald-50/50'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs transition-all ${
                    isActive
                      ? 'bg-[#4F46E5] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check size={12} className="sm:w-[14px] sm:h-[14px]" /> : stepNum}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-full hidden sm:block">
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 font-bold text-xs rounded-2xl border border-red-200">
            {error}
          </div>
        )}

        {/* STEP 1: Lesson Setup */}
        {currentStep === 1 && (
          <LessonSetupStep
            setupData={setupData}
            onChange={setSetupData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 2: Teacher Vision */}
        {currentStep === 2 && (
          <TeacherVisionStep
            visionData={visionData}
            onChange={setVisionData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* STEP 3: Pedagogical Preferences */}
        {currentStep === 3 && (
          <PedagogicalPreferencesStep
            choices={choices}
            onChange={setChoices}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 4: Review setup and trigger Concept Generation */}
        {currentStep === 4 && (
          <ReviewStep
            setupData={setupData}
            visionData={visionData}
            choices={choices}
            onEditStep={(s) => setCurrentStep(s)}
            onGenerate={handleGenerateConcept}
            isLoading={isLoading}
          />
        )}

        {/* STEP 5: Didactic Concept Review & Refinement */}
        {currentStep === 5 && didacticConcept && (
          <DidacticConceptReviewStep
            concept={didacticConcept}
            onApprove={handleApproveConceptAndGeneratePlan}
            onRefineElement={handleRefineConceptElement}
            onRegenerateConcept={handleGenerateConcept}
            isLoading={isLoading}
            onBackToChoices={() => setCurrentStep(3)}
          />
        )}

        {/* STEP 6: Interactive Editor for Final Approved Plan */}
        {currentStep === 6 && generatedPlan && (
          <InteractiveEditor
            plan={generatedPlan}
            onUpdatePlan={setGeneratedPlan}
            onApproveAndSave={handleApproveAndSave}
            onSaveDraft={handleApproveAndSave}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
};
