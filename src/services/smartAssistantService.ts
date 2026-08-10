import { GoogleGenAI } from '@google/genai';
import { 
  LessonSetupData, 
  TeacherVision, 
  PedagogicalChoices, 
  StructuredLessonPlan,
  LessonSetup,
  DidacticConcept,
  ConceptPhase,
  ConceptActivity,
  ConceptResource
} from '../types/smartAssistant';
import { 
  GenerationMode, 
  GroundedContext 
} from '../types/knowledgeBase';
import { KnowledgeRetrievalService } from './knowledgeBase/retrievalService';
import { LessonPlanQualityEvaluator } from './knowledgeBase/qualityEvaluator';

const cleanJsonString = (text: string): string => {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .trim();
};

const getGenAIClient = (): GoogleGenAI => {
  const manualKey = typeof window !== 'undefined' ? localStorage.getItem('user_gemini_key') : null;
  const apiKey = manualKey || process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.trim() === "" || apiKey.includes("TODO")) {
    throw new Error("مفتاح API غير صالح أو مفقود. يرجى التأكد من ضبط المفتاح في الإعدادات.");
  }

  return new GoogleGenAI({ apiKey });
};

const generateWithModelFallback = async (ai: GoogleGenAI, prompt: string): Promise<string> => {
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      if (response.text) return response.text;
    } catch (e) {
      console.warn(`Model ${modelName} failed or unavailable, trying fallback model...`, e);
      lastError = e;
    }
  }

  throw lastError || new Error('تلقينا استجابة فارغة من خادم الذكاء الاصطناعي.');
};

/**
 * Stage 1 & 2: Generate Didactic Concept Proposal (التصور الديداكتيكي المقترح)
 * Precedes full lesson plan generation, providing deep pedagogical thinking,
 * subject-specific approach, grounded references, and decision rationales.
 */
