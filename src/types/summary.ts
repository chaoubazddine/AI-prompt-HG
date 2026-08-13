export interface SummarySubsection {
  subTitle: string; // e.g. "1. التطور التاريخي لنظام الحماية بالمغرب"
  content: string[]; // نقاط التلخيص المكثفة والدقيقة
  keyTerms?: { term: string; definition: string }[]; // المفاهيم والمصطلحات الأساسية (إن وجدت)
}

export interface SummarySection {
  mainTitle: string; // e.g. "أولاً: ظروف فرض الحماية الفرنسية والاسبانية على المغرب"
  subsections: SummarySubsection[];
}

export interface LessonSummaryData {
  title: string; // عنوان الدرس
  subject: string; // المادة: التاريخ / الجغرافيا / التربية على المواطنة
  level: string; // المستوى الدراسي
  module?: string; // المجزوءة / المكون
  introduction: {
    context: string; // التمهيد الإشكالي
    questions: string[]; // الأسئلة الإشكالية الموجهة
  };
  sections: SummarySection[]; // أولاً، ثانياً، ثالثاً...
  conclusion: string; // الخاتمة والتركيب العام
  keyTerms?: { term: string; definition: string }[]; // المفاهيم والمصطلحات الأساسية تظهر بعد الخاتمة
}
