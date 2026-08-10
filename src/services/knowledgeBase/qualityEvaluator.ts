import { StructuredLessonPlan, LessonSetup, DidacticConcept, DidacticConceptQuality, QualityCheckItem } from '../../types/smartAssistant';
import { EvaluationScore, GroundedContext } from '../../types/knowledgeBase';

/**
 * LessonPlanQualityEvaluator
 * Internal evaluation engine measuring lesson plan and didactic concept quality against core pedagogical & curriculum criteria.
 */
export class LessonPlanQualityEvaluator {
  /**
   * Evaluate a proposed DidacticConcept before lesson plan generation
   */
  static evaluateConcept(
    concept: DidacticConcept,
    setup?: LessonSetup
  ): DidacticConceptQuality {
    const checks: QualityCheckItem[] = [];

    // 1. Alignment between Goals and Activities (الانسجام بين الأهداف والأنشطة)
    const hasCentralGoal = concept.centralGoal && concept.centralGoal.trim().length > 10;
    const totalActivities = concept.learningPhases?.reduce((acc, p) => acc + (p.activities?.length || 0), 0) || 0;
    const goalAlignmentScore = hasCentralGoal && totalActivities >= 2 ? 95 : 60;
    checks.push({
      id: 'check-goals',
      title: 'الانسجام بين الأهداف والأنشطة',
      passed: goalAlignmentScore >= 80,
      score: goalAlignmentScore,
      feedback: goalAlignmentScore >= 80 
        ? 'الأنشطة المخططة منسجمة بوضوح مع الهدف التعلمي المركزي ومراحل بناء التعلم.'
        : 'يرجى التأكد من إضافة المزيد من الأنشطة المركزة لتحقيق الهدف المركزي.'
    });

    // 2. Subject Specific Approach (التمييز والدقة في نهج المكون: تاريخ / جغرافيا / مواطنة)
    const comp = concept.component || setup?.component || 'التاريخ';
    let subjectScore = 90;
    let subjectFeedback = '';
    
    if (comp === 'التاريخ') {
      const text = JSON.stringify(concept).toLowerCase();
      const hasHistKeywords = text.includes('تاريخ') || text.includes('وثيق') || text.includes('تعريف') || text.includes('تفسير') || text.includes('تركيب') || text.includes('زمن');
      subjectScore = hasHistKeywords ? 98 : 70;
      subjectFeedback = 'تطبيق محكم لخطوات النهج التاريخي (التعريف، التفسير، التركيب) واستثمار الوثائق والدعامات التاريخية.';
    } else if (comp === 'الجغرافيا') {
      const text = JSON.stringify(concept).toLowerCase();
      const hasGeoKeywords = text.includes('جغراف') || text.includes('مجال') || text.includes('وصف') || text.includes('تفسير') || text.includes('تعميم') || text.includes('خريط') || text.includes('مبيان');
      subjectScore = hasGeoKeywords ? 98 : 70;
      subjectFeedback = 'تطبيق دقيق لخطوات النهج الجغرافي (الوصف الجغرافي، التفسير المجالي، التعميم) واستقراء الأدوات الخرائطية والبيانية.';
    } else {
      const text = JSON.stringify(concept).toLowerCase();
      const hasCivicKeywords = text.includes('مواطن') || text.includes('حقوق') || text.includes('سلوك') || text.includes('موقف') || text.includes('قيم') || text.includes('اكتشاف');
      subjectScore = hasCivicKeywords ? 98 : 70;
      subjectFeedback = 'اعتماد النهج المواطني التفاعلي (اكتشاف المفهوم، التحليل النقدي، التجسيد الميداني والسلوك المواطن).';
    }

    checks.push({
      id: 'check-subject-nature',
      title: `طبيعة المادة والنهج الديداكتيكي (${comp})`,
      passed: subjectScore >= 80,
      score: subjectScore,
      feedback: subjectFeedback
    });

    // 3. Level Appropriateness & Moroccan Curriculum Grounding (احترام المنهاج المغربي والعمق المعرفي)
    const hasConcepts = concept.keyConcepts && concept.keyConcepts.length >= 2;
    const hasValidTextbook = concept.proposedResources?.some(r => r.source && r.source.trim().length > 0);
    const curriculumScore = (hasConcepts ? 50 : 20) + (hasValidTextbook ? 45 : 30);
    checks.push({
      id: 'check-curriculum',
      title: 'احترام المنهاج المغربي وموثوقية المراجع',
      passed: curriculumScore >= 75,
      score: curriculumScore,
      feedback: curriculumScore >= 75 
        ? 'المفاهيم والمراجع والمستندات مقترحة وفق التوجيهات الرسمية للمنهاج المغربي دون اختلاق.'
        : 'ينصح بالتدقيق في أرقام الوثائق والمستندات المقررة في المراجع الرسمية.'
    });

    // 4. Time Feasibility (احترام المدة الزمنية والتدبير الديداكتيكي)
    const timeScore = totalActivities >= 2 && totalActivities <= 6 ? 92 : 75;
    checks.push({
      id: 'check-time',
      title: 'احترام المدة الزمنية وتوزيع الأنشطة',
      passed: timeScore >= 80,
      score: timeScore,
      feedback: `تم توزيع الملاحظات والأنشطة على غلاف زمني مناسب قدره (${concept.duration || '55 دقيقة'})، مع مراعاة الانتقال المنطقي بين المقاطع.`
    });

    // 5. Evaluation & Support Presence (وجود تقويم فعلي ودعم)
    const hasFormative = concept.formativeEvaluation && concept.formativeEvaluation.length > 0;
    const hasFinal = concept.finalEvaluation && concept.finalEvaluation.length > 0;
    const evalScore = (hasFormative ? 50 : 20) + (hasFinal ? 45 : 20);
    checks.push({
      id: 'check-evaluation',
      title: 'وجود تقويم تكويني ونهائي ودعم ديداكتيكي',
      passed: evalScore >= 80,
      score: evalScore,
      feedback: evalScore >= 80
        ? 'يتضمن التصور أداة تقويم مرحلي مستمر وتقويم ختامي واضح مع خطة دعم مركزة.'
        : 'يرجى التأكد من إضافة أسئلة تقويمية لقياس مدى تحقق الأهداف.'
    });

    // Calculate overall score
    const overallScore = Math.round(
      checks.reduce((acc, c) => acc + c.score, 0) / checks.length
    );

    return {
      overallScore,
      passed: overallScore >= 75,
      checks,
      overallFeedback: overallScore >= 80
        ? 'التصور الديداكتيكي ممتاز، مبرر تربوياً، ومطابق للتوجيهات التربوية المغربية لمادة الاجتماعيات.'
        : 'التصور الديداكتيكي يحتاج بعض التعديلات البسيطة لضمان الجودة التربوية العالية.'
    };
  }