export const generateDidacticConcept = async (
  setup: LessonSetup,
  choices: PedagogicalChoices,
  profInfo: { name: string; school: string; academy: string; directorate: string; year: string },
  mode: GenerationMode = 'GROUNDED'
): Promise<DidacticConcept> => {
  const isHistory = setup.component === 'التاريخ';
  const isGeo = setup.component === 'الجغرافيا';

  const approachGuidelines = isHistory
    ? 'تطبيق خطوات النهج التاريخي: 1. التعريف بالحدث والمجال والزمان - 2. التفسير ببيان العوامل والأسباب والمظاهر - 3. التركيب واستخلاص الحصيلة والسياق. يجب إبراز القيمة التاريخية للوثائق والزمن التاريخي والمفاهيم.'
    : isGeo
    ? 'تطبيق خطوات النهج الجغرافي: 1. الوصف الجغرافي للتوطين والبنية والمورفولوجيا - 2. التفسير الجغرافي بالعوامل الطبيعية والبشرية والاقتصادية - 3. التعميم الجغرافي واستخلاص القوانين والتوازن المجالي. يجب إبراز المجال والخرائط والمبيانات والإحصائيات.'
    : 'تطبيق خطوات النهج المواطني: 1. اكتشاف المفهوم أو الوضعية - 2. رد الفعل والتحليل النقدي والاستنادات الحقوقية والقيمية - 3. الفعل الميداني والسلوك المواطن. يجب إبراز الممارسة والوعي المواطن والتفكير النقدي.';

  let groundedContext: GroundedContext | null = null;
  let curriculumBlock = '';

  if (mode === 'GROUNDED') {
    groundedContext = await KnowledgeRetrievalService.getGroundedContext({
      subject: setup.subject,
      schoolLevel: setup.level,
      component: setup.component,
      lesson: setup.lessonTitle,
      unit: setup.unit
    });
    curriculumBlock = groundedContext.summaryText;
  }

  const prompt = `
[SYSTEM INSTRUCTIONS]
أنت المساعد التربوي الخبير في الديداكتيك والمنهاج المغربي لمادة الاجتماعيات (التاريخ، الجغرافيا، التربية على المواطنة).
المطلوب منك: بناء "التصور الديداكتيكي المقترح" للدرس بشكل مفصل وعميق جداً قبل إنتاج الجذاذة النهائية.

تنبيهات حاسمة وصرامة منهجية:
1. ابحث في المرجعيات المغربية الرسمية المتاحة ولا تخترع مراجع غير موجودة. إذا لم تتوفر معلومة موثوقة صرح بذلك بدقة.
2. لا تعامل جميع المواد بنفس الطريقة. راعِ خصائص مكون "${setup.component}":
   ${approachGuidelines}
3. لا تجعل الذكاء الاصطناعي مجرد "ملء خانات". وضح الدواعي والتعليلات التربوية المنطقية:
   - لماذا اخترت هذه الوضعية المشكلة؟
   - لماذا اقترحت هذه الوثائق والدعامات؟
   - ما التعلم المستهدف من كل نشاط ولماذا طرحت هذا السؤال؟

[CURRICULUM CONTEXT - GROUNDED MOROCCAN KNOWLEDGE BASE]
${curriculumBlock || 'الاعتماد على المرجعية التربوية العامة للمنهاج المغربي الرسمي.'}

[LESSON PARAMETERS]
- المادة والمكون: ${setup.subject} - ${setup.component}
- المستوى والتأطير: ${setup.level} | ${setup.unit || 'الوحدة الدراسية المعتمدة'}
- عنوان الدرس: ${setup.lessonTitle}
- المرجع المقرر: ${setup.textbook || 'المقرر المدرسي المعتمد'}
- مدة الحصة: ${setup.duration || '55 دقيقة'}
- تصور ورؤية الأستاذ: "${setup.teacherVision || 'تفعيل النهج الديداكتيكي واستثمار الوثائق مع إبراز الحس النقدي.'}"
- الاختيارات البيداغوجية: النهج: ${choices.pedagogicalApproach || choices.startApproach || 'حواري تفاعلي'} | صيغ الأنشطة: ${choices.preferredActivities?.join('، ') || 'تحليل الوثائق'} | التقويم: ${choices.assessmentType}

[OUTPUT SCHEMA - JSON ONLY]
أرجع كائن JSON حصرياً بالهيكل التالي دون أي زيادة:
{
  "subject": "${setup.subject}",
  "level": "${setup.level}",
  "component": "${setup.component}",
  "lessonTitle": "${setup.lessonTitle}",
  "duration": "${setup.duration || '55 دقيقة'}",
  "textbook": "${setup.textbook || 'المقرر الدراسي المعتمد'}",
  "centralGoal": "صياغة الهدف التعلمي المركزي الشامل للدرس بوضوح ودقة تربوية...",
  "prerequisites": [
    "التعلم أو المكتسب السابق 1 الضروري لمتابعة الدرس...",
    "التعلم أو المكتسب السابق 2..."
  ],
  "keyConcepts": [
    { "term": "المفهوم 1", "definition": "التعريف الديداكتيكي الدقيق للمفهوم وفق المنهاج المغربي..." },
    { "term": "المفهوم 2", "definition": "التعريف الديداكتيكي للمفهوم الثاني..." }
  ],
  "problematic": {
    "situation": "نص الوضعية المشكلة الاستهلالية المحفزة المصوغة بدقة وسياق واقعي...",
    "mainQuestions": [
      "التساؤل الإشكالي الأول الموجه للمقطع 1...",
      "التساؤل الإشكالي الثاني الموجه للمقطع 2...",
      "التساؤل الإشكالي الثالث..."
    ],
    "justification": "تعليل ودواعي اختيار هذه الوضعية المشكلة تحديداً ومدى مناسبتها للمستوى والغلاف الزمني..."
  },
  "proposedResources": [
    {
      "id": "res-1",
      "title": "عنوان الوثيقة/الدعامة 1",
      "type": "نص تاريخي / خريطة موضوعاتية / مبيان / جدول إحصائي / صورة",
      "source": "المصدر الرسمي من المقرر المقرر (مثلاً المنار ص 42 أو الوثيقة 2 ص 15)",
      "description": "وصف دقيق لمضمون الوثيقة والدعامة المستثمرة...",
      "justification": "دواعي اختيار هذه الوثيقة وقيمتها الديداكتيكية في بناء تعلمات المادة..."
    },
    {
      "id": "res-2",
      "title": "عنوان الوثيقة/الدعامة 2",
      "type": "نوع الوثيقة",
      "source": "المصدر المحدد",
      "description": "وصف المضمون",
      "justification": "التعليل التربوي لاختيار هذه الدعامة"
    }
  ],
  "learningPhases": [
    {
      "id": "phase-1",
      "phaseTitle": "المقطع التعلمي الأول: [اسم المقطع المفصل]",
      "phaseGoal": "هدف المقطع التعلمي الأول وتأطيره الديداكتيكي...",
      "duration": "25 دقيقة",
      "activities": [
        {
          "id": "act-1-1",
          "title": "النشاط 1: [موضوع النشاط 1]",
          "targetObjective": "التعلم المستهدف الدقيق من النشاط 1...",
          "teacherRoleSummary": "دور الأستاذ والأسئلة الديداكتيكية الموجهة للنشاط...",
          "learnerRoleSummary": "دور المتعلم والإجابات والمهام المطلوبة منه...",
          "keyQuestions": [
            "السؤال الموجه 1 لاستقراء الوثائق...",
            "السؤال الموجه 2 للتفسير والتحليل..."
          ],
          "expectedOutput": "الاستنتاج المعرفي والملخص السبوري المنتظر للنشاط 1...",
          "justification": "العلاقة بين النشاط والهدف ومدى ملاءمته للمستوى والزمن..."
        }
      ]
    },
    {
      "id": "phase-2",
      "phaseTitle": "المقطع التعلمي الثاني: [اسم المقطع الثاني]",
      "phaseGoal": "هدف المقطع التعلمي الثاني...",
      "duration": "25 دقيقة",
      "activities": [
        {
          "id": "act-2-1",
          "title": "النشاط 1: [موضوع النشاط في المقطع 2]",
          "targetObjective": "التعلم المستهدف من هذا النشاط...",
          "teacherRoleSummary": "دور الأستاذ والأسئلة...",
          "learnerRoleSummary": "دور المتعلم والمهام...",
          "keyQuestions": ["السؤال الموجه 1..."],
          "expectedOutput": "الاستنتاج المنتظر والملخص السبوري للنشاط...",
          "justification": "تعليل الاختيار ودواعيه..."
        }
      ]
    }
  ],
  "formativeEvaluation": [
    "سؤال التقويم التكويني للمقطع 1 لقياس تحقق الهدف...",
    "سؤال التقويم التكويني للمقطع 2..."
  ],
  "finalEvaluation": [
    "سؤال التقويم النهائي المعرفي...",
    "سؤال تطبيق مهارة تحليل الوثائق...",
    "سؤال التعبير عن موقف أو كتابة فقرة تركيبية..."
  ],
  "remediation": "خطة الدعم والمعالجة الديداكتيكية المخصصة للمتعلمين الذين يواجهون تعثرات...",
  "pedagogicalJustifications": {
    "subjectApproach": "خطوات النهج الديداكتيكي لمكون ${setup.component}",
    "approachExplanation": "شرح تفعيل خطوات النهج في تفاصيل هذا الدرس...",
    "situationReasoning": "تعليل صياغة الوضعية المشكلة...",
    "resourcesReasoning": "تعليل اختيار الوثائق والدعامات المقترحة...",
    "evaluationReasoning": "تعليل بناء أسئلة التقويم التكويني والنهائي..."
  }
}
`;

  const ai = getGenAIClient();
  const rawText = await generateWithModelFallback(ai, prompt);
  const cleanJson = cleanJsonString(rawText);
  const concept = JSON.parse(cleanJson) as DidacticConcept;

  concept.id = `concept-${Date.now()}`;
  concept.createdAt = new Date().toISOString();

  if (mode === 'GROUNDED' && groundedContext) {
    concept.sourcesUsed = groundedContext.sources.map((s, idx) => ({
      id: `${s.documentId}-${idx}`,
      title: s.title,
      source: s.title,
      url: s.sourceUrl,
      type: 'official',
      subject: setup.subject,
      level: setup.level,
      component: setup.component,
      lesson: setup.lessonTitle,
      reliability: s.authorityLevel === 'OFFICIAL_MOROCCAN' ? 1.0 : 0.85,
      snippet: s.title,
      documentId: s.documentId,
      authorityLevel: s.authorityLevel,
      pageNumber: s.pageNumber
    }));
  }

  // Quality check assessment
  concept.qualityAssessment = LessonPlanQualityEvaluator.evaluateConcept(concept, setup);

  return concept;
};

