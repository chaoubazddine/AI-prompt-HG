import { safeJsonParse } from "../utils/jsonCleaner";
import { generateAIContent } from "./aiClient";
import { LessonSummaryData, SummarySection, SummarySubsection } from "../types/summary";

export { type LessonSummaryData, type SummarySection, type SummarySubsection };

export const generateFallbackSummary = (
  lessonTitle: string,
  level: string,
  subject: string = "التاريخ"
): LessonSummaryData => {
  return {
    title: lessonTitle,
    subject: subject || "الاجتماعيات",
    level: level,
    introduction: {
      context: `يشكل درس "${lessonTitle}" أحد المحاور الأساسية في برنامج مادة ${subject} لمستوى ${level}، حيث يسلط الضوء على سياق الظاهرة، عواملها المؤثرة، والنتائج المترتبة عنها.`,
      questions: [
        "ما هو الإطار والسياق العام المؤطر لموضوع الدرس؟",
        "ما هي أهم العوامل والأسباب المفسرة للظاهرة؟",
        "ما هي أبرز النتائج والامتدادات المترتبة عنها؟"
      ]
    },
    sections: [
      {
        mainTitle: "أولاً: السياق العام ومظاهر وتجليات الظاهرة",
        subsections: [
          {
            subTitle: "1. الإطار المفاهيمي والسياق العام",
            content: [
              `تحديد مفهوم "${lessonTitle}" وإبراز سياقه ومجاله.`,
              "رصد المحطات التاريخية والمجالية البارزة التي ميزت تطور الموضوع.",
              "تحديد المفاهيم الأساسية المرتبطة ببنية الدرس والمقرر الدراسي."
            ]
          },
          {
            subTitle: "2. أبرز المظاهر والتجليات الأساسية",
            content: [
              "استخلاص مظاهر التحول والتطور استناداً إلى الوثائق والدعامات الديداكتيكية.",
              "مقارنة المؤشرات والخصائص النوعية والكمية المفسرة للظاهرة."
            ]
          }
        ]
      },
      {
        mainTitle: "ثانياً: العوامل والأسباب المفسرة للظاهرة",
        subsections: [
          {
            subTitle: "1. العوامل البنيوية والداخلية",
            content: [
              "العوامل المباشرة والظروف التي ساهمت في بلورة الوضعية.",
              "التحولات الهيكلية والتنظيمية المواكبة للظاهرة."
            ]
          },
          {
            subTitle: "2. العوامل الخارجية والتأثيرات المحيطة",
            content: [
              "انعكاسات الظروف الإقليمية والدولية على مسار التطور.",
              "تفاعل العوامل وتكاملها في تفسير النتائج العامة."
            ]
          }
        ]
      },
      {
        mainTitle: "ثالثاً: النتائج والانعكاسات العامة والامتدادات",
        subsections: [
          {
            subTitle: "1. الحصيلة العامة والنتائج المباشرة",
            content: [
              "رصد الآثار المترتبة على المستويات السياسية، الاقتصادية، والمجالية.",
              "تقييم الأبعاد الإيجابية والتحديات الناجمة عن الظاهرة."
            ]
          }
        ]
      }
    ],
    conclusion: `نستخلص أن درس "${lessonTitle}" يجسد مرحلة هامة تفاعلت فيها مجموعة من العوامل لتفرز نتائج عميقة الأثر ساهمت في توجيه التطورات اللاحقة.`,
    keyTerms: [
      {
        term: lessonTitle,
        definition: `المفهوم المحوري لموضوع الدرس في مقرر ${subject} لمستوى ${level}.`
      },
      {
        term: "النهج الديداكتيكي",
        definition: "خطوات المعالجة الديداكتيكية المعتمدة: التعريف، التفسير، والتركيب."
      }
    ]
  };
};

export const generateLessonSummary = async (
  lessonTitle: string,
  subject: string,
  level: string,
  term?: string,
  options?: { summaryType?: string; targetLength?: string }
): Promise<LessonSummaryData> => {
  const prompt = `
أنت خبير تربوي مغربي متخصص في تدريس مادة الاجتماعيات (التاريخ، الجغرافيا، التربية على المواطنة).
مهمتك إعداد "ملخص درس تركيبي مركز وشامل" ومعد بطريقة بيداغوجية احترافية لدرس: "${lessonTitle}" 
المستوى: "${level}"
المكون: "${subject}"
${term ? `الدورة: "${term}"` : ''}

المطلوب:
1. مقدمة موجزة تمهد للموضوع وتطرح الأسئلة الإشكالية.
2. محاور رئيسية (بين 2 إلى 3 محاور كبرى) تتبع النهج الديداكتيكي للمادة (التعريف، التفسير، التركيب).
3. فقرات ونقاط ملخصة وواضحة وسلسة دون إخلال بالعمق المعرفي والمفاهيم الرسمية.
4. خاتمة استخلاصية موجزة تفتح آفاقاً للدرس الموالي.
5. لائحة بأهم المفاهيم والمصطلحات الأساسية للدرس وشرحها الرسمي المختصر.

أخرج النتيجة حصراً بصيغة JSON وفق الهيكل التالي دون أي مقدمات نصية:

{
  "title": "${lessonTitle}",
  "subject": "${subject}",
  "level": "${level}",
  "introduction": {
    "context": "نص التمهيد الإشكالي المركّز...",
    "questions": ["السؤال الإشكالي الأول؟", "السؤال الإشكالي الثاني؟", "السؤال الإشكالي الثالث؟"]
  },
  "sections": [
    {
      "mainTitle": "أولاً: [عنوان المحور الأول]",
      "subsections": [
        {
          "subTitle": "1. [عنوان الفقرة الأولى]",
          "content": ["النقطة الأولى المركزة والمفيدة...", "النقطة الثانية...", "النقطة الثالثة..."]
        }
      ]
    }
  ],
  "conclusion": "نص الخاتمة التركيبية المعبرة والموجزة...",
  "keyTerms": [
    {
      "term": "المفهوم الأساسي 1",
      "definition": "التعريف العلمي الدقيق والموجز..."
    }
  ]
}
`;

  try {
    const rawResponse = await generateAIContent({
      prompt,
      responseMimeType: "application/json",
      temperature: 0.3,
      preferredModel: "gemini-3.7-flash",
    });

    if (rawResponse) {
      const parsed = safeJsonParse<LessonSummaryData>(rawResponse);
      if (parsed && parsed.title && parsed.sections && parsed.sections.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("generateLessonSummary error, fallback triggered:", error);
  }

  return generateFallbackSummary(lessonTitle, level, subject);
};
