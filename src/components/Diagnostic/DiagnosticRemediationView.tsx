import React from 'react';
import { DiagnosticDossier } from '../../types/diagnostic';
import { 
  ShieldCheck, 
  Layers, 
  Clock, 
  Target, 
  CheckCircle, 
  Download, 
  Printer, 
  Sparkles,
  BookOpen,
  Users
} from 'lucide-react';
import { downloadRemediationPlanDocx } from '../../utils/diagnosticWordExport';

interface Props {
  dossier: DiagnosticDossier;
}

export const DiagnosticRemediationView: React.FC<Props> = ({ dossier }) => {
  const plan = dossier.remediationPlan;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">خطة الدعم والمعالجة البيداغوجية والاستدراكية</h3>
            <p className="text-xs text-slate-500">
              أنشطة علاجية مستهدفة وفق بيداغوجيا الفوارق ومجموعات الحاجات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>طباعة الخطة</span>
          </button>

          <button
            onClick={() => downloadRemediationPlanDocx(dossier)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>تحميل Word (.docx RTL)</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Meta Header */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-slate-500 font-bold">المستوى والمادة:</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{dossier.level} - مادة الاجتماعيات</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold">المجال الزمني للتنفيذ:</p>
            <p className="font-bold text-indigo-700 mt-0.5">{plan.timeframe}</p>
          </div>
          <div>
            <p className="text-slate-500 font-bold">تاريخ التقويم البعدي للتحقق:</p>
            <p className="font-bold text-emerald-700 mt-0.5">{plan.finalEvaluationDate}</p>
          </div>
        </div>

        {/* Strategic Axes */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">1</span>
            <span>المحاور الاستراتيجية لخطة الدعم والمعالجة</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.strategicAxes.map((axis, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">{i + 1}</span>
                  <span>{axis.axisName}</span>
                </h5>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  الهدف: {axis.objective}
                </p>
                <div className="pt-1">
                  <p className="text-[11px] font-bold text-slate-500 mb-1">الأنشطة المبرمجة:</p>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside pr-1">
                    {axis.priorityActivities.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Remediation Activities */}
        <div className="space-y-4 pt-2">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">2</span>
            <span>بطاقات الأنشطة العلاجية والورشات التطبيقية المبرمجة</span>
          </h4>

          <div className="space-y-4">
            {plan.activities.map((act) => {
              const targetBadge = act.targetCategory === 'غير متحكم' 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : act.targetCategory === 'في طور التحكم' 
                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                : 'bg-indigo-100 text-indigo-800 border-indigo-200';

              return (
                <div key={act.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {/* Activity Top Bar */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-slate-900">{act.title}</h5>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-slate-500 font-semibold">المجال: {act.targetedDomain}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${targetBadge}`}>
                          الفئة: {act.targetCategory}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-indigo-100">
                          الصيغة: {act.modality}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      <Clock size={14} className="text-indigo-600" />
                      <span>{act.duration}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Deficit & Objective */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-red-50/60 p-3 rounded-xl border border-red-100 space-y-1">
                        <p className="font-bold text-red-900">التعثر المرصود المراد علاجه:</p>
                        <p className="text-slate-800 leading-relaxed">{act.detectedDifficulty}</p>
                      </div>

                      <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 space-y-1">
                        <p className="font-bold text-emerald-900">الهدف البيداغوجي الإجرائي:</p>
                        <p className="text-slate-800 leading-relaxed">{act.pedagogicalObjective}</p>
                      </div>
                    </div>

                    {/* Didactic Tools */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                      <strong className="text-slate-800">الدعامات والمعينات:</strong>
                      {act.didacticTools.map((tool, ti) => (
                        <span key={ti} className="bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-slate-700">
                          {tool}
                        </span>
                      ))}
                    </div>

                    {/* Step-by-Step Procedures */}
                    <div className="space-y-2 pt-1">
                      <p className="font-bold text-xs text-slate-800">خطوات التدبير الديداكتيكي للنشاط العلاجي:</p>
                      <div className="space-y-2">
                        {act.procedureSteps.map((step, si) => (
                          <div key={si} className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                            <p className="font-bold text-indigo-900">{step.stepTitle}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                              <p className="bg-white p-2 rounded-lg border border-slate-200/60">
                                <strong className="text-indigo-700">دور الأستاذ: </strong>{step.teacherGuidance}
                              </p>
                              <p className="bg-white p-2 rounded-lg border border-slate-200/60">
                                <strong className="text-emerald-700">دور المتعلم: </strong>{step.studentActions}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verification Indicator */}
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 text-emerald-950 font-bold">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                      <span>مؤشر التحقق وزوال التعثر: {act.evaluationIndicator}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monitoring Mechanism Note */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
          <p className="font-bold text-slate-800">آلية التتبع والمصاحبة التربوية:</p>
          <p className="text-slate-600 leading-relaxed">{plan.monitoringMechanism}</p>
        </div>
      </div>
    </div>
  );
};