/**
 * Allows the teacher to modify or request AI re-generation of any element in DidacticConcept
 */
export const refineDidacticConceptElement = async (
  concept: DidacticConcept,
  sectionKey: string,
  instruction: string
): Promise<DidacticConcept> => {
  const prompt = `
أنت المساعد التربوي الخبير لمادة الاجتماعيات بالمغرب.
الأستاذ يطلب تعديل عنصر معين في "التصور الديداكتيكي المقترح" لدرس "${concept.lessonTitle}" (${concept.component}).

التصور الديداكتيكي الحالي:
${JSON.stringify(concept, null, 2)}

القسم المطلوب تعديله: "${sectionKey}"
تعليمات الأستاذ للتعديل: "${instruction}"

المطلوب:
تحديث التصور الديداكتيكي كاملاً مع تعديل القسم المحدد وإبقائه متسقاً مع باقي العناصر والتوجيهات الرسمية للمنهاج المغربي.
أرجع كائن JSON حصرياً مطابقاً لنفس هيكل DidacticConcept دون تغيير الحقول.
`;

  const ai = getGenAIClient();
  const rawText = await generateWithModelFallback(ai, prompt);
  const cleanJson = cleanJsonString(rawText);
  const updated = JSON.parse(cleanJson) as DidacticConcept;

  updated.qualityAssessment = LessonPlanQualityEvaluator.evaluateConcept(updated, {
    subject: updated.subject,
    level: updated.level,
    component: updated.component,
    lessonTitle: updated.lessonTitle,
    duration: updated.duration
  });

  return updated;
};

