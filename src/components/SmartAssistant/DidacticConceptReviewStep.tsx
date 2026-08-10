import React, { useState } from 'react';
import { DidacticConcept, DidacticConceptQuality } from '../../types/smartAssistant';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  RotateCcw, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Send,
  MessageSquare,
  ArrowLeft,
  Info
} from 'lucide-react';

interface DidacticConceptReviewStepProps {
  concept: DidacticConcept;
  onApprove: (approvedConcept: DidacticConcept) => void;
  onRefineElement: (sectionKey: string, instruction: string) => Promise<void>;
  onRegenerateConcept: () => void;
  isLoading: boolean;
  onBackToChoices: () => void;
}

export const DidacticConceptReviewStep: React.FC<DidacticConceptReviewStepProps> = ({
  concept,
  onApprove,
  onRefineElement,
  onRegenerateConcept,
  isLoading,
  onBackToChoices
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'problematic' | 'resources' | 'phases' | 'evaluation' | 'justifications'>('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState<string>('');
  const [isRefining, setIsRefining] = useState<boolean>(false);

  const quality = concept.qualityAssessment;

  const handleRefineSubmit = async (sectionKey: string) => {
    if (!refineInstruction.trim()) return;
    setIsRefining(true);
    try {
      await onRefineElement(sectionKey, refineInstruction);
      setEditingSection(null);
      setRefineInstruction('');
    } catch (err) {
      console.error('Error refining element:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner with Quality Assessment */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-700/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-amber-400/20 text-amber-300 rounded-2xl shrink-0 border border-amber-400/30">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-amber-400/20 text-amber-200 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  مرحلة الهندسة والتفكير التربوي
                </span>
                <span className="text-xs text-indigo-300">• {concept.component}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1">
                التصور الديداكتيكي المقترح: {concept.lessonTitle}
              </h2>
            </div>
          </div>

          {/* Overall Quality Badge */}
          {quality && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <div className="text-right">
                <span className="text-[10px] text-indigo-200 block font-bold">جودة التصور التربوي</span>
                <span className={`text-base font-black ${
                  (quality.overallScore ?? 0) >= 85 ? 'text-emerald-300' : (quality.overallScore ?? 0) >= 70 ? 'text-amber-300' : 'text-rose-300'
                }`}>
                  {quality.overallScore ?? 0} / 100 ({(quality.overallScore ?? 0) >= 85 ? 'ممتاز' : (quality.overallScore ?? 0) >= 70 ? 'جيد جداً' : 'يحتاج مراجعة'})
                </span>
              </div>
              <ShieldCheck size={28} className={(quality.overallScore ?? 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
          )}
        </div>

        {/* Quality Criteria Indicators */}
        {quality && (quality.checks || []).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {(quality.checks || []).map((crit, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                crit.passed 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}>
                <span className="font-bold text-[11px] truncate">{crit.title}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-black text-xs">{crit.score}/100</span>
                  {crit.passed ? <CheckCircle2 size={13} className="text-emerald-400" /> : <AlertTriangle size={13} className="text-amber-400" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs for Concept Components */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <BookOpen size={15} />
          الهدف والتعلمات والمفاهيم
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('problematic')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'problematic'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <HelpCircle size={15} />
          الوضعية المشكلة والإشكالية
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <FileText size={15} />
          الوثائق والدعامات ({concept.proposedResources?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('phases')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'phases'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Layers size={15} />
          المقاطع والأنشطة الديداكتيكية
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('evaluation')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'evaluation'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <ShieldCheck size={15} />
          التقويم والدعم
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('justifications')}
          className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'justifications'
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
          }`}
        >
          <Info size={15} />
          التعليلات التربوية
        </button>
      </div>

      {/* TAB 1: Overview (Central Goal, Prerequisites, Concepts) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Central Learning Goal */}
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                <BookOpen size={16} />
                الهدف التعلمي المركزي المؤطر للدرس
              </span>
              <button
                type="button"
                onClick={() => setEditingSection('centralGoal')}
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Edit3 size={13} />
                تعديل بالذكاء الاصطناعي
              </button>
            </div>
            <p className="text-sm font-bold text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
              {concept.centralGoal}
            </p>
          </div>

          {/* Prerequisites & Key Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prerequisites */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 block">المكتسبات السابقة والمستلزمات</span>
              <ul className="space-y-2 text-xs">
                {(concept.prerequisites || []).map((pre, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{pre}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Concepts */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 block">التأطير المفهومي والمصطلحات الرئيسية</span>
              <div className="space-y-2 text-xs">
                {(concept.keyConcepts || []).map((item, idx) => (
                  <div key={idx} className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/80 space-y-1">
                    <strong className="text-amber-900 font-bold block">{item.term}</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Problematic & Problem Situation */}
      {activeTab === 'problematic' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-indigo-600" />
                الوضعية المشكلة الاستهلالية المصوغة
              </span>
              <button
                type="button"
                onClick={() => setEditingSection('problematic')}
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Edit3 size={13} />
                تعديل بالذكاء الاصطناعي
              </button>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {concept.problematic?.situation}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-900 block">التساؤلات الإشكالية المؤطرة لبناء التعلمات:</span>
              <div className="space-y-2">
                {(concept.problematic?.mainQuestions || []).map((q, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-950">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification Box */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/80 space-y-1">
              <span className="text-[11px] font-black text-amber-900 block">💡 التعليل البيداغوجي لاختيار هذه الوضعية:</span>
              <p className="text-xs text-amber-800 leading-relaxed">{concept.problematic?.justification}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Proposed Documents & Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900">الوثائق والدعامات المعتمدة المقترحة للدرس</h3>
            <button
              type="button"
              onClick={() => setEditingSection('proposedResources')}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Edit3 size={13} />
              إضافة أو تعديل الوثائق بالذكاء الاصطناعي
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(concept.proposedResources || []).map((res, idx) => (
              <div key={res.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-100 inline-block mb-1">
                      {res.type}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{res.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">{res.source}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {res.description}
                </p>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                  <strong>التعليل والفاعلية الديداكتيكية: </strong>
                  <span>{res.justification}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Learning Phases & Activities */}
      {activeTab === 'phases' && (
        <div className="space-y-6">
          {(concept.learningPhases || []).map((phase, pIdx) => (
            <div key={phase.id || pIdx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full">
                    المقطع التعلمي {pIdx + 1} ({phase.duration})
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{phase.phaseTitle}</h3>
                  <p className="text-xs text-indigo-700 font-bold mt-0.5">هدف المقطع: {phase.phaseGoal}</p>
                </div>
              </div>

              {/* Activities inside Phase */}
              <div className="space-y-4">
                {(phase.activities || []).map((act, aIdx) => (
                  <div key={act.id || aIdx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-900">{act.title}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">
                        {act.targetObjective}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <strong className="text-slate-800 block text-[11px]">دور الأستاذ والأسئلة:</strong>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{act.teacherRoleSummary}</p>
                        <div className="space-y-1 pt-1">
                          {(act.keyQuestions || []).map((q, qIdx) => (
                            <p key={qIdx} className="text-indigo-900 font-bold text-[10px]">• {q}</p>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <strong className="text-slate-800 block text-[11px]">دور المتعلم والإجابة المنتظرة:</strong>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{act.learnerRoleSummary}</p>
                        <strong className="text-emerald-800 block text-[10px] mt-2">المنتج والملخص المتوقع: {act.expectedOutput}</strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                      <strong>💡 تعليل النشاط: </strong> {act.justification}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Evaluation & Support */}
      {activeTab === 'evaluation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Formative Evaluation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-900 block">أسئلة التقويم التكويني المرحلي</span>
              <ul className="space-y-2 text-xs">
                {(concept.formativeEvaluation || []).map((q, idx) => (
                  <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 font-medium">
                    {idx + 1}. {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Final Evaluation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-900 block">أسئلة التقويم النهائي الإجمالي</span>
              <ul className="space-y-2 text-xs">
                {(concept.finalEvaluation || []).map((q, idx) => (
                  <li key={idx} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-indigo-950 font-bold">
                    {idx + 1}. {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remediation Plan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-black text-slate-900 block">خطة الدعم والمعالجة الديداكتيكية</span>
            <p className="text-xs text-slate-700 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 leading-relaxed font-medium">
              {concept.remediation}
            </p>
          </div>
        </div>
      )}

      {/* TAB 6: Pedagogical Rationales */}
      {activeTab === 'justifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
            التعليلات والتأطير الديداكتيكي للمادة ({concept.component})
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <strong className="text-indigo-900 block font-bold mb-1">النهج الديداكتيكي المطبق:</strong>
              <p className="text-slate-700 leading-relaxed">{concept.pedagogicalJustifications?.subjectApproach}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <strong className="text-indigo-900 block font-bold mb-1">تفعيل خطوات النهج في الدرس:</strong>
              <p className="text-slate-700 leading-relaxed">{concept.pedagogicalJustifications?.approachExplanation}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <strong className="text-indigo-900 block font-bold mb-1">تعليل بناء الوضعية الإشكالية والأسئلة:</strong>
              <p className="text-slate-700 leading-relaxed">{concept.pedagogicalJustifications?.situationReasoning}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <strong className="text-indigo-900 block font-bold mb-1">تعليل ملاءمة الوثائق والأنشطة:</strong>
              <p className="text-slate-700 leading-relaxed">{concept.pedagogicalJustifications?.resourcesReasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Regeneration Modal / Bar */}
      {editingSection && (
        <div className="bg-indigo-950 text-white p-5 rounded-2xl shadow-xl space-y-3 border border-indigo-700 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles size={16} />
              تعديل قسم [{editingSection}] بواسطة الذكاء الاصطناعي
            </span>
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="text-xs text-indigo-300 hover:text-white"
            >
              إلغاء
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={refineInstruction}
              onChange={(e) => setRefineInstruction(e.target.value)}
              placeholder="اكتب تعليماتك المحددة للتعديل (مثلاً: غير الوضعية لتصبح حول الخريطة التاريخية ص 32...)"
              className="flex-1 bg-white/10 text-white placeholder-indigo-300 text-xs px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="button"
              onClick={() => handleRefineSubmit(editingSection)}
              disabled={isRefining || !refineInstruction.trim()}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-indigo-950 font-black px-5 py-3 rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              {isRefining ? 'جاري التعديل...' : <><Send size={14} /> تطبيق Tعديل</>}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBackToChoices}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-4 py-3 rounded-2xl bg-white flex items-center gap-1.5"
          >
            <ArrowLeft size={15} />
            تعديل الاختيارات
          </button>

          <button
            type="button"
            onClick={onRegenerateConcept}
            disabled={isLoading}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-2xl flex items-center gap-1.5"
          >
            <RotateCcw size={15} />
            إعادة توليد تصور جديد
          </button>
        </div>

        <button
          type="button"
          onClick={() => onApprove(concept)}
          disabled={isLoading}
          className="w-full sm:w-auto flex-1 max-w-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري بناء الجذاذة المعتمدة نهائياً...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              اعتماد التصور وانتقال لتوليد الجذاذة النهائية
            </>
          )}
        </button>
      </div>
    </div>
  );
};
