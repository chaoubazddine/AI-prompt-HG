import dotenv from 'dotenv';
dotenv.config();

import { ComparisonService } from '../src/services/knowledgeBase/comparisonService';

async function main() {
  console.log('====================================================');
  console.log(' بدء تشغيل اختبار مقارنة DIRECT vs GROUNDED لمادة الاجتماعيات (5 طلبات)');
  console.log('====================================================\n');

  try {
    const report = await ComparisonService.runBenchmark();

    console.log('\n====================================================');
    console.log(' نتائج التقييم والمقارنة التفصيلية (DIRECT vs GROUNDED)');
    console.log('====================================================\n');

    report.results.forEach((r, idx) => {
      console.log(`[الطلب ${idx + 1}] ${r.level} - ${r.component} - "${r.lessonTitle}"`);
      console.log(`  • النتيجة المباشرة (Direct Gemini): ${r.directScore.overallScore}/100`);
      console.log(`  • النتيجة الموجهة (Grounded KB):    ${r.groundedScore.overallScore}/100`);
      console.log(`  • نسبة التحسن:                    +${r.improvementPercentage}%`);
      console.log(`  • الوضع الفائز:                  ${r.winnerMode}`);
      console.log(`  • تفاصيل درجات Grounded:`);
      console.log(`    - مطابقة المنهاج:       ${r.groundedScore.curriculumAlignment}/100`);
      console.log(`    - دقة المحتوى والثرائية: ${r.groundedScore.contentAccuracy}/100`);
      console.log(`    - الاتساق الديداكتيكي:   ${r.groundedScore.pedagogicalCoherence}/100`);
      console.log(`    - رؤية الأستاذ:          ${r.groundedScore.teacherVisionAlignment}/100`);
      console.log(`    - التأصيل والمصادر:      ${r.groundedScore.sourceGrounding}/100`);
      console.log(`  • التغذية الراجعة (Feedback): ${r.groundedScore.feedback.length > 0 ? r.groundedScore.feedback.join(' | ') : 'مطابقة ممتازة لا توجد ملاحظات سلبية'}`);
      console.log('----------------------------------------------------\n');
    });

    console.log('====================================================');
    console.log(' ملخص الأداء الإجمالي:');
    console.log(`  • متوسط درجة المسار المباشر (Direct): ${report.summary.averageDirectScore}/100`);
    console.log(`  • متوسط درجة المسار الموجه (Grounded): ${report.summary.averageGroundedScore}/100`);
    console.log(`  • نسبة التحسن الإجمالية:              +${report.summary.overallImprovementPercent}%`);
    console.log(`  • عدد الحالات الفائزة لـ Grounded:    ${report.summary.groundedWinCount} / ${report.results.length}`);
    console.log('====================================================');
  } catch (err) {
    console.error('حدث خطأ أثناء تشغيل الاختبار:', err);
  }
}

main();
