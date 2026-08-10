import React, { useState } from 'react';
import { Sparkles, Check, X, ArrowLeftRight, Bot } from 'lucide-react';
import { refineSectionWithAI } from '../../services/smartAssistantService';
import { StructuredLessonPlan } from '../../types/smartAssistant';

interface SectionRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: StructuredLessonPlan;
  sectionKey: string;
  sectionTitle: string;
  currentValue: any;
  onApplyProposal: (sectionKey: string, newValue: any) => void;
}

export const SectionRefinementModal: React.FC<SectionRefinementModalProps> = ({
  isOpen,
  onClose,
  plan,
  sectionKey,
  sectionTitle,
  currentValue,
  onApplyProposal,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<any | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateProposal = async () => {
    if (!instruction.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await refineSectionWithAI(plan, sectionKey, instruction, currentValue);
      setProposal(res);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء توليد المقترح.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = () => {
    if (proposal) {
      onApplyProposal(sectionKey, proposal);
      onClose();
    }
  };

  const renderValueText = (val: any) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" dir="rtl">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-base font-black">تحسين قسم بالذكاء الاصطناعي: {sectionTitle}</h3>
              <p className="text-xs text-slate-400">اكتب توجيهاً مخصصاً لتعديل هذا القسم فقط دون المساس بباقت الجذاذة</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">ما الذي تريد تحسينه في هذا القسم؟</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="مثال: اجعل الوضعية المشكلة أكثر ارتباطاً بواقع المتعلمين المباشر / اختصر صياغة الأهداف..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateProposal()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleGenerateProposal}
                disabled={isLoading || !instruction.trim()}
                className="bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                طلب اقتراح
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'ربط بواقع المتعلم',
                'اختصر الصياغة',
                'إضافة أسئلة أعمق',
                'مراعاة الفوارق الفردية'
              ].map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInstruction(chip)}
                  className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 rounded-lg transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Comparison View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Version */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-600">النسخة الأصلية الحالية</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">الحالية</span>
              </div>
              <div className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap max-h-60 overflow-y-auto p-1">
                {renderValueText(currentValue)}
              </div>
            </div>

            {/* AI Proposal Version */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                  <Sparkles size={14} />
                  اقتراح الذكاء الاصطناعي
                </span>
                {proposal && (
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">جديد</span>
                )}
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-indigo-600 space-y-2">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">جاري توليد الاقتراح الجديد...</span>
                </div>
              ) : proposal ? (
                <div className="text-xs text-indigo-950 leading-relaxed font-medium whitespace-pre-wrap max-h-60 overflow-y-auto p-1 bg-white/70 rounded-xl border border-indigo-100/50">
                  {renderValueText(proposal)}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  اكتب التوجيه واضغط "طلب اقتراح" لعرض النسخة البديلة للمقارنة هنا.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl"
          >
            الاحتفاظ بالنسخة الأصلية
          </button>

          <button
            type="button"
            onClick={handleAcceptProposal}
            disabled={!proposal}
            className="bg-[#4F46E5] hover:bg-indigo-600 disabled:opacity-50 text-white font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            <Check size={16} />
            اعتماد الاقتراح المحدث
          </button>
        </div>
      </div>
    </div>
  );
};
