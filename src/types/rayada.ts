export interface RayadaStep {
  title: string; // عنوان المقطع / المحور
  targetSkill: string; // المهارة المستهدفة (مثال: قراءة خريطة، تحليل نص تاريخي، حساب الكثافة)
  document: {
    title: string;
    type: string; // نص تاريخي، خريطة، جدول إحصائي، مبيان، صورة
    reference: string; // رقم الوثيقة والصفحة في كراسة الأنشطة أو المرجع
    contentSnippet?: string; // مقتطف من محتوى الوثيقة
  };
  modelage: {
    teacherSpeech: string; // ما يقوله ويفعله الأستاذ بالتفكير بصوت عالٍ ("أنا أفعل / Je fais")
    demonstrationSteps: string[]; // خطوات النمذجة الإجرائية خطوة بخطوة
    workedExample: string; // النموذج المحلول والمكتمل المقدم للمتعلم
  };
  guidedPractice: {
    studentTask: string; // المهمة الموجهة ("نحن نفعل / Nous faisons")
    collaborationType: 'عمل ثنائي' | 'عمل في مجموعات صغيرة' | 'عمل تفاعلي جماعي بالألواح';
    checkpoints: string[]; // أسئلة التحقق السريع من الفهم (CFU)
    feedbackProtocol: string; // كيفية تقديم التغذية الراجعة الفورية وتصحيح الأخطاء الشائعة
  };
  independentPractice: {
    taskDescription: string; // المهمة المستقلة في الدفتر/الكراسة ("أنت تفعل / Tu fais")
    successCriteria: string; // معيار النجاح ومؤشر التمكن
    timeAllocation: string; // الغلاف الزمني المخصص (مثلاً: 5 إلى 7 دقائق)
  };
  synthesis: {
    keyTakeaway: string; // الخلاصة المركزة / الرسم التخطيطي المدون في الدفتر
    coreConcepts: string[]; // المفاهيم الأساسية المهيكلة
  };
}

export interface RayadaJadhaData {
  title: string;
  level: string; // الأولى إعدادي، الثانية إعدادي، الثالثة إعدادي
  subject: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
  term: 'الدورة الأولى' | 'الدورة الثانية';
  duration: string; // ساعتان (حصتان)
  academicYear: string; // 2025/2026
  references: string; // كراسة الأنشطة لريادة الاجتماعيات + الكتاب المدرسي المعتمد
  targetCompetency: string; // الكفاية الأساسية المستهدفة
  
  explicitObjectives: string[]; // الأهداف التعلمية المصرح بها بلغة مباشرة
  pedagogicalTools: {
    digitalSupport: string; // المسلاط الضوئي / العروض التفاعلية
    individualTools: string; // الألواح الفردية، كراسة الأنشطة، الدفتر، الأقلام الملونة
    didacticMaterials: string; // خرائط، نصوص، مبيانات، خطوط زمنية
  };

  reactivation: {
    duration: string; // 3 إلى 5 دقائق
    questions: string[]; // أسئلة التنشيط واستدعاء المكتسبات القبلية
    activationMechanism: string; // تقنية التفعيل (تقنية الألواح الفردية، عصف ذهني موجه)
    expectedAnswers: string[]; // الإجابات المتوقعة
    linkToNewLesson: string; // جسر الربط بالدرس الجديد
  };

  explicitGoalStatement: string; // نص التصريح بالهدف للمتعلمين (يُكتب على السبورة أو يُعرض)

  steps: RayadaStep[]; // مقاطع الدرس بنموذج التدريس الصريح

  closure: {
    duration: string; // 5 دقائق
    bilanQuestion: string; // سؤال الإغلاق والتقويم التكويني الختامي
    exitTicketTechnique: string; // تذكرة الخروج / تقنية التحقق السريع قبل مغادرة الحصة
    successThreshold: string; // نسبة التحكم المستهدفة (مثال: 80% من المتعلمين)
  };

  remediationHints: {
    commonMisconceptions: string[]; // التمثلات الخاطئة الشائعة
    immediateFix: string; // التدخل العلاجي الفوري المقترح
  };

  teacherName?: string;
  schoolName?: string;
}

// ----------------------------------------------------
// RAYADA EXAM DATA TYPES
// ----------------------------------------------------

