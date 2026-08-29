export type SlideType = 
  | 'title' 
  | 'general_info'
  | 'objectives' 
  | 'problematic' 
  | 'activity' 
  | 'synthesis' 
  | 'formative_eval'
  | 'conclusion'
  | 'evaluation'
  | 'document_analysis'
  | 'diagram_synthesis';

export interface KeyConceptItem {
  term: string;
  definition: string;
  category?: 'مفهوم مهيكل' | 'مصطلح تاريخي' | 'مصطلح جغرافي' | 'مفهوم حقوقي/مواطنة';
}

export type DocKind = 
  | 'نص تاريخي' 
  | 'خريطة جغرافية/تاريخية' 
  | 'جدول إحصائي' 
  | 'مبيان تطوري/مقارن' 
  | 'خط زمني' 
  | 'صورة/كاريكاتير' 
  | 'وثيقة دستورية/حقوقية' 
  | 'خطاطة بنيوية';

export interface ActivityDocItem {
  docType: DocKind;
  title: string;
  source?: string;
  contentSnippet?: string; // نص الوثيقة أو معطياتها
  visualType?: 'timeline' | 'map_guide' | 'chart_summary' | 'text_extract' | 'flowchart' | 'comparison_table';
  visualElements?: { label: string; value?: string; detail?: string }[];
  question: string;
  guidingQuestions?: string[];
  conclusion: string;
}

export interface VisualDiagramItem {
  type: 'process_flow' | 'cause_effect' | 'timeline_nodes' | 'comparison' | 'pillars';
  title: string;
  nodes: { title: string; desc?: string; badge?: string }[];
}

export interface InteractiveQuestionItem {
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  targetSkill?: string; // e.g. "التفسير الجغرافي", "التركيب التاريخي", "المعالجة الحقوقية"
}

export interface GeneralLessonInfo {
  subject: string;
  level: string;
  term: string;
  module?: string;
  duration?: string;
  targetCompetency?: string;
  axes?: string[];
}

export interface ObjectivesGroup {
  cognitive?: string[]; // أهداف معرفية
  methodological?: string[]; // أهداف منهجية ومهارية
  attitudinal?: string[]; // أهداف وجدانية وقيمية
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  type: SlideType;
  badge?: string; // e.g. "المقطع التعلمي 1", "تركيب المقطع", "تقويم مرحلي", "أهداف الدرس"
  pedagogicalStep?: string; // e.g. "النهج التاريخي: التعريف والتوطين", "النهج الجغرافي: التفسير", "التركيب الجزئي"
  moduleIndex?: number; // رقم المقطع (1, 2, 3)
  activityIndex?: number; // رقم النشاط (1, 2)
  sectionTitle?: string; // عنوان المقطع التعلمي (e.g. "المقطع التعلمي الأول: موطن الحضارة المصرية وتطورها")
  activityTitle?: string; // عنوان النشاط التعلمي (e.g. "النشاط 1: تعرف موطن الحضارة المصرية")
  synthesisGuidance?: string; // توجيه المتعلمين لتركيب التعلمات لما تم إنجازه في أنشطة المقطع
  title: string;
  subtitle?: string;
  bulletPoints: string[];
  objectivesGroup?: ObjectivesGroup;
  generalInfo?: GeneralLessonInfo;
  keyConcepts?: KeyConceptItem[];
  activityDoc?: ActivityDocItem;
  visualDiagram?: VisualDiagramItem;
  interactiveQuestion?: InteractiveQuestionItem;
  highlightBox?: string; // استنتاج مركز / إضاءة
  evaluationTasks?: string[];
  teacherNotes?: string; // إضاءة وتوجيهات بيداغوجية اختيارية للأستاذ
  activityTimerMinutes?: number; // مؤقت النشاط الصفي بالدقائق (مثلاً 2 أو 3 أو 5 دقائق)
  studentWorksheetTask?: string; // مهمة كراسة التلميذ الصفيّة
}

export type PresentationThemeStyle = 'simple_clean' | 'disciplinary' | 'papyrus_heritage' | 'classic_slate' | 'blackboard' | 'modern_clean' | 'warm_amber';

export interface PresentationData {
  id?: string;
  title: string; // عنوان الدرس
  subject: string; // التاريخ / الجغرافيا / التربية على المواطنة
  level: string; // المستوى الدراسي
  term: 'الدورة الأولى' | 'الدورة الثانية';
  module?: string; // المكون أو المجزوءة
  duration?: string; // الغلاف الزمني e.g. "ساعتان"
  targetCompetency?: string; // الكفاية المستهدفة
  axes?: string[]; // محاور الدرس
  pedagogicalApproach?: string; // النهج المعتمد (النهج التاريخي / النهج الجغرافي / نهج التربية على المواطنة)
  templateModel?: 'simple_sequential' | 'jaddadha_sequential' | 'standard_interactive'; // نموذج العرض
  slides: PresentationSlide[];
  themeColor?: 'history' | 'geography' | 'citizenship' | 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  themeStyle?: PresentationThemeStyle;
  createdAt?: any;
}
