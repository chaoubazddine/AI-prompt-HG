import { Rocket, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="py-24 px-6 text-center max-w-4xl mx-auto relative">
      <div className="flex justify-center mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full w-24 h-24 mx-auto" />
        <div className="relative bg-slate-900/80 p-5 rounded-2xl text-indigo-400 border border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] backdrop-blur-xl">
          <Sparkles className="w-12 h-12" />
        </div>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 leading-tight tracking-tight">
        توليد أوامر الذكاء الاصطناعي
      </h1>
      
      <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-3xl mx-auto font-medium">
        أداة توليد أوامر الذكاء الاصطناعي هي خدمة مجانية متطورة تمكّنك من إنشاء برومبت ذكاء اصطناعي باحترافية
        عالية ودقة متناهية. صُممت هذه الأداة لدعم أشهر منصات الذكاء الاصطناعي مثل ChatGPT, Claude, Gemini,
        Grok وغيرها، مما يساعدك على تحسين جودة المخرجات وزيادة الإنتاجية للوصول إلى أفضل النتائج الممكنة.
      </p>
      
      <button className="relative group mx-auto flex items-center gap-3">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative bg-slate-950 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 text-white border border-white/10 hover:bg-slate-900 transition-colors">
          <Rocket className="w-6 h-6 text-pink-400" />
          <span>استشارات ذكاء اصطناعي</span>
        </div>
      </button>
    </section>
  );
}