/**
 * Stage 7 & 8: Generate Final StructuredLessonPlan strictly based on Approved Didactic Concept
 */
export const generateFinalPlanFromConcept = async (
  concept: DidacticConcept,
  setupData: LessonSetupData,
  choices: PedagogicalChoices,
  profInfo: { name: string; school: string; academy: string; directorate: string; year: string }
): Promise<StructuredLessonPlan> => {
  const prompt = `
[SYSTEM INSTRUCTIONS]
أنت المساعد التربوي الخبير في الديداكتيك والمنهاج المغربي لمادة الاجتماعيات.
المطلوب منك: تحويل "التصور الديداكتيكي المعتمد والموافق عليه من طرف الأستاذ" إلى "جذاذة تربوية نهائية كاملة ومفصلة" (StructuredLessonPlan) بأعلى مستويات الثراء العلمي والارتقاء الديداكتيكي.

شروط وإرشادات حاسمة:
1. الجذاذة النهائية يجب أن تكون غنية بالمحتوى وليست مجرد عناوين فارغة.
2. لكل مرحلة ونشاط يجب توفير:
   - دور الأستاذ والتعليمات والأسئلة المنظمة بصيغة الأمر (1. اقرأ... 2. استخرج... 3. فسر...)
   - دور المتعلم والإجابات والمهام النموذجية الشاملة المفصلة
   - الوثائق والدعامات المحددة بأسمائها وأرقامها وصفحاتها
   - التعلمات والملخصات المنتظرة
   - التقويم المرحلي التكويني لكل نشاط
3. يمنع منعاً باتاً وضع عبارات مفرغة مثل "هدف معرفي 1" أو "أسئلة الأستاذ..." أو "إجابات المتعلمين...".
4. الالتزام بتفاصيل ومعطيات التصور الديداكتيكي المعتمد أدناه.

[APPROVED DIDACTIC CONCEPT - BLUEPRINT]
${JSON.stringify(concept, null, 2)}

[TEACHER & SCHOOL INFO]
- الأستاذ(ة): ${profInfo.name || 'أستاذ المادة'}
- المؤسسة: ${profInfo.school || 'المؤسسة التعليمية'}
- المديرية: ${profInfo.directorate || 'المديرية الإقليمية'}
- الأكاديمية: ${profInfo.academy || 'الأكاديمية الجهوية'}
- الموسم الدراسي: ${profInfo.year || '2025/2026'}

[OUTPUT SCHEMA - JSON ONLY]
أرجع كائن JSON حصرياً مطابق للهيكل التالي دون أي اختصار:

{
  "title": "${concept.lessonTitle}",
  "subject": "${concept.subject}",
  "level": "${concept.level}",
  "cycle": "middle",
  "component": "${concept.component}",
  "unit": "${setupData.unit || 'الوحدة الدراسية'}",
  "year": "${profInfo.year || '2025/2026'}",
  "duration": "${concept.duration || '55 دقيقة'}",
  "academy": "${profInfo.academy || ''}",
  "directorate": "${profInfo.directorate || ''}",
  "school": "${profInfo.school || ''}",
  "teacherName": "${profInfo.name || ''}",
  "references": "${concept.textbook || setupData.textbook || 'المقرر الدراسي المعتمد'}",
  "competencies": [
    "تفعيل خطوات النهج الديداكتيكي لمكون ${concept.component} في معالجة إشكالية الدرس.",
    "استثمار الدعامات والوثائق واستخراج المعطيات وتفسيرها والتركيب بأسلوب علمي متماسك.",
    "استضمار القيم والوعي المواطن والحس التاريخي والجغرافي لدى المتعلم."
  ],
  "capabilities": [
    "القدرة على استقراء الوثائق (نصوص، خرائط، مبيانات) وتفكيك مضامينها وتصنيف بياناتها.",
    "القدرة على التعليل الربط بين الأسباب والنتائج والمفاهيم المهيكلة للمادة.",
    "القدرة على صياغة خلاصات تركيبية وملخصات سبورية متماسكة شفاهياً وكتابياً."
  ],
  "objectives": {
    "cognitive": [
      "${concept.centralGoal}",
      "استيعاب المفاهيم الأساسية: ${concept.keyConcepts.map(k => k.term).join('، ')}."
    ],
    "skill": [
      "تطبيق مهارة قراءة وتحليل الوثائق والدعامات واستخراج الأسباب والانعكاسات.",
      "اكتساب مهارة التوطين والمقارنة والتصنيف واستخلاص الحصيلة."
    ],
    "affective": [
      "الوعي بأهمية الموضوع واستشعار الأبعاد الحضارية والبيئية والمواطنية والاعتزاز بالهوية."
    ]
  },
  "prerequisites": ${JSON.stringify(concept.prerequisites)},
  "problemSituation": "${concept.problematic.situation}\nالأسئلة الإشكالية المؤطرة:\n${concept.problematic.mainQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}",
  "resourcesList": ${JSON.stringify(concept.proposedResources.map(r => `${r.title} (${r.type} - ${r.source})`))},
  "introductionSteps": [
    {
      "id": "intro-1",
      "phaseName": "مراجعة الدرس السابق",
      "subPhase": "ربط المكتسبات",
      "duration": "5 دقائق",
      "resources": "الذاكرة الدراسية / أسئلة تذكيرية",
      "teacherActivity": "تذكير المتعلمين بالمفاهيم والتحولات المدروسة في الدرس السابق عبر أسئلة مركزة للربط والتمهيد.",
      "learnerActivity": "يستحضر المتعلمون المكتسبات السابقة ويوظفونها في الربط بين موضوعي الدرسين.",
      "workForm": "عمل جماعي حواري"
    },
    {
      "id": "intro-2",
      "phaseName": "تقديم عنوان الدرس",
      "subPhase": "تأطير الموضوع",
      "duration": "2 دقائق",
      "resources": "السبورة المدرسية",
      "teacherActivity": "أكتب عنوان الدرس [${concept.lessonTitle}] بوضوح على السبورة ووضح المفاهيم الكبرى لمدخل الموضوع.",
      "learnerActivity": "يدون المتعلمون العنوان في الدفاتر ويستعدون لتحديد محاور الدرس.",
      "workForm": "عمل موجه ومؤطر"
    },
    {
      "id": "intro-3",
      "phaseName": "تقويم تشخيصي",
      "subPhase": "رصد التمثلات",
      "duration": "5 دقائق",
      "resources": "أسئلة شفهية استكشافية",
      "teacherActivity": "طرح أسئلة شفهية لاستكشاف التمثلات الأولية ورصيد المتعلمين حول ${concept.lessonTitle}.",
      "learnerActivity": "يقدم المتعلمون تمثلاتهم الأولية محاولين ربط المفهوم بالإطار الجغرافي أو التاريخي.",
      "workForm": "عمل جماعي حواري"
    },
    {
      "id": "intro-4",
      "phaseName": "أهداف التعلم",
      "subPhase": "التعاقد الديداكتيكي",
      "duration": "3 دقائق",
      "resources": "الكتاب المدرسي / التصور المقترح",
      "teacherActivity": "اقرأ الهدف التعلمي المركزي بوضوح ووعد المتعلمين إلى الغايات المعرفية والمهارية للدرس.",
      "learnerActivity": "يتعرف المتعلمون على أهداف الدرس ومراحل مسار التعلم المرتقبة.",
      "workForm": "عمل موجه ومؤطر"
    },
    {
      "id": "intro-5",
      "phaseName": "التمهيد (صياغة الإشكالية)",
      "subPhase": "صياغة الإشكالية",
      "duration": "5 دقائق",
      "resources": "الوضعية المشكلة الاستهلالية",
      "teacherActivity": "عرض نص الوضعية المشكلة وتفكيك معطياتها وصياغة التساؤلات الإشكالية الثلاثة المؤطرة على السبورة.",
      "learnerActivity": "يشارك المتعلمون في صياغة الإشكالية وتدوين التساؤلات الإشكالية في الدفاتر.",
      "workForm": "عمل جماعي حواري"
    }
  ],
  "phases": [
    ${concept.learningPhases.map((phase, pIdx) => {
      const headerItem = `{
        "id": "p${pIdx + 1}-head",
        "phaseName": "${phase.phaseTitle}",
        "teacherActivity": "",
        "learnerActivity": "",
        "isHeader": true
      }`;

      const actItems = phase.activities.map((act, aIdx) => `{
        "id": "p${pIdx + 1}-act${aIdx + 1}",
        "phaseName": "${act.title}",
        "subPhase": "هدف النشاط: ${act.targetObjective}",
        "duration": "15 دقيقة",
        "resources": "${act.title} - ${concept.proposedResources[aIdx]?.source || 'المقرر المدرسي'}",
        "teacherActivity": "يدعو الأستاذ المتعلمين لملاحظة واستقراء الدعامات وتوجيه الأسئلة الديداكتيكية: ${act.teacherRoleSummary} ${act.keyQuestions.map((q, idx) => `(${idx + 1}) ${q}`).join(' ')}",
        "learnerActivity": "يتدارس المتعلمون الوثيقة ويجيبون ديداكتيكياً بانتظام: ${act.learnerRoleSummary}",
        "workForm": "عمل تفاعلي حواري (مجموعات / فردي)",
        "assessment": "تقويم تكويني مرحلي: سؤال قياس مدى تحقق ${act.targetObjective}."
      }`).join(',\n');

      const synItem = `{
        "id": "p${pIdx + 1}-syn",
        "phaseName": "الملخص السبوري والتركيب للمقطع ${pIdx + 1}",
        "duration": "5 دقائق",
        "teacherActivity": "يقود الأستاذ المتعلمين لتجميع التعلمات وصياغة ملخص سبوري موحد ومركب يغطي الأفكار والمفاهيم المحورية للمقطع ${pIdx + 1} ويدونه على السبورة.",
        "learnerActivity": "يشارك المتعلمون في بناء الملخص السبوري التركيبي ويدونونه بخط واضح في دفاترهم.",
        "isSynthesis": true
      }`;

      return `${headerItem},\n${actItems},\n${synItem}`;
    }).join(',\n')}
  ],
  "finalEvaluation": ${JSON.stringify(concept.finalEvaluation)},
  "remediation": "${concept.remediation}",
  "extension": "ربط موضوع الدرس بالوحدة التعليمية الموالية واستشراف الامتدادات المعرفية والمهارية المستقلية.",
  "sources": []
}
`;

  const ai = getGenAIClient();
  const rawText = await generateWithModelFallback(ai, prompt);
  const cleanJson = cleanJsonString(rawText);
  const plan = JSON.parse(cleanJson) as StructuredLessonPlan;

  plan.id = `plan-${Date.now()}`;
  plan.status = 'approved';
  plan.sources = concept.sourcesUsed || [];

  return plan;
};

