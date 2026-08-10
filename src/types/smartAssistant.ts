import { AuthorityLevel } from './knowledgeBase';

export interface KnowledgeSource {
  id: string;
  title: string;
  source: string;
  url?: string;
  type: 'curriculum' | 'guideline' | 'textbook' | 'official_doc' | string;
  subject: string;
  level: string;
  component: string;
  lesson?: string;
  date?: string;
  reliability: number; // 0.0 - 1.0
  snippet: string;
  documentId?: string;
  authorityLevel?: AuthorityLevel;
  pageNumber?: number;
}

export interface LessonSetupData {
  subject: string; // Default: 'الاجتماعيات'
  cycle: 'middle' | 'secondary';
  level: string;
  component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' | string;
  unit: string;
  lessonTitle: string;
  duration: string; // '45 دقيقة' | '50 دقيقة' | '55 دقيقة' | '60 دقيقة' | custom
  textbook: string;
}

export interface LessonSetup {
  subject: string;
  level: string;
  cycle?: 'middle' | 'secondary';
  component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' | string;
  unit?: string;
  lessonTitle: string;
  duration?: string;
  textbook?: string;
  teacherVision?: string;
}

export interface TeacherVision {
  visionText: string;
}

export interface PedagogicalChoices {
  // Quick optional options (الأسئلة الذكية الاختيارية)
  sessionType?: 'تقديم درس' | 'بناء التعلمات' | 'تحليل وثائق' | 'تقويم' | 'دعم' | string;
  sessionDuration?: '30 دقيقة' | '45 دقيقة' | '55 دقيقة' | 'ساعة' | string;
  planDensity?: 'مختصرة' | 'قياسية' | 'مفصلة' | string;
  enableProblemSituation?: boolean;
  enableDocumentsQuestions?: boolean;
  enableFormativeAssessment?: boolean;
  enableRemediationToggle?: boolean;

  startApproach?: string; // 'وضعية مشكلة' | 'صورة' | 'وثيقة' | 'سؤال محفز' | 'مراجعة المكتسبات السابقة' | 'اقتراح من المساعد'
  preferredActivities?: string[]; // ['تحليل الوثائق', 'العمل الفردي', 'العمل الثنائي', ...]
  pedagogicalApproach?: string;
  activitiesType?: string;
  assessmentType: string; // 'تقويم تشخيصي' | 'تقويم تكويني' | 'تقويم ختامي' | 'أسئلة مباشرة' | 'نشاط تطبيقي' | 'اقتراح من المساعد'
  supportType?: string;
  includeRemediation?: boolean; // 'نعم' | 'لا'
  customResources: string;
}

export interface PhaseItem {
  id: string;
  phaseName: string;
  subPhase?: string;
  duration?: string;
  teacherActivity: string;
  learnerActivity: string;
  resources?: string;
  workForm?: string;
  assessment?: string;
  notes?: string;
  isHeader?: boolean;
  isSynthesis?: boolean;
  isEvaluation?: boolean;
}

export interface StructuredLessonPlan {
  id?: string;
  title: string;
  subject: string;
  level: string;
  cycle: string;
  component: string;
  unit?: string;
  year: string;
  duration: string;
  academy?: string;
  directorate?: string;
  school?: string;
  teacherName?: string;
  references: string;
  
  teacherVisionText?: string;
  pedagogicalChoices?: PedagogicalChoices;

  competencies: string[];
  capabilities: string[];
  objectives: {
    cognitive: string[];
    skill: string[];
    affective: string[];
  };
  prerequisites: string[];
  problemSituation: string;
  resourcesList: string[];
  
  introductionSteps: PhaseItem[];
  phases: PhaseItem[];
  
  finalEvaluation: string[];
  remediation?: string;
  extension?: string;
  sources: KnowledgeSource[];
  
  createdAt?: string | number;
  status?: 'draft' | 'approved';
}

export interface AssistantChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  affectedSection?: string;
}

export interface ConceptResource {
  id: string;
  title: string;
  type: string; // 'نص تاريخي' | 'خريطة' | 'مبيان' | 'جدول إحصائي' | 'صورة' | 'وثيقة حقوقية' | 'مرجع رسمى'
  source: string; // e.g. الكتاب المدرسي المنار ص 42 أو الوثيقة 2
  description: string;
  justification: string; // لماذا تم اختيار هذه الوثيقة؟ (التعليل التربوي)
}

export interface ConceptActivity {
  id: string;
  title: string;
  targetObjective: string; // التعلم المستهدف من النشاط
  teacherRoleSummary: string; // دور الأستاذ والأسئلة الموجهة
  learnerRoleSummary: string; // دور المتعلم والإجابات والمهام
  keyQuestions: string[]; // الأسئلة الموجهة الجوهرية
  expectedOutput: string; // الاستنتاجات المنتظرة / الملخص السبوري
  justification: string; // العلاقة بين النشاط والهدف ودواعي اختيارها
}

export interface ConceptPhase {
  id: string;
  phaseTitle: string;
  phaseGoal: string;
  duration: string;
  activities: ConceptActivity[];
}

export interface QualityCheckItem {
  id: string;
  title: string;
  passed: boolean;
  score: number; // 0 - 100
  feedback: string;
}

export interface DidacticConceptQuality {
  overallScore: number;
  passed: boolean;
  checks: QualityCheckItem[];
  overallFeedback: string;
}

export interface DidacticConcept {
  id: string;
  subject: string;
  level: string;
  cycle?: string;
  component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' | string;
  lessonTitle: string;
  duration: string;
  textbook?: string;
  
  // 1. Central Goal & Prerequisites
  centralGoal: string;
  prerequisites: string[];
  
  // 2. Core Concepts & Terminology
  keyConcepts: { term: string; definition: string }[];
  
  // 3. Problematic / Situation
  problematic: {
    situation: string;
    mainQuestions: string[];
    justification: string; // لماذا اختار هذه الوضعية المشكلة؟
  };
  
  // 4. Proposed Resources & Documents (Authentic Moroccan Curriculum sources)
  proposedResources: ConceptResource[];
  
  // 5. Learning Construction Structure (Phases & Activities)
  learningPhases: ConceptPhase[];
  
  // 6. Evaluation & Support
  formativeEvaluation: string[];
  finalEvaluation: string[];
  remediation: string;
  
  // 7. Subject-Specific Pedagogical Logic & Decision Rationale
  pedagogicalJustifications: {
    subjectApproach: string; // النهج التاريخي / الجغرافي / المواطني
    approachExplanation: string; // شرح كيفية تطبيق مفاهيم المادة في هذا الدرس
    situationReasoning: string; // تعليل اختيار الوضعية
    resourcesReasoning: string; // تعليل اختيار الوثائق
    evaluationReasoning: string; // تعليل خطة التقويم
  };

  // 8. Quality Check Assessment
  qualityAssessment?: DidacticConceptQuality;
  
  createdAt?: string;
  sourcesUsed?: KnowledgeSource[];
}

