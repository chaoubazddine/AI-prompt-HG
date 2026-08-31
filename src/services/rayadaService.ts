import { RayadaJadhaData, RayadaExamData, RayadaTarlTest } from "../types/rayada";
import { safeJsonParse } from "../utils/jsonCleaner";
import { generateAIContent } from "./aiClient";

/**
 * توليد جذاذة وفق نموذج "التدريس الصريح" المعتمد في إعداديات الريادة بالمغرب
 */
export const generateFallbackRayadaJadha = (
  lessonTitle: string,
  level: string = "الأولى إعدادي",
  subject: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' = 'التاريخ',
  textbook: string = "كراسة الأنشطة لريادة الاجتماعيات + الكتاب المدرسي",
  term: 'الدورة الأولى' | 'الدورة الثانية' = 'الدورة الأولى'
): RayadaJadhaData => {
  return {
    title: lessonTitle,
    level,
    subject,
    term,
    duration: "ساعتان (حصتان)",
    academicYear: "2025/2026",
    references: textbook,
    targetCompetency: `التمكن من خطوات النهج الديداكتيكي لمكون ${subject} وبناء المفاهيم واستثمار الوثائق المعيارية.`,
    explicitObjectives: [
      `التعرف على المفاهيم والوقائع الأساسية المرتبطة بدرس "${lessonTitle}".`,
      `تطبيق خطوات النهج (الوصف، التفسير، والتركيب) على الوثائق والدعامات.`,
      `استخلاص النتائج وصياغة خلاصات تركيبية في كراسة الأنشطة والدفتر.`
    ],
    pedagogicalTools: {
      digitalSupport: "المسلاط الضوئي والعرض الرقمي التفاعلي لكراسة الريادة",
      individualTools: "الألواح الفردية، كراسة أنشطة الريادة، الدفتر، الأقلام الملونة",
      didacticMaterials: "خرائط جغرافية، نصوص تاريخية، جداول إحصائية، خطوط زمنية"
    },
    reactivation: {
      duration: "5 دقائق",
      questions: [
        "ما هي أهم المكتسبات التي توصلنا إليها في الدرس السابق؟",
        "حدد المفهوم المركزي المرتبط بهذا المحور."
      ],
      activationMechanism: "رفع الألواح الفردية لتأكيد استيعاب المكتسبات القبلية",
      expectedAnswers: [
        "استحضار المفاهيم والأحداث المحورية للدرس السابق",
        "الإجابة المباشرة المحددة"
      ],
      linkToNewLesson: `الربط بين المكتسبات القبلية وموضوع الدرس الجديد: "${lessonTitle}"`
    },
    explicitGoalStatement: `في نهاية حصتنا اليوم، ستكونون قادرين على فهم وتفسير أبعاد "${lessonTitle}" واستثمار الدعامات المرافقة بدقة.`,
    steps: [
      {
        title: `المقطع الأول: تشخيص وتحديد الإطار العام لـ (${lessonTitle})`,
        targetSkill: "تحديد المفاهيم واستقراء المعطيات من الدعامة",
        document: {
          title: `وثيقة مؤطرة لـ ${lessonTitle}`,
          type: subject === 'الجغرافيا' ? 'خريطة' : 'نص تاريخي',
          reference: "الوثيقة 1 ص. كراسة الريادة",
          contentSnippet: `مقتطف يبرز المفاهيم الأساسية والأبعاد الرئيسية لـ ${lessonTitle}.`
        },
        modelage: {
          teacherSpeech: "أنا الآن سأريكم كيف نقوم باستقراء الوثيقة: أبدأ أولاً بقراءة العنوان ثم المفتاح واستخراج الفكرة الأساسية...",
          demonstrationSteps: [
            "الخطوة الأولى: تحديد موضوع الوثيقة وإطارها العام",
            "الخطوة الثانية: تفكيك المعطيات الأساسية ورصد المؤشرات",
            "الخطوة الثالثة: استخلاص النتيجة والتعليل المنطقي"
          ],
          workedExample: "نموذج محلول يوضح استخراج الفكرة الأساسية وتصنيف المعطيات بدقة."
        },
        guidedPractice: {
          studentTask: "الآن سنقوم معاً بتطبيق نفس الخطوات على الوثيقة المجاورة وتدوين الإجابات على الألواح.",
          collaborationType: "عمل تفاعلي جماعي بالألواح",
          checkpoints: [
            "هل تم تحديد موضوع الوثيقة بشكل صحيح؟",
            "هل تم استخراج المعطى المطلوب بدقة؟"
          ],
          feedbackProtocol: "في حال وجود خطأ في الألواح، يعيد الأستاذ توجيه الانتباه إلى الكلمات المفاتيح فوراً."
        },
        independentPractice: {
          taskDescription: "أنجزوا فردياً في كراسة الأنشطة النشاط التطبيقي المحدد.",
          successCriteria: "الإجابة الصحيحة وتحديد العناصر بدقة وفي الوقت المحدد.",
          timeAllocation: "6 دقائق"
        },
        synthesis: {
          keyTakeaway: `خلاصة المقطع الأول: تحديد المعالم والمفاهيم المحورية لـ ${lessonTitle}.`,
          coreConcepts: ["المفهوم الأول", "المفهوم الثاني"]
        }
      },
      {
        title: `المقطع الثاني: التحليل والتفسير واستخلاص النتائج`,
        targetSkill: "التفسير والربط بين الأسباب والنتائج",
        document: {
          title: "جدول / نص تحليلي",
          type: "دعامة تفسيرية",
          reference: "الوثيقة 2 ص. كراسة الريادة",
          contentSnippet: "معطيات تفسيرية حول العوامل والآثار المترتبة."
        },
        modelage: {
          teacherSpeech: "أنا الآن سأريكم كيف نعلل ونفسر الظاهرة بربط الأسباب بالنتائج...",
          demonstrationSteps: [
            "تحديد عناصر المقارنة والتفسير",
            "تصنيف العوامل المتدخلة",
            "استنتاج الأثر والامتداد"
          ],
          workedExample: "تحليل نموذجي يبرز ترتيب العوامل من الأكثر تأثيراً إلى الأقل."
        },
        guidedPractice: {
          studentTask: "تطبيق خطوات التفسير على وضعية مقارنة في مجموعات ثنائية.",
          collaborationType: "عمل ثنائي",
          checkpoints: ["التفسير السليم", "الاستدلال بالحجج"],
          feedbackProtocol: "تصحيح فوري وتغذية راجعة بناءة."
        },
        independentPractice: {
          taskDescription: "كتابة فقرة تفسيرية موجزة في الدفتر.",
          successCriteria: "سلامة اللغة والترتيب المنطقي للأفكار.",
          timeAllocation: "7 دقائق"
        },
        synthesis: {
          keyTakeaway: "خلاصة المقطع الثاني: رصد وتفسير مجموع العوامل والمؤشرات الموجهة للموضوع.",
          coreConcepts: ["عامل التفسير", "الأثر والنتيجة"]
        }
      }
    ],
    closure: {
      duration: "5 دقائق",
      bilanQuestion: `سؤال تذكرة الخروج: استخلص في جملة واحدة الأهمية المركزية لدرس "${lessonTitle}".`,
      exitTicketTechnique: "كتابة الجواب على اللوحة الفردية ورفعها في وقت واحد",
      successThreshold: "تحكم ما لا يقل عن 80% من المتعلمين"
    },
    remediationHints: {
      commonMisconceptions: ["الخلط بين المفاهيم والمؤشرات الدالة"],
      immediateFix: "إعادة التذكير بالقاعدة المميزة بأمثلة ملموسة"
    }
  };
};

