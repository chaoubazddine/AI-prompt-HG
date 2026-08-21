import React, { useState } from 'react';
import { 
  RayadaJadhaData, 
  RayadaStep 
} from '../../types/rayada';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  UserCheck, 
  Users, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  Tv, 
  Clock, 
  Edit3, 
  Save, 
  FileText,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { downloadRayadaJadhaWord } from '../../utils/rayadaWordExport';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface RayadaJadhaViewProps {
  jadhaData: RayadaJadhaData;
  onUpdate?: (updated: RayadaJadhaData) => void;
}

export const RayadaJadhaView: React.FC<RayadaJadhaViewProps> = ({ jadhaData, onUpdate }) => {
  const [data, setData] = useState<RayadaJadhaData>(jadhaData);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const handleCopyText = () => {
    let plainText = `جذاذة التدريس الصريح - إعداديات الريادة 🌟\n`;
    plainText += `الدرس: ${data.title} | المستوى: ${data.level} | المكون: ${data.subject}\n`;
    plainText += `الكفاية المستهدفة: ${data.targetCompetency}\n\n`;
    plainText += `الأهداف التعلمية الصريحة:\n${data.explicitObjectives.map(o => `- ${o}`).join('\n')}\n\n`;
    plainText += `التذكير والتنشيط (5 دقائق): ${data.reactivation.questions.join(' | ')}\n`;
    plainText += `التصريح بالهدف: ${data.explicitGoalStatement}\n\n`;
    data.steps.forEach((s, idx) => {
      plainText += `--- المقطع ${idx + 1}: ${s.title} ---\n`;
      plainText += `1. النمذجة (أنا أفعل): ${s.modelage.teacherSpeech}\n`;
      plainText += `2. الممارسة الموجهة (نحن نفعل): ${s.guidedPractice.studentTask}\n`;
      plainText += `3. الممارسة المستقلة (أنت تفعل): ${s.independentPractice.taskDescription}\n`;
      plainText += `الخلاصة: ${s.synthesis.keyTakeaway}\n\n`;
    });
    plainText += `الإغلاق (تذكرة الخروج): ${data.closure.bilanQuestion}\n`;

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast.success('تم نسخ محتوى جذاذة الريادة بنجاح!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    try {
      toast.loading('جاري تحضير مستند Word لجذاذة الريادة بتنسيق الجداول العربية RTL...', { id: 'word-export' });
      await downloadRayadaJadhaWord(data);
      toast.success('تم تحميل مستند Word بنجاح!', { id: 'word-export' });
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل ملف Word', { id: 'word-export' });
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('rayada-jadha-print-area');
    if (!element) return;

    try {
      setIsExportingPDF(true);
      toast.loading('جاري توليد ملف PDF لجذاذة الريادة...', { id: 'pdf-toast' });

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
      pdf.save(`جذاذة_الريادة_${(data.title || "الدرس").replace(/\s+/g, '_')}.pdf`);

      toast.success('تم تحميل ملف PDF بنجاح!', { id: 'pdf-toast' });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error('عذراً، فشل تصدير ملف PDF.', { id: 'pdf-toast' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Top Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
            <Sparkles size={14} className="text-slate-950" />
            جذاذة التدريس الصريح 🌟 إعداديات الريادة
          </span>
          
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon size={14} />
              <span>جدول الجذاذة الرسمي (RTL)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>بطاقات التدريس الصريح</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isEditing ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? 'حفظ التعديلات' : 'تعديل الجذاذة'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>نسخ النص</span>
          </button>

          <button
            onClick={handlePrint}
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
            <FileText size={14} />
            <span>تحميل Word (.docx من اليمين لليسار)</span>
          </button>
        </div>
      </div>

      {/* Main Printable / Display Area */}
      <div 
        id="rayada-jadha-print-area" 
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-900"
        dir="rtl"
      >
        {/* Official Header Table (Moroccan Pioneer Schools standard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/40 rounded-2xl border border-indigo-100/80">
          <div className="space-y-1 text-center md:text-right text-xs text-slate-700">
            <p className="font-black text-slate-900">المملكة المغربية</p>
            <p className="text-[11px] text-slate-600">وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
            <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-black text-[11px] mt-1">
              <span>مشروع إعداديات الريادة</span>
              <Sparkles size={12} />
            </div>
            <p className="text-[11px] text-slate-500 font-bold">{data.schoolName || 'المؤسسة التعليمية'}</p>
          </div>

          <div className="text-center space-y-1 my-auto">
            <h2 className="text-base sm:text-lg font-black text-indigo-900">جذاذة التدريس الصريح (Enseignement Explicite)</h2>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 inline-block">
              {data.title}
            </h1>
            <p className="text-xs font-bold text-slate-600">
              المكون: <span className="text-indigo-700">{data.subject}</span> | المستوى: <span className="text-indigo-700">{data.level}</span>
            </p>
          </div>

          <div className="space-y-1 text-center md:text-left text-xs text-slate-600">
            <p>الموسم الدراسي: <strong className="text-slate-900">{data.academicYear}</strong></p>
            <p>الغلاف الزمني: <strong className="text-slate-900">{data.duration}</strong></p>
            <p>المرجع: <strong className="text-slate-800 text-[11px]">{data.references}</strong></p>
            <p>الأستاذ(ة): <strong className="text-slate-900">{data.teacherName || "...................."}</strong></p>
          </div>
        </div>

        {/* Competencies & Explicit Objectives Table */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
            <h3 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
              <BookOpen size={16} className="text-indigo-600" />
              الكفاية الأساسية المستهدفة
            </h3>
            {isEditing ? (
              <textarea
                className="w-full text-xs p-2 bg-white border border-indigo-200 rounded-xl leading-relaxed"
                rows={3}
                value={data.targetCompetency}
                onChange={(e) => setData({ ...data, targetCompetency: e.target.value })}
              />
            ) : (
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {data.targetCompetency}
              </p>
            )}
          </div>

          <div className="md:col-span-8 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2">
            <h3 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-amber-600" />
              الأهداف التعلمية الصريحة والمباشرة
            </h3>
            <ul className="space-y-1 text-xs text-slate-800 font-medium">
              {data.explicitObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step 0: Reactivation & Explicit Goal Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reactivation (التذكير والتنشيط) */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <Clock size={16} className="text-emerald-600" />
                1. محطة التذكير والتنشيط (Réactivation)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                {data.reactivation.duration}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-800">
              <p className="font-bold text-emerald-950">أسئلة استدعاء المكتسبات (بالألواح الفردية):</p>
              <ul className="space-y-1 pr-2">
                {data.reactivation.questions.map((q, i) => (
                  <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1">
                    <span className="font-black text-emerald-700 shrink-0">س{i + 1}:</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-emerald-100 text-[11px] space-y-1 text-emerald-900">
                <p><span className="font-bold">آلية التفعيل:</span> {data.reactivation.activationMechanism}</p>
                <p><span className="font-bold">جسر الربط:</span> {data.reactivation.linkToNewLesson}</p>
              </div>
            </div>
          </div>

          {/* Explicit Goal Announcement (التصريح بالهدف) */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-indigo-600" />
                2. التصريح بالهدف التعلمي (Objectif Explicite)
              </h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                عقد ديداكتيكي
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-200/80 shadow-2xs">
              <p className="text-xs font-black text-indigo-950 leading-relaxed">
                "{data.explicitGoalStatement}"
              </p>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1">
              <Tv size={14} className="text-indigo-600" />
              <span>{data.pedagogicalTools.digitalSupport} + {data.pedagogicalTools.individualTools}</span>
            </div>
          </div>
        </div>

        {/* ===================== VIEW MODE 1: OFFICIAL RTL TABLE ===================== */}
        {viewMode === 'table' ? (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TableIcon size={18} className="text-indigo-600" />
                جدول التدبير الديداكتيكي لمقاطع الدرس (من اليمين إلى اليسار)
              </h3>
              <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                مطابق لهندسة إعداديات الريادة
              </span>
            </div>

            <div className="space-y-6">
              {data.steps.map((step, idx) => (
                <div key={idx} className="overflow-x-auto rounded-2xl border border-slate-300 shadow-2xs">
                  <table className="w-full text-right border-collapse text-xs" dir="rtl">
                    <thead>
                      {/* Top Step Banner */}
                      <tr className="bg-slate-900 text-white">
                        <th colSpan={4} className="p-3 font-black text-sm text-right">
                          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md ml-2 font-black text-xs">
                            المقطع {idx + 1}
                          </span>
                          {step.title}
                        </th>
                      </tr>
                      {/* Table Column Headers: Right to Left */}
                      <tr className="border-b border-slate-300 text-white font-black text-xs">
                        <th className="p-3 w-[20%] bg-slate-800 border-l border-slate-700 text-center">
                          المقطع والدعامة والمهارة
                        </th>
                        <th className="p-3 w-[30%] bg-blue-700 border-l border-blue-600 text-center">
                          1. النمذجة (Modelage)
                          <div className="text-[10px] font-normal opacity-90">[أنا أفعل - Je fais]</div>
                        </th>
                        <th className="p-3 w-[27%] bg-amber-600 border-l border-amber-500 text-center">
                          2. الممارسة الموجهة (Pratique guidée)
                          <div className="text-[10px] font-normal opacity-90">[نحن نفعل - Nous faisons]</div>
                        </th>
                        <th className="p-3 w-[23%] bg-emerald-700 text-center">
                          3. الممارسة المستقلة (Pratique autonome)
                          <div className="text-[10px] font-normal opacity-90">[أنت تفعل - Tu fais]</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Main Explicit Engineering Row */}
                      <tr className="align-top border-b border-slate-300 divide-x divide-x-reverse divide-slate-200">
                        {/* Col 1 (Right): Segment, Skill, Doc */}
                        <td className="p-3 bg-slate-50 space-y-2">
                          <p className="font-black text-indigo-900">{step.title}</p>
                          <div className="text-[11px] text-slate-700">
                            <span className="font-bold text-slate-900">المهارة المستهدفة:</span>
                            <p className="text-indigo-700 font-bold">{step.targetSkill}</p>
                          </div>
                          <div className="text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                            <span className="font-bold text-slate-900">الدعامة:</span>
                            <p className="font-bold">{step.document.title}</p>
                            <p className="text-[10px] text-slate-500">{step.document.type} | {step.document.reference}</p>
                          </div>
                        </td>

                        {/* Col 2: Modelage (Je fais) */}
                        <td className="p-3 bg-blue-50/50 space-y-2.5">
                          <div>
                            <span className="font-black text-blue-900 text-[11px]">التفكير بصوت مسموع (Verbalisation):</span>
                            <p className="text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-blue-100 mt-1 leading-relaxed">
                              "{step.modelage.teacherSpeech}"
                            </p>
                          </div>
                          <div>
                            <span className="font-black text-blue-900 text-[11px]">خطوات النمذجة الإجرائية:</span>
                            <ul className="space-y-1 mt-1 pr-1 text-[11px] text-slate-700">
                              {step.modelage.demonstrationSteps.map((ds, sIdx) => (
                                <li key={sIdx} className="flex items-start gap-1">
                                  <span className="font-bold text-blue-600 shrink-0">•</span>
                                  <span>{ds}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-1.5 border-t border-blue-200 text-[11px] text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                            <span className="font-black">النموذج المحلول:</span> {step.modelage.workedExample}
                          </div>
                        </td>

                        {/* Col 3: Guided Practice (Nous faisons) */}
                        <td className="p-3 bg-amber-50/50 space-y-2.5">
                          <div>
                            <span className="font-black text-amber-900 text-[11px]">المهمة الموجهة:</span>
                            <p className="text-[11px] text-slate-800 font-bold bg-white p-2 rounded-lg border border-amber-100 mt-1 leading-relaxed">
                              {step.guidedPractice.studentTask}
                            </p>
                            <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                              صيغة العمل: {step.guidedPractice.collaborationType}
                            </span>
                          </div>
                          <div>
                            <span className="font-black text-amber-900 text-[11px]">التحقق السريع من الفهم (CFU):</span>
                            <ul className="space-y-1 mt-1 pr-1 text-[11px] text-slate-700">
                              {step.guidedPractice.checkpoints.map((cp, cIdx) => (
                                <li key={cIdx} className="flex items-start gap-1">
                                  <span className="font-bold text-amber-600 shrink-0">؟</span>
                                  <span>{cp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-1.5 border-t border-amber-200 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-900">التغذية الراجعة:</span> {step.guidedPractice.feedbackProtocol}
                          </div>
                        </td>

                        {/* Col 4 (Left): Independent Practice (Tu fais) */}
                        <td className="p-3 bg-emerald-50/50 space-y-2.5">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-black text-emerald-900 text-[11px]">نشاط الكراسة:</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                {step.independentPractice.timeAllocation}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-800 font-bold bg-white p-2 rounded-lg border border-emerald-100 mt-1 leading-relaxed">
                              {step.independentPractice.taskDescription}
                            </p>
                          </div>
                          <div className="p-2 bg-emerald-100/60 rounded-lg text-[11px] text-emerald-950 space-y-1">
                            <span className="font-black text-emerald-900">معيار النجاح:</span>
                            <p>{step.independentPractice.successCriteria}</p>
                          </div>
                        </td>
                      </tr>

                      {/* Synthesis Row (الأثر الكتابي) */}
                      <tr className="bg-indigo-50/60 border-t border-slate-300">
                        <td className="p-3 font-black text-indigo-950 text-center bg-indigo-100/70 border-l border-indigo-200">
                          التركيب والأثر الكتابي
                          <div className="text-[10px] font-normal text-indigo-700">(Trace écrite)</div>
                        </td>
                        <td colSpan={3} className="p-3 space-y-1 text-xs">
                          <p className="text-slate-900 font-bold leading-relaxed">
                            • الخلاصة المدونة في الدفتر: <span className="font-normal">{step.synthesis.keyTakeaway}</span>
                          </p>
                          <p className="text-indigo-900 font-bold text-[11px]">
                            • المفاهيم والمصطلحات المهيكلة: <span className="font-black text-indigo-700">{step.synthesis.coreConcepts.join(" | ")}</span>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ===================== VIEW MODE 2: INTERACTIVE CARDS ===================== */
          <div className="space-y-6 pt-2">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                هندسة مقاطع وأنشطة الدرس بالتدريس الصريح (عرض البطاقات)
              </h3>
            </div>

            {data.steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50/70 p-5 rounded-3xl border border-slate-200 space-y-4 shadow-2xs"
              >
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      المقطع التعليمي {idx + 1}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1">{step.title}</h4>
                  </div>
                  <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                    الدعامة: <span className="text-indigo-700">{step.document.title}</span> ({step.document.reference})
                  </div>
                </div>

                {/* Explicit Triad Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* 1. MODELAGE (أنا أفعل) */}
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <User size={13} />
                        1. النمذجة (أنا أفعل)
                      </span>
                      <span className="text-[10px] font-bold text-blue-800">Modelage</span>
                    </div>

                    <p className="text-[11px] text-blue-950 font-bold leading-relaxed bg-white p-2.5 rounded-xl border border-blue-100">
                      "{step.modelage.teacherSpeech}"
                    </p>

                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-blue-900">خطوات النمذجة التوضيحية:</p>
                      <ul className="space-y-1 pr-1 text-[11px] text-slate-700">
                        {step.modelage.demonstrationSteps.map((ds, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1">
                            <span className="font-bold text-blue-600 shrink-0">•</span>
                            <span>{ds}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-blue-200/60 text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="font-black">النموذج المحلول:</span> {step.modelage.workedExample}
                    </div>
                  </div>

                  {/* 2. GUIDED PRACTICE (نحن نفعل) */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <Users size={13} />
                        2. الممارسة الموجهة (نحن نفعل)
                      </span>
                      <span className="text-[10px] font-bold text-amber-800">Pratique Guidée</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-amber-100 text-[11px] text-amber-950">
                      <p className="font-black mb-1">المهمة الموجهة:</p>
                      <p className="leading-relaxed">{step.guidedPractice.studentTask}</p>
                      <span className="inline-block mt-1.5 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                        {step.guidedPractice.collaborationType}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-amber-900">التحقق السريع من الفهم (CFU):</p>
                      <ul className="space-y-1 pr-1 text-[11px] text-slate-700">
                        {step.guidedPractice.checkpoints.map((cp, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1">
                            <span className="font-bold text-amber-600 shrink-0">؟</span>
                            <span>{cp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 text-[11px] text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900">التغذية الراجعة:</span> {step.guidedPractice.feedbackProtocol}
                    </div>
                  </div>

                  {/* 3. INDEPENDENT PRACTICE (أنت تفعل) */}
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <UserCheck size={13} />
                        3. الممارسة المستقلة (أنت تفعل)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800">Pratique Autonome</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-950">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black">تمرين كراسة الأنشطة:</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          {step.independentPractice.timeAllocation}
                        </span>
                      </div>
                      <p className="leading-relaxed">{step.independentPractice.taskDescription}</p>
                    </div>

                    <div className="p-2.5 bg-emerald-100/50 rounded-xl text-[11px] text-emerald-950 space-y-1">
                      <p className="font-black text-emerald-900">معيار النجاح والتثبيت:</p>
                      <p>{step.independentPractice.successCriteria}</p>
                    </div>
                  </div>
                </div>

                {/* Synthesis & Notebook Writing */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        الخلاصة المدونة في الدفتر:
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-bold">
                        {step.synthesis.coreConcepts.map((c, ci) => (
                          <span key={ci} className="bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {step.synthesis.keyTakeaway}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Closure & Remediation Footer Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Closure (الإغلاق والتقويم الختامي) */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                الإغلاق والتقويم التكويني (Bilan & Clôture)
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                {data.closure.duration}
              </span>
            </div>
            <p className="text-xs font-bold leading-relaxed text-slate-100">
              تذكرة الخروج (Exit Ticket): "{data.closure.bilanQuestion}"
            </p>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
              <span>التقنية: {data.closure.exitTicketTechnique}</span>
              <span className="text-amber-300 font-bold">العتبة: {data.closure.successThreshold}</span>
            </div>
          </div>

          {/* Remediation Hints (معالجة التعثرات الفورية) */}
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/80 space-y-2">
            <h3 className="text-xs font-black text-rose-900 flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-rose-600" />
              معالجة التعثرات والتمثلات الشائعة (Remédiation)
            </h3>
            <ul className="space-y-1 text-xs text-rose-950">
              {data.remediationHints.commonMisconceptions.map((cm, cmi) => (
                <li key={cmi} className="flex items-start gap-1">
                  <span className="font-bold text-rose-600">•</span>
                  <span>تمثل خاطئ: {cm}</span>
                </li>
              ))}
            </ul>
            <div className="pt-1.5 border-t border-rose-200 text-xs text-slate-800 font-bold">
              التدخل الفوري: {data.remediationHints.immediateFix}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
