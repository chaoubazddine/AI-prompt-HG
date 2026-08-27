import React, { useState } from 'react';
import { DiagnosticDossier } from '../../types/diagnostic';
import { 
  FileText, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Printer, 
  Download, 
  Sparkles, 
  BookOpen, 
  FileCheck2, 
  Layers, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { downloadDiagnosticTestDocx } from '../../utils/diagnosticWordExport';
import { checkAndRecordDownload } from '../../services/usageTracker';
import { toast } from 'sonner';

interface Props {
  dossier: DiagnosticDossier;
}

export const DiagnosticTestView: React.FC<Props> = ({ dossier }) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileCheck2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{dossier.test.title}</h3>
            <p className="text-xs text-slate-500">
              المدة: {dossier.test.duration} | مجموع النقط: {dossier.test.totalPoints} نقطة | {dossier.test.questions.length} أسئلة مهارية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showAnswerKey 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showAnswerKey ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showAnswerKey ? 'إخفاء عناصر الإجابة' : 'عرض عناصر الإجابة والتنقيط'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
            title="طباعة الرائز"
          >
            <Printer size={14} />
            <span>طباعة</span>
          </button>

          <button
            onClick={async () => {
              const allowed = await checkAndRecordDownload(`تحميل رائز التقويم التشخيصي (${dossier.level})`);
              if (!allowed) return;
              try {
                toast.loading('جاري تحميل رائز التقويم التشخيصي...', { id: 'diag-test-word' });
                await downloadDiagnosticTestDocx(dossier);
                toast.success('تم تحميل رائز التقويم التشخيصي بنجاح!', { id: 'diag-test-word' });
              } catch (err) {
                toast.error('حدث خطأ أثناء تحميل ملف Word', { id: 'diag-test-word' });
              }
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>تحميل Word (.docx RTL)</span>
          </button>
        </div>
      </div>

      {/* Official Test Document Printable Canvas */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print:shadow-none print:border-none space-y-6" id="diagnostic-test-sheet">
        
        {/* Printable Header */}
        <div className="border-2 border-slate-800 rounded-2xl p-4 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center">
            {/* Right: Kingdom & Ministry */}
            <div className="text-right space-y-1">
              <p className="font-bold text-xs text-slate-800">المملكة المغربية</p>
              <p className="text-[11px] text-slate-600">وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
              <p className="text-[11px] text-slate-600">أكاديمية: {dossier.institutionInfo.academy}</p>
              <p className="text-[11px] text-slate-600">مديرية: {dossier.institutionInfo.directorate}</p>
              <p className="text-[11px] font-bold text-slate-700">مؤسسة: {dossier.institutionInfo.school || '....................'}</p>
            </div>

            {/* Center: Title */}
            <div className="space-y-1.5 border-y md:border-y-0 md:border-x border-slate-300 py-2 md:px-3">
              <div className="inline-block bg-indigo-100 text-indigo-900 font-black px-3 py-1 rounded-xl text-sm">
                رائز التقويم التشخيصي
              </div>
              <p className="font-bold text-xs text-slate-800">مادة الاجتماعيات (التاريخ - الجغرافيا - التربية على المواطنة)</p>
              <p className="text-xs font-semibold text-slate-700">
                المستوى: <span className="text-indigo-950 font-bold">{dossier.level}</span>
              </p>
              {dossier.prerequisiteLevel && (
                <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg inline-block">
                  المكتسبات القبلية المفحوصة: مكتسبات {dossier.prerequisiteLevel}
                </p>
              )}
            </div>

            {/* Left: Metadata */}
            <div className="text-left space-y-1">
              <p className="text-[11px] font-bold text-slate-700">الموسم الدراسي: {dossier.institutionInfo.academicYear}</p>
              <p className="text-[11px] text-slate-600">الأستاذ(ة): {dossier.institutionInfo.teacherName || '....................'}</p>
              <p className="text-[11px] text-slate-600">الفوج / القسم: {dossier.institutionInfo.classGroup || '....................'}</p>
              <p className="text-[11px] font-bold text-indigo-700">المدة: {dossier.test.duration}</p>
            </div>
          </div>
        </div>

        {/* Student Name and Score Blank */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
          <div className="sm:col-span-2 flex items-center gap-2">
            <span>اسم ونسب المتعلم(ة):</span>
            <span className="flex-1 border-b border-dotted border-slate-400"></span>
            <span>الرقم: ..........</span>
          </div>
          <div className="flex items-center justify-end gap-2 bg-red-50/80 px-3 py-1.5 rounded-xl border border-red-200 text-red-700">
            <span>النقطة:</span>
            <span className="font-black text-sm">..... / 20</span>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-xs space-y-1 text-amber-900">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <Sparkles size={14} />
            <span>توجيهات هامة للمتعلم:</span>
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-950/80 pr-2">
            {dossier.test.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {dossier.test.questions.map((q, qIdx) => {
            const qKey = q.id ? `${q.id}-${qIdx}` : `diag-q-${qIdx}`;
            const isExpanded = expandedQuestions[q.id] !== false; // default true
            return (
              <div 
                key={qKey}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Question Header */}
                <div 
                  onClick={() => toggleExpand(q.id)}
                  className="bg-slate-50 p-3.5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {q.number}
                    </span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      [{q.component}] {q.domain}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                      {q.prerequisiteSkill}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-lg">
                      {q.maxScore} نقط
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {/* Question Body */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white">
                    {/* Document Support if present */}
                    {q.documentSupport && (
                      <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-1.5 text-xs text-emerald-950">
                        <div className="flex items-center justify-between font-bold text-emerald-800">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={14} />
                            <span>دعامة مساعدة: {q.documentSupport.title} ({q.documentSupport.type})</span>
                          </span>
                        </div>
                        <p className="leading-relaxed bg-white/70 p-2.5 rounded-lg border border-emerald-100 font-serif text-slate-800 text-sm">
                          {q.documentSupport.content}
                        </p>
                        {q.documentSupport.source && (
                          <p className="text-[10px] text-emerald-700 italic">المصدر: {q.documentSupport.source}</p>
                        )}
                      </div>
                    )}

                    {/* Question Text */}
                    <div className="text-sm font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                      {q.questionText}
                    </div>

                    {/* Multiple Choice Options */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, i) => (
                          <div 
                            key={i} 
                            className="text-xs bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl font-medium text-slate-800 flex items-center gap-2"
                          >
                            <span className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center shrink-0"></span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Writing Answer Blank Line for Print */}
                    <div className="pt-2 space-y-2 border-t border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400">حيز الإجابة:</p>
                      <div className="border-b border-dotted border-slate-300 h-6"></div>
                      <div className="border-b border-dotted border-slate-300 h-6"></div>
                    </div>

                    {/* Answer Key & Criteria (Conditional) */}
                    {showAnswerKey && (
                      <div className="mt-3 bg-indigo-50/90 border border-indigo-200 p-3.5 rounded-xl space-y-1.5 text-xs text-indigo-950">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                          <CheckCircle2 size={14} className="text-indigo-600" />
                          <span>عناصر الإجابة النموذجية المعتمدة ({q.maxScore} نقطة):</span>
                        </div>
                        <p className="leading-relaxed text-slate-800 bg-white p-2.5 rounded-lg border border-indigo-100">
                          {q.expectedAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Official Footer Note */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          تم إعداد هذا الرائز وفق التوجيهات التربوية الرسمية والمقرر الوزاري لتنظيم السنة الدراسية - مادة الاجتماعيات
        </div>
      </div>
    </div>
  );
};
