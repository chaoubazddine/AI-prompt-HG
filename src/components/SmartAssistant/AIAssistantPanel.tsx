import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Minus, MessageSquareCode, Minimize2, Maximize2 } from 'lucide-react';
import { executeAssistantCommand } from '../../services/smartAssistantService';
import { StructuredLessonPlan, AssistantChatMessage } from '../../types/smartAssistant';

interface AIAssistantPanelProps {
  plan: StructuredLessonPlan;
  onPlanUpdated: (newPlan: StructuredLessonPlan, affectedSection: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  plan,
  onPlanUpdated,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'مرحباً بك أستاذي! أنا مساعدك التربوي المباشر داخل المحرر. أطلب مني أي تعديل على الجذاذة وسأقوم بتطبيق التعديل فورا.',
      timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const quickPrompts = [
    'اختصر الحصة إلى 45 دقيقة',
    'أضف نشاطًا جماعيًا مدته 10 دقائق',
    'ربط التقويم بأهداف الدرس',
    'اقترح وضعية مشكلة أخرى'
  ];

  const handleSendCommand = async (command: string) => {
    if (!command.trim() || isLoading) return;

    const userMsg: AssistantChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: command,
      timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await executeAssistantCommand(plan, command);
      onPlanUpdated(res.updatedPlan, res.affectedSectionName);

      const botMsg: AssistantChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `تم تحديث قسم (${res.affectedSectionName}) بنجاح!`,
        timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' }),
        affectedSection: res.affectedSectionName
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: AssistantChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `عذراً: ${err.message || 'حدث خطأ أثناء تنفيذ الأمر.'}`,
        timestamp: new Date().toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-5 left-5 z-50 bg-[#4F46E5] hover:bg-indigo-600 text-white p-3.5 rounded-full shadow-xl transition-all duration-300 flex items-center gap-2 group hover:scale-105"
        title="افتح مساعد الجذاذة"
      >
        <Bot size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-black hidden sm:inline pl-1">مساعد الجذاذة</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 px-4 py-2.5 flex items-center gap-3" dir="rtl">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-indigo-400" />
          <span className="text-xs font-black">مساعد الجذاذة (مصغّر)</span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
          title="توسيع"
        >
          <Maximize2 size={14} />
        </button>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          title="إغلاق"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-[calc(100vw-2rem)] max-w-[340px] sm:w-[350px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[440px] max-h-[75vh] transition-all duration-300" 
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-3.5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Bot size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black">🤖 مساعد الجذاذة الذكي</h4>
            <span className="text-[10px] text-indigo-300 block">أوامر وتعديلات مباشرة</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="تصغير"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="إغلاق"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50/70 text-right">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
          >
            <div
              className={`p-2.5 rounded-2xl text-xs leading-relaxed max-w-[90%] font-medium ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tl-none shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tr-none shadow-xs'
              }`}
            >
              {msg.text}
              {msg.affectedSection && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  ✓ المكون المحدث: {msg.affectedSection}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>جاري تحديث الجذاذة...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestions Chips */}
      <div className="p-2 bg-slate-100/80 border-t border-slate-200 shrink-0 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
        {quickPrompts.map(qp => (
          <button
            key={qp}
            onClick={() => handleSendCommand(qp)}
            disabled={isLoading}
            className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 px-2 py-1 rounded-lg shrink-0 transition-colors shadow-2xs"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          placeholder="اكتب أمراً بالجذاذة (مثال: أضف تقويماً مرحلياً)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand(inputText)}
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
        />
        <button
          onClick={() => handleSendCommand(inputText)}
          disabled={isLoading || !inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