/**
 * Universal Lesson Plan Generation Engine (Direct backward compatible)
 */
export const generateDraftLessonPlan = async (
  setup: LessonSetup,
  choices: PedagogicalChoices,
  profInfo: { name: string; school: string; academy: string; directorate: string; year: string },
  mode: GenerationMode = 'GROUNDED'
): Promise<StructuredLessonPlan> => {
  const concept = await generateDidacticConcept(setup, choices, profInfo, mode);
  const setupData: LessonSetupData = {
    subject: setup.subject,
    level: setup.level,
    cycle: setup.cycle || 'middle',
    component: setup.component,
    unit: setup.unit || 'الوحدة الأولى',
    lessonTitle: setup.lessonTitle,
    duration: setup.duration || '55 دقيقة',
    textbook: setup.textbook || 'المقرر المدرسي'
  };

  return generateFinalPlanFromConcept(concept, setupData, choices, profInfo);
};

/**
 * Backward compatible entry point for generateSmartAssistantLessonPlan
 */
export const generateSmartAssistantLessonPlan = async (
  setupData: LessonSetupData,
  vision: TeacherVision,
  choices: PedagogicalChoices,
  profInfo: { name: string; school: string; academy: string; directorate: string; year: string }
): Promise<StructuredLessonPlan> => {
  const setup: LessonSetup = {
    subject: setupData.subject,
    level: setupData.level,
    cycle: setupData.cycle,
    textbook: setupData.textbook,
    component: setupData.component,
    unit: setupData.unit,
    lessonTitle: setupData.lessonTitle,
    duration: setupData.duration,
    teacherVision: vision.visionText
  };

  return generateDraftLessonPlan(setup, choices, profInfo, 'GROUNDED');
};

