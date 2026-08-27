import React, { useState } from 'react';
import { RayadaTarlTest } from '../../types/rayada';
import { 
  Sparkles, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Layers, 
  Award,
  BookOpen
} from 'lucide-react';
import { downloadRayadaTarlWord } from '../../utils/rayadaWordExport';
import { checkAndRecordDownload } from '../../services/usageTracker';
import { toast } from 'sonner';

interface RayadaTarlViewProps {
  tarlData: RayadaTarlTest;
}

export const RayadaTarlView: React.FC<RayadaTarlViewProps> = ({ tarlData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text = `رائز التموضع والتشخيص (TaRL مادة الاجتماعيات)\nالمستوى: ${tarlData.level} | المكون: ${tarlData.subject}\nالمجال: ${tarlData.domain}\n\n`;
    tarlData.diagnosticLevels.forEach((l, i) => {
      text += `المستوى ${i + 1}: ${l.levelName}\nالنشاط: ${l.testItem}\nالتعليمة: ${l.instruction}\nالمعيار: ${l.passCriteria}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('تم نسخ محتوى رائز TaRL بنجاح!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = async () => {
    const allowed = await checkAndRecordDownload(`تحميل رائز TaRL (Word): ${tarlData.level} - ${tarlData.subject}`);
    if (!allowed) return;

    try {
      toast.loading('جاري تحميل رائز TaRL كملف Word...', { id: 'tarl-word' });
      await downloadRayadaTarlWord(tarlData);
      toast.success('تم تحميل مستند Word بنجاح!', { id: 'tarl-word' });
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل ملف Word', { id: 'tarl-word' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles size={14} />
            رائز التموضع والتشخيص (TaRL الاجتماعيات)
          </span>
          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
            {tarlData.level} - {tarlData.subject}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>نسخ الرائز</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>طباعة</span>
          </button>

          <button
            onClick={handleDownloadWord}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Download size={14} />
            <span>تحميل Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-slate-900" dir="rtl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-emerald-50/80 via-white to-indigo-50/40 rounded-2xl border border-emerald-100 text-center space-y-1.5">
          <span className="inline-block bg-emerald-100 text-emerald-900 px-3 py-0.5 rounded-full font-black text-xs">
            بروتوكول TaRL الاجتماعيات - إعداديات الريادة 🌟
          </span>
          <h2 className="text-lg font-black text-slate-900">
            رائز التموضع التشخيصي: {tarlData.domain}
          </h2>
          <p className="text-xs text-slate-600 font-bold">
            المستوى: {tarlData.level} | المكون: {tarlData.subject}
          </p>
        </div>

        {/* 4 Diagnostic Levels */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Layers size={18} className="text-emerald-600" />
            المسار التشخيصي المتدرج (4 عتبات تموضع)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tarlData.diagnosticLevels.map((lvl, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    المستوى {idx + 1}: {lvl.levelName}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 leading-relaxed">
                  {lvl.testItem}
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <p><span className="font-bold text-slate-800">التعليمة:</span> {lvl.instruction}</p>
                  <p className="text-emerald-800 font-bold"><span className="font-black">معيار المرور:</span> {lvl.passCriteria}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leveling Grid */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Award size={18} className="text-indigo-600" />
            شبكة تفيؤ المتعلمين وحصص الدخل العلاجي المستهدف
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 border border-slate-800">الفئة المستهدفة</th>
                  <th className="p-3 border border-slate-800">الحاجة البيداغوجية المرصودة</th>
                  <th className="p-3 border border-slate-800 bg-emerald-900 text-emerald-100">التدخل العلاجي المقترح</th>
                </tr>
              </thead>
              <tbody>
                {tarlData.levelingGrid.map((grid, gIdx) => (
                  <tr key={gIdx} className="hover:bg-slate-50">
                    <td className="p-3 border border-slate-200 font-black text-slate-900 bg-slate-50">
                      {grid.studentProfile}
                    </td>
                    <td className="p-3 border border-slate-200 text-slate-700 font-medium">
                      {grid.identifiedNeed}
                    </td>
                    <td className="p-3 border border-slate-200 text-emerald-950 bg-emerald-50/50 font-bold">
                      {grid.targetedIntervention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
