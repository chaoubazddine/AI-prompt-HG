import { safeJsonParse } from "../utils/jsonCleaner";
import { generateAIContent } from "./aiClient";
import { 
  ExamData, 
  SubjectComponent, 
  Situation1_Objective, 
  Situation2_Documents, 
  Situation3_Essay, 
  ExamAnswerKey 
} from "../types/exam";

export const generateFallbackMiddleSchoolExam = (
  level: string,
  term: 'الدورة الأولى' | 'الدورة الثانية',
  examTitle: string,
  selectedLessons: {
    history: string[];
    geography: string[];
    civics: string[];
  },
  framework: {
    situation1: SubjectComponent;
    situation2: SubjectComponent;
    situation3: SubjectComponent;
  },
  teacherInfo?: {
    teacherName?: string;
    schoolName?: string;
  }
): ExamData => {
  const isHighSchool = level.includes('باك') || level.includes('الجذع');
  const histLesson = selectedLessons.history[0] || "المغرب في مطلع العصر الحديث";
  const geoLesson = selectedLessons.geography[0] || "المغرب: موقع استراتيجي";
  const civLesson = selectedLessons.civics[0] || "الكرامة وحقوق الإنسان";

  const allLessons = [
    ...selectedLessons.history,
    ...selectedLessons.geography,
    ...selectedLessons.civics
  ].filter(Boolean);

  const s1Component = framework.situation1;
  const s2Component = framework.situation2;
  const s3Component = framework.situation3;

  // Situation 1: Objective Questions (6 pts in Middle School, or omitted in 10/10 High School)
  const situation1: Situation1_Objective = {
    component: s1Component,
    title: `الوضعية الاختبارية الأولى: مادة ${s1Component} - الاشتغال على المفاهيم والأسئلة الموضوعية (6 ن)`,
    totalPoints: 6,
    termsToDefine: [
      {
        term: s1Component === 'التاريخ' ? "الدولة الحديثة" : s1Component === 'الجغرافيا' ? "الموقع الاستراتيجي" : "المواطنة الإيجابية",
        definitionHint: "عرف المفهوم اصطلاحياً وسياقياً بدقة وفق المقرر الدراسي.",
        points: 2
      },
      {
        term: s1Component === 'التاريخ' ? "النهضة الأوربية" : s1Component === 'الجغرافيا' ? "المجال المغربي" : "الكرامة الإنسانية",
        definitionHint: "بين الدلالة الحقوقية والتربوية للمفهوم.",
        points: 2
      }
    ],
    objectiveQuestions: [
      {
        type: "true_false",
        questionText: `ضع علامة (✓) في الخانة المناسبة (صحيح أو خطأ) بالنسبة للموضوع المرتبط بـ (${s1Component === 'التاريخ' ? histLesson : s1Component === 'الجغرافيا' ? geoLesson : civLesson}):`,
        optionsOrMatches: [
          { left: "يشكل الانفتاح الاقتصادي رافعة أساسية للتنمية المجالية المندمجة.", right: "صحيح" },
          { left: "تقتصر حقوق المواطنة على الواجبات الفردية دون التزامات متبادلة.", right: "خطأ" }
        ],
        points: 2
      }
    ]
  };

  // Situation 2: Documents (7 pts Middle School / 10 pts High School)
  const situation2: Situation2_Documents = {
    component: s2Component,
    title: `الوضعية الاختبارية ${isHighSchool ? 'الأولى' : 'الثانية'}: مادة ${s2Component} - الاشتغال على الوثائق (${isHighSchool ? '10 ن' : '7 ن'})`,
    totalPoints: isHighSchool ? 10 : 7,
    documents: [
      {
        docNumber: 1,
        docType: "نص جغرافي/تاريخي",
        title: `وثيقة نصية مؤطرة لدرس (${s2Component === 'التاريخ' ? histLesson : s2Component === 'الجغرافيا' ? geoLesson : civLesson})`,
        content: `«تعتبر هذه المحطة البيداغوجية مجالا لتشخيص العوامل المتدخلة في توجيه التطورات وتحقيق التوازن الهيكلي، حيث تتكامل الإمكانات الطبيعية والبشرية لصياغة نموذج تنموي واعد قادر على مواجهة الرهانات التنافسية والإكراهات التدبيرية المعاصرة...»`,
        source: "المرجع التربوي المعتمد لمادة الاجتماعيات - التوجيهات الرسمية"
      },
      {
        docNumber: 2,
        docType: "جدول معطيات",
        title: "جدول إحصائي تركيبي للمؤشرات الأساسية",
        content: "جدول يبرز التوزيع النسبي للقطاعات والمؤشرات المعتمدة في التحليل الديداكتيكي.",
        tableData: {
          headers: ["المؤشر / القطاع", "النسبة المئوية (%)", "الملاحظات الديداكتيكية"],
          rows: [
            ["القطاع الأول (الإنتاجي)", "42%", "نمو إيجابي مستمر وتحديث في أساليب العمل"],
            ["القطاع الثاني (التحويلي)", "31%", "تطور ملحوظ ودينامية استثمارية واعدة"],
            ["قطاع الخدمات والتجارة", "27%", "انفتاح واسع على المحيط الخارجي"]
          ]
        },
        source: "معطيات إحصائية تركيبية للتقويم التربوي"
      }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: s2Component === 'التاريخ' 
          ? "حدد(ي) السياق التاريخي العام للوثيقتين (الزمان، المكان، الموضوع)."
          : "حدد(ي) الفكرة الأساس أو موضوع الوثيقتين بدقة.",
        points: isHighSchool ? 2 : 1
      },
      {
        questionNumber: 2,
        questionText: "استخرج(ي) من الوثيقة 1 العوامل والآليات المبرزة في النص.",
        points: isHighSchool ? 3 : 2
      },
      {
        questionNumber: 3,
        questionText: "استقرئ(ي) من الوثيقة 2 الجدول الإحصائي ورتب المؤشرات حسب الأهمية.",
        points: isHighSchool ? 2 : 2
      },
      {
        questionNumber: 4,
        questionText: "حرر(ي) فقرة موجزة من مكتسباتك تبرز فيها آفاق التطور والحلول المقترحة لتجاوز الإكراهات.",
        points: isHighSchool ? 3 : 2
      }
    ]
  };

  // Situation 3: Essay (7 pts Middle School / 10 pts High School)
  const situation3: Situation3_Essay = {
    component: s3Component,
    title: `الوضعية الاختبارية ${isHighSchool ? 'الثانية' : 'الثالثة'}: مادة ${s3Component} - إنتاج موضوع مقالي (${isHighSchool ? '10 ن' : '7 ن'})`,
    totalPoints: isHighSchool ? 10 : 7,
    choiceInstruction: "اكتب(ي) حسب اختيارك في أحد الموضوعين المقاليين الآتيين مستحضراً(ة) النهج المعتمد والخطوات المنهجية (مقدمة، عرض، خاتمة):",
    topics: [
      {
        topicNumber: 1,
        title: `الموضوع الأول (${s3Component})`,
        contextText: `شكل موضوع (${s3Component === 'التاريخ' ? histLesson : s3Component === 'الجغرافيا' ? geoLesson : civLesson}) محطة بارزة كشفت عن تداخل العوامل والنتائج في رسم ملامح المشهد العام.`,
        instructions: [
          "تحديد الإطار والسياق العام والمفاهيم المهيكلة للموضوع في مقدمة مناسبة وطرح الإشكالية.",
          "إبراز أهم المظاهر والخصائص المميزة للظاهرة في العرض.",
          "تحليل العوامل المفسرة والنتائج المترتبة عنها مع خاتمة تركيبية متوازنة."
        ]
      },
      {
        topicNumber: 2,
        title: `الموضوع الثاني (${s3Component})`,
        contextText: `تفرض التحديات التنموية والمجالية المعاصرة تضافر الجهود لبلورة حلول دقيقة تحقق العدالة المجالية والاجتماعية.`,
        instructions: [
          "مقدمة تبرز أهمية الموضوع وتطرح إشكالية واضحة وأسئلة موجهة.",
          "عرض مفصل يحلل التدابير المتخذة ورصد التحديات المعترضة.",
          "خاتمة تركيبية تقدم استنتاجاً عاماً وأفقاً مفتوحاً للموضوع."
        ]
      }
    ],
    methodologicalNotes: isHighSchool 
      ? "توزيع النقط: الجانب المنهجي (2ن) + الجانب المعرفي (7ن) + الجانب الشكلي وسلامة اللغة (1ن) = 10ن."
      : "توزيع النقط: الجانب المنهجي (1ن) + الجانب المعرفي (5ن) + الجانب الشكلي وسلامة التعبير (1ن) = 7ن."
  };

  // Answer Key
  const answerKey: ExamAnswerKey = {
    situation1Answers: [
      "1. التعاريف والمفاهيم: تقبل كل صياغة سليمة ومستوفية للشروط الاصطلاحية المعتمدة في المنهاج (نقطتان لكل مفهوم).",
      "2. الأسئلة الموضوعية: العبارة 1: صحيح (1ن) | العبارة 2: خطأ (1ن)."
    ],
    situation2Answers: [
      {
        questionNumber: 1,
        answer: "تحديد دقيق للموضوع والإطار العام/السياق التاريخي (الزمان، المكان، الموضوع).",
        points: isHighSchool ? 2 : 1
      },
      {
        questionNumber: 2,
        answer: "استخراج العناصر المباشرة من الوثيقة 1 وتصنيفها بشكل منهجي واضح.",
        points: isHighSchool ? 3 : 2
      },
      {
        questionNumber: 3,
        answer: "قراءة وتحليل معطيات الجدول الإحصائي مع ترتيب المؤشرات وتفسير التباينات.",
        points: isHighSchool ? 2 : 2
      },
      {
        questionNumber: 4,
        answer: "صياغة فقرة ربط دقيقة تركز على الحلول والامتدادات المكتسبة مع سلامة اللغة والأسلوب.",
        points: isHighSchool ? 3 : 2
      }
    ],
    situation3AnswerGuides: [
      {
        topicNumber: 1,
        topicTitle: `عناصر إجابة الموضوع المقالي الأول (${s3Component})`,
        introduction: "مقدمة مؤطرة للموضوع (سياق عام + إبراز الأهمية) مع طرح الإشكالية وتفريعاتها التساؤلية الدقيقة (1ن - 2ن).",
        development: [
          "الفقرة الأولى: رصد المظاهر والتشخيص الأولي للظاهرة بدقة.",
          "الفقرة الثانية: تحليل وتفسير العوامل والأسباب الداخلية والخارجية.",
          "الفقرة الثالثة: استخلاص الحصيلة والنتائج والانعكاسات المترتبة."
        ],
        conclusion: "خاتمة تركيبية تلخص النتائج وتفتح أفقاً جديداً للتفكير والتساؤل.",
        scoringBreakdown: [
          { item: "الجانب المنهجي (مقدمة، وضوح التصميم، خاتمة)", points: isHighSchool ? 2 : 1 },
          { item: "الجانب المعرفي (صحة المعلومات وتناسق الأفكار)", points: isHighSchool ? 7 : 5 },
          { item: "الجانب الشكلي (سلامة التعبير ونظافة الورقة)", points: 1 }
        ]
      },
      {
        topicNumber: 2,
        topicTitle: `عناصر إجابة الموضوع المقالي الثاني (${s3Component})`,
        introduction: "مقدمة منهجية تبرز الإشكالية التنموية والمجالية وتطرح الأسئلة الموجهة للعرض.",
        development: [
          "الفقرة الأولى: تشخيص الإكراهات والتحديات المطروحة.",
          "الفقرة الثانية: تحليل المبادرات والتدابير المتخذة لرفع الرهانات.",
          "الفقرة الثالثة: تقييم المخرجات وأثرها على التنمية المستدامة."
        ],
        conclusion: "خلاصة تركيبية موجزة تثمن المجهودات وتطرح تساؤلاً امتدادياً.",
        scoringBreakdown: [
          { item: "الجانب المنهجي", points: isHighSchool ? 2 : 1 },
          { item: "الجانب المعرفي", points: isHighSchool ? 7 : 5 },
          { item: "الجانب الشكلي", points: 1 }
        ]
      }
    ]
  };

  return {
    title: examTitle || `الفرض الكتابي المحروس - ${term}`,
    cycle: isHighSchool ? "التعليم الثانوي التأهيلي" : "التعليم الثانوي الإعدادي",
    level: level,
    term: term,
    duration: isHighSchool ? "ساعتان" : "ساعة واحدة",
    teacherName: teacherInfo?.teacherName || "ذ. عبد السلام الحاضي",
    schoolName: teacherInfo?.schoolName || "المؤسسة التعليمية",
    lessonsIncluded: allLessons.length > 0 ? allLessons : [histLesson, geoLesson, civLesson],
    situation1: isHighSchool ? undefined : situation1,
    situation2: situation2,
    situation3: situation3,
    answerKey: answerKey
  };
};