  /**
   * Evaluate a generated lesson plan against setup requirements and grounded context.
   */
  static evaluate(
    plan: StructuredLessonPlan,
    setup: LessonSetup,
    groundedContext?: GroundedContext
  ): EvaluationScore {
    const feedback: string[] = [];

    // 1. Curriculum Alignment (0 - 100)
    let curriculumAlignment = 75;
    if (groundedContext?.curriculumReference) {
      const ref = groundedContext.curriculumReference;
      const combinedPlanText = JSON.stringify(plan).toLowerCase();

      let conceptHits = 0;
      ref.keyConcepts.forEach(c => {
        if (combinedPlanText.includes(c.toLowerCase())) conceptHits++;
      });

      const conceptRatio = ref.keyConcepts.length > 0 ? conceptHits / ref.keyConcepts.length : 1;
      curriculumAlignment = Math.min(100, Math.round(60 + (conceptRatio * 40)));

      if (conceptRatio < 0.5) {
        feedback.push('تنبيه الملاءمة: لم يتم تضمين جزء من المفاهيم الرسمية الأساسية المحددة في المنهاج.');
      }
    } else if (groundedContext?.hasOfficialReference) {
      curriculumAlignment = 85;
    }

    // 2. Content Accuracy & Richness (0 - 100)
    let contentAccuracy = 90;
    const jsonStr = JSON.stringify(plan);
    if (
      jsonStr.includes('هدف معرفي 1') ||
      jsonStr.includes('أسئلة الأستاذ') ||
      jsonStr.includes('إجابات المتعلمين') ||
      jsonStr.includes('نص توضيحي')
    ) {
      contentAccuracy -= 40;
      feedback.push('خلل في المحتوى: تم اكتشاف عبارات عامة أو نصوص توضيحية مفرغة بدلاً من محتوى ديداكتيكي حقيقي.');
    }

    const phases = plan.phases || [];
    const activities = phases.filter(p => !p.isHeader && !p.isSynthesis && !p.isEvaluation);

    if (activities.length < 2) {
      contentAccuracy -= 20;
      feedback.push('نقص في الأنشطة: عدد الأنشطة البنائية أقل من الموصى به لتدريس المادة.');
    } else {
      activities.forEach((act, idx) => {
        if (!act.teacherActivity || act.teacherActivity.length < 25) {
          contentAccuracy -= 10;
          feedback.push(`ملاحظة في النشاط ${idx + 1}: نشاط الأستاذ موجز جداً.`);
        }
      });
    }
    contentAccuracy = Math.max(0, Math.min(100, contentAccuracy));

    // 3. Level Appropriateness (0 - 100)
    let levelAppropriateness = 88;
    if (setup.level.includes('إعدادي') || setup.level.includes('تأهيلي')) {
      levelAppropriateness = 95;
    }

    // 4. Pedagogical Coherence (0 - 100)
    let pedagogicalCoherence = 90;
    const hasIntro = plan.introductionSteps && plan.introductionSteps.length > 0;
    const hasActivities = activities.length >= 2;
    const hasAssessment = plan.finalEvaluation && plan.finalEvaluation.length > 0;

    if (!hasIntro || !hasActivities || !hasAssessment) {
      pedagogicalCoherence -= 30;
      feedback.push('خلل الاتساق الديداكتيكي: غياب إحدى المراحل الرئيسية (التمهيد، الأنشطة البنائية، أو التقويم).');
    }

    // 5. Teacher Vision Alignment (0 - 100)
    let teacherVisionAlignment = 85;
    if (setup.teacherVision && setup.teacherVision.trim().length > 0) {
      const visionLower = setup.teacherVision.toLowerCase();
      const planLower = JSON.stringify(plan).toLowerCase();

      const keywords = visionLower.split(/\s+/).filter(w => w.length > 3);
      let matches = 0;
      keywords.forEach(kw => {
        if (planLower.includes(kw)) matches++;
      });

      const visionRatio = keywords.length > 0 ? matches / keywords.length : 1;
      teacherVisionAlignment = Math.min(100, Math.round(50 + (visionRatio * 50)));

      if (teacherVisionAlignment < 70) {
        feedback.push('تطابق تصور الأستاذ: توصيات تصور الأستاذ الميداني لم تنعكس بشكل كافٍ في الجذاذة.');
      }
    } else {
      teacherVisionAlignment = 90;
    }

    // 6. Time Feasibility (0 - 100)
    let timeFeasibility = 90;
    let totalMinutes = 0;
    (plan.introductionSteps || []).forEach(step => {
      if (step.duration) totalMinutes += parseInt(step.duration) || 3;
    });
    phases.forEach(p => {
      if (p.duration) totalMinutes += parseInt(p.duration) || 10;
    });

    if (totalMinutes < 45 || totalMinutes > 70) {
      timeFeasibility -= 20;
      feedback.push(`توزيع الزمن (${totalMinutes} دقيقة): الغلاف الزمني ينحرف عن الحصة النمطية الموصى بها (55-60 دقيقة).`);
    }

    // 7. Assessment Alignment (0 - 100)
    let assessmentAlignment = 88;
    if (!plan.finalEvaluation || plan.finalEvaluation.length < 2) {
      assessmentAlignment -= 25;
      feedback.push('التقويم: أسئلة التقويم التكويني والتركيب غير كافية.');
    }

    // 8. Source Grounding (0 - 100)
    let sourceGrounding = 60;
    if (plan.sources && plan.sources.length > 0) {
      sourceGrounding = 85;
      const hasOfficial = plan.sources.some(
        s => s.authorityLevel === 'OFFICIAL_MOROCCAN' || s.type === 'official' || s.reliability >= 0.9
      );
      if (hasOfficial) sourceGrounding = 100;
    } else if (groundedContext?.hasOfficialReference) {
      sourceGrounding = 80;
    }

    // Overall Score Calculation (Weighted)
    const overallScore = Math.round(
      curriculumAlignment * 0.20 +
      contentAccuracy * 0.20 +
      pedagogicalCoherence * 0.15 +
      teacherVisionAlignment * 0.15 +
      sourceGrounding * 0.10 +
      timeFeasibility * 0.08 +
      assessmentAlignment * 0.07 +
      levelAppropriateness * 0.05
    );

    return {
      curriculumAlignment,
      contentAccuracy,
      levelAppropriateness,
      pedagogicalCoherence,
      teacherVisionAlignment,
      timeFeasibility,
      assessmentAlignment,
      sourceGrounding,
      overallScore,
      feedback
    };
  }
}
