import { 
  Wand, 
  ShieldCheck, 
  Aperture, 
  Film, 
  ScanText, 
  RefreshCcw, 
  Camera, 
  FileSearch, 
  Combine, 
  Store 
} from 'lucide-react';

const services = [
  {
    id: 'prompt-gen',
    title: 'توليد الأوامر',
    description: 'حوّل أفكارك إلى أوامر احترافية',
    icon: Wand,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-t-teal-500'
  },
  {
    id: 'prompt-check',
    title: 'فحص الأوامر',
    description: 'تحقق من جودة أوامرك',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-t-emerald-500'
  },
  {
    id: 'image-prompt',
    title: 'توليد أوامر الصور',
    description: 'أنشئ صوراً مذهلة بالذكاء الاصطناعي',
    icon: Aperture,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-t-amber-500'
  },
  {
    id: 'video-prompt',
    title: 'توليد أوامر الفيديو - VE03',
    description: 'أنشئ مقاطع فيديو مذهلة',
    icon: Film,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-t-rose-500'
  },
  {
    id: 'ai-detector',
    title: 'كاشف النصوص',
    description: 'اكتشف مصدر النصوص',
    icon: ScanText,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-t-indigo-500'
  },
  {
    id: 'humanizer',
    title: 'إعادة الصياغة',
    description: 'حوّل النصوص إلى أسلوب بشري',
    icon: RefreshCcw,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-t-cyan-500'
  },
  {
    id: 'img-to-prompt',
    title: 'محول الصور إلى أوامر',
    description: 'حوّل صورك إلى أوامر احترافية',
    icon: Camera,
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-t-fuchsia-500'
  },
  {
    id: 'img-to-text',
    title: 'تحويل الصورة إلى نص',
    description: 'استخراج النصوص من الصور',
    icon: FileSearch,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-t-sky-500'
  },
  {
    id: 'two-imgs-to-prompt',
    title: 'محول صورتين إلى أمر',
    description: 'حوّل صورتين إلى أمر واحد',
    icon: Combine,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-t-violet-500'
  },
  {
    id: 'product-desc',
    title: 'توليد وصف المنتجات',
    description: 'أنشئ أوصاف منتجات احترافية',
    icon: Store,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-t-orange-500'
  }
];

interface ServicesGridProps {
  onSelectService?: (id: string) => void;
  activeServiceId?: string | null;
}

export default function ServicesGrid({ onSelectService, activeServiceId }: ServicesGridProps) {
  const currentActiveId = activeServiceId || 'prompt-gen';

  return (
    <section className="max-w-7xl mx-auto px-6 mb-20 relative z-10" id="services">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">خدماتنا</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">اختر الخدمة التي تناسب احتياجاتك من بين مجموعة واسعة من أدوات الذكاء الاصطناعي</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {services.map((service) => {
          const isActive = currentActiveId === service.id;
          return (
            <div 
              key={service.id} 
              onClick={() => onSelectService?.(service.id)}
              className={`relative group rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[200px] overflow-hidden ${isActive ? 'bg-slate-800/80 border border-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] -translate-y-1' : 'bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10 hover:-translate-y-1'}`}
            >
              {/* Subtle background glow for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 ${isActive ? 'scale-110 bg-slate-950 shadow-inner border border-white/5' : 'bg-slate-950/50 group-hover:scale-110'}`}>
                <service.icon className={`w-8 h-8 ${service.color} drop-shadow-[0_0_10px_currentColor]`} />
              </div>
              <h3 className="font-bold text-slate-200 mb-2 relative z-10">{service.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">{service.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
