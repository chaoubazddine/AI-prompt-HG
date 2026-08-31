import { safeJsonParse } from "../utils/jsonCleaner";
import { PresentationData } from "../types/presentation";
import { generateAIContent } from "./aiClient";
import { ANCIENT_EGYPT_SHOWCASE_PRESENTATION, SIMPLE_PEDAGOGICAL_SHOWCASE_PRESENTATION } from "../data/presentationTemplates";

export const generateLessonPresentation = async (
  lessonTitle: string,
  subject: string,
  level: string,
  term: 'الدورة الأولى' | 'الدورة الثانية' = 'الدورة الأولى',
  templateModel: 'simple_sequential' | 'jaddadha_sequential' | 'standard_interactive' = 'simple_sequential'
): Promise<PresentationData> => {
  // If user requests Ancient Egyptian Civilization matching the exact reference model
  if ((lessonTitle.includes('مصر القديمة') || lessonTitle.includes('حضارة مصر')) && templateModel === 'jaddadha_sequential') {
    return JSON.parse(JSON.stringify(ANCIENT_EGYPT_SHOWCASE_PRESENTATION));
  }
  // If user requests Morocco Strategic Location showcase
  if ((lessonTitle.includes('موقع استراتيجي') || lessonTitle.includes('المغرب: موقع')) && templateModel === 'simple_sequential') {
    return JSON.parse(JSON.stringify(SIMPLE_PEDAGOGICAL_SHOWCASE_PRESENTATION));
  }
  const isHistory = subject.includes('تاريخ');
  const isGeo = subject.includes('جغرافيا');
  const isCitizen = subject.includes('مواطنة');

  const disciplinaryRules = isHistory
    ? `
- المادة: التاريخ (Histoire)
- النهج الديداكتيكي: النهج التاريخي (التعريف والتوطين ➔ التفسير واستجلاء العوامل ➔ التركيب وصياغة الحصيلة).
- المفاهيم المهيكلة: الزمن الكرونولوجي، المجال، المجتمع والحدث التاريخي.`
    : isGeo
    ? `
- المادة: الجغرافيا (Géographie)
- النهج الديداكتيكي: النهج الجغرافي (الوصف ورصد الخصائص ➔ التفسير والربط ➔ التعميم والتركيب المجالي).
- المفاهيم المهيكلة: المورفولوجيا/الشكل، التوطين والتوزيع، الحركة والدينامية المجالية.`
    : `
- المادة: التربية على المواطنة (Éducation à la citoyenneté)
- النهج الديداكتيكي: نهج المواطنة (الاكتشاف وتشخيص الحالة ➔ رد الفعل والمعالجة الحقوقية والقانونية ➔ الفعل الإيجابي والمبادرة المدنية).
- المرجعيات: الدستور المغربي، القوانين والمواثيق الدولية لحقوق الإنسان، السلوك المدني.`;

  // Tailored prompt for standard reference pedagogical presentation (clean & uncluttered)
  const isSimpleModel = templateModel === 'simple_sequential';

  const prompt = isSimpleModel
    ? `
أنت مفتش تربوي وخبير ديداكتيكي في مادة الاجتماعيات بالمنهاج المغربي.
المطلوب: توليد عرض تقديمي بيداغوجي تفاعلي دقيق ومركز ومنظم هندسياً وفق الجذاذة التربوية الرسمية وتدرج مقاطع وأنشطة الدرس دون أي حشو أو تعقيدات لدرس:
- عنوان الدرس: "${lessonTitle}"
- المادة: "${subject}"
- المستوى الدراسي: "${level}"
- الدورة: "${term}"

الهندسة البيداغوجية المرجعية المطلوبة للعرض (وفق الجذاذة التربوية):
1. **الشريحة 1 (type: 'title')**:
   - العنوان الكامل للدرس، بطاقة التعريف والتأطير (المادة، المستوى، الدورة، الكفاية المستهدفة باختصار).
2. **الشريحة 2 (type: 'objectives')**:
   - أهداف التعلم مسطرة بدقة كرؤوس أقلام مباشرة (معرفية، منهجية/مهارية، وجدانية).
3. **مقاطع الدرس وأنشطتها (تغطي المقطعين أو المقاطع الثلاثة للدرس كما في الجذاذة)**:
   لكل مقطع تعلمي:
   - **أ. شريحة النشاط (type: 'activity')**:
     * sectionTitle: "المقطع التعلمي X: [عنوان المقطع التعلمي كاملاً]"
     * activityTitle: "النشاط Y: [عنوان النشاط التعلمي كاملاً]"
     * bulletPoints: رؤوس أقلام لما يتضمنه النشاط من مضامين ومفاهيم أساسية ومعطيات مركزة تفيد التلميذ في بناء التعلم.
     * highlightBox: إضاءة أو استنتاج دقيق ومركّز.
   - **ب. شريحة تركيب المقطع (type: 'synthesis')**:
     * sectionTitle: "المقطع التعلمي X: [عنوان المقطع]"
     * title: "تركيب تعلمات المقطع X واستخلاص الحصيلة"
     * synthesisGuidance: "توجيه المتعلمين لتركيب التعلمات لما تم إنجازه في أنشطة المقطع: [توجيه ديداكتيكي مباشر وواضح يوجه التلاميذ لكتابة الخلاصة التركيبية في دفاترهم استناداً لما أنجزوه في أنشطة المقطع]".
     * bulletPoints: خلاصات التعلمات المركبة للمقطع (3-4 نقاط مركزة).
   - **ج. شريحة التقويم المرحلي (type: 'formative_eval')**:
     * sectionTitle: "المقطع التعلمي X"
     * title: "التقويم المرحلي للمقطع التعلمي X"
     * interactiveQuestion: سؤال تفاعلي فوري واضح ومحدد بخيارات متعددة، الإجابة الصحيحة، وتعليل بيداغوجي موجز.
4. **بعد الانتهاء من كافة مقاطع الدرس (كما في الجذاذات)**:
   - **شريحة التركيب الإجمالي (type: 'evaluation')**:
     * title: "التركيب الإجمالي لحصيلة مقاطع الدرس"
     * subtitle: "الربط التركيبي الشامل بين كافة مقاطع وأنشطة الدرس"
     * bulletPoints: حصيلة إجمالية شاملة وموجزة تربط بين كافة مقاطع الدرس.
   - **شريحة الخاتمة والامتدادات (type: 'conclusion')**:
     * title: "خاتمة الدرس والامتدادات"
     * subtitle: "الحصيلة العامة وأفق الدرس اللاحق"
     * bulletPoints: خلاصة ختامية معبرة عن القيمة المضافة للدرس.
     * highlightBox: تساؤل إشكالي للانفتاح على الدرس القادم (امتداد معرفي).

الضوابط الديداكتيكية:
${disciplinaryRules}

أخرج النتيجة بصيغة JSON حصراً مطابقة للنموذج التالي دون مقدمات:
{
  "title": "${lessonTitle}",
  "subject": "${subject}",
  "level": "${level}",
  "term": "${term}",
  "module": "المجزوءة / المكون المقبول",
  "duration": "ساعتان",
  "targetCompetency": "الكفاية المستهدفة",
  "templateModel": "simple_sequential",
  "themeStyle": "simple_clean",
  "axes": ["المقطع التعلمي الأول: ...", "المقطع التعلمي الثاني: ..."],
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "type": "title",
      "badge": "بطاقة الدرس",
      "title": "${lessonTitle}",
      "subtitle": "مادة ${subject} • ${level}",
      "generalInfo": {
        "subject": "${subject}",
        "level": "${level}",
        "term": "${term}",
        "duration": "ساعتان",
        "targetCompetency": "الكفاية المستهدفة"
      },
      "bulletPoints": [
        "تأطير ديداكتيكي مبسط وفق المنهاج المغربي",
        "بناء التعلمات بالاعتماد على النهج التخصصي"
      ]
    },
    {
      "id": "slide-2",
      "slideNumber": 2,
      "type": "objectives",
      "badge": "أهداف التعلم",
      "title": "أهداف التعلم والكفايات المستهدفة",
      "subtitle": "القدرات والمكتسبات المرجوة بنهاية الحصة",
      "objectivesGroup": {
        "cognitive": ["هدف معرفي 1", "هدف معرفي 2"],
        "methodological": ["هدف منهجي 1", "هدف منهجي 2"],
        "attitudinal": ["هدف وجداني 1", "هدف وجداني 2"]
      },
      "bulletPoints": ["أهداف معرفية", "أهداف منهجية ومهارية", "أهداف وجدانية"]
    },
    {
      "id": "slide-3",
      "slideNumber": 3,
      "type": "activity",
      "badge": "المقطع 1: النشاط 1",
      "moduleIndex": 1,
      "activityIndex": 1,
      "sectionTitle": "المقطع التعلمي الأول: ...",
      "activityTitle": "النشاط 1: ...",
      "title": "عنوان النشاط 1",
      "bulletPoints": [
        "رأس قلم 1: مضمون محدد...",
        "رأس قلم 2: مضمون محدد..."
      ],
      "highlightBox": "إضاءة: استنتاج مركز"
    },
    {
      "id": "slide-4",
      "slideNumber": 4,
      "type": "synthesis",
      "badge": "تركيب المقطع 1",
      "moduleIndex": 1,
      "sectionTitle": "المقطع التعلمي الأول: ...",
      "title": "تركيب تعلمات المقطع الأول واستخلاص الحصيلة",
      "synthesisGuidance": "يوجه الأستاذ المتعلمين إلى استخلاص الفكرة المحورية لما تم بناؤه في النشاط الأول وصياغة خلاصة تركيبية في دفاترهم.",
      "bulletPoints": [
        "خلاصة النقطة الأولى...",
        "خلاصة النقطة الثانية..."
      ]
    },
    {
      "id": "slide-5",
      "slideNumber": 5,
      "type": "formative_eval",
      "badge": "تقويم مرحلي 1",
      "moduleIndex": 1,
      "sectionTitle": "المقطع التعلمي الأول",
      "title": "التقويم المرحلي للمقطع التعلمي الأول",
      "interactiveQuestion": {
        "question": "سؤال فحص الاستيعاب للمقطع؟",
        "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
        "correctAnswer": "خيار 1",
        "explanation": "التعليل البيداغوجي للإجابة الصحيحة.",
        "targetSkill": "المهارة المستهدفة"
      }
    },
    {
      "id": "slide-6",
      "slideNumber": 6,
      "type": "evaluation",
      "badge": "تركيب إجمالي",
      "title": "التركيب الإجمالي لحصيلة مقاطع الدرس",
      "subtitle": "الربط التركيبي الشامل بين كافة مقاطع وأنشطة الدرس",
      "bulletPoints": [
        "الحصيلة التركيبية الشاملة الأولى...",
        "الحصيلة التركيبية الشاملة الثانية..."
      ]
    },
    {
      "id": "slide-7",
      "slideNumber": 7,
      "type": "conclusion",
      "badge": "خاتمة الدرس",
      "title": "خاتمة الدرس والامتدادات",
      "subtitle": "الحصيلة العامة وأفق الدرس اللاحق",
      "bulletPoints": [
        "خلاصة ختامية لمسار الدرس ومكتسباته...",
        "أهمية المكتسبات في بناء الوعي التاريخي والمجالي"
      ],
      "highlightBox": "إشكالية انفتاح: تساؤل يفتح على الدرس الموالي"
    }
  ]
}
`
    : `
أنت خبير ومفتش تربوي ومؤلف كتب مدرسية رفيع المستوى في مادة الاجتماعيات بالمنهاج المغربي الرسمي.
المطلوب: توليد عرض تقديمي بيداغوجي رقمي عميق وغني جداً بالمعارف والحقائق والمضامين الدراسية التفصيلية (بين 9 إلى 13 شريحة) لدرس:
- عنوان الدرس: "${lessonTitle}"
- المادة: "${subject}"
- المستوى الدراسي: "${level}"
- الدورة: "${term}"

⚠️ معايير الجودة والمحتوى المعرفي (تركيز فائق على المضمون العلمي والبيداغوجي):
1. **العمق المعرفي والغنى العلمي (Éviter la superficialité)**:
   - ابتعد تماماً عن العبارات العامة أو الجمل الإنشائية الفارغة مثل "هناك عوامل كثيرة" أو "تطورات مهمة".
   - اذكر أسماء المعاهدات، التواريخ الدقيقة، الشخصيات التاريخية، المعالم، الأرقام والنسب المئوية، الفصول الدستورية، والمفاهيم العلمية التخصصية المضبوطة بدقة بالغة.
2. **شحن الشرائح بالمعلومات المعرفية والديداكتيكية المفيدة للتلميذ**:
   - يجب أن تحتوي كل نقطة (bulletPoint) على معلومة حقيقية مشروحة ومفصلة بجملة تامة ومفيدة تخدم التعلم الصفي.
   - في خانة الدعامات والوثائق (activityDoc): قدّم نصوصاً تاريخية/جغرافية واقعية غنية ذات سياق ومصدر حقيقي (مثل ابن خلدون، الناصري، مقتطفات معاهدات، تقارير المندوبية السامية للتخطيط، بنك المغرب، مواد الدستور المغربي) مع أسئلة استثمارية عميقة ترتبط بخطوات النهج.
3. **الدقة في الخطاطات والمفاهيم**:
   - الخطاطات (visualDiagram) يجب أن تتضمن عناوين وتفاصيل دقيقة تشرح العلاقات السببية أو البنيوية، وليس مجرد كلمات مبهمة.
   - المفاهيم المهيكلة (keyConcepts): تعاريف علمية مصطلحية وافية ومركزة مطابقة لما هو مقرر في الامتحانات الإشهادية.
4. **توجيه الخطاب للمتعلم مباشرة**:
   - لا تضع أي إرشادات للمدرس في متن الشرائح، بل ركز بالكامل على بناء المعرفة للمتعلم.

الضوابط التخصصية الإلزامية:
${disciplinaryRules}

الهندسة البيداغوجية المتسلسلة الدقيقة للشرائح:
1. **الشريحة 1 (type: 'title')**:
   - العنوان الكامل للدرس، بطاقة التعريف المتكاملة، الكفاية النوعية، والمحاور الكبرى.
2. **الشريحة 2 (type: 'objectives')**:
   - تفصيل الأهداف المعرفية (الحقائق، المفاهيم، التواريخ)، والمنهجية (مهارات التعامل مع الوثائق والتفسير)، والوجدانية (القيم والوعي).
3. **الشريحة 3 (type: 'problematic')**:
   - تقديم وتمهيد إشكالي عميق يربط الدرس بسياقه وسوابقه، مع صياغة إشكالية مركزية وتساؤلات فرعية دقيقة تجيب عنها محاور الدرس.
4. **مقاطع التعلم المتسلسلة (تغطي كافة محاور الدرس بالتفصيل)**:
   لكل مقطع تعلمي (المقطع 1، 2، 3):
   - **أ. شريحة النشاط (type: 'activity')**:
     * محتوى تفصيلي للنشاط مع دعامة واقعية غنية (نص، إحصائيات، وثيقة مع المصدر)، سؤال استثمار إشكالي، واستنتاج دقيق، وخطاطة بصرية بروابط منطقية.
   - **ب. شريحة التركيب والمفاهيم (type: 'synthesis')**:
     * حصيلة معرفية تركيبية متينة للمقطع، ومصطلحات ومفاهيم مهيكلة مضبوطة بتعاريفها الكاملة المعتمدة في الامتحان الإشهادي.
   - **ج. شريحة التقويم المرحلي (type: 'formative_eval')**:
     * سؤال تفاعلي فوري ذكي يقيس الفهم العميق والربط المنطقي مع تعليل الإجابة وخيارات متعددة دقيقة.
5. **الشريحة قبل الأخيرة (type: 'conclusion')**:
   - خلاصة ختامية وازنة للدرس تبين أثره وامتداداته في الدروس اللاحقة والواقع المعاش.
6. **الشريحة الأخيرة (type: 'evaluation')**:
   - تقويم إجمالي مركب: أسئلة مصطلحات، أسئلة تحليلية ربطية، ومهمة تركيبية مقالية.

أخرج النتيجة بصيغة JSON حصراً مطابقة للنموذج التالي دون أي مقدمات أو أخطاء:
{
  "title": "${lessonTitle}",
  "subject": "${subject}",
  "level": "${level}",
  "term": "${term}",
  "module": "المكون أو المجزوءة المقررة",
  "duration": "ساعتان",
  "targetCompetency": "الكفاية النوعية التفصيلية المستهدفة وفق المنهاج المغربي",
  "pedagogicalApproach": "${isHistory ? 'النهج التاريخي (التعريف، التفسير، التركيب)' : isGeo ? 'النهج الجغرافي (الوصف، التفسير، التعميم)' : 'نهج التربية على المواطنة (الاكتشاف، رد الفعل، الفعل الإيجابي)'}",
  "themeColor": "${isHistory ? 'history' : isGeo ? 'geography' : isCitizen ? 'citizenship' : 'indigo'}",
  "templateModel": "jaddadha_sequential",
  "axes": [
    "المحور الأول: ...",
    "المحور الثاني: ...",
    "المحور الثالث: ..."
  ],
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "type": "title",
      "badge": "بطاقة الدرس التقديمية",
      "pedagogicalStep": "التقديم والتأطير العام",
      "title": "${lessonTitle}",
      "subtitle": "مادة ${subject} - ${level}",
      "generalInfo": {
        "subject": "${subject}",
        "level": "${level}",
        "term": "${term}",
        "module": "المجزوءة / المكون",
        "duration": "ساعتان",
        "targetCompetency": "الكفاية التفصيلية المكتسبة",
        "axes": ["المحور 1: ...", "المحور 2: ..."]
      },
      "bulletPoints": [
        "التأطير المنهجي والمعرفي وفق التوجيهات التربوية الرسمية لوزارة التربية الوطنية 🇲🇦",
        "اعتماد النهج الديداكتيكي التخصصي والدعامات الوثائقية لبناء التعلمات ذاتياً"
      ]
    },
    {
      "id": "slide-2",
      "slideNumber": 2,
      "type": "objectives",
      "badge": "أهداف التعلم",
      "pedagogicalStep": "تحديد الكفايات والأهداف",
      "title": "أهداف التعلم والكفايات المستهدفة",
      "subtitle": "القدرات والمكتسبات المرجوة بنهاية الحصة",
      "objectivesGroup": {
        "cognitive": [
          "تعرف وضبط المفاهيم والأحداث الأساسية لـ ...",
          "تحديد وتصنيف مظاهر وخصائص ..."
        ],
        "methodological": [
          "تطبيق خطوات النهج (الملاحظة والتحليل وقراءة الدعامات)",
          "القدرة على استخراج المعطيات وتركيبها في خطاطات وخلاصات"
        ],
        "attitudinal": [
          "تثمين الموروث / إدراك أهمية التوازنات المجالية والبيئية",
          "ترسيخ السلوك المدني والوعي بالمسؤولية والمواطنة الفاعلة"
        ]
      },
      "bulletPoints": [
        "أهداف معرفية: استيعاب المفاهيم والمضامين التاريخية/الجغرافية للدرس",
        "أهداف مهارية ومنهجية: تنمية القدرة على التعامل مع الوثائق وبناء الاستنتاجات",
        "أهداف وجدانية: تنمية التفكير النقدي وقيم المواطنة الإيجابية"
      ]
    },
    {
      "id": "slide-3",
      "slideNumber": 3,
      "type": "problematic",
      "badge": "تمهيد إشكالي",
      "pedagogicalStep": "صياغة الإشكالية",
      "title": "التمهيد والتقديم الإشكالي للدرس",
      "subtitle": "الإشكالية المركزية والتساؤلات الفرعية المؤطرة",
      "bulletPoints": [
        "السياق التاريخي / الجغرافي: تأطير الظاهرة وأهميتها البالغة...",
        "التساؤل الأول: فما هي مظاهر وخصائص ...؟",
        "التساؤل الثاني: وما هي العوامل والأسباب المفسرة لـ ...؟",
        "التساؤل الثالث: وإلى أي حد انعكست هذه التحولات على الواقع والنتائج المترتبة؟"
      ],
      "highlightBox": "الإشكالية المركزية: كيف تشكلت وتطورت معالم هذه الظاهرة وما هي انعكاساتها الكبرى؟"
    },
    {
      "id": "slide-4",
      "slideNumber": 4,
      "type": "activity",
      "badge": "المقطع 1: النشاط 1",
      "pedagogicalStep": "التعريف والوصف",
      "moduleIndex": 1,
      "activityIndex": 1,
      "title": "المقطع التعلمي الأول: عنوان المقطع",
      "subtitle": "النشاط 1: دراسة المظاهر والتجليات الأساسية",
      "bulletPoints": [
        "العنصر التحليلي الأول المستفاد من دراسة الوثائق...",
        "العنصر التحليلي الثاني مع ربط المعطيات..."
      ],
      "activityDoc": {
        "docType": "نص تاريخي",
        "title": "دعامة: عنوان الوثيقة الديداكتيكية",
        "source": "الكتاب المدرسي المعتمد",
        "contentSnippet": "مقتطف دال من النص أو المعطى الإحصائي...",
        "visualElements": [
          { "label": "مؤشر 1", "value": "قيمة المعطى" },
          { "label": "مؤشر 2", "value": "قيمة المعطى" }
        ],
        "question": "حدد الفكرة الأساسية للوثيقة واستخرج أهم المظاهر المعبرة عنها.",
        "conclusion": "استنتاج النشاط الأول المركز."
      },
      "visualDiagram": {
        "type": "process_flow",
        "title": "خطاطة النشاط الأول",
        "nodes": [
          { "title": "المظهر الأول", "desc": "شرح موجز", "badge": "1" },
          { "title": "المظهر الثاني", "desc": "شرح موجز", "badge": "2" }
        ]
      }
    },
    {
      "id": "slide-5",
      "slideNumber": 5,
      "type": "synthesis",
      "badge": "تركيب المقطع 1",
      "pedagogicalStep": "التركيب الجزئي",
      "moduleIndex": 1,
      "title": "التركيب الجزئي للمقطع الأول والمفاهيم المهيكلة",
      "subtitle": "خلاصة مكتسبات المقطع التعلمي الأول",
      "bulletPoints": [
        "خلاصة مركزة للعناصر المعرفية والمنهجية التي تم بناؤها في المقطع الأول",
        "الاستنتاج المحوري الرابط بين المقطع الأول والمقطع الموالي"
      ],
      "keyConcepts": [
        {
          "term": "المفهوم أو المصطلح الأساسي 1",
          "definition": "تعريف علمي وديداكتيكي دقيق للمصطلح.",
          "category": "مفهوم مهيكل"
        },
        {
          "term": "المفهوم الأساسي 2",
          "definition": "تعريف مبسط ومضبوط للمفهوم.",
          "category": "مصطلح تاريخي"
        }
      ],
      "highlightBox": "خلاصة المقطع الأول: تشكل هذه المرحلة الأساس النظري لفهم الأسباب."
    },
    {
      "id": "slide-6",
      "slideNumber": 6,
      "type": "formative_eval",
      "badge": "تقويم مرحلي 1",
      "pedagogicalStep": "فحص المكتسبات المرحلية",
      "moduleIndex": 1,
      "title": "التقويم المرحلي للمقطع التعلمي الأول",
      "subtitle": "أنشطة فحص الاستيعاب وتثبيت المفاهيم",
      "interactiveQuestion": {
        "question": "سؤال تقويمي تفاعلي حول مضامين المقطع الأول؟",
        "options": ["الخيار أ", "الخيار ب", "الخيار ج"],
        "correctAnswer": "الخيار أ",
        "explanation": "تعليل الإجابة الصحيحة وأهميتها الديداكتيكية.",
        "targetSkill": "التحليل والاستيعاب المفاهيمي"
      },
      "bulletPoints": [
        "سؤال فوري: ميز بين المفاهيم المحورية التي تمت دراستها",
        "مهمة تطبيقية سريعة: فسر العلاقة بين المظهر والنتيجة"
      ]
    },
    {
      "id": "slide-7",
      "slideNumber": 7,
      "type": "activity",
      "badge": "المقطع 2: النشاط 1",
      "pedagogicalStep": "التفسير والتحليل",
      "moduleIndex": 2,
      "activityIndex": 1,
      "title": "المقطع التعلمي الثاني: العوامل والأسباب المفسرة",
      "subtitle": "النشاط 1: استجلاء وتصنيف العوامل المفسرة",
      "bulletPoints": [
        "العوامل البنيوية والأساسية المفسرة للظاهرة...",
        "العوامل المباشرة وتفاعلاتها المتداخلة..."
      ],
      "activityDoc": {
        "docType": "جدول إحصائي",
        "title": "دعامة: جدول تطور المؤشرات والعوامل",
        "source": "المعطيات الرسمية المعتمدة",
        "contentSnippet": "معطيات مفسرة ومقارنة تبين وتيرة التحول...",
        "question": "فسر العوامل الكامنة وراء هذا التحول بناءً على الوثيقة.",
        "conclusion": "تعدد وتداخل العوامل المفسرة."
      },
      "visualDiagram": {
        "type": "cause_effect",
        "title": "خطاطة العوامل المفسرة",
        "nodes": [
          { "title": "عوامل داخلية", "desc": "الظروف الاقتصادية والاجتماعية", "badge": "أ" },
          { "title": "عوامل خارجية", "desc": "التأثيرات والضغوط الإقليمية", "badge": "ب" }
        ]
      }
    },
    {
      "id": "slide-8",
      "slideNumber": 8,
      "type": "synthesis",
      "badge": "تركيب المقطع 2",
      "pedagogicalStep": "التركيب الجزئي",
      "moduleIndex": 2,
      "title": "التركيب الجزئي للمقطع الثاني والمفاهيم",
      "subtitle": "خلاصة أسباب وعوامل الظاهرة",
      "bulletPoints": [
        "حصيلة العوامل المفسرة ووزن كل عامل في التطور العام",
        "الربط المنطقي مع المقطع التالي (النتائج أو الامتدادات)"
      ],
      "keyConcepts": [
        {
          "term": "مفهوم تفسيري محوري",
          "definition": "التعريف الديداكتيكي للمفهوم المفسر.",
          "category": "مفهوم مهيكل"
        }
      ],
      "highlightBox": "خلاصة المقطع الثاني: يتضح أن تضافر العوامل قاد حتماً إلى نتائج حاسمة."
    },
    {
      "id": "slide-9",
      "slideNumber": 9,
      "type": "formative_eval",
      "badge": "تقويم مرحلي 2",
      "pedagogicalStep": "فحص المكتسبات المرحلية",
      "moduleIndex": 2,
      "title": "التقويم المرحلي للمقطع التعلمي الثاني",
      "subtitle": "فحص مهارة التفسير والربط السببي",
      "interactiveQuestion": {
        "question": "ما هو العامل الأكثر حسماً في تفسير التطورات المدروسة؟",
        "options": ["خيار 1", "خيار 2", "خيار 3"],
        "correctAnswer": "خيار 1",
        "explanation": "التعليل العلمي الدقيق.",
        "targetSkill": "المهارة التفسيرية والتركيبية"
      },
      "bulletPoints": [
        "سؤال تطبيقي: صنف العوامل إلى مباشرة وغير مباشرة",
        "تمرين سريع: استخلص العامل المشترك"
      ]
    },
    {
      "id": "slide-10",
      "slideNumber": 10,
      "type": "conclusion",
      "badge": "خاتمة الدرس",
      "pedagogicalStep": "الخاتمة والامتدادات",
      "title": "خاتمة الدرس والامتدادات المستقبلية",
      "subtitle": "الحصيلة العامة وأفق الدرس اللاحق",
      "bulletPoints": [
        "استخلاص ختامي: حصيلة مركزة وشاملة لمسار الدرس ومكتسباته الرئيسية",
        "الامتداد المعرفي: كيف يشكل هذا الدرس نقطة انطلاق نحو الدروس والوحدات القادمة؟",
        "القيمة المضافة: بناء الوعي التاريخي والمجالي والمواطناتي لدى المتعلم"
      ],
      "highlightBox": "الامتداد: يفتح هذا الموضوع آفاقاً لفهم التحولات الإقليمية والدولية اللاحقة."
    },
    {
      "id": "slide-11",
      "slideNumber": 11,
      "type": "evaluation",
      "badge": "تقويم إجمالي",
      "pedagogicalStep": "التقويم النهائي الشامل",
      "title": "أنشطة التقويم الإجمالي الشامل للدرس",
      "subtitle": "قياس تحقق الكفايات والأهداف التعلمية المسطرة",
      "bulletPoints": [
        "المهمة الأولى (المفاهيم): عرف بالمصطلحات الأساسية وحدد سياقها الدقيق.",
        "المهمة الثانية (الاشتغال على الوثائق): فسر العلاقة بين المظاهر والعوامل المدروسة.",
        "المهمة الثالثة (السؤال التركيبي المقالي): حرر فقرة موجزة من 4 أسطر تستعرض فيها الحصيلة الشاملة."
      ],
      "interactiveQuestion": {
        "question": "سؤال إجمالي تركيبي يربط كل مقاطع الدرس؟",
        "options": ["خيار شامل 1", "خيار 2", "خيار 3"],
        "correctAnswer": "خيار شامل 1",
        "explanation": "تعليل تركيبي شامل لكافة أبعاد الدرس.",
        "targetSkill": "التركيب والتقويم الإجمالي"
      }
    }
  ]
}
`;

  let retries = 3;
  while (retries > 0) {
    try {
      const responseText = await generateAIContent({
        prompt,
        responseMimeType: "application/json",
        preferredModel: "gemini-3.7-flash",
      });

      if (!responseText) {
        throw new Error("لم نتمكن من الحصول على استجابة من خادم الذكاء الاصطناعي.");
      }

      const parsed = safeJsonParse<PresentationData>(responseText);
      
      if (!parsed || !parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
        throw new Error("تنسيق بيانات العرض التقديمي غير صالح أو فارغ.");
      }

      // Ensure slides have correct sequential slide numbers, IDs, and sanitized arrays
      parsed.templateModel = 'jaddadha_sequential';
      parsed.title = parsed.title || lessonTitle;
      parsed.subject = parsed.subject || subject;
      parsed.level = parsed.level || level;
      parsed.term = parsed.term || term;
      
      parsed.slides = parsed.slides.map((s, idx) => ({
        ...s,
        id: s.id || `slide-${idx + 1}`,
        slideNumber: idx + 1,
        title: s.title || `شريحة ${idx + 1}`,
        subtitle: s.subtitle || '',
        badge: s.badge || s.pedagogicalStep || `مقطع ${idx + 1}`,
        pedagogicalStep: s.pedagogicalStep || '',
        bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
        objectivesGroup: s.objectivesGroup ? {
          cognitive: Array.isArray(s.objectivesGroup.cognitive) ? s.objectivesGroup.cognitive : [],
          methodological: Array.isArray(s.objectivesGroup.methodological) ? s.objectivesGroup.methodological : [],
          attitudinal: Array.isArray(s.objectivesGroup.attitudinal) ? s.objectivesGroup.attitudinal : []
        } : undefined,
        keyConcepts: Array.isArray(s.keyConcepts) ? s.keyConcepts : [],
        visualDiagram: s.visualDiagram ? {
          ...s.visualDiagram,
          title: s.visualDiagram.title || 'خطاطة المقطع',
          nodes: Array.isArray(s.visualDiagram.nodes) ? s.visualDiagram.nodes : []
        } : undefined,
        interactiveQuestion: s.interactiveQuestion ? {
          ...s.interactiveQuestion,
          question: s.interactiveQuestion.question || 'سؤال تقويمي تفاعلي',
          options: Array.isArray(s.interactiveQuestion.options) ? s.interactiveQuestion.options : [],
          correctAnswer: s.interactiveQuestion.correctAnswer || '',
          explanation: s.interactiveQuestion.explanation || ''
        } : undefined,
        activityDoc: s.activityDoc ? {
          ...s.activityDoc,
          title: s.activityDoc.title || 'دعامة ديداكتيكية',
          docType: s.activityDoc.docType || 'نص تاريخي',
          question: s.activityDoc.question || 'حلل الوثيقة واستخلص الفكرة الأساسية',
          conclusion: s.activityDoc.conclusion || ''
        } : undefined,
        teacherNotes: s.teacherNotes || '',
        activityTimerMinutes: s.activityTimerMinutes || (s.type === 'formative_eval' ? 2 : s.type === 'activity' ? 4 : undefined),
        studentWorksheetTask: s.studentWorksheetTask || ''
      }));

      return parsed;
    } catch (error: any) {
      console.warn(`API Error in presentation generation (Attempts left: ${retries - 1}):`, error);
      retries--;
      if (retries === 0) {
        return generateFallbackPresentation(lessonTitle, subject, level, term);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return generateFallbackPresentation(lessonTitle, subject, level, term);
};

export const generateFallbackPresentation = (
  lessonTitle: string,
  subject: string,
  level: string,
  term: 'الدورة الأولى' | 'الدورة الثانية' = 'الدورة الأولى'
): PresentationData => {
  return {
    title: lessonTitle,
    subject: subject,
    level: level,
    term: term,
    module: "المجزوءة الأولى",
    duration: "ساعتان",
    targetCompetency: `تنمية مهارات التفكير التاريخي/الجغرافي والوعي الإيجابي بموضوع (${lessonTitle}).`,
    templateModel: "simple_sequential",
    themeStyle: "simple_clean",
    axes: [
      `المقطع الأول: سياق ومظاهر ${lessonTitle}`,
      `المقطع الثاني: العوامل المفسرة للظاهرة`,
      `المقطع الثالث: النتائج والامتدادات`
    ],
    slides: [
      {
        id: "slide-1",
        slideNumber: 1,
        type: "title",
        title: lessonTitle,
        subtitle: `مادة ${subject} - مستوى ${level} (${term})`,
        badge: "التقديم البيداغوجي",
        bulletPoints: [
          `المكون الدراسي: ${subject}`,
          `المستوى المستهدف: ${level}`,
          `الغلاف الزمني المخصص: ساعتان`,
          `المرجع: التوجيهات التربوية الرسمية لمادة الاجتماعيات`
        ]
      },
      {
        id: "slide-2",
        slideNumber: 2,
        type: "objectives",
        title: "الأهداف والكفايات المسطرة للدرس",
        subtitle: "مسار بناء التعلمات",
        badge: "أهداف التعلم",
        bulletPoints: [
          `الهدف المعرفي: تعرف الإطار العام ومفاهيم درس "${lessonTitle}".`,
          "الهدف المهاري: استثمار الوثائق والدعامات الديداكتيكية وفق النهج المعتمد.",
          "الهدف الوجداني: إدراك أهمية الموضوع وترسيخ قيم المواطنة والتفكير النقدي."
        ]
      },
      {
        id: "slide-3",
        slideNumber: 3,
        type: "activity",
        title: "النشاط 1: تعريف الظاهرة وتحديد سياقها ومفاهيمها",
        sectionTitle: `المقطع التعلمي الأول: السياق العام ومظاهر (${lessonTitle})`,
        activityTitle: "النشاط 1: تعريف الظاهرة وتحديد سياقها ومفاهيمها",
        badge: "المقطع 1 - النشاط 1",
        bulletPoints: [
          `تحديد الإطار المكاني والزماني لموضوع (${lessonTitle}).`,
          "استخراج المفاهيم المركزية من الوثائق والدعامات المعتمدة.",
          "رصد أولى المظاهر والخصائص المميزة للظاهرة."
        ],
        highlightBox: "يشكل ضبط السياق والمفاهيم الأساسية المدخل الضروري لبناء التعلم."
      },
      {
        id: "slide-4",
        slideNumber: 4,
        type: "synthesis",
        sectionTitle: `المقطع التعلمي الأول`,
        title: "تركيب تعلمات المقطع الأول",
        badge: "تركيب المقطع 1",
        synthesisGuidance: "توجيه المتعلمين لصياغة خلاصة تركيبية مركزة لما تم التوصل إليه في أنشطة المقطع الأول وتدوينها بالدفاتر.",
        bulletPoints: [
          "تحديد المحاور الأساسية والمفاهيم المهيكلة للمقطع.",
          "تلخيص المظاهر البارزة للظاهرة في نقاط متناسقة."
        ]
      },
      {
        id: "slide-5",
        slideNumber: 5,
        type: "formative_eval",
        sectionTitle: `المقطع الأول`,
        title: "التقويم المرحلي للمقطع الأول",
        badge: "تقويم فوري",
        bulletPoints: [
          "الإجابة عن السؤال التفاعلي لاختبار مدى استيعاب المفاهيم والمظاهر المدروسة."
        ],
        interactiveQuestion: {
          question: `ما هو المفهوم المركزي والمظهر الأساسي المؤطر لموضوع (${lessonTitle})؟`,
          options: [
            "التعريف الديداكتيكي وتحديد السياق العام للظاهرة (الخيار الصحيح)",
            "إغفال الأسباب والقفز مباشرة نحو الخاتمة",
            "الاقتصار على السرد دون تحليل للوثائق"
          ],
          correctAnswer: "التعريف الديداكتيكي وتحديد السياق العام للظاهرة (الخيار الصحيح)",
          explanation: "الانطلاق من التحديد الدقيق للمفاهيم والسياق يضمن فهماً سليماً للتعلمات."
        }
      },
      {
        id: "slide-6",
        slideNumber: 6,
        type: "activity",
        title: "النشاط 2: تحليل العوامل والأسباب المباشرة والعميقة",
        sectionTitle: `المقطع التعلمي الثاني: العوامل المفسرة لـ (${lessonTitle})`,
        activityTitle: "النشاط 2: تحليل العوامل والأسباب المباشرة والعميقة",
        badge: "المقطع 2 - النشاط 1",
        bulletPoints: [
          "إبراز العوامل البنيوية والداخلية المؤثرة في الظاهرة.",
          "تحليل تفاعل العوامل وتكاملها في صياغة النتائج.",
          "استقراء العلاقات السببية استناداً إلى الوثائق والخرائط."
        ],
        highlightBox: "تعتمد خطوة التفسير على كشف الأسباب والروابط المنطقية بين مختلف المؤشرات."
      },
      {
        id: "slide-7",
        slideNumber: 7,
        type: "synthesis",
        sectionTitle: `المقطع التعلمي الثاني`,
        title: "تركيب تعلمات المقطع الثاني",
        badge: "تركيب المقطع 2",
        synthesisGuidance: "إرشاد المتعلمين لبناء خطاطة تفسيرية تختزل العوامل المتدخلة وتدوينها في دفاتر الدروس.",
        bulletPoints: [
          "تجميع العوامل المفسرة في خطاطة بيداغوجية تركيبية.",
          "إبراز الأوزان النسبية لكل عامل من العوامل المدروسة."
        ]
      },
      {
        id: "slide-8",
        slideNumber: 8,
        type: "evaluation",
        title: "التركيب الإجمالي لحصيلة الدرس",
        subtitle: "الربط الشامل بين مقاطع الدرس",
        badge: "الحصيلة الإجمالية",
        bulletPoints: [
          `تكامل خطوات النهج الديداكتيكي في دراسة موضوع "${lessonTitle}".`,
          "الربط المحكم بين المظاهر المشخصة والعوامل المفسرة والنتائج المترتبة.",
          "ترسيخ المكتسبات المعرفية والمهارية المستهدفة."
        ]
      },
      {
        id: "slide-9",
        slideNumber: 9,
        type: "conclusion",
        title: "خاتمة الدرس والامتدادات",
        subtitle: "الأفق المعرفي والامتدادات المرتقبة",
        badge: "الخاتمة والامتداد",
        bulletPoints: [
          `خلاصة استنتاجية ختامية لأهمية درس "${lessonTitle}".`,
          "تثمين المجهود التفاعلي للمتعلمين خلال مختلف المحطات البيداغوجية."
        ],
        highlightBox: "كيف تشكل مخرجات هذا الدرس منطلقاً لاستيعاب مواضيع الدروس اللاحقة؟"
      }
    ]
  };
};

export const enrichSlideWithAI = async (
  slide: any,
  lessonTitle: string,
  subject: string,
  level: string
): Promise<any> => {
  const prompt = `
أنت خبير ومفتش مادة الاجتماعيات بالمنهاج المغربي الرسمي.
المطلوب: تعميق وإثراء المحتوى المعرفي والديداكتيكي للشريحة التالية لدرس "${lessonTitle}" (${subject} - ${level}):

بيانات الشريحة الحالية:
${JSON.stringify(slide, null, 2)}

تعليمات التعميق:
1. تعميق النقاط وإضافة حقائق أو مصطلحات أو تواريخ أو أرقام دقيقة.
2. إذا كانت هناك دعامة، اجعل النص أو الوثيقة أغنى وأدق في التوثيق والمصدر.
3. إذا كانت هناك مفاهيم، اجعل التعاريف مصطلحية رسمية محكمة.
4. أضف إضاءة بيداغوجية للأستاذ (teacherNotes) ومهمة لكراسة التلميذ (studentWorksheetTask).

أرجع كائن JSON واحد ومكتمل يمثل الشريحة المحدثة بنفس بنية الشريحة:
`;

  try {
    const responseText = await generateAIContent({
      prompt,
      responseMimeType: "application/json",
      preferredModel: "gemini-3.7-flash",
    });

    if (!responseText) throw new Error("لم نتمكن من الحصول على إثراء من الذكاء الاصطناعي.");
    const parsed = safeJsonParse<any>(responseText);
    if (!parsed) throw new Error("فشل تحليل بيانات الشريحة المحدثة.");

    return {
      ...slide,
      ...parsed,
      id: slide.id,
      slideNumber: slide.slideNumber,
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : slide.bulletPoints
    };
  } catch (err: any) {
    console.error("Enrich slide error:", err);
    throw new Error(err.message || "فشل تعميق الشريحة.");
  }
};
