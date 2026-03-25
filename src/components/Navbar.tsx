import { Wand2, Globe, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-[#030712]/60 backdrop-blur-xl py-4 px-6 sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-row-reverse">
        
        {/* Logo - visually on the left */}
        <div className="flex items-center gap-2 font-bold text-xl flex-row-reverse">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">GeneratePromptAI</span>
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Wand2 className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Navigation Links - visually on the right */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300 flex-row-reverse">
          <a href="#" className="hover:text-white transition-colors">الرئيسية</a>
          <a href="#" className="hover:text-white transition-colors">أعلن معنا</a>
          
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group">
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            <span>الموقع</span>
          </div>
          
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group">
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            <span>الخدمات</span>
          </div>
          
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors group">
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            <span>هندسة الذكاء الاصطناعي</span>
          </div>
          
          <a href="#" className="hover:text-white transition-colors">مكتبة الأوامر السرية</a>
          
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors border-l pl-4 border-white/10">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>English</span>
          </div>
        </div>

      </div>
    </nav>
  );
}