export const generateFallbackRayadaExam = (
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
): RayadaExamData => {
  return {
    title: examTitle,
    level,
    term,
    duration: "ساعة واحدة",
    academicYear: "2025/2026",
    lessonsIncluded: selectedLessons.length > 0 ? selectedLessons : ["دروس الدورة الرسمية المقررة لمؤسسات الريادة"],
    teacherInfo: {
      teacherName: teacherInfo?.teacherName || "أستاذ المادة",
      schoolName: teacherInfo?.schoolName || "المؤسسة التعليمية",
      academy: teacherInfo?.academy || "الأكاديمية الجهوية للتربية والتكوين",
      directorate: teacherInfo?.directorate || "المديرية الإقليمية"
    },
    situation1: {
      component: situationComponents.situation1,
      title: `I. مكون ${situationComponents.situation1}: أسئلة المفاهيم والتطبيقات الموضوعية (6 نقط)`,
      totalPoints: 6,
      tasks: [
        {
          type: "شرح مفاهيم",
          question: "عرّف بدقة المصطلحات والمفاهيم الأساسية المقررة.",
          points: 2
        },
        {
          type: "صحيح/خطأ مع التعليل",
          question: "أجب بـ (صحيح) أو (خطأ) مع تصحيح العبارة الخاطئة إن وجدت.",
          points: 2
        },
        {
          type: "ملء فراغات أو جدول",
          question: "صنف العناصر المعطاة في جدول ملائم وفق معايير التصنيف المحددة.",
          points: 2
        }
      ]
    },
    situation2: {
      component: situationComponents.situation2,
      title: `II. مكون ${situationComponents.situation2}: الاشتغال على وثيقة (7 نقط)`,
      totalPoints: 7,
      document: {
        title: `وثيقة منطلق لمكون ${situationComponents.situation2}`,
        docType: situationComponents.situation2 === 'الجغرافيا' ? 'خريطة' : 'نص تاريخي',
        source: "كراسة الريادة / الكتاب المدرسي المعتمد",
        content: `نص ودعامة ديداكتيكية تتناول المعالم الأساسية للموضوع وتقدم معطيات ومؤشرات كافية للإجابة عن الأسئلة المتدرجة.`
      },
      questions: [
        {
          questionNumber: 1,
          questionText: "حدد نوع الوثيقة ومصدرها وسياقها العام.",
          skillTarget: "تأطير الوثيقة واستخراج الهوية المنهجية",
          points: 1.5
        },
        {
          questionNumber: 2,
          questionText: "استخرج من الوثيقة المعطيات والمؤشرات الأساسية المحددة في السؤال.",
          skillTarget: "الاستخراج المباشر للمعطيات من الدعامة",
          points: 2
        },
        {
          questionNumber: 3,
          questionText: "فسر الظاهرة أو الحدث الوارد في الوثيقة مبيناً الأسباب والعوامل المفسرة.",
          skillTarget: "التفسير والتعليل العلمي",
          points: 2
        },
        {
          questionNumber: 4,
          questionText: "استخلص الفكرة الأساسية أو النتيجة المركبة التي تنتهي إليها الوثيقة.",
          skillTarget: "التركيب والاستنتاج",
          points: 1.5
        }
      ]
    },
    situation3: {
      component: situationComponents.situation3,
      title: `III. مكون ${situationComponents.situation3}: سؤال إنتاجي / تحرير فقرة موجهة (7 نقط)`,
      totalPoints: 7,
      contextText: `يشكل موضوع ${situationComponents.situation3} محطة أساسية لاستثمار المعارف والمهارات المكتسبة وتوظيفها في معالجة إشكالية ذات راهنية.`,
      guidelines: [
        "تحديد الإطار العام للموضوع في مقدمة مناسبة وطرح التساؤل الموجه.",
        "معالجة المحاور المطلوبة في العرض بترتيب منطقي واستعمال سليم للمفاهيم.",
        "صياغة خاتمة تبرز استنتاجاً عاماً أو موقفاً معللاً."
      ],
      formatRequirement: "مقدمة وعرض وخاتمة مع سلامة اللغة ووضوح الخط (نقطتان للجانب الشكلي والمنهجي + 5 نقط للمضامين)"
    },
    answerKey: {
      situation1Answers: [
        {
          question: "شرح المفاهيم",
          answer: "تعريف شامل ومضبوط للمفاهيم وفق التوجيهات الرسمية لكراسة الريادة.",
          points: 2
        },
        {
          question: "صحيح / خطأ مع التعليل",
          answer: "تحديد الإجابات الصحيحة والخاطئة مع التصحيح الدقيق والتعليل السليم.",
          points: 2
        },
        {
          question: "ملء الجدول",
          answer: "تعبئة الجدول بالعناصر المصنفة وفق المعايير بدقة تامة.",
          points: 2
        }
      ],
      situation2Answers: [
        {
          questionNumber: 1,
          answer: "تحديد سليم للنوع والمصدر والسياق العام للوثيقة.",
          points: 1.5
        },
        {
          questionNumber: 2,
          answer: "استخراج المؤشرات والمعطيات من النص/الدعامة كما هي واردة.",
          points: 2
        },
        {
          questionNumber: 3,
          answer: "تفسير متكامل يربط بين العوامل المتدخلة والظاهرة المعالجة.",
          points: 2
        },
        {
          questionNumber: 4,
          answer: "استخلاص الفكرة المركبة في عبارة دقيقة ومركزة.",
          points: 1.5
        }
      ],
      situation3AnswerGuide: {
        methodologicalPoints: 2,
        methodologicalNotes: "مقدمة ملائمة (0.5ن) + وضوح التصميم والربط (1ن) + خاتمة مناسبة (0.5ن)",
        knowledgeContent: [
          "تغطية كافة العناصر المطلوبة في نص الموضوع بدقة واستعمال سليم للمفاهيم",
          "سلامة التعبير والربط المنطقي بين الأفكار"
        ],
        totalPoints: 7
      }
    },
    rubric: [
      {
        criterion: "معيار الملاءمة",
        subSkill: "فهم التعليمات وتغطية عناصر الموضوع",
        maxPoints: 4,
        masteryIndicators: {
          acquired: "إنجاز كافة المهام المطلوبة بدقة والتزام تام بالموضوع",
          inProgress: "إنجاز جزئي للمهام مع بعض الاستطراد أو النقص",
          notAcquired: "خروج عن الموضوع أو عدم إنجاز المهمة المطلوبة"
        }
      },
      {
        criterion: "الاستعمال السليم لأدوات المادة",
        subSkill: "المفاهيم والنهج واستثمار الوثائق",
        maxPoints: 10,
        masteryIndicators: {
          acquired: "توظيف دقيق للمفاهيم وخطوات النهج واستثمار الوثائق ببراعة",
          inProgress: "توظيف جزئي للمفاهيم مع بعض الأخطاء في قراءة الوثائق",
          notAcquired: "أخطاء مفاهيمية جسيمة وعجز عن استثمار الدعامات"
        }
      },
      {
        criterion: "معيار الانسجام والتركيب واللغة",
        subSkill: "التنظيم والربط واللغة السليمة",
        maxPoints: 6,
        masteryIndicators: {
          acquired: "لغة سليمة وتنظيم محكم وتسلسل منطقي واضح للأفكار",
          inProgress: "لغة مقبولة مع بعض الصعوبات في الربط والتركيب",
          notAcquired: "ضعف تركيبي ولغوي يعيق فهم الإجابة"
        }
      }
    ],
    remediationPlan: [
      {
        difficultyArea: "استقراء الوثائق واستخراج المعطيات",
        observedDeficit: "صعوبة في تحديد واستخراج المعطيات من الوثيقة",
        remedialActivity: "تطبيق خطوات القراءة الصريحة بالنمذجة والممارسة الموجهة على وثائق مماثلة",
        activityFormat: "فردي مدعم"
      },
      {
        difficultyArea: "الإنتاج الكتابي والتحرير المهيكل",
        observedDeficit: "خلط في كتابة الفقرة وغياب الربط المنطقي",
        remedialActivity: "استعمال شبكة معيارية للتحرير والتدرب على روابط السببية والاستنتاج",
        activityFormat: "ورشة علاجية مصغرة"
      }
    ]
  };
};

