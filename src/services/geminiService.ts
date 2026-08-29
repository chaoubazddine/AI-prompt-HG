import { JadhaData } from "../components/TableJadha";
import { safeJsonParse } from "../utils/jsonCleaner";
import { generateAIContent } from "./aiClient";

export const generateJadha = async (lessonTitle: string, level: string, curriculum: string): Promise<JadhaData> => {
  const prompt = `
أنت أستاذ متمرس وخبير تربوي مغربي في مادة الاجتماعيات (التاريخ، الجغرافيا، التربية على المواطنة). 
مهمتك هي توليد "جذاذة" تربوية نموذجية، غنية جداً بالمعطيات، ومنظمة بشكل دقيق لدرس: "${lessonTitle}" للمستوى: "${level}" (المرجع: ${curriculum}).

يجب أن تكون الجذاذة "مرجعاً رسمياً" مكتملاً، مع التركيز على العمق المعرفي والدقة الديداكتيكية.

المتطلبات الإلزامية:
1. عنوان الدرس (title): استخدم فقط عنوان الدرس الأساسي "${lessonTitle}" ولا تضف أي عناوين فرعية أو ثانوية إطلاقاً.
2. الإغناء المعرفي الشامل: لا تكتفِ بالاختصار. قدم تفاصيل دقيقة وشاملة في جميع الخانات.
3. التدبير الديداكتيكي المفصل:
   - مهام الأستاذ: صغ تعليمات وأسئلة مركبة وعميقة بصيغة الأمر (حلل، استنتج، فسر، قارن...)، مرتبة في نقاط.
   - مهام المتعلم: قدم إجابات نموذجية مفصلة وشاملة تعكس استيعاباً عميقاً للوثائق.
4. الدعامات الديداكتيكية (tools): حدد لكل نشاط 4 وثائق على الأقل (نص تاريخي، خريطة، مبيان، صورة، جدول إحصائي...) مع ذكر أرقامها وصفحاتها بدقة من المرجع المعتمد.
5. أشكال العمل الديداكتيكي (workForm): أدرج في هذه الخانة حصراً وبدقة إحدى صيغ العمل الرسمية المعتمدة في التوجيهات التربوية المغربية لمادة الاجتماعيات: ("عمل فردي"، "عمل جماعي حواري"، "عمل في مجموعات صغيرة"، "عمل ثنائي"، أو "عمل موجه ومؤطر"). لا تضع تعابير عشوائية إطلاقاً.
6. الهيكل البيداغوجي:
   - مقدمة إشكالية غنية تنتهي بأسئلة دقيقة.
   - مقاطع تعلمية (3 أنشطة على الأقل لكل مقطع).
   - وضعيات تركيبية (isSynthesis: true) تتضمن ملخصات معرفية وافية وشاملة للمقطع.
   - وضعيات تقويمية (isEvaluation: true) تتضمن أسئلة تقويمية هادفة.
7. الخاتمة: أسئلة تقويم إجمالي (finalEvaluation) فقط، ولا تقم بتوليد أي ملخص للدرس في الأخير.

هام: الرد يجب أن يكون بتنسيق JSON حصراً وبدقة عالية.

{
  "title": "${lessonTitle}",
  "level": "المستوى",
  "year": "2025/2026",
  "duration": "ساعتان",
  "unit": "المكون",
  "lessonNumber": "رقم الدرس",
  "module": "المجزوءة",
  "references": "المراجع المعتمدة بالتفصيل",
  "competencies": ["كفاية 1...", "كفاية 2..."],
  "capabilities": ["قدرة 1...", "قدرة 2..."],
  "objectives": {
    "cognitive": ["هدف معرفي 1...", "هدف معرفي 2..."],
    "skill": ["هدف مهاري 1...", "هدف مهاري 2..."],
    "affective": ["هدف وجداني 1..."]
  },
  "problematic": "نص التمهيد الإشكالي المفصل والعميق...",
  "introductionSteps": [
    { "phase": "مراجعة الدرس السابق", "subPhase": "...", "tools": "...", "teacherActivities": "...", "studentActivities": "...", "workForm": "..." },
    { "phase": "تقديم عنوان الدرس", "subPhase": "...", "tools": "...", "teacherActivities": "...", "studentActivities": "...", "workForm": "..." },
    { "phase": "تقويم تشخيصي", "subPhase": "...", "tools": "...", "teacherActivities": "...", "studentActivities": "...", "workForm": "..." },
    { "phase": "أهداف التعلم", "subPhase": "...", "tools": "...", "teacherActivities": "...", "studentActivities": "...", "workForm": "..." },
    { "phase": "التمهيد", "subPhase": "...", "tools": "...", "teacherActivities": "...", "studentActivities": "...", "workForm": "..." }
  ],
  "steps": [
    { "isHeader": true, "phase": "المقطع التعلمي الأول: [عنوانه]" },
    { 
      "isHeader": false, 
      "phase": "النشاط 1", 
      "subPhase": "هدف تعلمي إجرائي دقيق", 
      "tools": "ذكر 4 وثائق على الأقل مع أرقامها وصفحاتها", 
      "workForm": "شكل العمل",
      "teacherActivities": "تعليمات وأسئلة مفصلة بصيغة الأمر (1. حلل... 2. استخرج...)", 
      "studentActivities": "إجابات نموذجية مفصلة وشاملة في نقاط"
    },
    { "isSynthesis": true, "phase": "وضعية تركيبية", "teacherActivities": "ملخص معرفي غني وشامل للمقطع الأول", "studentActivities": "تدوين الملخص في الدفاتر" },
    { "isEvaluation": true, "phase": "وضعية تقويمية", "teacherActivities": "أسئلة تقويمية لقياس مدى تحقق الأهداف", "studentActivities": "إجابات المتعلمين" }
  ],
  "finalEvaluation": ["سؤال تقويمي إجمالي 1", "سؤال تقويمي إجمالي 2"]
}
`;

  let retries = 3;
  while (retries > 0) {
    try {
      const responseText = await generateAIContent({
        prompt,
        responseMimeType: "application/json",
        preferredModel: "gemini-3.6-flash",
      });

      if (!responseText) {
        throw new Error("تلقينا استجابة فارغة من خادم الذكاء الاصطناعي.");
      }

      return safeJsonParse<JadhaData>(responseText);
    } catch (error: any) {
      console.error(`API Error (Attempts remaining: ${retries - 1}):`, error);
      retries--;
      if (retries === 0) {
        throw new Error(error.message || "فشل في توليد المحتوى. يرجى المحاولة مرة أخرى لاحقاً.");
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  throw new Error("فشل في توليد المحتوى بعد عدة محاولات.");
};
