import { LessonSetup, PedagogicalChoices } from '../../types/smartAssistant';
import { BenchmarkResult } from '../../types/knowledgeBase';
import { LessonPlanQualityEvaluator } from './qualityEvaluator';
import { KnowledgeRetrievalService } from './retrievalService';
import { generateDraftLessonPlan } from '../smartAssistantService';

const SAMPLE_TEACHER_INFO = {
  name: 'أستاذ خبير',
  school: 'ثانوية الإعدادية المزيانية',
  academy: 'جهة الرباط سلا القنيطرة',
  directorate: 'الرباط',
  year: '2024-2025'
};

const SAMPLE_CHOICES: PedagogicalChoices = {
  pedagogicalApproach: 'حوارية تفاعلية مع تحليل الوثائق ودراسة الحالات',
  activitiesType: 'عمل بالوثائق التاريخية والجغرافية والمجموعات المصغرة',
  assessmentType: 'تقويم تكويني وأسئلة تركيب واستثمار للمفاهيم',
  supportType: 'أنشطة دعم مركزة لمعالجة التعثرات في فهم المفاهيم',
  customResources: 'خرائط تاريخية وم نوص ونصوص قانونية رسمية من المقرر الدراسي'
};

export const BENCHMARK_LESSON_SETUPS: LessonSetup[] = [
  {
    subject: 'الاجتماعيات',
    level: 'الثالثة إعدادي',
    textbook: 'التجديد في الاجتماعيات',
    component: 'التاريخ',
    unit: 'الوحدة الأولى: تحولات العالم الرأسمالي والتنافس الإمبريالي',
    lessonTitle: 'الظاهرة الإمبريالية في القرن 19م',
    teacherVision: 'التركيز على إعمال خطوات النهج التاريخي (التعريف والتفسير) والاشتغال على خريطة تقسيم أفريقيا.'
  },
  {
    subject: 'الاجتماعيات',
    level: 'الثالثة إعدادي',
    textbook: 'المنار في الاجتماعيات',
    component: 'التاريخ',
    unit: 'الوحدة الثانية: المغرب في مواجهة الأطماع الإمبريالية',
    lessonTitle: 'المغرب: التنافس الإمبريالي وفرض الحماية',
    teacherVision: 'الاشتغال الحصري على بنود معاهدة فاس 1912 وإبراز دور العرش والشعب المغربي في المقاومة.'
  },
  {
    subject: 'الاجتماعيات',
    level: 'الثالثة إعدادي',
    textbook: 'التجديد في الاجتماعيات',
    component: 'الجغرافيا',
    unit: 'الوحدة الأولى: التكتلات الإقليمية في العالم',
    lessonTitle: 'المغرب العربي: عناصر الوحدة والتنوع',
    teacherVision: 'توظيف الخريطة والمبيانات لاستخلاص عناصر التكتل والتكامل الاقتصادي المغاربي.'
  },
  {
    subject: 'الاجتماعيات',
    level: 'الثالثة إعدادي',
    textbook: 'المنار في الاجتماعيات',
    component: 'التربية على المواطنة',
    unit: 'الوحدة الأولى: القيم والمواطنة',
    lessonTitle: 'الحفاظ على التراث وتطويره',
    teacherVision: 'التركيز على التراث غير المادي للمغرب وإعداد بطاقات وصافية لمعرض مدرسي مواطن.'
  },
  {
    subject: 'الاجتماعيات',
    level: 'الثانية إعدادي',
    textbook: 'النجاح في الاجتماعيات',
    component: 'التاريخ',
    unit: 'الوحدة الأولى: التحولات الكبرى في أوروبا الحديثة',
    lessonTitle: 'الثورة الفرنسية: ولادة مجتمع جديد',
    teacherVision: 'استثمار إعلان حقوق الإنسان والمواطن لعام 1789 وترسيخ قيم دولة المواطنة والحرية.'
  }
];

/**
 * ComparisonService
 * Executes internal benchmarking for DIRECT vs GROUNDED generation modes across 5 Moroccan Social Studies setups.
 */
export class ComparisonService {
  /**
   * Run benchmark across all 5 test cases
   */
  static async runBenchmark(): Promise<{
    results: BenchmarkResult[];
    summary: {
      averageDirectScore: number;
      averageGroundedScore: number;
      overallImprovementPercent: number;
      groundedWinCount: number;
    };
  }> {
    const results: BenchmarkResult[] = [];

    for (const setup of BENCHMARK_LESSON_SETUPS) {
      // 1. Generate GROUNDED version
      const groundedPlan = await generateDraftLessonPlan(
        setup,
        SAMPLE_CHOICES,
        SAMPLE_TEACHER_INFO,
        'GROUNDED'
      );
      const groundedContext = await KnowledgeRetrievalService.getGroundedContext({
        subject: setup.subject,
        schoolLevel: setup.level,
        component: setup.component,
        lesson: setup.lessonTitle,
        unit: setup.unit
      });
      const groundedScore = LessonPlanQualityEvaluator.evaluate(groundedPlan, setup, groundedContext);

      // 2. Generate DIRECT version
      const directPlan = await generateDraftLessonPlan(
        setup,
        SAMPLE_CHOICES,
        SAMPLE_TEACHER_INFO,
        'DIRECT'
      );
      const directScore = LessonPlanQualityEvaluator.evaluate(directPlan, setup);

      // 3. Compute Improvement
      const improvement = groundedScore.overallScore - directScore.overallScore;
      const improvementPercentage = Number(((improvement / directScore.overallScore) * 100).toFixed(1));

      results.push({
        lessonTitle: setup.lessonTitle,
        component: setup.component,
        level: setup.level,
        directScore,
        groundedScore,
        improvementPercentage,
        winnerMode: groundedScore.overallScore >= directScore.overallScore ? 'GROUNDED' : 'DIRECT'
      });
    }

    const avgDirect = Math.round(results.reduce((acc, r) => acc + r.directScore.overallScore, 0) / results.length);
    const avgGrounded = Math.round(results.reduce((acc, r) => acc + r.groundedScore.overallScore, 0) / results.length);
    const overallImprovementPercent = Number((((avgGrounded - avgDirect) / avgDirect) * 100).toFixed(1));
    const groundedWinCount = results.filter(r => r.winnerMode === 'GROUNDED').length;

    return {
      results,
      summary: {
        averageDirectScore: avgDirect,
        averageGroundedScore: avgGrounded,
        overallImprovementPercent,
        groundedWinCount
      }
    };
  }
}
