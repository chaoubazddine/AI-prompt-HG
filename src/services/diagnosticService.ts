import { 
  MoroccanLevel, 
  EducationCycle, 
  DiagnosticDossier, 
  DiagnosticQuestionItem, 
  StudentScoreRow, 
  DiagnosticReport, 
  RemediationPlan, 
  DiagnosticSupportJadha 
} from "../types/diagnostic";
import { DIAGNOSTIC_FRAMEWORKS, SAMPLE_STUDENTS_LIST } from "../constants/diagnosticData";
import { safeJsonParse } from "../utils/jsonCleaner";
import { getDeterministicQuestionsForLevel } from "./diagnosticQuestionsByLevel";
import { generateAIContent } from "./aiClient";

/**
 * Generate a complete, high-standard Diagnostic Dossier for Social Studies in Morocco
 */
export const generateDiagnosticDossier = async (
  level: MoroccanLevel,
  cycle: EducationCycle,
  institutionData: {
    academy: string;
    directorate: string;
    school: string;
    teacherName: string;
    academicYear: string;
    classGroup: string;
  },
  customFocusArea?: string
): Promise<DiagnosticDossier> => {
  const framework = DIAGNOSTIC_FRAMEWORKS[level] || DIAGNOSTIC_FRAMEWORKS['الأولى إعدادي'];

  const prompt = `
أنت خبير ومفتش تربوي تخصصي وممارس أول لمادة الاجتماعيات (التاريخ، الجغرافيا، والتربية على المواطنة) بالمملكة المغربية.
مهمتك إعداد "ملف التقويم التشخيصي المتكامل لبداية السنة الدراسية" وفق المقرر الوزاري المنظم للسنة الدراسية والأطر المرجعية المعتمدة.

المستوى التعليمي المستهدف: "${level}" (${cycle === 'prep' ? 'السلك الثانوي الإعدادي' : 'السلك الثانوي التأهيلي'})
المكتسبات القبلية المفحوصة: مكتسبات "${framework.prerequisiteLevel}"
معلومات المؤسسة:
- الأكاديمية: ${institutionData.academy}
- المديرية الإقليمية: ${institutionData.directorate}
- المؤسسة: ${institutionData.school}
- الأستاذ(ة): ${institutionData.teacherName}
- الموسم الدراسي: ${institutionData.academicYear}
- القسم/الفوج: ${institutionData.classGroup}
${customFocusArea ? `- تركيز خاص: ${customFocusArea}` : ''}

يجب أن يحتوي الملف التشخيصي الكامل على 5 مكونات أساسية عالية الاحترافية والعمق:
1. رائز تقويم تشخيصي تركيبي ومعياري (Test Diagnostique) على 20 نقطة:
   - يتضمن 8 إلى 10 أسئلة تغطي مجالات النهج التاريخي (التعريف، التفسير، التركيب)، والنهج الجغرافي (الوصف، التفسير، التعميم مع دعامات خرائطية ومبيانية وجداول)، والتربية على المواطنة / الفكر المقالي والمنهجي.
   - يتضمن عناصر الإجابة النموذجية المحددة وسلم التنقيط الدقيق لكل سؤال.
2. شبكة تفريغ واستثمار النتائج مع مصفوفة التفيؤ الواقعية لعينة من التلاميذ:
   - تحديد نقط كل تلميذ وتصنيفه بدقة وفق معايير التحكم الرسمية:
     * متحكم (Acquis): النقطة من 14 إلى 20
     * في طور التحكم (En cours d'acquisition): النقطة من 10 إلى 13.75
     * غير متحكم / متعثر (Non acquis): النقطة أقل من 10
3. تقرير التقويم التشخيصي الرسمي (Rapport d'évaluation diagnostique):
   - السياق التربوي والمذكرات المنظمة للتقويم التشخيصي.
   - المعطيات الإحصائية الكمية الدقيقة.
   - التحليل النوعي لمظاهر القوة ومكامن التعثر المشتركة (تاريخياً، جغرافياً، مواطناتياً ومنهجياً).
   - الاستنتاجات العامة والتوصيات التربوية.
4. خطة الدعم والمعالجة البيداغوجية والاستدراكية (Plan de soutien et de remédiation):
   - محاور استراتيجية وأنشطة علاجية واقعية ملموسة محددة الأهداف والدعامات وصيغ العمل (دعم صفي، مجموعات حاجات، ورشات الأقران).
5. جذاذة نموذجية كاملة لحصة دعم واستدراك بيداغوجي (Jadha de soutien et remédiation) مهيكلة بالمقاطع والدعامات ومهام الأستاذ والمتعلم.

أعد الرد حصراً بصيغة JSON وفق البنية الصارمة التالية:
{
  "title": "ملف التقويم التشخيصي لمادة الاجتماعيات - ${level}",
  "level": "${level}",
  "cycle": "${cycle}",
  "curriculumReference": "التوجيهات التربوية الرسمية والمقرر الوزاري لتنظيم السنة الدراسية",
  "createdAt": "${new Date().toISOString()}",
  "institutionInfo": {
    "academy": "${institutionData.academy}",
    "directorate": "${institutionData.directorate}",
    "school": "${institutionData.school}",
    "teacherName": "${institutionData.teacherName}",
    "academicYear": "${institutionData.academicYear}",
    "classGroup": "${institutionData.classGroup}"
  },
  "test": {
    "title": "رائز التقويم التشخيصي لمادة الاجتماعيات",
    "instructions": [
      "اقرأ الأسئلة والدعامات المرفقة بتمعن قبل الإجابة",
      "أجب في الحيز المخصص لكل سؤال بدقة ووضوح",
      "احرص على نظافة الورقة وسلامة التعبير واللغة"
    ],
    "duration": "ساعة واحدة (1س)",
    "totalPoints": 20,
    "questions": [
      {
        "id": "q1",
        "number": 1,
        "domain": "النهج التاريخي والمفاهيم التاريخية",
        "component": "التاريخ",
        "targetedCompetency": "...",
        "prerequisiteSkill": "...",
        "questionText": "...",
        "questionType": "multiple_choice",
        "options": ["أ. ...", "ب. ...", "ج. ...", "د. ..."],
        "expectedAnswer": "...",
        "maxScore": 2,
        "difficultyLevel": "سهل"
      }
    ]
  },
  "sampleScoringGrid": {
    "sampleStudents": []
  },
  "report": {
    "generalContext": "تندرج محطة التقويم التشخيصي في إطار مقتضيات المقرر الوزاري المنظم للسنة الدراسية الحالية وتوجيهات المنهاج الدراسي لمادة الاجتماعيات...",
    "institutionInfo": {
      "academy": "${institutionData.academy}",
      "directorate": "${institutionData.directorate}",
      "school": "${institutionData.school}",
      "teacherName": "${institutionData.teacherName}",
      "subject": "الاجتماعيات",
      "level": "${level}",
      "classGroup": "${institutionData.classGroup}",
      "academicYear": "${institutionData.academicYear}",
      "testDate": "شتنبر",
      "totalEnrolled": 38,
      "totalTested": 36,
      "absentCount": 2
    },
    "overallStats": {
      "averageScore": 11.85,
      "highestScore": 17.5,
      "lowestScore": 6.0,
      "successRate": 63.8
    },
    "categoriesStats": [
      {
        "category": "متحكم",
        "minThreshold": "14 - 20",
        "studentCount": 11,
        "percentage": 30.5,
        "description": "تحكم متين في المكتسبات القبلية والقدرة على التحليل والتركيب",
        "characteristics": ["استيعاب جيد للمفاهيم التاريخية والجغرافية", "سلامة التعبير والمنهجية"]
      },
      {
        "category": "في طور التحكم",
        "minThreshold": "10 - 13.75",
        "studentCount": 14,
        "percentage": 38.9,
        "description": "تحكم جزئي مع وجود بعض الهشاشة في التفسير والمهارات الخرائطية",
        "characteristics": ["تحكم نسبي في المفاهيم مع تردد في التفسير السببي", "صعوبات طفيفة في قراءة المبيانات"]
      },
      {
        "category": "غير متحكم",
        "minThreshold": "أقل من 10",
        "studentCount": 11,
        "percentage": 30.6,
        "description": "تعثرات ملحوظة في المفاهيم القاعدية والنهج الجغرافي والتاريخي",
        "characteristics": ["صعوبة في توظيف المصطلحات المناسبة", "نقص واضح في التعبير والتحليل"]
      }
    ],
    "domainAnalyses": [
      {
        "domain": "النهج التاريخي والمفاهيم التاريخية",
        "totalPoints": 7,
        "averageScore": 4.2,
        "masteryPercentage": 60,
        "strengths": ["التعرف على المحطات التاريخية الكبرى", "قراءة السلم الزمني البسيط"],
        "difficulties": ["الربط السببي بين الأحداث التاريخية", "تحديد السياق التاريخي للوثائق"],
        "recommendedInterventions": ["أنشطة تدريبية على تفكيك النصوص التاريخية", "ورشات استخراج الأسباب والنتائج"]
      }
    ],
    "qualitativeAnalysis": {
      "historicalThinkingDeficits": ["تعثر في الشرح التاريخي للمفاهيم", "الخلط بين التسلسل الزمني والتعليل السببي"],
      "geographicalThinkingDeficits": ["صعوبة قراءة واستثمار مفتاح الخريطة", "الخلط بين التفسير الجغرافي والوصف المجالي"],
      "citizenshipDeficits": ["نقص في التمييز بين الحقوق المدنية والسياسية", "صعوبة صياغة موقف معلل"],
      "methodologicalDeficits": ["النسخ الحرفي للنصوص في الأجوبة", "صعوبة صياغة مقدمة إشكالية واضحة"]
    },
    "generalConclusions": [
      "أظهرت نتائج الرائز التشخيصي تفاوتاً بيداغوجياً واضحاً بين فئات المتعلمين يستدعي تفريد التعلمات",
      "تركزت أغلب التعثرات في الجانب المهاري المنهجي (التحليل، التفسير، التوطين) أكثر من الجانب المعرفي الحفظي"
    ],
    "administrativeRecommendations": [
      "برمجة أسابيع دعم مكثف مندمج خلال الحصص التعليمية الأولى",
      "اعتماد بيداغوجيا الفوارق والتعلم بالقرين في العمل الصفي",
      "استثمار كراسات الدعم البيداغوجي والأنشطة الرقمية التفاعلية"
    ]
  },
  "remediationPlan": {
    "title": "خطة الدعم والاستدراك البيداغوجي لمادة الاجتماعيات",
    "level": "${level}",
    "academicYear": "${institutionData.academicYear}",
    "timeframe": "الأسابيع الثلاثة الأولى من انطلاق الموسم الدراسي وممتدة في الدعم المندمج",
    "strategicAxes": [
      {
        "axisName": "المحور الأول: تمتين المفاهيم المهيكلة والنهج التاريخي",
        "objective": "تمكين المتعلمين من خطوات التعريف والتفسير والتركيب التاريخي",
        "priorityActivities": ["ورشة الخطوط الزمنية والتحقيب", "نشاط استخراج الشواهد من النص التاريخي"]
      },
      {
        "axisName": "المحور الثاني: مهارات التعبير الجغرافي والخرائطي",
        "objective": "التحكم في قراءة وتحليل الرسوم المبيانية والخرائط الموضوعاتية",
        "priorityActivities": ["تطبيق خطوات الوصف والتفسير", "التدرب على رسم الخريطة وتوطين الظواهر"]
      }
    ],
    "activities": [
      {
        "id": "act1",
        "title": "ورشة معالجة النص التاريخي والتحقيب الزمني",
        "targetedDomain": "النهج التاريخي والمفاهيم التاريخية",
        "targetCategory": "غير متحكم",
        "detectedDifficulty": "صعوبة استخراج الفكرة وتحديد السياق التاريخي",
        "pedagogicalObjective": "أن يصبح المتعلم قادراً على تحديد موضوع النص وسياقه واستخراج معطياته بأمانة",
        "duration": "ساعة واحدة (1س)",
        "modality": "مجموعات حاجات",
        "didacticTools": ["نص تاريخي قصير مشكول", "جدول تفكيك الوثيقة", "بطاقة التوجيه الذاتي"],
        "procedureSteps": [
          {
            "stepTitle": "1. التهيئة والملاحظة (10 د)",
            "teacherGuidance": "عرض النص وتوجيه المتعلمين لقراءة العنوان والمصدر وصاحب النص",
            "studentActions": "قراءة صامتة وتحديد عناصر التوثيق الأساسية"
          },
          {
            "stepTitle": "2. النمذجة والاستخراج الموجه (25 د)",
            "teacherGuidance": "نمذجة كيفية وضع خطوط تحت الكلمات المفاتيح واستخراج الشواهد",
            "studentActions": "العمل داخل المجموعة لملء شبكة الاستخراج"
          },
          {
            "stepTitle": "3. التطبيق والتقويم الفردي (25 د)",
            "teacherGuidance": "تقديم نص تطبيقي قصير فردي للتثبيت",
            "studentActions": "إنجاز فردي وتصحيح تفاعلي بالقرين"
          }
        ],
        "evaluationIndicator": "قدرة 80% من المتعلمين المستهدفين على الإجابة الصحيحة عن أسئلة الفهم والاستخراج"
      }
    ],
    "monitoringMechanism": "تقويم تكويني مستمر خلال الحصص الدراسية مع رصد التحسن في سجل التتبع الفردي",
    "finalEvaluationDate": "نهاية الدورة الأولى"
  },
  "supportJadha": {
    "title": "جذاذة بيداغوجية لأنشطة الدعم والاستدراك",
    "remediationTitle": "حصة الدعم البيداغوجي: مهارات النهج الجغرافي والتحليل الخرائطي",
    "level": "${level}",
    "subject": "الاجتماعيات",
    "targetedDeficit": "ضعف في قراءة الخرائط واستثمار المفتاح والربط بين الظواهر الجغرافية",
    "prerequisiteGoal": "التحكم في توظيف أساسيات الخريطة وتطبيق خطوات الوصف الجغرافي للمجال",
    "duration": "ساعة واحدة (1س)",
    "pedagogicalMaterial": ["خريطة موضوعاتية مبسطة", "مسلاط عاكس أو كراسة الدعم", "أوراق عمل تطبيقية مصورة"],
    "steps": [
      {
        "phaseName": "المرحلة الأولى: رصد الصعوبة وبناء الدافعية",
        "duration": "10 دقائق",
        "learningSituation": "عرض خريطة بدون مفتاح وعنوان ومساءلة المتعلمين حول إمكانية قراءتها",
        "didacticSupport": "خريطة جغرافية ناقصة العناصر",
        "teacherTasks": ["طرح أسئلة استفزازية لإبراز أهمية عناصر الخريطة (العنوان، المفتاح، المقياس، الاتجاه)"],
        "studentTasks": ["اكتشاف أهمية المفتاح والعنوان في فك شفرات الخريطة وتدوين الملاحظة"],
        "workForm": "عمل جماعي حواري",
        "formativeCheck": "تسمية عناصر الخريطة الأربعة الأساسية بدقة"
      },
      {
        "phaseName": "المرحلة الثانية: النمذجة والممارسة الموجهة",
        "duration": "30 دقيقة",
        "learningSituation": "استثمار خريطة موضوعاتية متكاملة لتطبيق خطوات الوصف والتفسير",
        "didacticSupport": "خريطة التوزيعات المجالية وجدول معطيات مفسر",
        "teacherTasks": [
          "توجيه المتعلمين لقراءة المفتاح وتحديد مناطق التركز والتشتت",
          "مساعدة المتعلمين على صياغة جمل وصفية دقيقة ثم البحث عن العوامل المفسرة"
        ],
        "studentTasks": [
          "تحديد مدلول الرموز (نقطية، خطية، مساحية)",
          "تحرير وصف جغرافي منظم في جدول ثنائي"
        ],
        "workForm": "عمل في مجموعات صغيرة موجهة",
        "formativeCheck": "إنجاز جملة وصفية وجملة تفسيرية سليمتين لظاهرة مجالية"
      },
      {
        "phaseName": "المرحلة الثالثة: الإنتاج المستقل والتقويم الختامي",
        "duration": "20 دقيقة",
        "learningSituation": "تطبيق فردي على خريطة مصغرة جديدة للتحقق من زوال التعثر",
        "didacticSupport": "بطاقة تمرين فردي مستقل",
        "teacherTasks": ["مراقبة الإنجازات الفردية وتقديم تغذية راجعة فورية للمتعثرين"],
        "studentTasks": ["الإنجاز الفردي للبطاقة وتصحيح الأخطاء الذاتية"],
        "workForm": "عمل فردي مستقل",
        "formativeCheck": "تحقيق عتبة نجاح لا تقل عن 75% من المهام المطلوبة"
      }
    ],
    "synthesisAndRetention": "الخلاصة المستخلصة: قراءة الخريطة تستوجب احترام عناصرها الأربعة، ووصف الظاهرة يقتضي تحديد شكلها وتوزيعها، في حين يستدعي التفسير بيان أسباب وعوامل هذا التوزيع.",
    "postSupportEvaluation": "تمرين تطبيقي مدته 5 دقائق في بداية الحصة القادمة لقياس مدى استدامة المكتسب."
  }
}
`;

  let retries = 3;
  while (retries > 0) {
    try {
      const rawText = await generateAIContent({
        prompt,
        responseMimeType: "application/json",
        preferredModel: "gemini-3.7-flash",
      });

      const parsed = safeJsonParse<DiagnosticDossier>(rawText);
      if (parsed && parsed.test && parsed.report && parsed.remediationPlan) {
        parsed.id = parsed.id || `diag-${Date.now()}`;
        parsed.prerequisiteLevel = framework.prerequisiteLevel;

        // Normalize questions
        if (Array.isArray(parsed.test.questions)) {
          parsed.test.questions = parsed.test.questions.map((q, idx) => ({
            ...q,
            id: q.id || `q${idx + 1}`,
            number: q.number || idx + 1,
            maxScore: typeof q.maxScore === 'number' && q.maxScore > 0 ? q.maxScore : 3
          }));
        } else {
          parsed.test.questions = getDeterministicQuestionsForLevel(level);
        }

        // Fill sample students if empty or normalize existing
        if (!parsed.sampleScoringGrid?.sampleStudents?.length) {
          parsed.sampleScoringGrid = {
            sampleStudents: generateDeterministicStudentScores(parsed.test.questions)
          };
        } else {
          parsed.sampleScoringGrid.sampleStudents = parsed.sampleScoringGrid.sampleStudents.map((s, idx) => {
              const scoresDict: Record<string, number> = {};
              const rawScores = s.scores || (s as any).itemScores || {};
              let total = 0;

              parsed.test.questions.forEach((q, qIdx) => {
                const qKey = q.id || `q${qIdx + 1}`;
                let val = rawScores[qKey] ?? rawScores[String(q.number)] ?? rawScores[`q${q.number}`];
                if (typeof val !== 'number' || isNaN(val)) val = 0;
                scoresDict[qKey] = val;
                total += val;
              });

              total = Math.round(total * 2) / 2;
              const finalTotal = typeof s.totalScore === 'number' && !isNaN(s.totalScore) && s.totalScore > 0 ? s.totalScore : total;
              
              let cat: 'متحكم' | 'في طور التحكم' | 'غير متحكم' = s.levelCategory;
              if (!cat || !['متحكم', 'في طور التحكم', 'غير متحكم'].includes(cat)) {
                if (finalTotal >= 14) cat = 'متحكم';
                else if (finalTotal >= 10) cat = 'في طور التحكم';
                else cat = 'غير متحكم';
              }

              return {
                studentNumber: s.studentNumber || idx + 1,
                studentName: s.studentName || `تلميذ(ة) ${idx + 1}`,
                gender: s.gender === 'أنثى' ? 'أنثى' : 'ذكر',
                scores: scoresDict,
                totalScore: finalTotal,
                percentage: typeof s.percentage === 'number' ? s.percentage : Math.round((finalTotal / 20) * 100),
                levelCategory: cat
              };
            });
          }
          return parsed;
        }
        break;
      } catch (err) {
      console.warn("AI generation failed, retrying or falling back to offline generator:", err);
      retries--;
      if (retries === 0) break;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Robust Fallback Generator grounded in Moroccan Curricula
  return generateDeterministicDiagnosticDossier(level, cycle, institutionData, framework);
};

/**
 * Deterministic generator providing a rich, high-pedagogy offline diagnostic dossier
 */
function generateDeterministicDiagnosticDossier(
  level: MoroccanLevel,
  cycle: EducationCycle,
  institutionData: {
    academy: string;
    directorate: string;
    school: string;
    teacherName: string;
    academicYear: string;
    classGroup: string;
  },
  framework: any
): DiagnosticDossier {
  const questions: DiagnosticQuestionItem[] = getDeterministicQuestionsForLevel(level);

  const sampleStudents = generateDeterministicStudentScores(questions);

  const report: DiagnosticReport = {
    generalContext: `تندرج محطة التقويم التشخيصي في إطار مقتضيات المقرر الوزاري المنظم للسنة الدراسية ${institutionData.academicYear} والتوجيهات التربوية الرسمية الخاصة بتنظيم أسابيع التقويم التشخيصي والدعم الاستدراكي لمادة الاجتماعيات بالسلك ${cycle === 'prep' ? 'الثانوي الإعدادي' : 'الثانوي التأهيلي'}. تهدف هذه المحطة إلى تشخيص كفايات ومكتسبات المستوى السابق (${framework.prerequisiteLevel}) ورصد الفوارق الفردية وبناء خطط دعم موجهة وناجعة.`,
    institutionInfo: {
      academy: institutionData.academy,
      directorate: institutionData.directorate,
      school: institutionData.school,
      teacherName: institutionData.teacherName,
      subject: 'الاجتماعيات',
      level: level,
      classGroup: institutionData.classGroup,
      academicYear: institutionData.academicYear,
      testDate: 'شتنبر 2025',
      totalEnrolled: 38,
      totalTested: 36,
      absentCount: 2
    },
    overallStats: {
      averageScore: 11.45,
      highestScore: 17.5,
      lowestScore: 5.5,
      successRate: 61.1
    },
    categoriesStats: [
      {
        category: 'متحكم',
        minThreshold: '14 - 20',
        studentCount: 11,
        percentage: 30.6,
        description: 'تحكم متين وإتقان للقدرات المعرفية والمنهجية والقدرة على التفسير والتركيب والتحليل المستقل.',
        characteristics: [
          'استيعاب دقيق للمفاهيم والمصطلحات التاريخية والجغرافية',
          'إتقان قراءة الدعامات وتوظيف المفتاح والمقياس بمهارة',
          'سلامة التعبير المقالي والمنهجي والتنظيم المنطقي للأفكار'
        ]
      },
      {
        category: 'في طور التحكم',
        minThreshold: '10 - 13.75',
        studentCount: 14,
        percentage: 38.9,
        description: 'تحكم متوسط مع وجود بعض الثغرات المنهجية والحاجة إلى الدعم الموجه في التفسير والتوطين.',
        characteristics: [
          'تمكن معقول من الجانب المعرفي الحفظي مع تردد في الربط السببي',
          'صعوبة جزئية في تحويل الجداول إلى مبيانات أو استثمار الخرائط',
          'حاجة لتطوير أسلوب الصياغة وتجنب النقل الحرفي للنصوص'
        ]
      },
      {
        category: 'غير متحكم',
        minThreshold: 'أقل من 10',
        studentCount: 11,
        percentage: 30.5,
        description: 'تعثرات بنيوية عميقة تستدعي تدخلاً علاجياً استدراكياً ومصاحبة فردية حثيثة.',
        characteristics: [
          'نقص حاد في استيعاب المفاهيم القاعدية والكرونولوجيا',
          'صعوبة في قراءة وفهم النصوص والأسئلة واستخراج الأفكار',
          'ضعف القدرة على التعبير الكتابي وغياب المنهجية'
        ]
      }
    ],
    domainAnalyses: [
      {
        domain: 'النهج التاريخي والمفاهيم التاريخية',
        totalPoints: 8,
        averageScore: 4.8,
        masteryPercentage: 60,
        strengths: ['استذكار بعض الأحداث التاريخية البارزة والشخصيات', 'التمييز الأولي بين بعض الفترات التاريخية'],
        difficulties: ['التحقيب الزمني وحساب القرون بدقة', 'الربط السببي بين الظواهر واستخلاص السياق التاريخي'],
        recommendedInterventions: ['تمارين تفكيك النصوص التاريخية', 'ورشات تطبيقية على الخطوط الزمنية والتحقيب']
      },
      {
        domain: 'النهج الجغرافي والمهارات الخرائطية والمبيانية',
        totalPoints: 7,
        averageScore: 3.9,
        masteryPercentage: 55.7,
        strengths: ['معرفة الحدود الأساسية للمجال المغربي', 'التمييز المبدئي بين الجبال والسهول'],
        difficulties: ['توظيف عناصر الخريطة الأربعة وقراءة المفتاح', 'التعليل والتفسير الجغرافي للظواهر الطبيعية والبشرية'],
        recommendedInterventions: ['ورشات قراءة الخرائط الموضوعاتية وتوطين الظواهر', 'التدرب على خطوات النهج الجغرافي الثلاث']
      },
      {
        domain: 'التربية على المواطنة والسلوك المدني والوعي الحقوقي',
        totalPoints: 5,
        averageScore: 3.2,
        masteryPercentage: 64,
        strengths: ['الوعي بأهمية الحقوق والواجبات المدرسية', 'التمثل الإيجابي لقيم المواطنة والكرامة'],
        difficulties: ['التمييز المؤسساتي بين السلطات الدستورية', 'صياغة موقف معلل تجاه خرق حقوقي'],
        recommendedInterventions: ['دراسة حالات ووضعيات مشكلة حقوقية', 'استثمار جداول المقارنة بين المؤسسات الدستورية']
      }
    ],
    qualitativeAnalysis: {
      historicalThinkingDeficits: [
        'خلط واضح بين التحقيب الهجري والميلادي وحساب القرون',
        'الميل إلى السرد الإخباري وتغييب التفسير السببي والتركيب',
        'صعوبة الشرح التاريخي للمصطلحات وفق سياقها التاريخي'
      ],
      geographicalThinkingDeficits: [
        'إهمال عناصر الخريطة (خاصة المقياس والاتجاه) أثناء القراءة',
        'الخلط بين مفهوم الوصف الجغرافي ومفهوم التفسير الجغرافي',
        'صعوبة اختيار نوع المبيان المناسب للمعطيات الإحصائية'
      ],
      citizenshipDeficits: [
        'عدم التمييز الدقيق بين الحقوق الدستورية والواجبات القانونية',
        'نقص الإلمام بأدوار المؤسسات الاجتماعية والحقوقية الوطنية'
      ],
      methodologicalDeficits: [
        'النسخ الحرفي للجمل من النصوص دون صياغة إجابة مركزة',
        'إغفال التصميم المنهجي (المقدمة، العرض، الخاتمة) في الأسئلة التركيبية',
        'أخطاء لغوية وإملائية تؤثر على سلامة المعنى'
      ]
    },
    generalConclusions: [
      'تؤكد نتائج الرائز أن ثلثي المتعلمين يمتلكون قاعدة معرفية مقبولة، لكنهم يعانون من هشاشة واضحة في الجوانب المهارية المنهجية (النهج التاريخي، التوطين الجغرافي، التحليل المقارن).',
      'الحاجة الملحة لتخصيص أنشطة دعم مندمجة متدرجة الصعوبة خلال الأسابيع الأولى واعتماد البيداغوجيا الفارقية والعمل بالمجموعات المرنة.'
    ],
    administrativeRecommendations: [
      'تضمين أنشطة الدعم المندمج في التخطيط الدوري لجذاذات الدروس القادمة.',
      'توفير نسخ مصورة من الخرائط الصامتة وكراسات الدعم الذاتي للمتعثرين.',
      'إشراك المتعلمين المتحكمين في ورشات التوجيه بالقرين (Tutorat) لمساعدة زملائهم المتعثرين.'
    ]
  };

  const remediationPlan: RemediationPlan = {
    title: `خطة الدعم والاستدراك البيداغوجي لمادة الاجتماعيات - ${level}`,
    level: level,
    academicYear: institutionData.academicYear,
    timeframe: 'خلال الأسابيع الأولى من الدخول المدرسي وممتدة كدعم مندمج صفي طيلة الأسدوس الأول',
    strategicAxes: [
      {
        axisName: 'المحور الأول: تمتين خطوات النهج التاريخي والتحقيب الكرونولوجي',
        objective: 'إكساب المتعلمين القدرة على قراءة الخطوط الزمنية والربط السببي وتفكيك النصوص التاريخية',
        priorityActivities: [
          'ورشة التحقيب وحساب القرون والسنوات',
          'بطاقة الاشتغال على النص التاريخي وتحديد السياق والشواهد'
        ]
      },
      {
        axisName: 'المحور الثاني: إتقان التعبير الجغرافي والتحليل الخرائطي والمبياني',
        objective: 'التمكن من توظيف عناصر الخريطة وقراءة المبيانات وتطبيق خطوات الوصف والتفسير',
        priorityActivities: [
          'تطبيق خطوات الوصف والتفسير على ظاهرة مناخية أو سكانية',
          'التدرب على قراءة وتحويل الجداول إلى مبيانات ملائمة'
        ]
      },
      {
        axisName: 'المحور الثالث: المنهجية الإنشائية والوعي المفاهيمي والحقوقي',
        objective: 'التحكم في خطوات تحرير الموضوع المقالي وضبط المفاهيم الدستورية',
        priorityActivities: [
          'ورشة بناء المقدمة الإشكالية والخاتمة التركيبية',
          'شبكة مقارنة السلط الدستورية والحقوق والواجبات'
        ]
      }
    ],
    activities: [
      {
        id: 'act1',
        title: 'ورشة إتقان قراءة واستثمار الخرائط الجغرافية',
        targetedDomain: 'النهج الجغرافي والمهارات الخرائطية والمبيانية',
        targetCategory: 'غير متحكم',
        detectedDifficulty: 'صعوبة قراءة المفتاح وتوطين الظواهر الجغرافية واستخراج المعطيات',
        pedagogicalObjective: 'أن يصبح المتعلم قادراً على استثمار عناصر الخريطة الأربعة وتوطين الكيانات الجغرافية بدقة لا تقل عن 80%',
        duration: 'ساعة واحدة (1س)',
        modality: 'مجموعات حاجات',
        didacticTools: ['خرائط موضوعاتية مصورة بالألوان', 'خرائط صامتة للتطبيق', 'دليل القراءة الخرائطية'],
        procedureSteps: [
          {
            stepTitle: '1. التذكير والملاحظة الاستكشافية (10 د)',
            teacherGuidance: 'عرض خريطة ناقصة المفتاح والمساءلة حول كيفية قراءتها لتثبيت دور العناصر الأربعة.',
            studentActions: 'اكتشاف وتسمية العناصر الأربعة (العنوان، المفتاح، المقياس، الاتجاه).'
          },
          {
            stepTitle: '2. النمذجة والتطبيق الموجه (25 د)',
            teacherGuidance: 'نمذجة كيفية قراءة الرموز النقطية والخطية والمساحية في المفتاح وتطبيقها على خريطة المغرب.',
            studentActions: 'العمل الجماعي داخل المجموعات لتوطين السلاسل الجبلية والسهول والمناخات.'
          },
          {
            stepTitle: '3. الإنتاج المستقل والتقويم (25 د)',
            teacherGuidance: 'توزيع خريطة صامتة فردية ومواكبة المتعثرين مع تصحيح فوري بالقرين.',
            studentActions: 'ملء الخريطة الصامتة الفردية وكتابة خلاصة وصفية موجزة.'
          }
        ],
        evaluationIndicator: 'تحقيق علامة لا تقل عن 7/10 في رائز التوطين والقراءة الخرائطية البعدي.'
      },
      {
        id: 'act2',
        title: 'ورشة تفكيك واستثمار النصوص التاريخية والربط السببي',
        targetedDomain: 'النهج التاريخي والمفاهيم التاريخية',
        targetCategory: 'في طور التحكم',
        detectedDifficulty: 'النقل الحرفي للنصوص والخلط بين الوصف والتعليل التاريخي',
        pedagogicalObjective: 'أن يتمكن المتعلم من تحديد موضوع النص وسياقه واستخراج الأسباب والنتائج بأسلوب شخصي سليم',
        duration: 'ساعة واحدة (1س)',
        modality: 'دعم مندمج صفي',
        didacticTools: ['نص تاريخي قصير مشكول', 'شبكة تفكيك الوثيقة التاريخية', 'أوراق عمل فردية'],
        procedureSteps: [
          {
            stepTitle: '1. التمهيد والنمذجة (15 د)',
            teacherGuidance: 'توضيح تقنية وضع خطوط تحت الكلمات المفاتيح واستخراج الفكرة الأساسية وصاحب النص والمصدر.',
            studentActions: 'متابعة النموذج وتحديد عناصر التوثيق على النص المعروض.'
          },
          {
            stepTitle: '2. التمرين التطبيقي الثنائي (20 د)',
            teacherGuidance: 'طرح أسئلة مركبة تستدعي التمييز بين سبب الظاهرة ومظهرها ونتيجتها.',
            studentActions: 'التشاور الثنائي وصياغة الإجابات بأسلوب سليم في الشبكة.'
          },
          {
            stepTitle: '3. التقويم والتركيب (25 د)',
            teacherGuidance: 'توجيه المتعلمين لكتابة فقرة تركيبية تجمع الأفكار المستخلصة.',
            studentActions: 'تحرير الفقرة الفردية وتدوين بطاقة التوجيه الذاتي في الدفتر.'
          }
        ],
        evaluationIndicator: 'قدرة المتعلم على الإجابة الصحيحة عن أسئلة الفهم والتعليل بدون نسخ حرفي.'
      }
    ],
    monitoringMechanism: 'اعتماد بطاقات التتبع البيداغوجي الفردي، والتقويم التكويني المستمر عبر الألواح الفردية والأسئلة القصيرة في مستهل كل حصة دراسية.',
    finalEvaluationDate: 'خلال الفرض المحروس الأول من الدورة الأولى'
  };

  const supportJadha: DiagnosticSupportJadha = {
    title: 'جذاذة نموذجية لأنشطة الدعم والاستدراك البيداغوجي',
    remediationTitle: 'حصة الدعم والاستدراك: مهارات النهج التاريخي والجغرافي والتحليل المنهجي',
    level: level,
    subject: 'الاجتماعيات',
    targetedDeficit: 'صعوبة استثمار الدعامات الديداكتيكية (النصوص والخرائط) وضعف التعليل السببي والتعبير المنظم',
    prerequisiteGoal: 'تمكين المتعلمين من تقنيات تفكيك الوثائق وتطبيق خطوات النهج التاريخي والجغرافي بثقة واستقلالية',
    duration: 'ساعة واحدة (1س)',
    pedagogicalMaterial: [
      'نصوص تاريخية وخرائط جغرافية داعمة مصورة',
      'مسلاط ضوئي / سبورة تفاعلية',
      'بطاقات الأنشطة التطبيقية الفردية والجماعية'
    ],
    steps: [
      {
        phaseName: 'المرحلة الأولى: رصد التعثر وبناء الدافعية',
        duration: '10 دقائق',
        learningSituation: 'عرض وثيقة جغرافية وأخرى تاريخية بها أخطاء شائعة مستقاة من رائز التقويم التشخيصي لمناقشتها مع المتعلمين.',
        didacticSupport: 'شريحة عرض تتضمن أخطاء نموذجية مرصودة',
        teacherTasks: [
          'استدراج المتعلمين لاكتشاف مواطن الخلل في الإجابات المعروضة',
          'التصريح بأهداف حصة الدعم والمعالجة وتحفيز الجميع على الانخراط الإيجابي'
        ],
        studentTasks: [
          'اكتشاف مواطن النقص وتصويبها شفهياً',
          'استشعار الحاجة لضبط المنهجية وتدوين الهدف الإجرائي'
        ],
        workForm: 'عمل جماعي حواري تفاعلي',
        formativeCheck: 'تحديد مكمن الخطأ في الإجابة النموذجية المعروضة'
      },
      {
        phaseName: 'المرحلة الثانية: النمذجة والممارسة الموجهة',
        duration: '30 دقيقة',
        learningSituation: 'الاشتغال في ورشات موجهة على دعامتين (نص تاريخي + خريطة جغرافية) وفق خطوات إجرائية محددة.',
        didacticSupport: 'بطاقة عمل تتضمن نصاً تاريخياً وخريطة مبسطة',
        teacherTasks: [
          'تقديم نمذجة حية على السبورة لكيفية تحديد السياق التاريخي واستخراج الأسباب من النص',
          'مواكبة مجموعات العمل وتقديم الدعم الفوري للمتعثرين وتيسير تبادل الآراء'
        ],
        studentTasks: [
          'تطبيق خطوات النمذجة على الوثائق المقترحة داخل المجموعة',
          'استخراج المعطيات وتصنيفها في جداول ثنائية متناسقة'
        ],
        workForm: 'عمل في مجموعات صغيرة (مجموعات حاجات / الأقران)',
        formativeCheck: 'تقييم إنجاز كل مجموعة عبر أسئلة سريعة على الألواح الفردية'
      },
      {
        phaseName: 'المرحلة الثالثة: التطبيق المستقل والتقويم الختامي',
        duration: '20 دقيقة',
        learningSituation: 'إنجاز نشاط فردي قصير ومستقل للتحقق من زوال التعثر ورسوخ المهارة.',
        didacticSupport: 'ورقة نشاط تطبيقي فردي مصغرة',
        teacherTasks: [
          'توزيع النشاط الفردي ومراقبة سلاسة الإنجاز دون تدخل إلا للتوجيه الخفيف',
          'إجراء تصحيح جماعي سريع وتثبيت القواعد المنهجية'
        ],
        studentTasks: [
          'الإنجاز الفردي للنشاط في الحيز المخصص',
          'التصحيح الذاتي وتدوين خلاصة التركيب في الدفتر'
        ],
        workForm: 'عمل فردي مستقل',
        formativeCheck: 'تحقيق نسبة نجاح تفوق 75% في النشاط التطبيقي الفردي'
      }
    ],
    synthesisAndRetention: 'الخلاصة المنهجية: النهج التاريخي يعتمد على التعريف والتفسير والتركيب، والنهج الجغرافي ينبني على الوصف والتفسير والتعميم. قراءة أي وثيقة تقتضي استحضار سياقها واستخراج معطياتها بأسلوب شخصي رصين بعيداً عن النقل الأعمى.',
    postSupportEvaluation: 'إدراج سؤال منهجي في مدخل الحصة الدراسية الموالية للتحقق من استدامة الأثر الإيجابي لحصة الدعم.'
  };

  return {
    id: `diag-${Date.now()}`,
    title: `ملف التقويم التشخيصي لمادة الاجتماعيات - ${level}`,
    level: level,
    cycle: cycle,
    prerequisiteLevel: framework.prerequisiteLevel,
    curriculumReference: 'المقرر الوزاري المنظم للسنة الدراسية والتوجيهات التربوية الرسمية',
    createdAt: new Date().toISOString(),
    institutionInfo: institutionData,
    test: {
      title: `رائز التقويم التشخيصي لمادة الاجتماعيات - ${level}`,
      instructions: [
        'اقرأ الأسئلة والدعامات المرفقة بتمعن وتركيز قبل الإجابة.',
        'أجب في الحيز المخصص لكل سؤال بدقة وبأسلوب شخصي سليم.',
        'احرص على تنظيم ورقة التحرير وسلامة اللغة ونظافة الخط.'
      ],
      duration: 'ساعة واحدة (1س)',
      totalPoints: 20,
      questions: questions
    },
    sampleScoringGrid: {
      sampleStudents: sampleStudents
    },
    report: report,
    remediationPlan: remediationPlan,
    supportJadha: supportJadha
  };
}

/**
 * Generate deterministic sample students data with realistic Moroccan score distributions
 */
export function generateDeterministicStudentScores(questions: DiagnosticQuestionItem[]): StudentScoreRow[] {
  const students = SAMPLE_STUDENTS_LIST;
  const result: StudentScoreRow[] = [];

  students.forEach((s, idx) => {
    const scores: Record<string, number> = {};
    let total = 0;

    // Patterned score profiles (top, medium, struggling)
    let profile: 'high' | 'mid' | 'low';
    if (idx % 3 === 0) profile = 'high';
    else if (idx % 3 === 1) profile = 'mid';
    else profile = 'low';

    questions.forEach((q) => {
      let score = 0;
      if (profile === 'high') {
        score = q.maxScore >= 4 ? q.maxScore - 0.5 : q.maxScore;
      } else if (profile === 'mid') {
        score = Math.max(0.5, Math.round(q.maxScore * 0.6 * 2) / 2);
      } else {
        score = Math.max(0, Math.round(q.maxScore * 0.35 * 2) / 2);
      }
      scores[q.id] = score;
      total += score;
    });

    total = Math.round(total * 2) / 2;
    const percentage = Math.round((total / 20) * 100);

    let category: 'متحكم' | 'في طور التحكم' | 'غير متحكم' = 'غير متحكم';
    if (total >= 14) category = 'متحكم';
    else if (total >= 10) category = 'في طور التحكم';

    result.push({
      studentNumber: idx + 1,
      studentName: s.name,
      gender: s.gender,
      scores,
      totalScore: total,
      percentage,
      levelCategory: category
    });
  });

  return result;
}
