import React, { useState } from 'react';
import { RayadaExamData } from '../../types/rayada';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Layers, 
  Grid, 
  ListChecks, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { downloadRayadaExamWord } from '../../utils/rayadaWordExport';
import { checkAndRecordDownload } from '../../services/usageTracker';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface RayadaExamViewProps {
  examData: RayadaExamData;
}

export const RayadaExamView: React.FC<RayadaExamViewProps> = ({ examData }) => {
  const [activeTab, setActiveTab] = useState<'exam' | 'answers' | 'rubric' | 'remediation'>('exam');
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleCopy = () => {
    let text = `${examData.title}\nالمستوى: ${examData.level} | الدورة: ${examData.term}\n\n`;
    text += `${examData.situation1.title}\n`;
    examData.situation1.tasks.forEach((t, i) => {
      text += `${i + 1}. ${t.question} (${t.points}ن)\n`;
    });
    text += `\n${examData.situation2.title}\nالوثيقة: ${examData.situation2.document.title}\n${examData.situation2.document.content}\n`;
    examData.situation2.questions.forEach(q => {
      text += `س${q.questionNumber}: ${q.questionText} (${q.points}ن)\n`;
    });
    text += `\n${examData.situation3.title}\n${examData.situation3.contextText}\n`;
    examData.situation3.guidelines.forEach(g => {
      text += `- ${g}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('تم نسخ الفرض بنجاح!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = async () => {
    const allowed = await checkAndRecordDownload(`تحميل فرض الريادة (Word): ${examData.title} (${examData.level})`);
    if (!allowed) return;

    try {
      toast.loading('جاري تجهيز مستند Word لفرض وشبكة الريادة...', { id: 'exam-word' });
      await downloadRayadaExamWord(examData);
      toast.success('تم تحميل مستند Word بنجاح!', { id: 'exam-word' });
    } catch (err) {
      toast.error('حدث خطأ أثناء تصدير Word', { id: 'exam-word' });
    }
  };

  const handleDownloadPDF = async () => {
    const allowed = await checkAndRecordDownload(`تحميل فرض الريادة (PDF): ${examData.title} (${examData.level})`);
    if (!allowed) return;

    const element = document.getElementById('rayada-exam-print-area');
    if (!element) return;

    try {
      setIsExportingPDF(true);
      toast.loading('جاري تصدير ملف PDF للفرض...', { id: 'pdf-toast' });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`فرض_الريادة_${(examData.title || "الفرض").replace(/\s+/g, '_')}.pdf`);

      toast.success('تم تحميل ملف PDF بنجاح!', { id: 'pdf-toast' });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error('عذراً، فشل تصدير ملف PDF.', { id: 'pdf-toast' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'exam' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>نص الفرض (المتعلم)</span>
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'answers' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>عناصر الإجابة</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'rubric' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid size={14} />
            <span>شبكة التنقيط المعيارية</span>
          </button>

          <button
            onClick={() => setActiveTab('remediation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'remediation' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw size={14} />
            <span>خطة المعالجة البعدية</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>نسخ</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>طباعة</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download size={14} />
            <span>تصدير PDF</span>
          </button>

          <button
            onClick={handleDownloadWord}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Download size={14} />
            <span>تصدير Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div 
        id="rayada-exam-print-area" 
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-900"
        dir="rtl"
      >
        {/* Official Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 rounded-2xl border border-indigo-100/80">
          <div className="space-y-1 text-center md:text-right text-xs text-slate-700">
            <p className="font-black text-slate-900">المملكة المغربية</p>
            <p className="text-[11px] text-slate-600">وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
            <span className="inline-block bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-black text-[11px]">
              مشروع إعداديات الريادة 🌟
            </span>
          </div>

          <div className="text-center space-y-1 my-auto">
            <h2 className="text-base sm:text-lg font-black text-indigo-900">{examData.title}</h2>
            <p className="text-xs font-bold text-slate-700">
              مادة الاجتماعيات | <span className="text-indigo-700 font-black">{examData.level}</span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">الدورة: {examData.term} | المدة: {examData.duration}</p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <p className="text-slate-600">الاسم والنسب: .......................................</p>
            <p className="text-slate-600">القسم: ................... الرقم: ....................</p>
            <p className="font-black text-rose-600 text-sm text-center pt-1 border-t border-slate-100">
              النقطة: ............. / 20
            </p>
          </div>
        </div>

        {/* TAB 1: EXAM QUESTIONS (STUDENT PAPER) */}
        {activeTab === 'exam' && (
          <div className="space-y-6">
            {/* Situation 1: أسئلة المفاهيم والتطبيقات الموضوعية */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-indigo-900">{examData.situation1.title}</h3>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {examData.situation1.totalPoints} نقط
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {examData.situation1.tasks.map((task, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-xs">
                        <span className="font-black text-indigo-700">س{idx + 1}:</span> {task.question}
                      </p>
                      <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        ({task.points} ن)
                      </span>
                    </div>

                    {task.options && task.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {task.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                            • <strong className="text-slate-900">{opt}:</strong> ................................................................
                          </div>
                        ))}
                      </div>
                    )}

                    {task.tableHeaders && task.tableRows && (
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-center border-collapse border border-slate-300 text-[11px]">
                          <thead>
                            <tr className="bg-slate-100">
                              {task.tableHeaders.map((th, thIdx) => (
                                <th key={thIdx} className="border border-slate-300 p-2 font-black text-slate-800">
                                  {th}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {task.tableRows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="border border-slate-300 p-2 text-slate-700">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Situation 2: الاشتغال على وثيقة */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-indigo-900">{examData.situation2.title}</h3>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {examData.situation2.totalPoints} نقط
                </span>
              </div>

              {/* Document Display */}
              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-indigo-900 border-b border-indigo-100 pb-1.5">
                  <span>{examData.situation2.document.title}</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    {examData.situation2.document.docType}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed py-1 font-medium">
                  {examData.situation2.document.content}
                </p>
                <p className="text-[10px] text-slate-500 text-left pt-1 border-t border-slate-100">
                  المصدر: {examData.situation2.document.source}
                </p>
              </div>

              {/* Document Questions */}
              <div className="space-y-3 pt-1">
                {examData.situation2.questions.map((q, qIdx) => (
                  <div key={`s2-q-${qIdx}-${q.questionNumber || ''}`} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-bold text-slate-900">
                        <span className="font-black text-indigo-700">س{q.questionNumber}:</span> {q.questionText}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                          {q.skillTarget}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          ({q.points} ن)
                        </span>
                      </div>
                    </div>
                    <div className="h-6 border-b border-dotted border-slate-300 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Situation 3: إنتاج فقرة / موضوع موجز */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-black text-indigo-900">{examData.situation3.title}</h3>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {examData.situation3.totalPoints} نقط
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-slate-900 leading-relaxed font-medium">
                  <span className="font-bold text-amber-900">سياق الانطلاق: </span>
                  {examData.situation3.contextText}
                </div>

                <div className="space-y-1.5">
                  <p className="font-black text-slate-900">المطلوب تحريره بدقة:</p>
                  <ul className="space-y-1 pr-2">
                    {examData.situation3.guidelines.map((g, gi) => (
                      <li key={gi} className="text-slate-800 flex items-start gap-1.5 font-medium">
                        <span className="font-bold text-indigo-600">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-700 font-bold border border-slate-200">
                  {examData.situation3.formatRequirement}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANSWER KEY (عناصر الإجابة) */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                عناصر الإجابة النموذجية ودليل التصحيح
              </h3>
            </div>

            {/* Situation 1 Answers */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-900">1. عناصر إجابة الوضعية الأولى (6 نقط):</h4>
              <div className="space-y-2 text-xs">
                {examData.answerKey.situation1Answers.map((ans, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{ans.question}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black">({ans.points}ن)</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pr-2 font-medium">{ans.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Situation 2 Answers */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-900">2. عناصر إجابة الوضعية الثانية (الاشتغال على وثيقة - 7 نقط):</h4>
              <div className="space-y-2 text-xs">
                {examData.answerKey.situation2Answers.map((ans, ansIdx) => (
                  <div key={`ans2-${ansIdx}-${ans.questionNumber || ''}`} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>السؤال {ans.questionNumber}:</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black">({ans.points}ن)</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pr-2 font-medium">{ans.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Situation 3 Guide */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-900">3. دليل تصحيح الموضوع الإنتاجي (7 نقط):</h4>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-indigo-900">
                  • الجانب المنهجي والشكلي ({examData.answerKey.situation3AnswerGuide.methodologicalPoints}ن): {examData.answerKey.situation3AnswerGuide.methodologicalNotes}
                </p>
                <div className="space-y-1">
                  <p className="font-black text-slate-900">المضامين المعرفية المستهدفة في العرض:</p>
                  <ul className="space-y-1 pr-2">
                    {examData.answerKey.situation3AnswerGuide.knowledgeContent.map((kc, kci) => (
                      <li key={kci} className="text-slate-700 font-medium">• {kc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CRITERION-REFERENCED RUBRIC (شبكة التنقيط المعيارية) */}
        {activeTab === 'rubric' && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <Grid size={18} className="text-amber-600" />
                شبكة التنقيط المعيارية (Grille d'évaluation critériée)
              </h3>
              <p className="text-xs text-amber-800 mt-1 font-medium">
                تُعتمد هذه الشبكة لتحديد مستوى تمكن المتعلم وتفيؤ النتائج إلى ثلاث درجات تحكم واضحة.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-indigo-900 text-white text-center">
                    <th className="p-3 border border-indigo-800">المعيار والمهارة</th>
                    <th className="p-3 border border-indigo-800 bg-emerald-800 text-emerald-100">متحكم (Acquis)</th>
                    <th className="p-3 border border-indigo-800 bg-amber-800 text-amber-100">في طور التحكم</th>
                    <th className="p-3 border border-indigo-800 bg-rose-800 text-rose-100">غير متحكم (Non acquis)</th>
                  </tr>
                </thead>
                <tbody>
                  {examData.rubric.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      <td className="p-3 border border-slate-200 bg-slate-50 font-medium">
                        <p className="font-black text-slate-900">{row.criterion}</p>
                        <p className="text-[11px] text-slate-500">{row.subSkill}</p>
                        <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                          الحد الأقصى: {row.maxPoints} نقط
                        </span>
                      </td>
                      <td className="p-3 border border-slate-200 text-emerald-950 bg-emerald-50/50 leading-relaxed font-medium">
                        {row.masteryIndicators.acquired}
                      </td>
                      <td className="p-3 border border-slate-200 text-amber-950 bg-amber-50/50 leading-relaxed font-medium">
                        {row.masteryIndicators.inProgress}
                      </td>
                      <td className="p-3 border border-slate-200 text-rose-950 bg-rose-50/50 leading-relaxed font-medium">
                        {row.masteryIndicators.notAcquired}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REMEDIATION PLAN (خطة المعالجة البعدية) */}
        {activeTab === 'remediation' && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
              <h3 className="text-sm font-black text-rose-950 flex items-center gap-2">
                <RotateCcw size={18} className="text-rose-600" />
                خطة المعالجة والدعم البعدي للتعثرات (Plan de Remédiation)
              </h3>
              <p className="text-xs text-rose-800 mt-1 font-medium">
                أنشطة علاجية جاهزة لتدبير حصة الدعم المندمج لمعالجة الثغرات المرصودة في الفرض.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {examData.remediationPlan.map((plan, pIdx) => (
                <div key={pIdx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-black text-slate-900">{plan.difficultyArea}</h4>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                      {plan.activityFormat}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-rose-700 font-bold">مظهر النقص المرصود:</p>
                    <p className="text-slate-700 leading-relaxed font-medium">{plan.observedDeficit}</p>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                    <p className="text-[11px] text-emerald-900 font-black">النشاط العلاجي المقترح:</p>
                    <p className="text-emerald-950 leading-relaxed font-medium">{plan.remedialActivity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
