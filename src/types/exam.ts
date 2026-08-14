export type SubjectComponent = 'التاريخ' | 'الجغرافيا' | 'التربية على المواطنة';

export interface ObjectiveQuestion {
  type: 'term_definition' | 'true_false' | 'matching' | 'multiple_choice';
  questionText: string;
  optionsOrMatches?: { left: string; right: string }[];
  points: number;
}

export interface Situation1_Objective {
  component: SubjectComponent;
  title: string; // e.g. "الوضعية الاختبارية الأولى: استعمال المفاهيم والمصطلحات والأسئلة الموضوعية (6 ن)"
  termsToDefine: { term: string; definitionHint?: string; points: number }[];
  objectiveQuestions: ObjectiveQuestion[];
  totalPoints: number; // 6
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface TimelineEvent {
  dateOrYear: string;
  title: string;
  detail?: string;
}

export interface TimelineData {
  title?: string;
  events: TimelineEvent[];
}

export interface DiagramBranch {
  title: string;
  items: string[];
}

export interface DiagramData {
  centralConcept: string;
  branches: DiagramBranch[];
}

export interface ExamDocument {
  docNumber: number;
  docType: string; // e.g. 'نص' | 'جدول معطيات' | 'خط زمني' | 'خطاطة مفاهيمية' | 'مصدر'
  title: string;
  content: string; // Plain text fallback or text content
  tableData?: TableData;
  timelineData?: TimelineData;
  diagramData?: DiagramData;
  source?: string;
}

export interface Situation2_Documents {
  component: SubjectComponent;
  title: string; // e.g. "الوضعية الاختبارية الثانية: الاشتغال على الوثائق (7 ن)"
  documents: ExamDocument[];
  questions: {
    questionNumber: number;
    questionText: string;
    points: number;
  }[];
  totalPoints: number; // 7
}

export interface EssayTopic {
  topicNumber: 1 | 2;
  title: string; // e.g. "الموضوع الأول" or "الموضوع الثاني"
  contextText: string;
  instructions: string[];
}

export interface Situation3_Essay {
  component: SubjectComponent;
  title: string; // e.g. "الوضعية الاختبارية الثالثة: إنتاج موضوع مقالي (7 ن)"
  choiceInstruction?: string; // e.g. "اكتب(ي) في أحد الموضوعين التاليين حسب اختيارك:"
  contextText?: string; // Fallback for single topic
  instructions?: string[]; // Fallback for single topic
  topics?: EssayTopic[]; // Optional two topics: Topic 1 & Topic 2
  methodologicalNotes?: string; // الملاحظات والجانب المنهجي (1ن للمنهجي + 6ن للمعرفي)
  totalPoints: number; // 7 or 10
}

export interface EssayAnswerGuide {
  topicNumber?: 1 | 2;
  topicTitle?: string;
  introduction: string;
  development: string[];
  conclusion: string;
  scoringBreakdown: { item: string; points: number }[];
}

export interface ExamAnswerKey {
  situation1Answers?: string[];
  situation2Answers: { questionNumber: number; answer: string; points: number }[];
  situation3AnswerGuide?: EssayAnswerGuide; // Fallback for single topic
  situation3AnswerGuides?: EssayAnswerGuide[]; // Array for Topic 1 and Topic 2
}

export interface ExamData {
  title: string; // e.g. "الفرض الكتابي المحروس رقم 1 - الدورة الأولى"
  cycle: string; // التعليم الثانوي الإعدادي / التعليم الثانوي التأهيلي
  level: string; // الأولى إعدادي / ... / الجذع المشترك / الأولى باك / الثانية باك
  term: string; // الدورة الأولى / الدورة الثانية
  duration: string; // e.g. "ساعة واحدة" or "ساعتان"
  teacherName?: string; // اسم الأستاذ(ة)
  schoolName?: string; // المؤسسة التعليمية
  lessonsIncluded: string[];
  situation1?: Situation1_Objective; // Optional for High School (السلك التأهيلي)
  situation2: Situation2_Documents;
  situation3: Situation3_Essay;
  answerKey: ExamAnswerKey;
}
