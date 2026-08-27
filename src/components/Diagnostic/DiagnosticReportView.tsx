import React from 'react';
import { DiagnosticDossier } from '../../types/diagnostic';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Download, 
  Printer,
  Compass,
  MapPin,
  Sparkles,
  Award
} from 'lucide-react';
import { downloadDiagnosticReportDocx } from '../../utils/diagnosticWordExport';
import { checkAndRecordDownload } from '../../services/usageTracker';
import { toast } from 'sonner';

interface Props {
  dossier: DiagnosticDossier;
}

export const DiagnosticReportView: React.FC<Props> = ({ dossier }) => {
  const report = dossier.report;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">تقرير التقويم التشخيصي والقراءة النوعية للنتائج</h3>
            <p className="text-xs text-slate-500">
              وثيقة تربوية رسمية موجهة للإدارة التربوية والتفتيش ومجالس الأقسام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>طباعة التقرير</span>
          </button>

          <button
            onClick={async () => {
              const allowed = await checkAndRecordDownload(`تحميل تقرير التقويم التشخيصي (${dossier.level})`);
              if (!allowed) return;
              try {
                toast.loading('جاري تحميل تقرير التقويم التشخيصي...', { id: 'diag-rep-word' });
                await downloadDiagnosticReportDocx(dossier);
                toast.success('تم تحميل تقرير التقويم التشخيصي بنجاح!', { id: 'diag-rep-word' });
              } catch (err) {
                toast.error('حدث خطأ أثناء تحميل ملف Word', { id: 'diag-rep-word' });
              }
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>تحميل Word (.docx RTL)</span>
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Header Title */}
        <div className="border-b border-slate-200 pb-5 text-center space-y-2">
          <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            المملكة المغربية - وزارة التربية الوطنية والتعليم الأولي والرياضة
          </div>
          <h2 className="text-xl font-black text-slate-900">
            تقرير التقويم التشخيصي واستثمار النتائج - مادة الاجتماعيات
          </h2>
          <p className="text-xs text-slate-500">
            المستوى: <strong className="text-slate-800 font-bold">{dossier.level}</strong> | الموسم الدراسي: <strong className="text-slate-800 font-bold">{report.institutionInfo.academicYear}</strong> | الأستاذ(ة): <strong className="text-slate-800 font-bold">{report.institutionInfo.teacherName || '....................'}</strong>
          </p>
        </div>

        {/* 1. Pedagogical Context */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">1</span>
            <span>السياق العام والإطار المرجعي للتقويم التشخيصي</span>
          </h4>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
            {report.generalContext}
          </div>
        </div>

        {/* 2. Statistical Metrics */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">2</span>
            <span>المعطيات الإحصائية الكمية ومؤشرات التمكن</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[11px] font-bold text-indigo-900">نسبة النجاح (10 فما فوق)</p>
              <p className="text-2xl font-black text-indigo-700 mt-1">{report.overallStats.successRate}%</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-600">المعدل العام للقسم</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{report.overallStats.averageScore} <span className="text-xs text-slate-400 font-normal">/ 20</span></p>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[11px] font-bold text-emerald-900">أعلى نقطة محصلة</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{report.overallStats.highestScore} <span className="text-xs text-slate-400 font-normal">/ 20</span></p>
            </div>

            <div className="bg-red-50/50 p-3.5 rounded-2xl border border-red-100 text-center">
              <p className="text-[11px] font-bold text-red-900">أدنى نقطة محصلة</p>
              <p className="text-2xl font-black text-red-700 mt-1">{report.overallStats.lowestScore} <span className="text-xs text-slate-400 font-normal">/ 20</span></p>
            </div>
          </div>
        </div>

        {/* 3. Level Categories Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">3</span>
            <span>توزيع وتفيؤ المتعلمين حسب عتبات التحكم الرسمية</span>
          </h4>

          {/* Progress visual bar */}
          <div className="h-6 w-full rounded-xl overflow-hidden flex font-bold text-[10px] text-white shadow-inner">
            {report.categoriesStats.map((cat, idx) => {
              const bg = cat.category === 'متحكم' ? 'bg-emerald-500' : cat.category === 'في طور التحكم' ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div 
                  key={idx} 
                  style={{ width: `${cat.percentage}%` }}
                  className={`${bg} flex items-center justify-center px-1 transition-all truncate`}
                  title={`${cat.category}: ${cat.percentage}%`}
                >
                  {cat.percentage > 10 ? `${cat.category} (${cat.percentage}%)` : ''}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {report.categoriesStats.map((cat, idx) => {
              const isAcquis = cat.category === 'متحكم';
              const isInProgress = cat.category === 'في طور التحكم';

              const border = isAcquis ? 'border-emerald-200 bg-emerald-50/40' : isInProgress ? 'border-amber-200 bg-amber-50/40' : 'border-red-200 bg-red-50/40';
              const badge = isAcquis ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';

              return (
                <div key={idx} className={`p-4 rounded-2xl border ${border} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge}`}>
                      {cat.category} ({cat.minThreshold})
                    </span>
                    <span className="text-xs font-black text-slate-700">{cat.studentCount} تلميذ ({cat.percentage}%)</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">{cat.description}</p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside pr-1">
                    {cat.characteristics.map((ch, i) => (
                      <li key={i}>{ch}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Qualitative Reading & Difficulties Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">4</span>
            <span>القراءة النوعية لمواطن القوة ومكامن التعثر المرصودة</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* History Thinking */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                <Compass size={16} className="text-indigo-600" />
                <span>تعثرات النهج التاريخي والمفاهيم المهيكلة:</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside pr-2">
                {report.qualitativeAnalysis.historicalThinkingDeficits.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Geography Thinking */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <MapPin size={16} className="text-emerald-600" />
                <span>تعثرات النهج الجغرافي والمهارات الخرائطية:</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside pr-2">
                {report.qualitativeAnalysis.geographicalThinkingDeficits.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Citizenship */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-600" />
                <span>التربية على المواطنة والوعي الحقوقي:</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside pr-2">
                {report.qualitativeAnalysis.citizenshipDeficits.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Methodology */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h5 className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                <FileText size={16} className="text-purple-600" />
                <span>الجانب المنهجي والتعبير المقالي والتركيب:</span>
              </h5>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside pr-2">
                {report.qualitativeAnalysis.methodologicalDeficits.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. Conclusions & Pedagogical Recommendations */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">5</span>
            <span>الاستنتاجات العامة والتوصيات الإجرائية</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-2">
              <h5 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                <AlertCircle size={16} className="text-blue-600" />
                <span>الاستنتاجات المستخلصة:</span>
              </h5>
              <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside pr-2">
                {report.generalConclusions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <Lightbulb size={16} className="text-emerald-600" />
                <span>التوصيات والتدابير البيداغوجية المقترحة:</span>
              </h5>
              <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside pr-2">
                {report.administrativeRecommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs font-bold text-slate-700">
          <div>
            <p>توقيع وخاتم الأستاذ(ة):</p>
            <div className="h-16 mt-2 border-b border-dashed border-slate-300"></div>
          </div>
          <div>
            <p>تأشيرة السيد(ة) رئيس(ة) المؤسسة / المفتش(ة) التربوي(ة):</p>
            <div className="h-16 mt-2 border-b border-dashed border-slate-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
