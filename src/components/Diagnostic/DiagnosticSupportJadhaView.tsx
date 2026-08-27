import React from 'react';
import { DiagnosticDossier } from '../../types/diagnostic';
import { 
  FileText, 
  Clock, 
  Download, 
  Printer, 
  Layers, 
  CheckCircle2, 
  BookOpen, 
  Award,
  Sparkles,
  Users
} from 'lucide-react';
import { downloadSupportJadhaDocx } from '../../utils/diagnosticWordExport';
import { checkAndRecordDownload } from '../../services/usageTracker';
import { toast } from 'sonner';

interface Props {
  dossier: DiagnosticDossier;
}

export const DiagnosticSupportJadhaView: React.FC<Props> = ({ dossier }) => {
  const jadha = dossier.supportJadha;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{jadha.title}</h3>
            <p className="text-xs text-slate-500">
              جذاذة ديداكتيكية نموذجية مؤطرة لأنشطة الدعم والاستدراك الصفي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>طباعة الجذاذة</span>
          </button>

          <button
            onClick={async () => {
              const allowed = await checkAndRecordDownload(`تحميل جذاذة الدعم والاستدراك (${dossier.level})`);
              if (!allowed) return;
              try {
                toast.loading('جاري تحميل جذاذة الدعم والاستدراك...', { id: 'diag-jadha-word' });
                await downloadSupportJadhaDocx(dossier);
                toast.success('تم تحميل جذاذة الدعم بنجاح!', { id: 'diag-jadha-word' });
              } catch (err) {
                toast.error('حدث خطأ أثناء تحميل ملف Word', { id: 'diag-jadha-word' });
              }
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>تحميل Word (.docx RTL)</span>
          </button>
        </div>
      </div>

      {/* Main Jadha Sheet Canvas */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6" id="diagnostic-jadha-sheet">
        
        {/* Official Header Table */}
        <div className="border-2 border-slate-800 rounded-2xl p-4 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center">
            <div className="text-right space-y-1">
              <p className="font-bold text-xs text-slate-800">المملكة المغربية</p>
              <p className="text-[11px] text-slate-600">وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
              <p className="text-[11px] text-slate-600">الأكاديمية الجهوية: {dossier.institutionInfo.academy}</p>
              <p className="text-[11px] text-slate-600">المديرية الإقليمية: {dossier.institutionInfo.directorate}</p>
              <p className="text-[11px] font-bold text-slate-700">المؤسسة: {dossier.institutionInfo.school || '....................'}</p>
            </div>

            <div className="space-y-1.5 border-y md:border-y-0 md:border-x border-slate-300 py-2 md:px-3">
              <div className="inline-block bg-purple-100 text-purple-900 font-black px-3 py-1 rounded-xl text-sm">
                جذاذة أنشطة الدعم والاستدراك
              </div>
              <p className="font-bold text-xs text-slate-800">{jadha.remediationTitle}</p>
              <p className="text-xs font-semibold text-slate-600">المستوى: {dossier.level}</p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-[11px] font-bold text-slate-700">الموسم الدراسي: {dossier.institutionInfo.academicYear}</p>
              <p className="text-[11px] text-slate-600">الأستاذ(ة): {dossier.institutionInfo.teacherName || '....................'}</p>
              <p className="text-[11px] font-bold text-purple-700">المدة: {jadha.duration}</p>
              <p className="text-[11px] text-slate-500">الفوج: {dossier.institutionInfo.classGroup || '....................'}</p>
            </div>
          </div>
        </div>

        {/* Pedagogical Metadata Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-red-50/70 p-3.5 rounded-2xl border border-red-200 space-y-1">
            <p className="font-bold text-red-900">التعثر المرصود في التقويم التشخيصي:</p>
            <p className="text-slate-800 leading-relaxed">{jadha.targetedDeficit}</p>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
            <p className="font-bold text-emerald-900">الكفاية والهدف المراد تثبيته وعلاجه:</p>
            <p className="text-slate-800 leading-relaxed">{jadha.prerequisiteGoal}</p>
          </div>
        </div>

        {/* Materials */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center gap-2 flex-wrap">
          <strong className="text-slate-800">المعينات والدعامات الديداكتيكية:</strong>
          {jadha.pedagogicalMaterial.map((mat, i) => (
            <span key={i} className="bg-white border border-slate-300 px-2.5 py-0.5 rounded-lg font-semibold text-slate-700">
              {mat}
            </span>
          ))}
        </div>

        {/* Synoptic Steps Table (جدول التدبير الديداكتيكي للمقاطع من اليمين إلى اليسار) */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="p-3 w-36">المرحلة والمدة</th>
                  <th className="p-3 w-52">الوضعية التعليمية والدعامة</th>
                  <th className="p-3">مهام الأستاذ(ة) والتوجيه</th>
                  <th className="p-3">أنشطة المتعلمين وصيغة العمل</th>
                  <th className="p-3 w-28 text-center">التقويم التكويني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {jadha.steps.map((step, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors align-top">
                    {/* Stage & Duration */}
                    <td className="p-3 bg-slate-50/60 font-bold space-y-1">
                      <p className="text-indigo-900">{step.phaseName}</p>
                      <span className="inline-block text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        {step.duration}
                      </span>
                    </td>

                    {/* Situation & Support */}
                    <td className="p-3 space-y-2">
                      <p className="text-slate-800 leading-relaxed font-medium">{step.learningSituation}</p>
                      <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-200 text-[11px] font-bold">
                        الدعامة: {step.didacticSupport}
                      </div>
                    </td>

                    {/* Teacher Tasks */}
                    <td className="p-3">
                      <ul className="space-y-1 list-disc list-inside text-slate-700 pr-1">
                        {step.teacherTasks.map((t, ti) => (
                          <li key={ti} className="leading-relaxed">{t}</li>
                        ))}
                      </ul>
                    </td>

                    {/* Student Tasks & Work Form */}
                    <td className="p-3 space-y-2">
                      <ul className="space-y-1 list-disc list-inside text-slate-700 pr-1">
                        {step.studentTasks.map((s, si) => (
                          <li key={si} className="leading-relaxed">{s}</li>
                        ))}
                      </ul>
                      <div className="pt-1">
                        <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold text-[10px] border border-purple-200">
                          صيغة العمل: {step.workForm}
                        </span>
                      </div>
                    </td>

                    {/* Formative Check */}
                    <td className="p-3 text-center bg-slate-50/40 text-[11px] font-bold text-indigo-700">
                      {step.formativeCheck}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Synthesis & Retention */}
        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 text-xs space-y-1.5 text-indigo-950">
          <h5 className="font-bold text-indigo-900 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-indigo-600" />
            <span>الخلاصة والتثبيت المنهجي (Trace écrite):</span>
          </h5>
          <p className="leading-relaxed text-slate-800 font-medium bg-white p-3 rounded-xl border border-indigo-100">
            {jadha.synthesisAndRetention}
          </p>
        </div>

        {/* Post-Support Evaluation */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs space-y-1.5 text-emerald-950">
          <h5 className="font-bold text-emerald-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-emerald-600" />
            <span>التقويم البعدي للتحقق من استدامة الأثر:</span>
          </h5>
          <p className="leading-relaxed text-slate-800 font-medium bg-white p-3 rounded-xl border border-emerald-100">
            {jadha.postSupportEvaluation}
          </p>
        </div>
      </div>
    </div>
  );
};
