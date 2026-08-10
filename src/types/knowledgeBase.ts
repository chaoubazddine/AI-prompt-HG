export type AuthorityLevel = 'OFFICIAL_MOROCCAN' | 'OWNER_PROVIDED' | 'TRUSTED_EDUCATIONAL' | 'OFFICIAL' | 'TRUSTED_EXTERNAL';

export type SourceType =
  | 'CURRICULUM'
  | 'GUIDELINES'
  | 'REFERENCE_FRAMEWORK'
  | 'TEXTBOOK'
  | 'PEDAGOGICAL_GUIDE'
  | 'TRAINING_DOCUMENT'
  | 'EXAM_REFERENCE'
  | 'DIGITAL_RESOURCE'
  | 'OTHER';

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'REQUIRES_REVIEW';

export type KnowledgeCategory = 'CURRICULUM_KNOWLEDGE' | 'PEDAGOGICAL_ENRICHMENT';

export type GenerationMode = 'DIRECT' | 'GROUNDED';

export interface KnowledgeDocument {
  id: string;
  title: string;
  description: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: SourceType;
  authorityLevel: AuthorityLevel;
  verificationStatus: VerificationStatus;
  knowledgeCategory: KnowledgeCategory;
  publicationDate?: string;
  language: string; // e.g., 'ar'
  subject: string; // e.g., 'الاجتماعيات'
  schoolLevel: string; // e.g., 'الثالثة إعدادي', 'جميع المستويات'
  track?: string; // e.g., 'عام', 'آداب وعلوم إنسانية'
  component?: string; // 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة' | 'عام'
  unit?: string;
  lesson?: string;
  keywords: string[];
  version: string;
  status: 'active' | 'draft' | 'archived';
  copyrightStatus?: string;
  retrievalAllowed?: boolean;
  createdAt: string | number;
  updatedAt: string | number;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  text: string;
  pageNumber?: number;
  sectionTitle?: string;
  subject: string;
  schoolLevel: string;
  component?: string;
  unit?: string;
  lesson?: string;
  keywords: string[];
  embeddingReference?: string;
  createdAt: string | number;
}

export interface CurriculumReference {
  id: string;
  subject: string; // 'الاجتماعيات'
  schoolLevel: string; // e.g., 'الثالثة إعدادي', 'الثانية إعدادي', 'الأولى إعدادي'
  cycle: 'middle' | 'secondary' | 'primary';
  component: 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';
  unit?: string;
  lesson: string;
  lessonCode?: string;
  competencies: string[];
  learningObjectives: {
    cognitive: string[];
    skill: string[];
    affective: string[];
  };
  keyConcepts: string[];
  skills: string[];
  officialGuidance: string; // Pedagogical guidance for teaching this lesson according to Moroccan curriculum
  assessmentGuidance?: string;
  officialSources: {
    title: string;
    sourceName: string;
    pageNumber?: number;
    url?: string;
  }[];
  version: string;
  effectiveDate?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNDER_REVIEW';
  notes?: string;
}

export interface KnowledgeQueryFilters {
  subject?: string;
  schoolLevel?: string;
  component?: string;
  unit?: string;
  lesson?: string;
  authorityLevel?: AuthorityLevel;
  sourceType?: SourceType;
  verificationStatus?: VerificationStatus;
  knowledgeCategory?: KnowledgeCategory;
  status?: 'active' | 'draft' | 'archived';
  [key: string]: any;
}

export interface KnowledgeRetrievalQueryParams {
  query: string;
  subject?: string;
  schoolLevel?: string;
  component?: string;
  unit?: string;
  lesson?: string;
  authorityLevel?: AuthorityLevel;
  category?: KnowledgeCategory;
  filters?: KnowledgeQueryFilters;
  topK?: number;
}

export interface RetrievedKnowledge {
  text: string;
  source: string;
  sourceUrl?: string;
  documentTitle: string;
  documentId: string;
  pageNumber?: number;
  sectionTitle?: string;
  relevanceScore: number;
  authorityLevel: AuthorityLevel;
  sourceType: SourceType;
  knowledgeCategory: KnowledgeCategory;
  verificationStatus: VerificationStatus;
  metadata: {
    subject: string;
    schoolLevel: string;
    component?: string;
    unit?: string;
    lesson?: string;
    keywords?: string[];
    [key: string]: any;
  };
}

export interface GroundedContext {
  curriculumReference?: CurriculumReference;
  officialChunks: RetrievedKnowledge[];
  enrichmentChunks: RetrievedKnowledge[];
  sources: {
    documentId: string;
    title: string;
    sourceUrl?: string;
    pageNumber?: number;
    authorityLevel: AuthorityLevel;
  }[];
  summaryText: string;
  hasOfficialReference: boolean;
}

export interface EvaluationScore {
  curriculumAlignment: number; // 0 - 100
  contentAccuracy: number; // 0 - 100
  levelAppropriateness: number; // 0 - 100
  pedagogicalCoherence: number; // 0 - 100
  teacherVisionAlignment: number; // 0 - 100
  timeFeasibility: number; // 0 - 100
  assessmentAlignment: number; // 0 - 100
  sourceGrounding: number; // 0 - 100
  overallScore: number; // 0 - 100
  feedback: string[];
}

export interface BenchmarkResult {
  lessonTitle: string;
  component: string;
  level: string;
  directScore: EvaluationScore;
  groundedScore: EvaluationScore;
  improvementPercentage: number;
  winnerMode: GenerationMode;
}
