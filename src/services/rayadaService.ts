import { RayadaJadhaData, RayadaExamData, RayadaTarlTest } from "../types/rayada";
import { safeJsonParse } from "../utils/jsonCleaner";
import { generateAIContent } from "./aiClient";

/**
 * توليد جذاذة وفق نموذج "التدريس الصريح" المعتمد في إعداديات الريادة بالمغرب
 */
export const generateRayadaJadha = async (
  lessonTitle: string,
  level: string = "الأولى إعدادي",
  subject: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' = 'التاريخ',
  textbook: string = "كراسة الأنشطة لريادة الاجتماعيات + الكتاب المدرسي",
  term: 'الدورة الأولى' | 'الدورة الثانية' = 'الدورة الأولى'
): Promise<RayadaJadhaData> => {
  const prompt = `
أنت خبير بيداغوجي ومفتش تربوي متخصص في منهاج "إعداديات الريادة (Collèges Pionniers)" ومقاربة "التدريس الصريح (Enseignement Explicite)" في مادة الاجتماعيات بالتعليم الثانوي الإعدادي بالمملكة المغربية.

مهمتك هي بناء "جذاذة تربوية نموذجية بالتدريس الصريح" مكتملة العناصر لدرس:
- عنوان الدرس: "${lessonTitle}"
- السلك: التعليم الثانوي الإعدادي
- المستوى الدراسي: "${level}"
- المكون: "${subject}"
- الدورة: "${term}"
- المرجع: "${textbook}"

قواعد وهندسة جذاذة إعداديات الريادة بالتدريس الصريح:
1. **الترويسة والكفايات**:
   - كفاية أساسية مستهدفة مرتبطة بمهارات المادة (توطين، تفسير، تحليل زمني/مجالي، مقارنة، استدلال مواطناتي).
   - أهداف تعلمية مصرح بها بلغة مباشرة وبسيطة يفهمها التلميذ.
   - الدعامات: المسلاط الضوئي التفاعلي، كراسة الأنشطة، الألواح الفردية (Ardoises)، الدفاتر.

2. **محطة التذكير والتنشيط (Réactivation - 3 إلى 5 دقائق)**:
   - أسئلة سريعة ومركزة لاستدعاء المكتسبات ذات الصلة مع تفعيل تقنية الألواح لضمان مشاركة 100% من التلاميذ.
   - جسر انتقال صريح للدرس الجديد.

3. **التصريح بالهدف (Objectif Explicite)**:
   - عبارة واضحة للأستاذ تبدأ بـ: "في نهاية هذه الحصة ستكونون قادرين على..."

4. **مقاطع الدرس (Steps) وفق النموذج الثلاثي الصريح**:
   لكل مقطع (قسم الدرس إلى 2 أو 3 مقاطع تعلمية رئيسية)، يجب تفصيل المراحل التالية بدقة بالغة:
   - **أ. النمذجة (Modelage - "أنا أفعل / Je fais")**:
     * كلام الأستاذ التوضيحي والتفكير بصوت عالٍ (Verbalisation de la pensée).
     * خطوات العمل الدقيقة خطوة بخطوة في استقراء الوثيقة (خريطة، نص، جدول، خط زمني).
     * تقديم مثال مكتمل ونموذج محلول.
   - **ب. الممارسة الموجهة (Pratique guidée - "نحن نفعل / Nous faisons")**:
     * نشاط مماثل ينجزه المتعلمون في ثنائيات أو تفاعلياً بالألواح.
     * أسئلة التحقق السريع من الفهم (Check For Understanding - CFU).
     * أسلوب التصحيح الفوري وتقديم التغذية الراجعة (Feedback).
   - **ج. الممارسة المستقلة (Pratique autonome - "أنت تفعل / Tu fais")**:
     * تمرين فردي واضح في كراسة الأنشطة أو الدفتر للتثبيت.
     * معيار النجاح والتوقيت المحدد.
   - **د. التركيب والخلاصة (Synthèse)**:
     * تلخيص معرفي ومفاهيمي مهيكل ومختصر يُدون في الدفتر.

5. **الإغلاق والتقويم التكويني (Bilan & Clôture - 5 دقائق)**:
   - سؤال تذكرة الخروج (Exit Ticket) لقياس نسبة تحقق الهدف (عتبة 80%).
   - معالجة فورية للتمثلات الخاطئة الشائعة (Remédiation).

يرجى إرجاع البيانات بتنسيق JSON الصارم التالي دون أي نصوص إضافية:

{
  "title": "${lessonTitle}",
  "level": "${level}",
  "subject": "${subject}",
  "term": "${term}",
  "duration": "ساعتان (حصتان)",
  "academicYear": "2025/2026",
  "references": "${textbook}",
  "targetCompetency": "الكفاية الأساسية المستهدفة...",
  "explicitObjectives": [
    "الهدف الأول...",
    "الهدف الثاني...",
    "الهدف الثالث..."
  ],
  "pedagogicalTools": {
    "digitalSupport": "المسلاط الضوئي والعرض الرقمي التفاعلي لكراسة الريادة",
    "individualTools": "الألواح الفردية، كراسة أنشطة الريادة، الدفتر، الأقلام الملونة",
    "didacticMaterials": "خرائط جغرافية، نصوص تاريخية، جداول إحصائية، خطوط زمنية"
  },
  "reactivation": {
    "duration": "5 دقائق",
    "questions": ["سؤال التنشيط 1", "سؤال التنشيط 2"],
    "activationMechanism": "رفع الألواح الفردية لتأكيد استيعاب المكتسبات القبلية",
    "expectedAnswers": ["إجابة متوقعة 1", "إجابة متوقعة 2"],
    "linkToNewLesson": "الربط بالدرس الجديد..."
  },
  "explicitGoalStatement": "في نهاية حصتنا اليوم، ستكونون قادرين على...",
  "steps": [
    {
      "title": "المقطع الأول: [عنوان المحور الأول]",
      "targetSkill": "المهارة المستهدفة بدقة",
      "document": {
        "title": "عنوان الوثيقة/الدعامة",
        "type": "خريطة موضوعاتية / نص تاريخي / جدول",
        "reference": "الوثيقة 1 ص ... من كراسة الريادة",
        "contentSnippet": "مقتطف أو وصف لمحتوى الوثيقة..."
      },
      "modelage": {
        "teacherSpeech": "أنا الآن سأريكم كيف نقوم بـ... أبدأ أولاً بقراءة العنوان ثم المفتاح...",
        "demonstrationSteps": [
          "الخطوة الأولى: تحديد موضوع الوثيقة وإطارها",
          "الخطوة الثانية: تفكيك المعطيات الأساسية",
          "الخطوة الثالثة: استخلاص النتيجة والتعليل"
        ],
        "workedExample": "النموذج المحلول والمكتمل الذي يقدمه الأستاذ..."
      },
      "guidedPractice": {
        "studentTask": "الآن سنقوم معاً بتطبيق نفس الخطوات على الوثيقة المجاورة...",
        "collaborationType": "عمل تفاعلي جماعي بالألواح",
        "checkpoints": ["سؤال التحقق 1", "سؤال التحقق 2"],
        "feedbackProtocol": "في حال وجود خطأ في الألواح، يعيد الأستاذ توجيه الانتباه إلى المفتاح/السياق فوراً"
      },
      "independentPractice": {
        "taskDescription": "أنجزوا فردياً في كراسة الأنشطة النشاط رقم...",
        "successCriteria": "الإجابة الصحيحة وتحديد العنصرين بدقة",
        "timeAllocation": "6 دقائق"
      },
      "synthesis": {
        "keyTakeaway": "خلاصة المقطع الأولى المركزة لتدوينها في الدفتر...",
        "coreConcepts": ["مفهوم 1", "مفهوم 2"]
      }
    }
  ],
  "closure": {
    "duration": "5 دقائق",
    "bilanQuestion": "سؤال تذكرة الخروج الشامل...",
    "exitTicketTechnique": "كتابة الجواب في كلمة أو جملة على اللوحة ورفعها في وقت واحد",
    "successThreshold": "تحكم ما لا يقل عن 80% من المتعلمين"
  },
  "remediationHints": {
    "commonMisconceptions": ["خلط شائع بين المفهوم أ والمفهوم ب"],
    "immediateFix": "إعادة التذكير بالقاعدة المميزة بينهما بأمثلة سريعة"
  }
}
`;

  const responseText = await generateAIContent({
    prompt,
    responseMimeType: "application/json",
    temperature: 0.2,
    preferredModel: "gemini-3.6-flash",
  });

  if (responseText) {
    const parsed = safeJsonParse<RayadaJadhaData>(responseText);
    if (parsed && parsed.title && parsed.steps && parsed.steps.length > 0) {
      return parsed;
    }
  }

  throw new Error("فشل توليد جذاذة الريادة: يرجى المحاولة مرة أخرى.");
};