export interface RayadaRubricRow {
  criterion: string; // المعيار (معيار الملاءمة، الاستعمال السليم لأدوات المادة، الانسجام)
  subSkill: string; // المهارة الفرعية
  maxPoints: number; // النقطة المخصصة
  masteryIndicators: {
    acquired: string; // مؤشرات مستوى "متحكم" (نقطة كاملة)
    inProgress: string; // مؤشرات مستوى "في طور التحكم" (نصف النقطة)
    notAcquired: string; // مؤشرات مستوى "غير متحكم" (0 نقطة)
  };
}

export interface RayadaRemediationPlan {
  difficultyArea: string; // موطن التعثر المرصود
  observedDeficit: string; // مظهر النقص لدى المتعلم
  remedialActivity: string; // النشاط العلاجي الدقيق المقترح
  activityFormat: 'فردي مدعم' | 'ورشة علاجية مصغرة' | 'استثمار دعامة مبسطة';
}

export interface RayadaExamData {
  title: string; // الفرض المحروس رقم 1 - نموذج إعداديات الريادة
  level: string; // الأولى إعدادي / الثانية إعدادي / الثالثة إعدادي
  term: string; // الدورة الأولى / الدورة الثانية
  duration: string; // ساعة واحدة
  academicYear: string;
  lessonsIncluded: string[];

  // Situation 1: أسئلة بناء المفاهيم والمعارف والموضوعية (6 أو 7 نقط)
  situation1: {
    component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
    title: string;
    totalPoints: number;
    tasks: {
      type: 'QCM' | 'وصل بسهم' | 'شرح مفاهيم' | 'صحيح/خطأ مع التعليل' | 'ملء فراغات أو جدول';
      question: string;
      points: number;
      options?: string[];
      tableHeaders?: string[];
      tableRows?: string[][];
    }[];
  };

  // Situation 2: الاشتغال على وثيقة أساسية وفق نموذج الريادة (7 نقط)
  situation2: {
    component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
    title: string;
    totalPoints: number;
    document: {
      title: string;
      docType: 'نص تاريخي' | 'خريطة' | 'جدول إحصائي' | 'مبيان' | 'خط زمني';
      content: string;
      source: string;
    };
    questions: {
      questionNumber: number;
      skillTarget: string; // قراءة، استخراج، تفسير، تعليل، تركيب
      questionText: string;
      points: number;
    }[];
  };

  // Situation 3: إنتاج فقرة / موضوع موجز بمعايير الريادة (6 أو 7 نقط)
  situation3: {
    component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
    title: string;
    totalPoints: number;
    contextText: string;
    guidelines: string[]; // المطلوب تحريره بدقة في نقاط
    formatRequirement: string; // الشروط المنهجية (مقدمة، عرض، خاتمة وسلامة اللغة)
  };

  // شبكة التصحيح وعناصر الإجابة
  answerKey: {
    situation1Answers: { question: string; answer: string; points: number }[];
    situation2Answers: { questionNumber: number; answer: string; points: number }[];
    situation3AnswerGuide: {
      methodologicalPoints: number;
      methodologicalNotes: string;
      knowledgeContent: string[];
      totalPoints: number;
    };
  };

  // شبكة التنقيط المعيارية الشاملة
  rubric: RayadaRubricRow[];

  // خطة المعالجة البعدية
  remediationPlan: RayadaRemediationPlan[];

  teacherInfo?: {
    teacherName?: string;
    schoolName?: string;
    academy?: string;
    directorate?: string;
  };
}

// ----------------------------------------------------
// RAYADA TARL & DIAGNOSTIC TYPES
// ----------------------------------------------------

export interface RayadaTarlTest {
  level: string;
  subject: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
  domain: string; // مثلاً: قراءة الخريطة واستثمارها / فهم الخط الزمني / استثمار الوثائق
  diagnosticLevels: {
    levelName: 'مبتدئ (Debutant)' | 'كلمة/مفهوم (Mot/Concept)' | 'فقرة/تحليل (Paragraphe)' | 'قصة/تركيب متقدم (Avance)';
    testItem: string;
    instruction: string;
    passCriteria: string;
  }[];
  levelingGrid: {
    studentProfile: string;
    identifiedNeed: string;
    targetedIntervention: string;
  }[];
}