/**
 * Refines a specific section of the lesson plan with AI instruction
 */
export const refineSectionWithAI = async (
  plan: StructuredLessonPlan,
  sectionKey: string,
  instruction: string,
  currentValue: any
): Promise<any> => {
  const prompt = `
أنت المساعد التربوي الذكي المتخصص في المنهاج المغربي لمادة الاجتماعيات.
القسم المطلوب تحسينه أو تعديله: "${sectionKey}"
المحتوى الحالي للقسم:
${JSON.stringify(currentValue, null, 2)}

تعليمات الأستاذ للتعديل:
"${instruction}"

معلومات الدرس الحالية:
- عنوان الدرس: ${plan.title}
- المادة والمستوى: ${plan.subject} - ${plan.level}
- المكون: ${plan.component}

المطلوب:
إرجاع كائن JSON دقيق يحتوي حصراً على النسخة المقترحة المحسنة بنفس بنية وشكل المحتوى الحالي للقسم دون تغيير الهيكل، وبأعلى قدر من الاحترافية والدقة الديداكتيكية.
أرجع JSON بالصيغة التالية:
{
  "proposedValue": ... المحتوى الجديد بنفس نوع وهيكل المحتوى الحالي ...
}
`;

  const ai = getGenAIClient();
  const rawText = await generateWithModelFallback(ai, prompt);

  const cleanJson = cleanJsonString(rawText);
  const parsed = JSON.parse(cleanJson);
  return parsed.proposedValue;
};

