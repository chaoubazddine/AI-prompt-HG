import { Keyboard, Microchip, Send, Activity, Network, Crosshair } from 'lucide-react';

export default function InfoSections() {
  return (
    <div className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
      
      {/* How to use section */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            كيفية استخدام أداة توليد أوامر الذكاء الاصطناعي الفوري الخاص بنا ؟
          </h2>
          <p className="text-slate-400 flex items-center justify-center gap-2">
            اتبع هذه الخطوات البسيطة لتوليد أوامر الذكاء الاصطناعي بشكل احترافي في ثوان.
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs font-bold border border-indigo-500/30">دليل ChatGPT</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative group bg-[#0a0f1e]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Keyboard className="w-8 h-8 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 relative z-10">أدخل فكرتك</h3>
            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
              ابدأ بإدخال المهمة التي تريد تنفيذها أو الهدف الذي تسعى لتحقيقه. سواء كنت بحاجة إلى توليد محتوى، برمجة أكواد، أو تحليل بيانات، فإن أداة توليد أوامر الذكاء الاصطناعي لدينا قادرة على فهم أي مدخل وتحويله إلى أمر دقيق.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative group bg-[#0a0f1e]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <Microchip className="w-8 h-8 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 relative z-10">تحسين فوري بالذكاء الاصطناعي</h3>
            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
              يقوم نظامنا الذكي بتحليل المدخلات بعمق، ثم توليد أمر محسن ومتوافق مع مختلف نماذج الذكاء الاصطناعي مثل ChatGPT و Claude و Gemini وغيرها. تعتمد أداة توليد أوامر الذكاء الاصطناعي على أساليب متقدمة لضمان أن تكون الأوامر أكثر تفصيلاً ووضوحاً للحصول على أوامر دقيقة وفعالة.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative group bg-[#0a0f1e]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform duration-300">
              <Send className="w-8 h-8 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 relative z-10">النتيجة النهائية</h3>
            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
              بعد ثوانٍ فقط، ستظهر أمامك الأوامر الجاهزة للاستخدام. يمكنك نسخها ولصقها مباشرة في النموذج الذي تختاره، أو تعديلها لتحسين دقتها وفقاً لاحتياجاتك الخاصة، مما يمنحك تحكم كامل في تجربة الذكاء الاصطناعي الخاصة بك.
            </p>
          </div>
        </div>
      </section>

      {/* Why choose section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            لماذا تختار أداة توليد أوامر الذكاء الاصطناعي ؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="relative group bg-[#0a0f1e]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-8 h-8 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 relative z-10">تحسين فوري لأوامرك</h3>
            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
              استفد من تقنيات الذكاء الاصطناعي المتقدمة لتحسين أوامرك فوراً، مما يجعلها أكثر دقة وكفاءة للحصول على أفضل النتائج.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative group bg-[#0a0f1e]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <Network className="w-8 h-8 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 relative z-10">تحليل ذكي ومتقدم</h3>
            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
              يعتمد نظامنا على تقنيات تحليل متطورة لفهم سياق أوامرك بدقة، مما يساعد على تقديم أوامر محسنة تلبي احتياجاتك بشكل مثالي.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative group bg-[#0a0f1e]/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 text-center hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-6 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform duration-300">
              <Crosshair className="w-8 h-8 drop-shadow-[0_0_8px_currentColor]" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-4 relative z-10">نتائج دقيقة</h3>
            <p className="text-slate-400 leading-relaxed text-sm relative z-10">
              احصل على استجابات أكثر دقة وملاءمة من نماذج الذكاء الاصطناعي بفضل الأوامر المحسنة التي تضمن لك أداءً احترافياً في كل مرة.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
