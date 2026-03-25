import React, { useState, useEffect } from 'react';
import { Send, Copy, Image as ImageIcon, UploadCloud, X, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const SERVICES_CONFIG: Record<string, any> = {
  'prompt-gen': {
    title: 'توليد الأوامر',
    desc: 'أدخل فكرتك وسنقوم بتحويلها إلى أمر احترافي لنماذج الذكاء الاصطناعي.',
    inputType: 'text',
    placeholder: 'مثال: أريد كتابة مقال عن فوائد الذكاء الاصطناعي...',
    sysPrompt: 'أنت خبير في هندسة الأوامر. قم بتحويل الفكرة التالية إلى أمر (Prompt) مفصل واحترافي باللغة العربية. أضف السياق، والتعليمات الدقيقة، وتنسيق المخرجات المطلوب.'
  },
  'prompt-check': {
    title: 'فحص الأوامر',
    desc: 'أدخل الأمر الخاص بك وسنقوم بتقييمه واقتراح تحسينات عليه.',
    inputType: 'text',
    placeholder: 'الصق الأمر (Prompt) هنا لفحصه...',
    sysPrompt: 'أنت خبير في تقييم أوامر الذكاء الاصطناعي. قم بتحليل الأمر التالي، حدد نقاط الضعف، وقدم نسخة محسنة منه باللغة العربية مع شرح سبب التحسين.'
  },
  'image-prompt': {
    title: 'توليد أوامر الصور',
    desc: 'صف الصورة التي تتخيلها، وسنكتب لك أمراً احترافياً لـ Midjourney أو DALL-E.',
    inputType: 'text',
    placeholder: 'مثال: مدينة مستقبلية في الفضاء مع سيارات طائرة...',
    sysPrompt: 'أنت خبير في كتابة أوامر توليد الصور (Midjourney/DALL-E). حول الوصف التالي إلى أمر دقيق جداً باللغة الإنجليزية مع إضافة تفاصيل الإضاءة والعدسة والأسلوب الفني، ثم قدم ترجمة وشرحاً بالعربية.'
  },
  'video-prompt': {
    title: 'توليد أوامر الفيديو - VE03',
    desc: 'صف المشهد وسنكتب لك أمراً دقيقاً لتوليد فيديو بالذكاء الاصطناعي.',
    inputType: 'text',
    placeholder: 'مثال: كاميرا تتحرك ببطء فوق غابة خريفية مع تساقط الأوراق...',
    sysPrompt: 'أنت خبير في كتابة أوامر توليد الفيديو (Sora/VE03). اكتب أمراً مفصلاً باللغة الإنجليزية يصف حركة الكاميرا، الإضاءة، والمشهد بناءً على الفكرة التالية، مع شرح بالعربية.'
  },
  'ai-detector': {
    title: 'كاشف النصوص',
    desc: 'الصق النص هنا لنكتشف ما إذا كان مكتوباً بواسطة الذكاء الاصطناعي أم بشري.',
    inputType: 'text',
    placeholder: 'الصق النص المراد فحصه هنا...',
    sysPrompt: 'قم بتحليل النص التالي وتحديد ما إذا كان مكتوباً بواسطة الذكاء الاصطناعي أم إنسان. أعط نسبة مئوية للاحتمالين مع ذكر الأسباب والأدلة من النص باللغة العربية.'
  },
  'humanizer': {
    title: 'إعادة الصياغة',
    desc: 'أدخل نصاً وسنقوم بإعادة صياغته ليبدو طبيعياً ومكتوباً بأسلوب بشري.',
    inputType: 'text',
    placeholder: 'الصق النص الذي تريد إعادة صياغته...',
    sysPrompt: 'أعد صياغة النص التالي باللغة العربية ليبدو طبيعياً جداً، كأنه مكتوب بواسطة كاتب بشري محترف، وتجنب الأسلوب الآلي النمطي للذكاء الاصطناعي.'
  },
  'img-to-prompt': {
    title: 'محول الصور إلى أوامر',
    desc: 'ارفع صورة وسنقوم بتحليلها وكتابة أمر (Prompt) يمكنه إعادة توليد صورة مشابهة.',
    inputType: 'image',
    placeholder: 'أضف أي ملاحظات إضافية (اختياري)...',
    sysPrompt: 'قم بوصف هذه الصورة بدقة متناهية كأمر (Prompt) باللغة الإنجليزية يمكن استخدامه في Midjourney لإعادة توليد صورة مشابهة، مع تقديم ترجمة وشرح بالعربية.'
  },
  'img-to-text': {
    title: 'تحويل الصورة إلى نص',
    desc: 'ارفع صورة تحتوي على نص وسنقوم باستخراجه لك بدقة.',
    inputType: 'image',
    placeholder: 'أضف أي تعليمات إضافية (اختياري)...',
    sysPrompt: 'استخرج جميع النصوص الموجودة في هذه الصورة بدقة تامة كما هي مكتوبة، مع الحفاظ على التنسيق قدر الإمكان.'
  },
  'two-imgs-to-prompt': {
    title: 'محول صورتين إلى أمر',
    desc: 'ارفع صورتين وسنكتب لك أمراً يدمج بين فكرتيهما أو أسلوبهما.',
    inputType: 'two-images',
    placeholder: 'أضف أي تعليمات للدمج (اختياري)...',
    sysPrompt: 'قم بتحليل هاتين الصورتين، واكتب أمراً (Prompt) باللغة الإنجليزية لـ Midjourney يدمج بين العناصر الأساسية والأسلوب الفني للصورتين معاً، مع الشرح بالعربية.'
  },
  'product-desc': {
    title: 'توليد وصف المنتجات',
    desc: 'أدخل اسم المنتج ومواصفاته، وسنكتب لك وصفاً تسويقياً جذاباً.',
    inputType: 'text',
    placeholder: 'مثال: حذاء رياضي مريح للجري، خفيف الوزن، لون أسود...',
    sysPrompt: 'أنت خبير تسويق وكتابة محتوى (Copywriter). اكتب وصفاً تسويقياً جذاباً ومقنعاً للمنتج التالي باللغة العربية، مع إبراز الفوائد والمميزات بشكل يحفز على الشراء.'
  }
};

type ImageState = { file: File; preview: string; base64: string } | null;

export default function ServiceWorkspace({ activeServiceId }: { activeServiceId: string }) {
  const config = SERVICES_CONFIG[activeServiceId] || SERVICES_CONFIG['prompt-gen'];
  
  const [textInput, setTextInput] = useState('');
  const [image1, setImage1] = useState<ImageState>(null);
  const [image2, setImage2] = useState<ImageState>(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when service changes
  useEffect(() => {
    setTextInput('');
    setImage1(null);
    setImage2(null);
    setResult('');
    setError('');
  }, [activeServiceId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      const imgData = { file, preview: URL.createObjectURL(file), base64: base64String };
      if (slot === 1) setImage1(imgData);
      else setImage2(imgData);
    };
  };

  const removeImage = (slot: 1 | 2) => {
    if (slot === 1) setImage1(null);
    else setImage2(null);
  };

  const isGenerateDisabled = () => {
    if (isLoading) return true;
    if (config.inputType === 'text' && !textInput.trim()) return true;
    if (config.inputType === 'image' && !image1) return true;
    if (config.inputType === 'two-images' && (!image1 || !image2)) return true;
    return false;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const parts: any[] = [];

      if (textInput.trim() || config.inputType !== 'text') {
        parts.push({ text: textInput.trim() || 'قم بتنفيذ المهمة المطلوبة بناءً على الصور المرفقة.' });
      }

      if (image1) {
        parts.push({
          inlineData: { data: image1.base64, mimeType: image1.file.type }
        });
      }

      if (image2) {
        parts.push({
          inlineData: { data: image2.base64, mimeType: image2.file.type }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts },
        config: {
          systemInstruction: config.sysPrompt,
        }
      });

      setResult(response.text || '');
    } catch (err) {
      console.error("Error generating content:", err);
      setError("حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const ImageUploader = ({ slot, image }: { slot: 1 | 2, image: ImageState }) => (
    <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] bg-slate-900/50 hover:bg-slate-800/80 transition-colors group">
      {image ? (
        <>
          <img src={image.preview} alt={`Upload ${slot}`} className="h-32 object-contain rounded-lg" />
          <button 
            onClick={() => removeImage(slot)}
            className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <UploadCloud className="w-10 h-10 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm text-slate-400 mb-2">اضغط لرفع صورة</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleImageUpload(e, slot)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </>
      )}
    </div>
  );

  return (
    <section className="max-w-4xl mx-auto px-6 mb-16 relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50"></div>
      <div className="relative bg-[#0a0f1e]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-slate-400">{config.desc}</p>
        </div>

        {/* Image Uploads */}
        {(config.inputType === 'image' || config.inputType === 'two-images') && (
          <div className={`grid gap-4 mb-6 ${config.inputType === 'two-images' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <ImageUploader slot={1} image={image1} />
            {config.inputType === 'two-images' && (
              <ImageUploader slot={2} image={image2} />
            )}
          </div>
        )}

        {/* Textarea */}
        <div className="relative mb-6">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={config.placeholder}
            className="w-full h-32 p-5 bg-[#030712]/50 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-slate-600 transition-all"
            maxLength={1000}
          />
          <div className="absolute bottom-3 left-3 text-xs text-slate-500">
            {textInput.length}/1000
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button 
          onClick={handleGenerate}
          disabled={isGenerateDisabled()}
          className="relative w-full group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-500 group-disabled:hidden"></div>
          <div className="relative w-full bg-slate-900 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 text-white border border-white/10 transition-colors">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5 text-purple-400" />
                <span>تنفيذ</span>
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
              <h3 className="font-bold text-lg text-white">النتيجة:</h3>
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
