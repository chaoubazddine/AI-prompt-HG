export type EducationCycle = 'prep' | 'secondary';

export type MoroccanLevel = 
  | 'الأولى إعدادي' 
  | 'الثانية إعدادي' 
  | 'الثالثة إعدادي' 
  | 'الجذع المشترك' 
  | 'الأولى باك' 
  | 'الثانية باك';

export type DiagnosticDomain = 
  | 'النهج التاريخي والمفاهيم التاريخية'
  | 'النهج الجغرافي والمهارات الخرائطية والمبيانية'
  | 'التربية على المواطنة والسلوك المدني والوعي الحقوقي'
  | 'المنهجية والتعبير المقالي والتركيب';

export interface DiagnosticQuestionItem {
  id: string;
  number: number;
  domain: DiagnosticDomain;
  component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' | 'مشترك';
  targetedCompetency: string; // الكفاية المستهدفة من المستوى السابق
  prerequisiteSkill: string; // المكتسب القبلي المشخص
  questionText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'matching' | 'document_analysis' | 'chronology' | 'map_work' | 'problem_solving';
  options?: string[];
  documentSupport?: {
    type: 'نص' | 'خريطة' | 'جدول' | 'مبيان' | 'خط زمني' | 'صورة';
    title: string;
    content: string;
    source?: string;
  };
  expectedAnswer: string;
  maxScore: number;
  difficultyLevel: 'سهل' | 'متوسط' | 'مركب';
}

export interface StudentScoreRow {
  studentNumber: number;
  studentName: string;
  gender: 'ذكر' | 'أنثى';
  scores: Record<string, number>; // questionId -> score
  totalScore: number;
  percentage: number;
  levelCategory: 'متحكم' | 'في طور التحكم' | 'غير متحكم';
}

export interface DomainAnalysis {
  domain: DiagnosticDomain;
  totalPoints: number;
  averageScore: number;
  masteryPercentage: number;
  strengths: string[];
  difficulties: string[];
  recommendedInterventions: string[];
}

export interface LevelCategoryStats {
  category: 'متحكم' | 'في طور التحكم' | 'غير متحكم';
  minThreshold: string; // e.g. "14 - 20"
  studentCount: number;
  percentage: number;
  description: string;
  characteristics: string[];
}

export interface DiagnosticReport {
  generalContext: string; // السياق التربوي والمذكرات المنظمة
  institutionInfo: {
    academy: string;
    directorate: string;
    school: string;
    teacherName: string;
    subject: string;
    level: string;
    classGroup: string;
    academicYear: string;
    testDate: string;
    totalEnrolled: number;
    totalTested: number;
    absentCount: number;
  };
  overallStats: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    successRate: number; // percentage >= 10/20
  };
  categoriesStats: LevelCategoryStats[];
  domainAnalyses: DomainAnalysis[];
  qualitativeAnalysis: {
    historicalThinkingDeficits: string[]; // تعثرات النهج التاريخي
    geographicalThinkingDeficits: string[]; // تعثرات النهج الجغرافي
    citizenshipDeficits: string[]; // تعثرات التربية على المواطنة
    methodologicalDeficits: string[]; // تعثرات منهجية وتعبيرية
  };
  generalConclusions: string[];
  administrativeRecommendations: string[];
}

export interface RemediationActivity {
  id: string;
  title: string;
  targetedDomain: DiagnosticDomain;
  targetCategory: 'غير متحكم' | 'في طور التحكم' | 'جميع الفئات';
  detectedDifficulty: string;
  pedagogicalObjective: string;
  duration: string; // e.g. "حصة واحدة (1س)"
  modality: 'دعم مندمج صفي' | 'مجموعات حاجات' | 'ورشات الأقران' | 'بطاقات التعلم الذاتي';
  didacticTools: string[];
  procedureSteps: {
    stepTitle: string;
    teacherGuidance: string;
    studentActions: string;
  }[];
  evaluationIndicator: string; // مؤشر التحقق بعد الدعم
}

export interface RemediationPlan {
  title: string;
  level: string;
  academicYear: string;
  timeframe: string; // e.g. "الأسابيع الأولى من شهر شتنبر وممتدة في الدعم المندمج"
  strategicAxes: {
    axisName: string;
    objective: string;
    priorityActivities: string[];
  }[];
  activities: RemediationActivity[];
  monitoringMechanism: string;
  finalEvaluationDate: string;
}

export interface SupportJadhaStep {
  phaseName: string; // e.g. "1. رصد التعثر والتذكير بالمفهوم"
  duration: string;
  learningSituation: string; // الوضعية الديداكتيكية للعلاج
  didacticSupport: string; // الدعامة المعتمدة
  teacherTasks: string[];
  studentTasks: string[];
  workForm: string; // عمل فردي، مجموعات، جماعي حواري
  formativeCheck: string; // التقويم التكويني للتحقق
}

export interface DiagnosticSupportJadha {
  title: string;
  remediationTitle: string; // عنوان حصة الدعم والمعالجة
  level: string;
  subject: string;
  targetedDeficit: string;
  prerequisiteGoal: string;
  duration: string;
  pedagogicalMaterial: string[];
  steps: SupportJadhaStep[];
  synthesisAndRetention: string; // الخلاصة والتثبيت
  postSupportEvaluation: string; // رائز التحقق البعدي
}

export interface DiagnosticDossier {
  id: string;
  title: string;
  level: MoroccanLevel;
  cycle: EducationCycle;
  prerequisiteLevel: string; // المستوى السابق الذي تم تشخيص مكتسباته
  curriculumReference: string;
  createdAt: string;
  institutionInfo: {
    academy: string;
    directorate: string;
    school: string;
    teacherName: string;
    academicYear: string;
    classGroup: string;
  };
  test: {
    title: string;
    instructions: string[];
    duration: string;
    totalPoints: number;
    questions: DiagnosticQuestionItem[];
  };
  sampleScoringGrid: {
    sampleStudents: StudentScoreRow[];
  };
  report: DiagnosticReport;
  remediationPlan: RemediationPlan;
  supportJadha: DiagnosticSupportJadha;
}