export const generateFallbackRayadaTarl = (
  level: string = "الأولى إعدادي",
  subject: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' = 'التاريخ',
  domain: string = "قراءة الوثائق وتوطين المعطيات الجغرافية والتاريخية"
): RayadaTarlTest => {
  return {
    level,
    subject,
    domain,
    diagnosticLevels: [
      {
        levelName: "مبتدئ (Debutant)",
        testItem: "التعرف على نوع الوثيقة (خريطة، نص، جدول) والتمييز بين عناصرها الأساسية.",
        instruction: "يطلب الأستاذ من التلميذ الإشارة إلى عنوان الوثيقة ومفتاحها.",
        passCriteria: "تسمية نوع الوثيقة وتحديد عنصرين من عناصرها بنجاح."
      },
      {
        levelName: "كلمة/مفهوم (Mot/Concept)",
        testItem: "استخراج مصطلح أو كلمة مفتاحية من النص وشرح معناها البسيط.",
        instruction: "اقرأ السطر المحدد واستخرج الكلمة الدالة على الموضوع.",
        passCriteria: "استخراج المفهوم الصحيح في أقل من دقيقة."
      },
      {
        levelName: "فقرة/تحليل (Paragraphe)",
        testItem: "قراءة فقرة واستخراج السبب والنتيجة المباشرين.",
        instruction: "اقرأ الفقرة واجب عن السؤال: لماذا حدث هذا الأمر؟",
        passCriteria: "تحديد العلاقة السببية بشكل صحيح."
      },
      {
        levelName: "قصة/تركيب متقدم (Avance)",
        testItem: "إبداء رأي معلل أو صياغة استنتاج مركب من وثيقتين.",
        instruction: "قارن بين المعطيين وصغ خلاصة موجزة في سطرين.",
        passCriteria: "صياغة استنتاج تركيبي دقيق ومتماسك."
      }
    ],
    levelingGrid: [
      {
        studentProfile: "فئة غير المتمكنين من المفاهيم الأساسية (مستوى مبتدئ)",
        identifiedNeed: "صعوبة في تمييز المفاهيم والمصطلحات المرجعية",
        targetedIntervention: "حصص دعم مبنية على ألعاب المفاهيم والبطاقات المصورة والألواح"
      },
      {
        studentProfile: "فئة المتعثرين في استقراء الوثائق (مستوى كلمة/فقرة)",
        identifiedNeed: "عدم القدرة على قراءة الخريطة أو الخط الزمني بدقة",
        targetedIntervention: "ورشات تطبيقية لخطوات القراءة الصريحة خطوة بخطوة"
      },
      {
        studentProfile: "فئة المتحكمين جزئياً في التحرير والتركيب (مستوى متقدم)",
        identifiedNeed: "ضعف الربط المنطقي بين الأفكار في التعبير الكتابي",
        targetedIntervention: "تمارين النمذجة الموجهة لروابط السببية والتعليل وصياغة الخلاصات"
      }
    ]
  };
};

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

  try {
    const responseText = await generateAIContent({
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      preferredModel: "gemini-3.7-flash",
    });

    if (responseText) {
      const parsed = safeJsonParse<RayadaJadhaData>(responseText);
      if (parsed && parsed.title && parsed.steps && parsed.steps.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("generateRayadaJadha error, fallback triggered:", error);
  }

  return generateFallbackRayadaJadha(lessonTitle, level, subject, textbook, term);
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
    preferredModel: "gemini-3.7-flash",
  });

  try {
    const responseText = await generateAIContent({
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      preferredModel: "gemini-3.7-flash",
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
  } catch (error) {
    console.warn("generateRayadaExam error, fallback triggered:", error);
  }

  return generateFallbackRayadaExam(
    level,
    term,
    examTitle,
    selectedLessons,
    situationComponents,
    teacherInfo
  );
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

  try {
    const responseText = await generateAIContent({
      prompt,
      responseMimeType: "application/json",
      temperature: 0.2,
      preferredModel: "gemini-3.7-flash",
    });

    if (responseText) {
      const parsed = safeJsonParse<RayadaTarlTest>(responseText);
      if (parsed && parsed.diagnosticLevels && parsed.diagnosticLevels.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("generateRayadaTarlDiagnostic error, fallback triggered:", error);
  }

  return generateFallbackRayadaTarl(level, subject, domain);
};
