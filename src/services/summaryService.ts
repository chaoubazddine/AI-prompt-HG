import { GoogleGenAI } from "@google/genai";
import { LessonSummaryData } from "../types/summary";
import { safeJsonParse } from "../utils/jsonCleaner";

export const generateLessonSummary = async (
  lessonTitle: string,
  subject: string = "التاريخ",
  level: string = "الأولى بكالوريا",
  term: string = "الدورة الأولى",
  curriculum: string = "المنهاج الرسمي المغربي"
): Promise<LessonSummaryData> => {
  const prompt = `
أنت مفتش ممتاز وخبير تربوي في تدريس مادة الاجتماعيات (${subject}) بالمنهاج المغربي.
مهمتك هي صياغة "ملخص درسي نموذجي" منظم ومكثف ودقيق لدرس: "${lessonTitle}" للمستوى: "${level}" (${term}) (${curriculum}).

يجب أن يلتزم الملخص التزاماً تاماً بـ **التوجيهات التربوية المغربية لمادة الاجتماعيات** والنمط المعتمد كالتالي:

1. **عنوان الدرس (title)**: "${lessonTitle}"
2. **المادة (subject)**: "${subject}"
3. **المستوى (level)**: "${level}"
4. **مقدمة (introduction)**:
   - context: نص التمهيد الإشكالي المحفز وصياغة مركزة.
   - questions: 3 أسئلة إشكالية موجهة ومطابقة لعناوين المحاور الرئيسية (فما هي... وكيف... وما نتائج...؟).
5. **المحاور الرئيسية (sections)**:
   - المحور الأول: "أولاً: [عنوان رئيسي دقيق يركز على الوصف أو التفسير أو التعريف]"
   - المحور الثاني: "ثانياً: [عنوان رئيسي دقيق]"
   - المحور الثالث (حسب طبيعة الدرس): "ثالثاً: [عنوان رئيسي دقيق]"
   - داخل كل محور، أضف 2 إلى 3 عناوين فرعية (subsections) مثل:
     - subTitle: "1. [عنوان فرعي]"
     - content: مصفوفة من النقاط التلخيصية (3-5 نقاط غنية بالمعطيات والتواريخ والأرقام والدقة العلمية).
     - keyTerms (اختياري): أهم المصطلحات والمفاهيم الرسمية المرتبطة بهذا الجزء مع تعريفها الدقيق (إن وجدت).
6. **خاتمة (conclusion)**: تركيب عام واستخلاص مركز يربط الدرس بافتتاحية الدرس القادم.
7. **المفاهيم والمصطلحات الأساسية (keyTerms)**: قائمة مركزة بأهم المصطلحات والمفاهيم الرسمية المعتمدة للدرس مع تعريفاتها الدقيقة (تكون مستقلة في النهاية بعد الخاتمة).

تنسيق الاستجابة يجب أن يكون JSON حصراً بالبنية التالية:

{
  "title": "${lessonTitle}",
  "subject": "${subject}",
  "level": "${level}",
  "module": "الدورة الأولى / الثانية",
  "introduction": {
    "context": "تمهيد إشكالي مركز...",
    "questions": [
      "فما هي ظروف...؟",
      "وما هي مراحل...؟",
      "وما هي النتائج والتداعيات...؟"
    ]
  },
  "sections": [
    {
      "mainTitle": "أولاً: [عنوان المحور الأول]",
      "subsections": [
        {
          "subTitle": "1. [عنوان الفقرة الفرعية الأولى]",
          "content": [
            "نقطة ملخصة دقيقة تتضمن المعطيات والتواريخ والوقائع...",
            "نقطة ثانية غنية بالتحليل والشرح...",
            "نقطة ثالثة..."
          ]
        },
        {
          "subTitle": "2. [عنوان الفقرة الفرعية الثانية]",
          "content": [
            "نقطة ملخصة دقيقة...",
            "نقطة ثانية..."
          ]
        }
      ]
    },
    {
      "mainTitle": "ثانياً: [عنوان المحور الثاني]",
      "subsections": [
        {
          "subTitle": "1. [عنوان فرعي]",
          "content": [
            "نقطة ملخصة...",
            "نقطة ثانية..."
          ]
        }
      ]
    }
  ],
  "conclusion": "خاتمة استخلاصية مركزة...",
  "keyTerms": [
    { "term": "المفهوم / المصطلح 1", "definition": "التعريف الديداكتيكي الرسمي المعتمد..." },
    { "term": "المفهوم / المصطلح 2", "definition": "التعريف الديداكتيكي الرسمي المعتمد..." }
  ]
}
`;

  let retries = 3;
  while (retries > 0) {
    try {
      const manualKey = typeof window !== 'undefined' ? localStorage.getItem('user_gemini_key') : null;
      const apiKey = manualKey || process.env.API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.trim() === "" || apiKey.includes("TODO")) {
        throw new Error("مفتاح API غير صالح أو مفقود. يرجى تفعيل المفتاح في الإعدادات.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest'];
      let responseText = '';
      let lastErr: any = null;

      for (const modelName of modelsToTry) {
        try {
          const res = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          if (res.text) {
            responseText = res.text;
            break;
          }
        } catch (e) {
          console.warn(`Model ${modelName} failed in generateLessonSummary, trying fallback...`, e);
          lastErr = e;
        }
      }

      if (!responseText) {
        throw lastErr || new Error("تلقينا استجابة فارغة من خادم الذكاء الاصطناعي.");
      }

      return safeJsonParse<LessonSummaryData>(responseText);
    } catch (error: any) {
      console.error(`API Summary Error (Attempts remaining: ${retries - 1}):`, error);
      retries--;
      if (retries === 0) {
        throw new Error(error.message || "فشل في توليد الملخص. يرجى المحاولة مرة أخرى.");
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  throw new Error("فشل في توليد الملخص بعد عدة محاولات.");
};