/**
 * توليد فرض كتابي محروس وفق شبكة التنقيط المعيارية لإعداديات الريادة
 */
export const generateRayadaExam = async (
  level: string = "الأولى إعدادي",
  term: 'الدورة الأولى' | 'الدورة الثانية' = 'الدورة الأولى',
  examTitle: string = "الفرض الكتابي المحروس رقم 1 - إعداديات الريادة",
  selectedLessons: string[] = [],
  situationComponents: {
    situation1: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
    situation2: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
    situation3: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
  } = {
    situation1: 'التربية على المواطنة',
    situation2: 'التاريخ',
    situation3: 'الجغرافيا'
  },
  teacherInfo?: {
    teacherName?: string;
    schoolName?: string;
    academy?: string;
    directorate?: string;
  }
): Promise<RayadaExamData> => {
  const lessonsText = selectedLessons.length > 0 ? selectedLessons.join("، ") : "دروس الدورة الرسمية المقررة لمؤسسات الريادة";

  const prompt = `
أنت خبير تقويم وتخطيط تربوي بمشروع "إعداديات الريادة (Collèges Pionniers)" بمادة الاجتماعيات بالسلك الثانوي الإعدادي بالمغرب.
مهمتك إعداد "فرض كتابي محروس معياري (Évaluation Critériée)" متكامل مع عناصر الإجابة، شبكة التنقيط المعيارية (Grille Critériée)، وبطاقة المعالجة البعدية للتعثرات.

المعطيات:
- المستوى: ${level}
- الدورة: ${term}
- الدروس المقررة: ${lessonsText}
- عنوان الفرض: ${examTitle}
- توزيع المكونات:
  * الوضعية الأولى (6 نقط): مكون ${situationComponents.situation1} (بناء المفاهيم والأسئلة الموضوعية الدقيقة).
  * الوضعية الثانية (7 نقط): مكون ${situationComponents.situation2} (الاشتغال على وثيقة أساسية بأسئلة متدرجة).
  * الوضعية الثالثة (7 نقط): مكون ${situationComponents.situation3} (سؤال إنتاجي / فقرة موجهة بشبكة معيارية).

الشروط الإلزامية لتقويمات الريادة:
1. **الوضعية 1 (6 نقط)**: تشمل مهام موضوعية واضحة تقيس الدقة المعرفية (تحديد مفاهيم، وصل بسهم، جدول تصنيف، أسئلة الصواب والخطأ مع التعليل).
2. **الوضعية 2 (7 نقط)**: تقديم وثيقة أساسية واضحة ومكتملة، وتصنيف الأسئلة حسب مستويات التدرج المنهجي (تحديد نوع وسياق الوثيقة، استخراج المعطيات المباشرة، التفسير والتعليل، الاستخلاص والتركيب).
3. **الوضعية 3 (7 نقط)**: سياق انطلاق واضح يطرح الإشكالية مع توجيهات محددة بدقة في عوارض لما يجب تحريره، مع تقسيم النقط (نقطتان للجانب الشكلي والمنهجي + 5 نقط للمضامين المعرفية).
4. **عناصر الإجابة وشبكة التنقيط المعيارية (Rubric)**:
   - تحديد معايير التقويم (معيار الملاءمة، معيار الاستعمال السليم لأدوات المادة، معيار الانسجام والتركيب).
   - توضيح مؤشرات الإنجاز لثلاثة مستويات تحكم: متحكم (Acquis)، في طور التحكم (En cours d'acquisition)، غير متحكم (Non acquis).
5. **خطة المعالجة البعدية للتعثرات (Remediation Plan)**:
   - لكل صعوبة متوقعة، اقتراح نشاط علاجي مصغر لمعالجة الثغرة لدى التلاميذ غير المتحكمين.

أرجع النتيجة بتنسيق JSON الصارم التالي:

{
  "title": "${examTitle}",
  "level": "${level}",
  "term": "${term}",
  "duration": "ساعة واحدة",
  "academicYear": "2025/2026",
  "lessonsIncluded": [${selectedLessons.map(l => `"${l}"`).join(', ')}],
  "situation1": {
    "component": "${situationComponents.situation1}",
    "title": "I. مكون ${situationComponents.situation1}: أسئلة المفاهيم والتطبيقات الموضوعية (6 نقط)",
    "totalPoints": 6,
    "tasks": [
      {
        "type": "شرح مفاهيم",
        "question": "عرّف بدقة المصطلحات التالية:",
        "points": 2,
        "options": ["المصطلح الأول", "المصطلح الثاني"]
      },
      {
        "type": "ملء فراغات أو جدول",
        "question": "صنّف المعطيات التالية داخل الجدول المناسب:",
        "points": 2,
        "tableHeaders": ["المجال الأول", "المجال الثاني"],
        "tableRows": [["عنصر 1", "عنصر 2"], ["عنصر 3", "عنصر 4"]]
      },
      {
        "type": "صحيح/خطأ مع التعليل",
        "question": "أجب بصحيح أو خطأ مع تصحيح الخطأ إن وجد:",
        "points": 2
      }
    ]
  },
  "situation2": {
    "component": "${situationComponents.situation2}",
    "title": "II. مكون ${situationComponents.situation2}: الاشتغال على وثيقة (7 نقط)",
    "totalPoints": 7,
    "document": {
      "title": "الوثيقة: نص تاريخي / جغرافي أساسي",
      "docType": "نص تاريخي",
      "content": "نص الوثيقة الأساسي كاملاً وواضحاً...",
      "source": "مصدر الوثيقة ومرجعها..."
    },
    "questions": [
      {
        "questionNumber": 1,
        "skillTarget": "تحديد نوعية الوثيقة وسياقها",
        "questionText": "حدد نوعية الوثيقة وسياقها التاريخي/الجغرافي:",
        "points": 1
      },
      {
        "questionNumber": 2,
        "skillTarget": "استخراج المعطيات المباشرة",
        "questionText": "استخرج من الوثيقة ما يلي: أ. ... ب. ...",
        "points": 2.5
      },
      {
        "questionNumber": 3,
        "skillTarget": "التفسير والتعليل",
        "questionText": "فسّر انطلاقاً من الوثيقة ومكتسباتك سبب...",
        "points": 2
      },
      {
        "questionNumber": 4,
        "skillTarget": "التركيب وإبداء الرأي",
        "questionText": "استخلص الفكرة العامة المتضمنة في الوثيقة:",
        "points": 1.5
      }
    ]
  },
  "situation3": {
    "component": "${situationComponents.situation3}",
    "title": "III. مكون ${situationComponents.situation3}: إنتاج فقرة / موضوع موجز (7 نقط)",
    "totalPoints": 7,
    "contextText": "نص سياق الانطلاق الذي يطرح الإشكالية بدقة...",
    "guidelines": [
      "مقدمة مناسبة تتضمن طرح الإشكالية وتساؤلاتها (1ن)",
      "العنصر الأول: ... (2.5ن)",
      "العنصر الثاني: ... (2.5ن)",
      "خاتمة تركيبية وسلامة اللغة (1ن)"
    ],
    "formatRequirement": "أكتب فقرة متماسكة من مقدمة وعرض وخاتمة تجيب فيها عن المطلوب مع مراعاة وضوح الخط وسلامة التعبير."
  },
  "answerKey": {
    "situation1Answers": [
      { "question": "السؤال 1", "answer": "عناصر الإجابة النموذجية 1", "points": 2 },
      { "question": "السؤال 2", "answer": "عناصر الإجابة النموذجية 2", "points": 2 },
      { "question": "السؤال 3", "answer": "عناصر الإجابة النموذجية 3", "points": 2 }
    ],
    "situation2Answers": [
      { "questionNumber": 1, "answer": "تحديد النوع والسياق بدقة...", "points": 1 },
      { "questionNumber": 2, "answer": "استخراج العناصر أ وب...", "points": 2.5 },
      { "questionNumber": 3, "answer": "التفسير والتعليل السليم...", "points": 2 },
      { "questionNumber": 4, "answer": "الفكرة العامة والتركيب...", "points": 1.5 }
    ],
    "situation3AnswerGuide": {
      "methodologicalPoints": 2,
      "methodologicalNotes": "مقدمة ملائمة (1ن)، خاتمة تركيبية ووضوح الخط وخلوه من الأخطاء (1ن)",
      "knowledgeContent": [
        "معالجة المحور الأول: تقديم الأفكار الصحيحة (2.5ن)",
        "معالجة المحور الثاني: تقديم الأدلة والتفسير (2.5ن)"
      ],
      "totalPoints": 7
    }
  },
  "rubric": [
    {
      "criterion": "معيار الملاءمة (Pertinence)",
      "subSkill": "مطابقة الإجابة للمطلوب وتغطية المحاور المحددة",
      "maxPoints": 3,
      "masteryIndicators": {
        "acquired": "تغطية كافة عناصر المطلوب دون حشو أو استطراد (3ن)",
        "inProgress": "تغطية جزئية لبعض العناصر مع إغفال عناصر فرعية (1.5ن)",
        "notAcquired": "خروج كلي عن الموضوع أو إجابة لا تجيب عن السؤال (0ن)"
      }
    },
    {
      "criterion": "الاستعمال السليم لأدوات المادة (Outils de la discipline)",
      "subSkill": "توظيف المفاهيم والمصطلحات والنهج الجغرافي/التاريخي",
      "maxPoints": 3,
      "masteryIndicators": {
        "acquired": "توظيف دقيق وسليم للمفاهيم والنهج الخاص بالمادة (3ن)",
        "inProgress": "استعمال سطحي أو بعض الخلط في المصطلحات (1.5ن)",
        "notAcquired": "غياب المصطلحات والمفاهيم المهيكلة للمادة (0ن)"
      }
    },
    {
      "criterion": "معيار الانسجام والتنظيم (Cohérence)",
      "subSkill": "التسلسل المنطقي وسلامة التعبير الشكلي",
      "maxPoints": 1,
      "masteryIndicators": {
        "acquired": "أفكار مرتبة منطقياً، خط واضح ولغة سليمة (1ن)",
        "inProgress": "أفكار مقبولة مع بعض الركاكة التعبيرية (0.5ن)",
        "notAcquired": "أفكار مفككة وصعوبة في قراءة الإجابة (0ن)"
      }
    }
  ],
  "remediationPlan": [
    {
      "difficultyArea": "قراءة وتفكيك الخرائط والوثائق",
      "observedDeficit": "عجز المتعلم عن استخراج المعطيات المباشرة أو تفسير المفتاح",
      "remedialActivity": "تطبيق بروتوكول قراءة الخريطة الصريح على 3 نماذج مبسطة متدرجة الصعوبة",
      "activityFormat": "ورشة علاجية مصغرة"
    },
    {
      "difficultyArea": "صياغة وتحديد المفاهيم",
      "observedDeficit": "الخلط بين المفاهيم ذات المعنى المتقارب",
      "remedialActivity": "بطاقات المطابقة والمفاهيم (Flashcards) مع بطاقة المقارنة الثنائية",
      "activityFormat": "فردي مدعم"
    },
    {
      "difficultyArea": "تحرير فقرة متماسكة",
      "observedDeficit": "غياب الربط المنطقي بين الأفكار وتفكك الفقرة",
      "remedialActivity": "تعبئة قالب الفقرة المؤطرة الموجهة مع ملء روابط الربط السببي",
      "activityFormat": "استثمار دعامة مبسطة"
    }
  ]
}
`;

  const responseText = await generateAIContent({
    prompt,
    responseMimeType: "application/json",
    temperature: 0.2,
    preferredModel: "gemini-3.6-flash",
  });

  if (responseText) {
    const parsed = safeJsonParse<RayadaExamData>(responseText);
    if (parsed && parsed.situation1 && parsed.situation2 && parsed.situation3) {
      if (teacherInfo) {
        parsed.teacherInfo = teacherInfo;
      }
      return parsed;
    }
  }

  throw new Error("فشل توليد فرض الريادة: يرجى المحاولة مرة أخرى.");
};