export const generateMiddleSchoolExam = async (
  level: string,
  term: 'الدورة الأولى' | 'الدورة الثانية',
  examTitle: string,
  selectedLessons: {
    history: string[];
    geography: string[];
    civics: string[];
  },
  framework: {
    situation1: SubjectComponent;
    situation2: SubjectComponent;
    situation3: SubjectComponent;
  },
  teacherInfo?: {
    teacherName?: string;
    schoolName?: string;
  }
): Promise<ExamData> => {
  const isHighSchool = level.includes('باك') || level.includes('الجذع');
  
  const prompt = `أنت خبير ومفتش تربوي تخصص مادة الاجتماعيات بالمنظومة التعليمية المغربية.
المطلوب صياغة موضوع امتحان/فرض كتابي محروس رسمي متكامل بدقة بيداغوجية وفق الأطر المرجعية المغربية المحينة.

بيانات الامتحان:
- السلك: ${isHighSchool ? 'التعليم الثانوي التأهيلي' : 'التعليم الثانوي الإعدادي'}
- المستوى: ${level}
- الدورة: ${term}
- العنوان: ${examTitle}
- الدروس المدرجة:
  * التاريخ: ${selectedLessons.history.join(', ') || 'دروس المقرر'}
  * الجغرافيا: ${selectedLessons.geography.join(', ') || 'دروس المقرر'}
  * التربية على المواطنة: ${selectedLessons.civics.join(', ') || 'دروس المقرر'}

التوزيع الديداكتيكي للوضعيات:
${!isHighSchool ? `1. الوضعية الأولى (6 ن): مادة ${framework.situation1} -> استعمال المفاهيم والمصطلحات والأسئلة الموضوعية.` : ''}
2. الوضعية ${isHighSchool ? 'الأولى (10 ن)' : 'الثانية (7 ن)'}: مادة ${framework.situation2} -> الاشتغال على الوثائق (نصوص، جداول، خطوط زمنية).
3. الوضعية ${isHighSchool ? 'الثانية (10 ن)' : 'الثالثة (7 ن)'}: مادة ${framework.situation3} -> إنتاج موضوع مقالي (موضوعان اختياريان).

أجب بصيغة JSON تطابق الحقول التالية تماماً بدون نصوص إضافية خارج الـ JSON:
{
  "title": "${examTitle}",
  "cycle": "${isHighSchool ? 'التعليم الثانوي التأهيلي' : 'التعليم الثانوي الإعدادي'}",
  "level": "${level}",
  "term": "${term}",
  "duration": "${isHighSchool ? 'ساعتان' : 'ساعة واحدة'}",
  "lessonsIncluded": ${JSON.stringify([...selectedLessons.history, ...selectedLessons.geography, ...selectedLessons.civics])},
  ${!isHighSchool ? `
  "situation1": {
    "component": "${framework.situation1}",
    "title": "الوضعية الاختبارية الأولى: مادة ${framework.situation1} - استعمال المفاهيم والأسئلة الموضوعية (6 ن)",
    "totalPoints": 6,
    "termsToDefine": [
      { "term": "المفهوم 1", "definitionHint": "توجيه", "points": 2 },
      { "term": "المفهوم 2", "definitionHint": "توجيه", "points": 2 }
    ],
    "objectiveQuestions": [
      {
        "type": "true_false",
        "questionText": "ضع علامة (✓) في الخانة المناسبة (صحيح أو خطأ):",
        "optionsOrMatches": [
          { "left": "عبارة ديداكتيكية 1", "right": "صحيح" },
          { "left": "عبارة ديداكتيكية 2", "right": "خطأ" }
        ],
        "points": 2
      }
    ]
  },` : ''}
  "situation2": {
    "component": "${framework.situation2}",
    "title": "الوضعية الاختبارية ${isHighSchool ? 'الأولى' : 'الثانية'}: مادة ${framework.situation2} - الاشتغال على الوثائق (${isHighSchool ? '10 ن' : '7 ن'})",
    "totalPoints": ${isHighSchool ? 10 : 7},
    "documents": [
      {
        "docNumber": 1,
        "docType": "نص",
        "title": "عنوان الوثيقة 1",
        "content": "نص الوثيقة الكامل والدقيق...",
        "source": "المصدر الرسمي"
      },
      {
        "docNumber": 2,
        "docType": "جدول معطيات",
        "title": "عنوان الجدول",
        "content": "شرح الجدول",
        "tableData": {
          "headers": ["العمود 1", "العمود 2", "العمود 3"],
          "rows": [
            ["معطى 1", "معطى 2", "معطى 3"],
            ["معطى 4", "معطى 5", "معطى 6"]
          ]
        },
        "source": "المصدر"
      }
    ],
    "questions": [
      { "questionNumber": 1, "questionText": "حدد(ي) السياق / الفكرة الأساس...", "points": ${isHighSchool ? 2 : 1} },
      { "questionNumber": 2, "questionText": "استخرج(ي) من الوثيقة 1...", "points": ${isHighSchool ? 3 : 2} },
      { "questionNumber": 3, "questionText": "استقرئ(ي) من الوثيقة 2...", "points": ${isHighSchool ? 2 : 2} },
      { "questionNumber": 4, "questionText": "حرر(ي) فقرة موجزة تبرز فيها...", "points": ${isHighSchool ? 3 : 2} }
    ]
  },
  "situation3": {
    "component": "${framework.situation3}",
    "title": "الوضعية الاختبارية ${isHighSchool ? 'الثانية' : 'الثالثة'}: مادة ${framework.situation3} - إنتاج موضوع مقالي (${isHighSchool ? '10 ن' : '7 ن'})",
    "totalPoints": ${isHighSchool ? 10 : 7},
    "choiceInstruction": "اكتب(ي) في أحد الموضوعين المقاليين التاليين حسب اختيارك مستحضراً الخطوات المنهجية:",
    "topics": [
      {
        "topicNumber": 1,
        "title": "الموضوع الأول (${framework.situation3})",
        "contextText": "نص الانطلاق للموضوع المقالي الأول...",
        "instructions": [
          "مقدمة مناسبة وطرح الإشكالية والتساؤلات.",
          "عرض تحليلي مفصل يجيب عن محاور الموضوع.",
          "خاتمة تركيبية مناسبة."
        ]
      },
      {
        "topicNumber": 2,
        "title": "الموضوع الثاني (${framework.situation3})",
        "contextText": "نص الانطلاق للموضوع المقالي الثاني...",
        "instructions": [
          "مقدمة منهجية مع التساؤلات.",
          "عرض تحليلي مقارن.",
          "خاتمة تركيبية."
        ]
      }
    ],
    "methodologicalNotes": "${isHighSchool ? 'الجانب المنهجي (2ن) + الجانب المعرفي (7ن) + الجانب الشكلي (1ن) = 10ن' : 'الجانب المنهجي (1ن) + الجانب المعرفي (5ن) + الجانب الشكلي (1ن) = 7ن'}"
  },
  "answerKey": {
    "situation1Answers": [
      "تعاريف المفاهيم النموذجية...",
      "أجوبة الأسئلة الموضوعية..."
    ],
    "situation2Answers": [
      { "questionNumber": 1, "answer": "الإجابة النموذجية للسؤال 1", "points": ${isHighSchool ? 2 : 1} },
      { "questionNumber": 2, "answer": "الإجابة النموذجية للسؤال 2", "points": ${isHighSchool ? 3 : 2} },
      { "questionNumber": 3, "answer": "الإجابة النموذجية للسؤال 3", "points": ${isHighSchool ? 2 : 2} },
      { "questionNumber": 4, "answer": "الإجابة النموذجية للسؤال 4", "points": ${isHighSchool ? 3 : 2} }
    ],
    "situation3AnswerGuides": [
      {
        "topicNumber": 1,
        "topicTitle": "عناصر إجابة الموضوع المقالي الأول",
        "introduction": "مقدمة نموذجية...",
        "development": [
          "أفكار الفقرة الأولى...",
          "أفكار الفقرة الثانية...",
          "أفكار الفقرة الثالثة..."
        ],
        "conclusion": "خاتمة نموذجية...",
        "scoringBreakdown": [
          { "item": "الجانب المنهجي", "points": ${isHighSchool ? 2 : 1} },
          { "item": "الجانب المعرفي", "points": ${isHighSchool ? 7 : 5} },
          { "item": "الجانب الشكلي والتعبير", "points": 1 }
        ]
      },
      {
        "topicNumber": 2,
        "topicTitle": "عناصر إجابة الموضوع المقالي الثاني",
        "introduction": "مقدمة نموذجية...",
        "development": [
          "أفكار الفقرة الأولى...",
          "أفكار الفقرة الثانية..."
        ],
        "conclusion": "خاتمة نموذجية...",
        "scoringBreakdown": [
          { "item": "الجانب المنهجي", "points": ${isHighSchool ? 2 : 1} },
          { "item": "الجانب المعرفي", "points": ${isHighSchool ? 7 : 5} },
          { "item": "الجانب الشكلي والتعبير", "points": 1 }
        ]
      }
    ]
  }
}
`;

  let retries = 2;
  while (retries > 0) {
    try {
      const responseText = await generateAIContent({
        prompt,
        responseMimeType: "application/json",
        preferredModel: "gemini-3.7-flash",
      });

      if (!responseText) {
        throw new Error("تلقينا استجابة فارغة من خادم الذكاء الاصطناعي.");
      }

      const parsed = safeJsonParse<ExamData>(responseText);
      if (parsed && parsed.situation2 && parsed.situation3 && parsed.answerKey) {
        if (teacherInfo?.teacherName) parsed.teacherName = teacherInfo.teacherName;
        if (teacherInfo?.schoolName) parsed.schoolName = teacherInfo.schoolName;
        return parsed;
      }
      throw new Error("بيانات الامتحان غير مكتملة.");
    } catch (error: any) {
      console.warn(`API Exam Error (Attempts remaining: ${retries - 1}):`, error?.message || error);
      retries--;
      if (retries === 0) {
        return generateFallbackMiddleSchoolExam(level, term, examTitle, selectedLessons, framework, teacherInfo);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return generateFallbackMiddleSchoolExam(level, term, examTitle, selectedLessons, framework, teacherInfo);
};

// Aliases for compatibility
export const generateExam = generateMiddleSchoolExam;
export const generateFallbackExam = generateFallbackMiddleSchoolExam;
