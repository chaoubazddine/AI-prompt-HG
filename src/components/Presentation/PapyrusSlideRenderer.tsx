import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  FileText, 
  MapPin, 
  Compass, 
  Clock, 
  Award, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Eye,
  EyeOff,
  CheckSquare
} from 'lucide-react';
import { PresentationSlide, PresentationData } from '../../types/presentation';

interface PapyrusSlideRendererProps {
  slide: PresentationSlide;
  slideIndex: number;
  totalSlides: number;
  presentation: PresentationData;
  isEditing: boolean;
  onUpdateSlide: (field: string, val: any) => void;
  revealedAnswers: Record<string, boolean>;
  userSelectedAnswers: Record<string, string>;
  onSelectOption: (slideId: string, option: string) => void;
  onToggleAnswerReveal: (slideId: string) => void;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
}

export const PapyrusSlideRenderer: React.FC<PapyrusSlideRendererProps> = ({
  slide,
  slideIndex,
  totalSlides,
  presentation,
  isEditing,
  onUpdateSlide,
  revealedAnswers,
  userSelectedAnswers,
  onSelectOption,
  onToggleAnswerReveal,
  onNextSlide,
  onPrevSlide
}) => {
  const isTitleSlide = slide.type === 'title' || slideIndex === 0;
  const isObjectivesSlide = slide.type === 'objectives';
  const isActivityIntro = slide.type === 'activity' && slide.moduleIndex && !slide.activityDoc && !slide.visualDiagram;
  const isTimelineSlide = slide.activityDoc?.docType === 'خط زمني' || slide.title.includes('المراحل الكبرى') || slide.title.includes('الخط الزمني') || slide.visualDiagram?.type === 'timeline_nodes';
  const isPyramidSlide = slide.activityDoc?.docType === 'خطاطة بنيوية' || slide.title.includes('هرم') || slide.title.includes('المجتمع');
  const isMapSlide = slide.activityDoc?.docType === 'خريطة جغرافية/تاريخية' || slide.title.includes('موطن') || slide.title.includes('خريطة');
  const isNileDocSlide = slide.activityDoc?.docType === 'نص تاريخي' || slide.title.includes('الفلاحة') || slide.title.includes('النيل');

  return (
    <div className="relative w-full aspect-video bg-[#F4ECD8] rounded-xl p-4 sm:p-7 flex flex-col justify-between text-[#291B0E] overflow-hidden border-4 border-[#C5A059] shadow-2xl select-none" dir="rtl">
      
      {/* Decorative Ornate Background Texture & Corner Brackets */}
      <div className="absolute inset-0 bg-[radial-gradient(#E0D2B4_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
      <div className="absolute inset-1.5 border border-[#8C6D32]/30 pointer-events-none rounded-lg" />
      <div className="absolute inset-3 border border-[#C5A059]/20 pointer-events-none rounded-md" />

      {/* Ornate Corner Accents */}
      <div className="absolute top-2 right-2 text-[#8C6D32] text-xs font-serif opacity-70 pointer-events-none">❖</div>
      <div className="absolute top-2 left-2 text-[#8C6D32] text-xs font-serif opacity-70 pointer-events-none">❖</div>
      <div className="absolute bottom-2 right-2 text-[#8C6D32] text-xs font-serif opacity-70 pointer-events-none">❖</div>
      <div className="absolute bottom-2 left-2 text-[#8C6D32] text-xs font-serif opacity-70 pointer-events-none">❖</div>

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-[#C5A059]/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black bg-[#1E3A8A] text-white px-3 py-0.5 rounded-md shadow-xs border border-[#172554]">
            {slide.badge || `شريحة ${slide.slideNumber}`}
          </span>
          <span className="text-xs text-[#8B261E] font-bold hidden sm:inline font-serif">
            {presentation.subject} • {presentation.level} ({presentation.term})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {slide.pedagogicalStep && (
            <span className="text-[10px] bg-[#FEF3C7] text-[#8C6D32] font-bold px-2 py-0.5 rounded border border-[#C5A059]/50">
              {slide.pedagogicalStep}
            </span>
          )}
          <span className="text-xs text-[#8C6D32] font-mono font-bold">
            {slideIndex + 1} / {totalSlides}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. TITLE / COVER SLIDE (Matching Screenshot 1) */}
      {/* ============================================================ */}
      {isTitleSlide && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto py-2">
          
          {/* Right Column: Title, Flourish & Action */}
          <div className="space-y-4 text-center md:text-right pr-2">
            
            <div className="inline-block bg-[#1E3A8A] text-white text-xs font-black px-4 py-1 rounded-md border border-[#172554] shadow-sm">
              {slide.badge || 'الدرس 02'}
            </div>

            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => onUpdateSlide('title', e.target.value)}
                  className="w-full bg-[#FFFDF7] border-2 border-[#C5A059] rounded-xl px-3 py-2 text-2xl font-black text-[#8B261E] focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl sm:text-4xl font-black text-[#8B261E] font-serif tracking-tight drop-shadow-xs">
                  {slide.title}
                </h1>
              )}
              <p className="text-sm font-bold text-[#8C6D32] mt-1">
                {slide.subtitle || `${presentation.subject} - ${presentation.level}`}
              </p>
            </div>

            {/* Flourish Divider */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#C5A059] py-1">
              <span className="h-[2px] w-12 bg-gradient-to-l from-[#C5A059] to-transparent"></span>
              <span className="text-sm font-serif">🙞 ❖ 🙜</span>
              <span className="h-[2px] w-12 bg-gradient-to-r from-[#C5A059] to-transparent"></span>
            </div>

            {/* General Info Tags */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#4A3B2C]">
              <div className="bg-[#FFFDF7] p-2 rounded-lg border border-[#C5A059]/40 shadow-xs">
                <span className="text-[#8C6D32] block text-[9px]">المجزوءة / المكون:</span>
                <span className="truncate block">{presentation.module || presentation.subject}</span>
              </div>
              <div className="bg-[#FFFDF7] p-2 rounded-lg border border-[#C5A059]/40 shadow-xs">
                <span className="text-[#8C6D32] block text-[9px]">الغلاف الزمني:</span>
                <span>{presentation.duration || 'ساعتان'}</span>
              </div>
            </div>

            {/* Entry Action Button */}
            {onNextSlide && (
              <div className="pt-2">
                <button
                  onClick={onNextSlide}
                  className="inline-flex items-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-md transition-all border border-[#FDE68A]/40 group"
                >
                  <span>الدخول للدرس</span>
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Left Column: Framed Thematic Artwork */}
          <div className="relative p-3 bg-[#FFFDF7] rounded-2xl border-2 border-[#C5A059] shadow-md flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-1 border border-[#8C6D32]/20 rounded-xl pointer-events-none" />
            
            <div className="w-full h-44 bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A]/40 rounded-xl border border-[#C5A059]/40 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Graphic Motif */}
              <div className="text-4xl mb-2 filter drop-shadow">🏛️ 🏺 📜</div>
              <h4 className="text-sm font-black text-[#8B261E] font-serif mb-1">
                {presentation.title}
              </h4>
              <p className="text-[10px] text-[#6B5B45] max-w-xs leading-relaxed">
                {presentation.targetCompetency || 'بناء المعارف التاريخية وتوطين المجال واستثمار الوثائق والدعامات وفق المنهاج المغربي.'}
              </p>
              <div className="mt-2 flex gap-1.5">
                <span className="text-[9px] bg-[#1E3A8A] text-white px-2 py-0.5 rounded font-bold">الخريطة</span>
                <span className="text-[9px] bg-[#8B261E] text-white px-2 py-0.5 rounded font-bold">الخط الزمني</span>
                <span className="text-[9px] bg-[#2F3E1B] text-white px-2 py-0.5 rounded font-bold">الهرم الاجتماعي</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 2. OBJECTIVES SLIDE (Matching Screenshot 2) */}
      {/* ============================================================ */}
      {isObjectivesSlide && (
        <div className="relative z-10 my-auto py-2 space-y-4">
          
          {/* Header Banner Arch */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-[#8B261E] via-[#A82E24] to-[#8B261E] text-[#FEF3C7] px-8 py-1.5 rounded-lg border-2 border-[#C5A059] shadow-sm">
              <h2 className="text-lg sm:text-xl font-black font-serif tracking-wide">
                أهـــداف التـعـلّــــم
              </h2>
            </div>
            {/* Scroll flourish */}
            <div className="flex items-center justify-center gap-2 text-[#C5A059] mt-1 text-xs font-serif">
              <span>•••••</span>
              <span>🙞 ❖ 🙜</span>
              <span>•••••</span>
            </div>
          </div>

          {/* 3 Parchment Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* 1. Cognitive Card */}
            <div className="bg-[#FFFDF7] rounded-xl p-3.5 border-2 border-[#C5A059] shadow-sm relative flex flex-col justify-between">
              <div className="absolute inset-1 border border-[#8C6D32]/20 rounded-lg pointer-events-none" />
              <div>
                <div className="bg-[#8B261E] text-white text-[11px] font-black px-2.5 py-1 rounded text-center mb-2 shadow-xs">
                  🎯 الهدف المعرفي 1
                </div>
                <p className="text-xs font-bold text-[#291B0E] leading-relaxed text-center">
                  {slide.objectivesGroup?.cognitive?.[0] || 'تعرف بعض جوانب الحضارة المصرية القديمة وموطنها الجغرافي.'}
                </p>
                {slide.objectivesGroup?.cognitive?.[1] && (
                  <p className="text-[11px] text-[#5A4A3B] leading-relaxed text-center mt-1.5 pt-1.5 border-t border-[#C5A059]/20">
                    {slide.objectivesGroup.cognitive[1]}
                  </p>
                )}
              </div>
              <div className="text-center text-[#C5A059] text-[10px] mt-2">❖ ❖ ❖</div>
            </div>

            {/* 2. Methodological Card */}
            <div className="bg-[#FFFDF7] rounded-xl p-3.5 border-2 border-[#C5A059] shadow-sm relative flex flex-col justify-between">
              <div className="absolute inset-1 border border-[#8C6D32]/20 rounded-lg pointer-events-none" />
              <div>
                <div className="bg-[#1E3A8A] text-white text-[11px] font-black px-2.5 py-1 rounded text-center mb-2 shadow-xs">
                  🛠️ الهدف المنهجي والمهاري 2
                </div>
                <p className="text-xs font-bold text-[#291B0E] leading-relaxed text-center">
                  {slide.objectivesGroup?.methodological?.[0] || 'تعرف بعض مكونات شبكة تحليل الحضارات (المجتمع، الفلاحة، الهرم).'}
                </p>
                {slide.objectivesGroup?.methodological?.[1] && (
                  <p className="text-[11px] text-[#5A4A3B] leading-relaxed text-center mt-1.5 pt-1.5 border-t border-[#C5A059]/20">
                    {slide.objectivesGroup.methodological[1]}
                  </p>
                )}
              </div>
              <div className="text-center text-[#C5A059] text-[10px] mt-2">❖ ❖ ❖</div>
            </div>

            {/* 3. Attitudinal Card */}
            <div className="bg-[#FFFDF7] rounded-xl p-3.5 border-2 border-[#C5A059] shadow-sm relative flex flex-col justify-between">
              <div className="absolute inset-1 border border-[#8C6D32]/20 rounded-lg pointer-events-none" />
              <div>
                <div className="bg-[#2F3E1B] text-white text-[11px] font-black px-2.5 py-1 rounded text-center mb-2 shadow-xs">
                  🌟 الهدف الوجداني والقيمي 3
                </div>
                <p className="text-xs font-bold text-[#291B0E] leading-relaxed text-center">
                  {slide.objectivesGroup?.attitudinal?.[0] || 'تقدير مساهمة حضارة مصر القديمة في إغناء الحضارة الإنسانية.'}
                </p>
                {slide.objectivesGroup?.attitudinal?.[1] && (
                  <p className="text-[11px] text-[#5A4A3B] leading-relaxed text-center mt-1.5 pt-1.5 border-t border-[#C5A059]/20">
                    {slide.objectivesGroup.attitudinal[1]}
                  </p>
                )}
              </div>
              <div className="text-center text-[#C5A059] text-[10px] mt-2">❖ ❖ ❖</div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 3. ACTIVITY INTRO (Matching Screenshot 3) */}
      {/* ============================================================ */}
      {isActivityIntro && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto py-2">
          <div className="space-y-4 pr-2">
            <div className="inline-block bg-[#1E3A8A] text-white text-xs font-black px-4 py-1 rounded-md shadow-sm">
              {slide.badge || 'النشاط الأول'}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-[#8B261E] font-serif leading-snug">
              {slide.subtitle || slide.title}
            </h2>

            <div className="flex items-center gap-2 text-[#C5A059] py-1">
              <span className="h-[2px] w-12 bg-gradient-to-l from-[#C5A059] to-transparent"></span>
              <span className="text-sm font-serif">🙞 ❖ 🙜</span>
              <span className="h-[2px] w-12 bg-gradient-to-r from-[#C5A059] to-transparent"></span>
            </div>

            <div className="space-y-2">
              {slide.bulletPoints.map((bp, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2 text-xs font-bold text-[#4A3B2C] bg-[#FFFDF7] p-2 rounded-lg border border-[#C5A059]/30">
                  <span className="text-[#8B261E] font-black">•</span>
                  <p>{bp}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFDF7] p-4 rounded-2xl border-2 border-[#C5A059] shadow-md flex flex-col items-center justify-center text-center">
            <div className="w-full h-40 bg-[#FEF3C7]/60 rounded-xl border border-[#C5A059]/40 p-4 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">📜 🗺️</div>
              <h4 className="text-sm font-black text-[#8B261E]">مدخل الدعامات والوثائق</h4>
              <p className="text-[11px] text-[#6B5B45] mt-1">الاشتغال على الخريطة والخط الزمني والنصوص التاريخية</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. SPATIAL MAP ANALYSIS SLIDE (Matching Screenshot 4) */}
      {/* ============================================================ */}
      {isMapSlide && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-auto py-1 items-stretch">
          
          {/* Right Column: Question Badges */}
          <div className="md:col-span-5 space-y-2.5 flex flex-col justify-center">
            
            <div className="bg-[#1E3A8A] text-white text-xs font-black p-2.5 rounded-xl shadow-xs border border-[#172554] flex items-center gap-2">
              <Compass size={15} className="text-[#FDE68A] shrink-0" />
              <span>لاحظ الخريطة جيداً ثم :</span>
            </div>

            <div className="bg-[#FFFDF7] p-2.5 rounded-xl border-2 border-[#C5A059] text-xs font-bold text-[#291B0E] space-y-2">
              <div className="bg-[#1E3A8A]/10 text-[#1E3A8A] p-2 rounded-lg border border-[#1E3A8A]/20">
                <span className="font-black text-[10px] text-[#8B261E] block mb-0.5">المهمة 1 (التوطين):</span>
                <span>حدد موقع مصر القديم بالنسبة لحوض البحر الأبيض المتوسط.</span>
              </div>

              <div className="bg-[#1E3A8A]/10 text-[#1E3A8A] p-2 rounded-lg border border-[#1E3A8A]/20">
                <span className="font-black text-[10px] text-[#8B261E] block mb-0.5">المهمة 2 (المجال الطبيعي):</span>
                <span>صف المجال الطبيعي لمصر والدور المحوري لوادي النيل والدلتا.</span>
              </div>
            </div>

            {slide.highlightBox && (
              <div className="bg-[#FEF3C7] p-2 rounded-xl border border-[#C5A059] text-[11px] text-[#8C6D32] font-bold">
                💡 {slide.highlightBox}
              </div>
            )}
          </div>

          {/* Left Column: Rich Map Visual Representation */}
          <div className="md:col-span-7 bg-[#FFFDF7] rounded-xl p-3 border-2 border-[#C5A059] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-1.5 mb-2">
              <span className="text-xs font-black text-[#8B261E]">خريطة: موطن حضارة مصر القديمة</span>
              <span className="text-[10px] text-[#8C6D32] bg-[#FEF3C7] px-2 py-0.5 rounded">مقياس توطيني</span>
            </div>

            {/* Map Graphic Canvas */}
            <div className="relative bg-[#E0F2FE] rounded-lg p-2.5 h-44 border border-[#BAE6FD] overflow-hidden flex flex-col justify-between">
              
              {/* Mediterranean Sea Top */}
              <div className="text-center font-black text-[#0369A1] text-xs bg-white/70 py-0.5 rounded border border-[#0284C7]/30 shadow-xs">
                🌊 البحر الأبيض المتوسط
              </div>

              {/* Central Map Regions */}
              <div className="grid grid-cols-3 gap-1 my-1 text-center text-[10px] font-bold">
                <div className="bg-[#FEF08A] text-[#854D0E] p-1 rounded border border-[#FACC15]">
                  🏜️ الصحراء الليبية (الغرب)
                </div>

                {/* Nile Corridor */}
                <div className="bg-[#BBF7D0] text-[#166534] p-1 rounded border border-[#4ADE80] font-black flex flex-col justify-between">
                  <span>🔺 الدلتا وممفيس</span>
                  <span className="text-[9px] text-[#15803D] my-0.5">〰️ وادي النيل الخصيب 〰️</span>
                  <span>🏛️ طيبة (الأقصر)</span>
                </div>

                <div className="bg-[#FED7AA] text-[#9A3412] p-1 rounded border border-[#FB923C]">
                  🏜️ البحر الأحمر وشبه الجزيرة
                </div>
              </div>

              {/* Southern Border */}
              <div className="flex justify-between text-[9px] font-bold text-[#4A3B2C] bg-white/70 px-2 py-0.5 rounded">
                <span>جنوباً: بلاد النوبة والأحباش</span>
                <span>منبع نهر النيل ⬇️</span>
              </div>
            </div>

            {/* Map Legend */}
            <div className="flex items-center justify-around text-[10px] font-bold text-[#4A3B2C] pt-2 border-t border-[#C5A059]/20">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#BBF7D0] border border-[#166534] rounded-xs inline-block"></span> أراضي زراعية خصبة</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FEF08A] border border-[#CA8A04] rounded-xs inline-block"></span> صحاري ومجالات جافة</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0284C7] rounded-xs inline-block"></span> مسطحات مائية وتجارة</span>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CHRONOLOGICAL TIMELINE SLIDE (Matching Screenshot 5) */}
      {/* ============================================================ */}
      {isTimelineSlide && (
        <div className="relative z-10 my-auto py-1 space-y-2.5">
          
          {/* Header & Guiding Questions */}
          <div className="bg-[#FFFDF7] p-2.5 rounded-xl border-2 border-[#C5A059] shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#1E3A8A] text-white text-xs font-black px-3 py-1 rounded">خط زمني</span>
              <h3 className="text-xs sm:text-sm font-black text-[#8B261E] font-serif">
                المراحل الكبرى لتاريخ مصر القديمة (من 2500 ق.م إلى 30 ق.م)
              </h3>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-[#1E3A8A]">
              <span className="bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#93C5FD]">
                ❓ استخرج المراحل التي مر منها تاريخ مصر
              </span>
              <span className="bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#93C5FD]">
                ⏱️ احسب المدة الزمنية المستغرقة
              </span>
            </div>
          </div>

          {/* Timeline Visual Component with 4 Big Epochs */}
          <div className="bg-[#FFFDF7] rounded-xl p-3 border-2 border-[#C5A059] shadow-sm space-y-2">
            
            {/* Timeline Horizontal Bar */}
            <div className="grid grid-cols-4 gap-1.5 text-white text-center font-bold text-[11px]">
              
              {/* Epoch 1 */}
              <div className="bg-[#8B261E] p-2 rounded-lg border border-[#7F1D1D] shadow-xs">
                <span className="text-[9px] text-[#FDE68A] block">2500 - 2000 ق.م</span>
                <span className="font-black block text-xs">الدولة القديمة</span>
                <span className="text-[9px] text-white/90">بناء الأهرامات الكبرى</span>
              </div>

              {/* Epoch 2 */}
              <div className="bg-[#1E3A8A] p-2 rounded-lg border border-[#1E40AF] shadow-xs">
                <span className="text-[9px] text-[#FDE68A] block">2000 - 1500 ق.م</span>
                <span className="font-black block text-xs">الدولة الوسطى</span>
                <span className="text-[9px] text-white/90">إعادة التوحيد والري</span>
              </div>

              {/* Epoch 3 */}
              <div className="bg-[#2F3E1B] p-2 rounded-lg border border-[#365314] shadow-xs">
                <span className="text-[9px] text-[#FDE68A] block">1500 - 1000 ق.م</span>
                <span className="font-black block text-xs">الدولة الحديثة</span>
                <span className="text-[9px] text-white/90">التوسع والفتوحات الكبرى</span>
              </div>

              {/* Epoch 4 */}
              <div className="bg-[#78350F] p-2 rounded-lg border border-[#92400E] shadow-xs">
                <span className="text-[9px] text-[#FDE68A] block">1000 - 30 ق.م</span>
                <span className="font-black block text-xs">الانحطاط والاحتلال</span>
                <span className="text-[9px] text-white/90">غزو الفرس والرومان</span>
              </div>

            </div>

            {/* Time Arrow */}
            <div className="relative h-4 bg-gradient-to-l from-[#C5A059] to-[#8C6D32] rounded-full flex items-center justify-between px-3 text-[9px] font-black text-white shadow-inner">
              <span>2500 قبل الميلاد ➔</span>
              <span>2000 ق.م</span>
              <span>1500 ق.م</span>
              <span>1000 ق.م</span>
              <span>500 ق.م</span>
              <span>➔ ميلاد المسيح (30 ق.م الاحتلال)</span>
            </div>

            {/* Summary bullet notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-[#4A3B2C] pt-1">
              <div className="bg-[#FEF3C7] p-2 rounded-lg border border-[#C5A059]/40">
                <span className="text-[#8B261E] font-black">✓ المدة الإجمالية: </span>
                <span>استغرقت الحضارة المصرية القديمة قرابة 2500 سنة (25 قرناً).</span>
              </div>
              <div className="bg-[#FEF3C7] p-2 rounded-lg border border-[#C5A059]/40">
                <span className="text-[#1E3A8A] font-black">✓ الدينامية التاريخية: </span>
                <span>تناوبت فترات القوة والازدهار مع فترات الضعف والانقسام.</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 6. SOCIAL PYRAMID SLIDE (Matching Screenshot 6) */}
      {/* ============================================================ */}
      {isPyramidSlide && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-auto py-1 items-stretch">
          
          {/* Right Column: Guiding questions & Companion card */}
          <div className="md:col-span-5 space-y-2 flex flex-col justify-center">
            
            <div className="bg-[#1E3A8A] text-white text-xs font-black p-2.5 rounded-xl shadow-xs border border-[#172554]">
              <span>هرم فئات المجتمع المصري القديم</span>
            </div>

            <div className="space-y-1.5 text-xs font-bold">
              <div className="bg-[#1E3A8A] text-white p-2 rounded-lg shadow-xs text-[11px]">
                ❓ استخرج فئات المجتمع المصري القديم
              </div>
              <div className="bg-[#1E3A8A] text-white p-2 rounded-lg shadow-xs text-[11px]">
                ❓ استخلص طبيعة المجتمع (مجتمع طبقي هرمي غير متكافئ)
              </div>
              <div className="bg-[#1E3A8A] text-white p-2 rounded-lg shadow-xs text-[11px]">
                ❓ حدد موقع الفرعون في الهرم واستنتج قوته وسلطته المطلقة
              </div>
            </div>

            {/* Companion Character Card */}
            <div className="bg-[#FFFDF7] p-2 rounded-xl border-2 border-[#C5A059] text-[10px] text-[#4A3B2C]">
              <span className="font-black text-[#8B261E] block mb-0.5">👤 الفلاح والكاتب المصري القديم:</span>
              <p>الفلاح يشكل قاعدة الإنتاج والعمل الشاق، بينما الكاتب والكهنة يحتلون مكانة نافذة لإتقان الهيروغليفية وإدارة ثروات المعابد.</p>
            </div>
          </div>

          {/* Left Column: Visual Stepped Social Pyramid (6 Tiers) */}
          <div className="md:col-span-7 bg-[#FFFDF7] rounded-xl p-3 border-2 border-[#C5A059] shadow-sm flex flex-col justify-between">
            <div className="text-center font-black text-[#8B261E] text-xs pb-1 border-b border-[#C5A059]/30">
              الهيكل الطبقي التراتبي للمجتمع المصري القديم
            </div>

            {/* Stepped Tiers 1 to 6 */}
            <div className="space-y-1 my-1.5">
              
              {/* 1. Pharaoh */}
              <div className="w-[45%] mx-auto bg-[#8B261E] text-white text-[10px] font-black p-1.5 rounded-t-lg text-center shadow-xs border border-[#7F1D1D] flex items-center justify-between px-2">
                <span>1</span>
                <span>👑 الفرعون (الحاكم المطلق المقدس)</span>
                <span>👑</span>
              </div>

              {/* 2. Priests & Scribes */}
              <div className="w-[58%] mx-auto bg-[#1E3A8A] text-white text-[10px] font-bold p-1.5 rounded text-center shadow-xs border border-[#1E40AF] flex items-center justify-between px-2">
                <span>2</span>
                <span>📜 الكهنة والكتّاب</span>
                <span>🛕</span>
              </div>

              {/* 3. Soldiers */}
              <div className="w-[70%] mx-auto bg-[#2F3E1B] text-white text-[10px] font-bold p-1.5 rounded text-center shadow-xs border border-[#365314] flex items-center justify-between px-2">
                <span>3</span>
                <span>⚔️ الجنود والجيش</span>
                <span>🛡️</span>
              </div>

              {/* 4. Artisans & Merchants */}
              <div className="w-[82%] mx-auto bg-[#D97706] text-white text-[10px] font-bold p-1.5 rounded text-center shadow-xs border border-[#B45309] flex items-center justify-between px-2">
                <span>4</span>
                <span>🏺 الحرفيون والتجار</span>
                <span>⚖️</span>
              </div>

              {/* 5. Peasants / Farmers */}
              <div className="w-[94%] mx-auto bg-[#8C6D32] text-white text-[10px] font-bold p-1.5 rounded text-center shadow-xs border border-[#78350F] flex items-center justify-between px-2">
                <span>5</span>
                <span>🌾 الفلاحون (الأغلبية المنتجة)</span>
                <span>🌱</span>
              </div>

              {/* 6. Slaves */}
              <div className="w-full bg-[#52525B] text-white text-[10px] font-bold p-1.5 rounded-b-lg text-center shadow-xs border border-[#3F3F46] flex items-center justify-between px-2">
                <span>6</span>
                <span>⛓️ العبيد وأسرى الحرب</span>
                <span>⚒️</span>
              </div>

            </div>

            <div className="text-[10px] text-center text-[#8C6D32] font-bold bg-[#FEF3C7] py-1 rounded border border-[#C5A059]/40">
              قاعدة الهرم تتحمل أعباء الإنتاج ⬅️ بينما قمة الهرم تحتكر السلطة والثروة
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 7. NILE AGRICULTURE & HISTORICAL TEXT SLIDE (Matching Screenshot 7) */}
      {/* ============================================================ */}
      {isNileDocSlide && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-auto py-1 items-stretch">
          
          {/* Right Column: Historical Text Quote in Olive Green Box */}
          <div className="md:col-span-6 space-y-2 flex flex-col justify-between">
            
            <div className="bg-[#2F3E1B] text-[#FEF3C7] rounded-xl p-3.5 border-2 border-[#C5A059] shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-1">
                <span className="text-xs font-black text-[#FDE68A] font-serif">📜 أنشودة النيل (نص تاريخي)</span>
                <span className="text-[9px] text-[#A7F3D0] bg-black/20 px-2 py-0.5 rounded">برديات مصرية</span>
              </div>
              <p className="text-xs font-serif leading-relaxed italic text-white/95 bg-black/20 p-2.5 rounded-lg border border-white/10">
                «أيها النيل سلام عليك.. يا منعش مصر، يا واهب الحياة للمزارع.. تسقي الحقول وتفيض بالخيرات وتطعم الأنام، إذا شح ماؤك قحطت البلاد، وإذا جرى ماؤك رويت الأرض وازدهرت الفلاحة...»
              </p>
            </div>

            {/* Questions in Navy Badges */}
            <div className="space-y-1.5 text-xs font-bold">
              <div className="bg-[#1E3A8A] text-white p-2 rounded-lg text-[11px] shadow-xs">
                ❓ استخرج من النص أهمية نهر النيل بالنسبة للمصريين القدامى
              </div>
              <div className="bg-[#1E3A8A] text-white p-2 rounded-lg text-[11px] shadow-xs">
                ❓ سم النهر الممثل في الصورتين واستنتج دوره في الدورة الفلاحية
              </div>
            </div>

          </div>

          {/* Left Column: Companion Agricultural Photos / Illustrations */}
          <div className="md:col-span-6 bg-[#FFFDF7] rounded-xl p-3 border-2 border-[#C5A059] shadow-sm flex flex-col justify-between space-y-2">
            
            <div className="text-xs font-black text-[#8B261E] pb-1 border-b border-[#C5A059]/30">
              الدعامات البصرية: فيضان النيل والأنشطة الفلاحية
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#FEF3C7] p-2 rounded-lg border border-[#C5A059]/40 text-center">
                <div className="text-2xl mb-1">🌊 🌾</div>
                <span className="text-[10px] font-black text-[#8B261E] block">صورة لفيضان نهر النيل</span>
                <span className="text-[9px] text-[#5A4A3B]">ترسيب الطمي الخصب وتجديد التربة</span>
              </div>

              <div className="bg-[#FEF3C7] p-2 rounded-lg border border-[#C5A059]/40 text-center">
                <div className="text-2xl mb-1">🪵 🪣</div>
                <span className="text-[10px] font-black text-[#8B261E] block">تقنية الشادوف</span>
                <span className="text-[9px] text-[#5A4A3B]">رفع مياه النيل لري الحقول المرتفعة</span>
              </div>
            </div>

            <div className="bg-[#2F3E1B]/10 p-2 rounded-lg border border-[#2F3E1B]/20 text-[10px] font-bold text-[#2F3E1B]">
              🌾 الدورة الفلاحية: فصل الفيضان (أخت) ➔ فصل البذر (برت) ➔ فصل الحصاد (شمو).
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 8. STANDARD FALLBACK / SYNTHESIS SLIDE */}
      {/* ============================================================ */}
      {!isTitleSlide && !isObjectivesSlide && !isActivityIntro && !isMapSlide && !isTimelineSlide && !isPyramidSlide && !isNileDocSlide && (
        <div className="relative z-10 my-auto py-2 space-y-3">
          
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#8B261E] font-serif">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-xs font-bold text-[#8C6D32] mt-0.5">
                {slide.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              {slide.bulletPoints.map((bp, bIdx) => (
                <div key={bIdx} className="flex items-start gap-2 bg-[#FFFDF7] p-2.5 rounded-lg border-2 border-[#C5A059] text-xs font-bold text-[#291B0E] shadow-xs">
                  <span className="text-[#8B261E] font-black">•</span>
                  <p className="leading-relaxed">{bp}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {slide.keyConcepts && slide.keyConcepts.length > 0 && (
                <div className="bg-[#FFFDF7] p-3 rounded-xl border-2 border-[#C5A059] shadow-xs space-y-1.5">
                  <span className="text-xs font-black text-[#8B261E] block border-b border-[#C5A059]/30 pb-1">
                    📖 المفاهيم والمصطلحات:
                  </span>
                  {slide.keyConcepts.map((kc, kIdx) => (
                    <div key={kIdx} className="text-[11px] bg-[#FEF3C7] p-1.5 rounded border border-[#C5A059]/30">
                      <strong className="text-[#8B261E]">{kc.term}: </strong>
                      <span className="text-[#4A3B2C]">{kc.definition}</span>
                    </div>
                  ))}
                </div>
              )}

              {slide.highlightBox && (
                <div className="bg-[#2F3E1B] text-[#FEF3C7] p-2.5 rounded-xl border-2 border-[#C5A059] text-xs">
                  <span className="font-black text-[#FDE68A] block mb-0.5">💡 استنتاج وخلاصة:</span>
                  {slide.highlightBox}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Bottom Footer Bar */}
      <div className="relative z-10 flex items-center justify-between border-t border-[#C5A059]/40 pt-2 text-[10px] text-[#8C6D32] font-serif font-bold">
        <span>الدرس: {presentation.title} • المنهاج المغربي الرسمي 🇲🇦</span>
        <div className="flex items-center gap-2">
          {onPrevSlide && slideIndex > 0 && (
            <button onClick={onPrevSlide} className="hover:text-[#8B261E] flex items-center gap-0.5">
              <span>السابق</span>
              <ChevronRight size={12} />
            </button>
          )}
          {onNextSlide && slideIndex < totalSlides - 1 && (
            <button onClick={onNextSlide} className="hover:text-[#8B261E] flex items-center gap-0.5">
              <ChevronLeft size={12} />
              <span>التالي</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