/**
 * In-Editor Assistant Command Handler
 */
export const executeAssistantCommand = async (
  currentPlan: StructuredLessonPlan,
  commandText: string
): Promise<{ updatedPlan: StructuredLessonPlan; affectedSectionName: string }> => {
  const prompt = `
أنت مساعد الجذاذة التربوي الذكي المتقدم.
الأستاذ يعمل الآن على الجذاذة التالية:
${JSON.stringify(currentPlan, null, 2)}

أمر الأستاذ للذكاء الاصطناعي:
"${commandText}"

قواعد مهمة:
1. التزم بتعديل الأجزاء المتأثرة بالأمر فقط (مثلاً إعادة توزيع الزمن، تعديل الأنشطة، إضافة وثائق، أو تغيير التقويم) ولا تعد تغيير الأجزاء غير المتعلقة بالأمر.
2. حافظ على تصور الأستاذ والهيكل الأساسي للجذاذة والتوجيهات الرسمية للمنهاج المغربي.
3. أرجع كائن JSON بالصيغة التالية:
{
  "affectedSectionName": "اسم القسم المترتب عليه التعديل (مثلاً: توزيع زمن المقاطع / الوضعية المشكلة / الأنشطة / التقويم والدعم)",
  "updatedPlan": ... كائن الجذاذة المحدث كاملاً بنفس الحقول الرسمية ...
}
`;

  const ai = getGenAIClient();
  const rawText = await generateWithModelFallback(ai, prompt);

  const cleanJson = cleanJsonString(rawText);
  const parsed = JSON.parse(cleanJson);
  return {
    updatedPlan: parsed.updatedPlan,
    affectedSectionName: parsed.affectedSectionName || 'الجذاذة'
  };
};