/**
 * توليد عدة التشخيص والتموضع (TaRL مادة الاجتماعيات بالسلك الإعدادي)
 */
export const generateRayadaTarlDiagnostic = async (
  level: string = "الأولى إعدادي",
  subject: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' = 'التاريخ',
  domain: string = "قراءة الوثائق وتوطين المعطيات الجغرافية والتاريخية"
): Promise<RayadaTarlTest> => {
  const prompt = `
أنت خبير في تطبيق مقاربة TaRL (Teaching at the Right Level) المعتمدة بمؤسسات وإعداديات الريادة بالمغرب في مادة الاجتماعيات.
مهمتك إعداد "رائز موضعة تشخيصي لمهارات الاجتماعيات (Test de Positionnement TaRL)" لمستوى: "${level}"، في مكون: "${subject}"، مجال: "${domain}".

المطلوب:
1. بناء 4 مستويات تشخيصية متدرجة (المستوى المبتدئ ➔ مستوى الكلمة والمفهوم ➔ مستوى الفقرة والتحليل ➔ المستوى المتقدم والتركيب).
2. تحديد التعليمة ومعيار المرور للدرجة الأعلى.
3. شبكة تفيؤ المتعلمين وخطط التدخل المستهدفة لكل فئة.

أرجع النتيجة بصيغة JSON:
{
  "level": "${level}",
  "subject": "${subject}",
  "domain": "${domain}",
  "diagnosticLevels": [
    {
      "levelName": "مبتدئ (Debutant)",
      "testItem": "سؤال أو تمرين المستوى المبتدئ...",
      "instruction": "تعليمة الإنجاز للأستاذ والمتعلم",
      "passCriteria": "معيار النجاح للمرور للمستوى التالي"
    },
    {
      "levelName": "كلمة/مفهوم (Mot/Concept)",
      "testItem": "تمرين تمييز المفاهيم الأساسية...",
      "instruction": "تعليمة الإنجاز...",
      "passCriteria": "معيار النجاح..."
    },
    {
      "levelName": "فقرة/تحليل (Paragraphe)",
      "testItem": "تمرين استخراج وتفسير معطى من وثيقة...",
      "instruction": "تعليمة الإنجاز...",
      "passCriteria": "معيار النجاح..."
    },
    {
      "levelName": "قصة/تركيب متقدم (Avance)",
      "testItem": "تمرين الربط والتركيب وإبداء الاستنتاج...",
      "instruction": "تعليمة الإنجاز...",
      "passCriteria": "معيار النجاح..."
    }
  ],
  "levelingGrid": [
    {
      "studentProfile": "فئة غير المتمكنين من المفاهيم الأساسية",
      "identifiedNeed": "صعوبة في تمييز المفاهيم التاريخية/الجغرافية",
      "targetedIntervention": "حصص دعم مبنية على ألعاب المفاهيم والبطاقات المصورة"
    },
    {
      "studentProfile": "فئة المتعثرين في استقراء الوثائق",
      "identifiedNeed": "عدم القدرة على قراءة الخريطة أو الخط الزمني",
      "targetedIntervention": "ورشات تطبيقية لخطوات القراءة الصريحة خطوة بخطوة"
    },
    {
      "studentProfile": "فئة المتحكمين جزئياً في التحرير",
      "identifiedNeed": "ضعف الربط المنطقي بين الأفكار في التعبير الكتابي",
      "targetedIntervention": "تمارين النمذجة الموجهة لروابط السببية والتعليل"
    }
  ]
}
`;

  const responseText = await generateAIContent({
    prompt,
    responseMimeType: "application/json",
    temperature: 0.2,
    preferredModel: "gemini-3.6-flash",
  });

  if (responseText) {
    const parsed = safeJsonParse<RayadaTarlTest>(responseText);
    if (parsed && parsed.diagnosticLevels && parsed.diagnosticLevels.length > 0) {
      return parsed;
    }
  }

  throw new Error("فشل توليد رائز TaRL: يرجى المحاولة مرة أخرى.");
};
