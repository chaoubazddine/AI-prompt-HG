import { useState } from 'react';
import { AudioLines, Stars, Send, Copy, Flame, Lightbulb } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Mode = 'simple' | 'advanced' | 'expert';

export default function PromptGenerator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('advanced');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult('');

    try {
      let systemInstruction = "";
      if (mode === 'simple') {
        systemInstruction = "قم بتحسين الأمر التالي ليكون أوضح وأكثر دقة لنماذج الذكاء الاصطناعي. أخرج النتيجة باللغة العربية.";
      } else if (mode === 'advanced') {
        systemInstruction = "أنت مساعد ذكي. قم بتحويل الفكرة التالية إلى أمر (Prompt) جيد ومفصل لنماذج الذكاء الاصطناعي. أخرج النتيجة باللغة العربية.";
      } else {
        systemInstruction = "أنت خبير عالمي في هندسة الأوامر (Prompt Engineering). قم بتحويل الفكرة البسيطة التالية إلى أمر احترافي ومفصل جداً ومناسب لنماذج الذكاء الاصطناعي المتقدمة مثل ChatGPT و Claude و Gemini. أضف السياق، والتعليمات الدقيقة، وتنسيق المخرجات المطلوب، والقيود. أخرج النتيجة باللغة العربية ومنسقة بشكل جميل باستخدام Markdown.";
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: input,
        config: {
          systemInstruction,
        }
      });

      setResult(response.text || '');
    } catch (error) {
      console.error("Error generating prompt:", error);
      setResult("حدث خطأ أثناء توليد الأمر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 mb-16 relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50"></div>
      <div className="relative bg-[#0a0f1e]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">توليد الأوامر</h2>
          <p className="text-slate-400">أدخل أفكارك الأولية وكافة تفاصيل طلبك ودع مولد الأوامر يفاجئك</p>
        </div>

        {/* Top Actions */}
        <div className="flex justify-between items-center mb-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 text-sm">
            <AudioLines className="w-4 h-4 text-indigo-400" />
            <span>تسجيل صوتي</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden sm:inline">يمكنك الكتابة أو استخدام التسجيل الصوتي</span>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-medium">
              <Stars className="w-3 h-3" />
              <span>برومبت ذكاء اصطناعي</span>
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative mb-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب فكرتك هنا..."
            className="w-full h-40 p-5 bg-[#030712]/50 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-slate-600 transition-all"
            maxLength={500}
          />
        </div>
        
        {/* Character Count */}
        <div className="text-left text-xs text-slate-500 mb-6">
          {input.length}/500
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <button 
            onClick={() => setMode('simple')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${mode === 'simple' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]' : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
          >
            <Flame className="w-5 h-5" />
            <span className="font-medium">بسيط</span>
          </button>
          
          <button 
            onClick={() => setMode('advanced')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${mode === 'advanced' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]' : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="font-medium">متقدم</span>
          </button>
          
          <button 
            onClick={() => setMode('expert')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 ${mode === 'expert' ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]' : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
          >
            <Stars className="w-5 h-5" />
            <span className="font-medium">خبير</span>
          </button>
        </div>
        
        <p className="text-center text-sm text-slate-500 mb-8 h-5">
          {mode === 'simple' && 'نموذج بسيط يقدم أوامر مباشرة وسريعة'}
          {mode === 'advanced' && 'نموذج متقدم يقدم ردود مدروسة ومفصلة'}
          {mode === 'expert' && 'نموذج خبير يقدم أوامر احترافية جداً ومعقدة'}
        </p>

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="relative w-full group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-500 group-disabled:hidden"></div>
          <div className="relative w-full bg-slate-900 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 text-white border border-white/10 transition-colors">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5 text-purple-400" />
                <span>توليد الأمر</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Result Area */}
      {result && (
        <div className="mt-8 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50"></div>
          <div className="relative bg-[#0a0f1e]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-500/30 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Stars className="w-5 h-5 text-indigo-400" />
                الأمر المحسّن:
              </h3>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
              >
                <Copy className="w-4 h-4" />
                <span>نسخ إلى الحافظة</span>
              </button>
            </div>
            <div className="prose prose-invert max-w-none rtl:prose-reverse prose-p:leading-relaxed">
              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed bg-[#030712]/50 p-6 rounded-xl border border-white/5 font-mono text-sm">
                {result}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
