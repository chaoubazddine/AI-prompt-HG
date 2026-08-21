import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { RayadaJadhaData, RayadaExamData, RayadaTarlTest } from '../types/rayada';

/**
 * دالة مساعدة لإنشاء فقرات منسقة تدعم اللغة العربية من اليمين إلى اليسار
 */
const createRtlPara = (text: string, options: any = {}) => {
  return new Paragraph({
    // @ts-ignore
    bidirectional: true,
    alignment: options.alignment || AlignmentType.RIGHT,
    spacing: options.spacing || { before: 40, after: 40 },
    children: [
      new TextRun({
        text: text || "",
        rightToLeft: true,
        bold: options.bold,
        size: options.size || 20, // 10pt = 20 half-points
        color: options.color || "1E293B",
        font: "Arial",
      })
    ],
  });
};

/**
 * دالة مساعدة لإنشاء خلية جدول تدعم RTL وهوامش مريحة وحدود واضحة
 */
const createCell = (content: string | Paragraph[] | Paragraph, options: any = {}) => {
  let children: Paragraph[] = [];
  if (typeof content === 'string') {
    children = [createRtlPara(content, { 
      bold: options.bold, 
      alignment: options.alignment || AlignmentType.RIGHT, 
      size: options.size || 18, 
      color: options.color 
    })];
  } else if (Array.isArray(content)) {
    children = content;
  } else {
    children = [content];
  }

  const borderStyle = options.noBorder ? {
    style: BorderStyle.NONE,
    size: 0,
    color: "FFFFFF",
  } : {
    style: BorderStyle.SINGLE,
    size: 4,
    color: options.borderColor || "CBD5E1",
  };

  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: options.shading ? { fill: options.shading } : undefined,
    columnSpan: options.columnSpan,
    rowSpan: options.rowSpan,
    width: options.width,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
    },
    children,
  });
};

/**
 * تصدير جذاذة التدريس الصريح المعتمدة في إعداديات الريادة بصيغة Word من اليمين إلى اليسار
 */
export const downloadRayadaJadhaWord = async (jadha: RayadaJadhaData) => {
  if (!jadha) return;

  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 500, right: 500, bottom: 500, left: 500 },
          },
        },
        children: [
          // 1. Official Header Table (3 Columns - RTL Order: Right Box -> Center Box -> Left Box)
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  // Right Box (Kingdom & Pioneer Schools Project)
                  createCell([
                    createRtlPara("المملكة المغربية", { bold: true, size: 16, alignment: AlignmentType.CENTER, color: "0F172A" }),
                    createRtlPara("وزارة التربية الوطنية والتعليم الأولي والرياضة", { size: 13, alignment: AlignmentType.CENTER, color: "475569" }),
                    createRtlPara("مشروع إعداديات الريادة 🌟", { bold: true, size: 17, color: "D97706", alignment: AlignmentType.CENTER }),
                    createRtlPara(jadha.schoolName || "المؤسسة التعليمية", { size: 13, alignment: AlignmentType.CENTER, color: "64748B" }),
                  ], { width: { size: 28, type: WidthType.PERCENTAGE }, shading: "F8FAFC", borderColor: "CBD5E1" }),

                  // Center Box (Lesson Title & Level)
                  createCell([
                    createRtlPara("جذاذة التدريس الصريح (Enseignement Explicite)", { bold: true, size: 20, color: "4F46E5", alignment: AlignmentType.CENTER }),
                    createRtlPara(`درس: ${jadha.title}`, { bold: true, size: 22, color: "0F172A", alignment: AlignmentType.CENTER }),
                    createRtlPara(`المكون: ${jadha.subject} | المستوى: ${jadha.level}`, { bold: true, size: 17, color: "1E293B", alignment: AlignmentType.CENTER }),
                    createRtlPara(`الدورة: ${jadha.term || "الدورة الأولى"}`, { size: 14, color: "64748B", alignment: AlignmentType.CENTER }),
                  ], { width: { size: 44, type: WidthType.PERCENTAGE }, shading: "EEF2FF", borderColor: "A5B4FC" }),

                  // Left Box (Metadata: Year, Duration, Textbook, Teacher)
                  createCell([
                    createRtlPara(`الموسم الدراسي: ${jadha.academicYear || "2025/2026"}`, { size: 14, alignment: AlignmentType.RIGHT, color: "334155" }),
                    createRtlPara(`الغلاف الزمني: ${jadha.duration || "ساعتان (حصتان)"}`, { size: 14, alignment: AlignmentType.RIGHT, color: "334155" }),
                    createRtlPara(`المرجع: ${jadha.references || "كراسة الريادة"}`, { size: 13, alignment: AlignmentType.RIGHT, color: "475569" }),
                    createRtlPara(`الأستاذ(ة): ${jadha.teacherName || "...................."}`, { size: 14, alignment: AlignmentType.RIGHT, color: "334155" }),
                  ], { width: { size: 28, type: WidthType.PERCENTAGE }, shading: "F8FAFC", borderColor: "CBD5E1" }),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 80 } }),

          // 2. Competency & Explicit Objectives Table (2 Columns - RTL Order: Right 35% -> Left 65%)
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell(createRtlPara("الكفاية المستهدفة (Compétence visée)", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 17 }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "312E81", borderColor: "1E1B4B" }),
                  createCell(createRtlPara("الأهداف التعلمية الصريحة والمباشرة (Objectifs explicites)", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 17 }), { width: { size: 65, type: WidthType.PERCENTAGE }, shading: "4F46E5", borderColor: "3730A3" }),
                ],
              }),
              new TableRow({
                children: [
                  createCell(createRtlPara(jadha.targetCompetency || "", { size: 17, color: "1E293B" }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
                  createCell(
                    jadha.explicitObjectives.map((obj) => createRtlPara(`• ${obj}`, { size: 17, color: "0F172A" })),
                    { width: { size: 65, type: WidthType.PERCENTAGE }, shading: "FFFFFF" }
                  ),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 80 } }),

          // 3. Reactivation & Explicit Goal Announcement Table (RTL Order: Right 55% -> Left 45%)
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  // Right Cell: Reactivation (التنشيط والتذكير)
                  createCell([
                    createRtlPara(`1. محطة التذكير والتنشيط (Réactivation - ${jadha.reactivation.duration || "5 دقائق"})`, { bold: true, color: "166534", size: 18 }),
                    createRtlPara("أسئلة استدعاء المكتسبات القبلية (بالألواح الفردية):", { bold: true, size: 15, color: "14532D" }),
                    ...jadha.reactivation.questions.map((q, i) => createRtlPara(`   - س${i + 1}: ${q}`, { size: 16, color: "1E293B" })),
                    createRtlPara(`• آلية التفعيل: ${jadha.reactivation.activationMechanism}`, { size: 14, color: "475569" }),
                    createRtlPara(`• جسر الربط بالدرس الجديد: ${jadha.reactivation.linkToNewLesson}`, { size: 15, color: "166534", bold: true }),
                  ], { width: { size: 55, type: WidthType.PERCENTAGE }, shading: "F0FDF4", borderColor: "BBF7D0" }),

                  // Left Cell: Explicit Goal Statement & Supports (التصريح بالهدف والدعامات)
                  createCell([
                    createRtlPara("2. التصريح بالهدف التعلمي (Objectif Explicite)", { bold: true, color: "92400E", size: 18 }),
                    createRtlPara(`"${jadha.explicitGoalStatement || ""}"`, { size: 16, bold: true, color: "78350F" }),
                    createRtlPara("الوسائط والدعامات الديداكتيكية المعتمدة:", { bold: true, size: 14, color: "475569", spacing: { before: 50, after: 20 } }),
                    createRtlPara(`• العرض الرقمي: ${jadha.pedagogicalTools.digitalSupport}`, { size: 13, color: "475569" }),
                    createRtlPara(`• الأدوات الفردية: ${jadha.pedagogicalTools.individualTools}`, { size: 13, color: "475569" }),
                    createRtlPara(`• الدعامات: ${jadha.pedagogicalTools.didacticMaterials}`, { size: 13, color: "475569" }),
                  ], { width: { size: 45, type: WidthType.PERCENTAGE }, shading: "FEFCE8", borderColor: "FEF08A" }),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 100 } }),

          // Title for Didactic Engineering Table
          createRtlPara("جدول التدبير الديداكتيكي لمقاطع الدرس وفق مقاربة التدريس الصريح (Enseignement Explicite):", {
            bold: true,
            size: 20,
            color: "312E81",
            spacing: { before: 80, after: 60 }
          }),

          // 4. MAIN DIDACTIC ENGINEERING TABLE (RTL Columns: Right to Left)
          // Col 1 (Right 18%): المقطع والدعامة والمهارة
          // Col 2 (30%): النمذجة (أنا أفعل / Modelage)
          // Col 3 (28%): الممارسة الموجهة (نحن نفعل / Pratique guidée)
          // Col 4 (Left 24%): الممارسة المستقلة (أنت تفعل / Pratique autonome)
          ...jadha.steps.flatMap((step, stepIdx) => [
            new Table({
              visuallyRightToLeft: true,
              width: { size: 100, type: WidthType.PERCENTAGE },
              alignment: AlignmentType.CENTER,
              rows: [
                // Header Row for the 4 Columns
                new TableRow({
                  children: [
                    createCell(createRtlPara("المقطع والدعامة والمهارة", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 16 }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "1E293B", borderColor: "0F172A" }),
                    createCell(createRtlPara("1. النمذجة (Modelage)\n[أنا أفعل - Je fais]", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 16 }), { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "1D4ED8", borderColor: "1E40AF" }),
                    createCell(createRtlPara("2. الممارسة الموجهة (Pratique Guidée)\n[نحن نفعل - Nous faisons]", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 16 }), { width: { size: 27, type: WidthType.PERCENTAGE }, shading: "D97706", borderColor: "B45309" }),
                    createCell(createRtlPara("3. الممارسة المستقلة (Pratique Autonome)\n[أنت تفعل - Tu fais]", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 16 }), { width: { size: 23, type: WidthType.PERCENTAGE }, shading: "047857", borderColor: "065F46" }),
                  ],
                }),

                // Content Row for the 4 Columns
                new TableRow({
                  children: [
                    // Col 1 (Right): Step Info & Document
                    createCell([
                      createRtlPara(`المقطع ${stepIdx + 1}:`, { bold: true, size: 16, color: "4F46E5" }),
                      createRtlPara(step.title, { bold: true, size: 15, color: "0F172A" }),
                      createRtlPara(`المهارة: ${step.targetSkill}`, { size: 13, color: "475569", spacing: { before: 40, after: 20 } }),
                      createRtlPara(`الدعامة: ${step.document.title}`, { bold: true, size: 13, color: "1E293B" }),
                      createRtlPara(`النوع: ${step.document.type}`, { size: 12, color: "64748B" }),
                      createRtlPara(`المرجع: ${step.document.reference}`, { size: 12, color: "64748B" }),
                    ], { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "F8FAFC", borderColor: "CBD5E1" }),

                    // Col 2: Modelage (أنا أفعل)
                    createCell([
                      createRtlPara("• التفكير بصوت مسموع (Verbalisation):", { bold: true, size: 14, color: "1E40AF" }),
                      createRtlPara(`"${step.modelage.teacherSpeech}"`, { size: 15, color: "1E293B" }),
                      createRtlPara("• خطوات النمذجة التوضيحية:", { bold: true, size: 14, color: "1E3A8A", spacing: { before: 40, after: 20 } }),
                      ...step.modelage.demonstrationSteps.map(s => createRtlPara(`   - ${s}`, { size: 14, color: "334155" })),
                      createRtlPara("• النموذج المحلول والمكتمل:", { bold: true, size: 14, color: "047857", spacing: { before: 40, after: 20 } }),
                      createRtlPara(step.modelage.workedExample, { size: 14, color: "064E3B", bold: true }),
                    ], { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "EFF6FF", borderColor: "BFDBFE" }),

                    // Col 3: Guided Practice (نحن نفعل)
                    createCell([
                      createRtlPara("• المهمة الموجهة:", { bold: true, size: 14, color: "92400E" }),
                      createRtlPara(step.guidedPractice.studentTask, { size: 15, color: "1E293B", bold: true }),
                      createRtlPara(`صيغة العمل: ${step.guidedPractice.collaborationType}`, { size: 13, color: "78350F" }),
                      createRtlPara("• أسئلة التحقق السريع من الفهم (CFU):", { bold: true, size: 14, color: "92400E", spacing: { before: 40, after: 20 } }),
                      ...step.guidedPractice.checkpoints.map(cp => createRtlPara(`   ؟ ${cp}`, { size: 14, color: "334155" })),
                      createRtlPara(`• بروتوكول التغذية الراجعة: ${step.guidedPractice.feedbackProtocol}`, { size: 13, color: "475569", spacing: { before: 40, after: 0 } }),
                    ], { width: { size: 27, type: WidthType.PERCENTAGE }, shading: "FEFCE8", borderColor: "FEF08A" }),

                    // Col 4 (Left): Independent Practice (أنت تفعل)
                    createCell([
                      createRtlPara("• النشاط الفردي بالكراسة:", { bold: true, size: 14, color: "065F46" }),
                      createRtlPara(step.independentPractice.taskDescription, { size: 14, color: "1E293B", bold: true }),
                      createRtlPara(`المدة: ${step.independentPractice.timeAllocation}`, { size: 13, color: "047857" }),
                      createRtlPara("• معيار النجاح والتثبيت:", { bold: true, size: 14, color: "065F46", spacing: { before: 40, after: 20 } }),
                      createRtlPara(step.independentPractice.successCriteria, { size: 13, color: "064E3B" }),
                    ], { width: { size: 23, type: WidthType.PERCENTAGE }, shading: "ECFDF5", borderColor: "A7F3D0" }),
                  ],
                }),

                // Sub-Row: Synthesis & Notebook Writing (التركيب والأثر الكتابي)
                new TableRow({
                  children: [
                    createCell(createRtlPara("التركيب والأثر الكتابي\n(Trace écrite)", { bold: true, size: 15, alignment: AlignmentType.CENTER, color: "312E81" }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "F5F3FF", borderColor: "DDD6FE" }),
                    createCell([
                      createRtlPara(`• الخلاصة المدونة في الدفتر: ${step.synthesis.keyTakeaway}`, { size: 15, bold: true, color: "0F172A" }),
                      createRtlPara(`• المفاهيم والمصطلحات المهيكلة: ${step.synthesis.coreConcepts.join(" | ")}`, { size: 14, color: "4338CA", bold: true }),
                    ], { columnSpan: 3, width: { size: 80, type: WidthType.PERCENTAGE }, shading: "F5F3FF", borderColor: "DDD6FE" }),
                  ],
                }),
              ],
            }),
            createRtlPara("", { spacing: { before: 60 } })
          ]),

          createRtlPara("", { spacing: { before: 40 } }),

          // 5. Closure & Remediation Table (RTL Order: Right 50% -> Left 50%)
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  // Right Cell: Bilan & Exit Ticket (الإغلاق وتذكرة الخروج)
                  createCell([
                    createRtlPara(`الإغلاق والتقويم التكويني الختامي (Bilan & Clôture - ${jadha.closure.duration || "5 دقائق"})`, { bold: true, color: "1E40AF", size: 17 }),
                    createRtlPara(`• تذكرة الخروج (Exit Ticket): "${jadha.closure.bilanQuestion}"`, { size: 16, bold: true, color: "0F172A" }),
                    createRtlPara(`• تقنية التحقق السريع: ${jadha.closure.exitTicketTechnique}`, { size: 14, color: "475569" }),
                    createRtlPara(`• عتبة التمكن والتحكم: ${jadha.closure.successThreshold}`, { size: 15, color: "166534", bold: true }),
                  ], { width: { size: 50, type: WidthType.PERCENTAGE }, shading: "F8FAFC", borderColor: "CBD5E1" }),

                  // Left Cell: Remediation Hints (معالجة التعثرات الفورية)
                  createCell([
                    createRtlPara("معالجة التعثرات والتمثلات الشائعة (Remédiation)", { bold: true, color: "991B1B", size: 17 }),
                    ...jadha.remediationHints.commonMisconceptions.map(cm => createRtlPara(`• تمثل خاطئ شائع: ${cm}`, { size: 14, color: "991B1B" })),
                    createRtlPara(`• التدخل العلاجي الفوري: ${jadha.remediationHints.immediateFix}`, { size: 15, color: "1E293B", bold: true, spacing: { before: 40, after: 0 } }),
                  ], { width: { size: 50, type: WidthType.PERCENTAGE }, shading: "FEF2F2", borderColor: "FECACA" }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `جذاذة_الريادة_${(jadha.title || "الدرس").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Failed to export Rayada Jadha Word:", error);
    throw error;
  }
};

/**
 * تصدير فرض كتابي محروس معياري لمؤسسات الريادة بصيغة Word من اليمين إلى اليسار
 */
export const downloadRayadaExamWord = async (exam: RayadaExamData) => {
  if (!exam) return;

  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 500, right: 500, bottom: 500, left: 500 },
          },
        },
        children: [
          // Header Table (3 columns - RTL)
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell([
                    createRtlPara("المملكة المغربية", { bold: true, size: 16, alignment: AlignmentType.CENTER }),
                    createRtlPara("وزارة التربية الوطنية والتعليم الأولي والرياضة", { size: 13, alignment: AlignmentType.CENTER }),
                    createRtlPara("مشروع إعداديات الريادة 🌟", { bold: true, size: 17, color: "D97706", alignment: AlignmentType.CENTER }),
                  ], { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
                  createCell([
                    createRtlPara(exam.title || "الفرض الكتابي المحروس - إعداديات الريادة", { bold: true, size: 20, color: "4F46E5", alignment: AlignmentType.CENTER }),
                    createRtlPara(`مادة الاجتماعيات - ${exam.level}`, { bold: true, size: 18, color: "0F172A", alignment: AlignmentType.CENTER }),
                    createRtlPara(`الدورة: ${exam.term} | المدة: ${exam.duration || "ساعة واحدة"}`, { size: 14, alignment: AlignmentType.CENTER }),
                  ], { width: { size: 40, type: WidthType.PERCENTAGE }, shading: "EEF2FF" }),
                  createCell([
                    createRtlPara(`الاسم والنسب: .......................................`, { size: 15, alignment: AlignmentType.RIGHT }),
                    createRtlPara(`القسم: ................... الرقم: ....................`, { size: 15, alignment: AlignmentType.RIGHT }),
                    createRtlPara(`النقطة: ............. / 20`, { bold: true, size: 19, color: "DC2626", alignment: AlignmentType.CENTER }),
                  ], { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 100 } }),

          // Situation 1
          createRtlPara(exam.situation1.title, { bold: true, size: 21, color: "1E40AF", spacing: { before: 80, after: 50 } }),
          ...exam.situation1.tasks.map((task, idx) => {
            const paragraphs = [
              createRtlPara(`س ${idx + 1} (${task.points} ن): ${task.question}`, { bold: true, size: 17 }),
            ];
            if (task.options && task.options.length > 0) {
              task.options.forEach(opt => paragraphs.push(createRtlPara(`   - ${opt}: ..........................................................................................`, { size: 15 })));
            }
            return paragraphs;
          }).flat(),

          createRtlPara("", { spacing: { before: 80 } }),

          // Situation 2
          createRtlPara(exam.situation2.title, { bold: true, size: 21, color: "1E40AF", spacing: { before: 80, after: 50 } }),
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell([
                    createRtlPara(exam.situation2.document.title, { bold: true, size: 17, color: "1E293B", alignment: AlignmentType.CENTER }),
                    createRtlPara(exam.situation2.document.content, { size: 16, spacing: { before: 50, after: 50 } }),
                    createRtlPara(`المصدر: ${exam.situation2.document.source}`, { size: 13, color: "64748B", alignment: AlignmentType.LEFT }),
                  ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
                ],
              }),
            ],
          }),
          createRtlPara("", { spacing: { before: 50 } }),
          ...exam.situation2.questions.map(q => [
            createRtlPara(`س ${q.questionNumber} (${q.points} ن) [${q.skillTarget}]: ${q.questionText}`, { bold: true, size: 17 }),
            createRtlPara("........................................................................................................................................................................", { size: 15, color: "94A3B8" }),
          ]).flat(),

          createRtlPara("", { spacing: { before: 80 } }),

          // Situation 3
          createRtlPara(exam.situation3.title, { bold: true, size: 21, color: "1E40AF", spacing: { before: 80, after: 50 } }),
          createRtlPara(exam.situation3.contextText, { size: 17, spacing: { before: 30, after: 50 } }),
          createRtlPara("المطلوب تحريره بدقة:", { bold: true, size: 17, color: "0F172A" }),
          ...exam.situation3.guidelines.map(g => createRtlPara(`• ${g}`, { size: 15 })),
          createRtlPara(exam.situation3.formatRequirement, { size: 15, color: "475569", bold: true, spacing: { before: 40, after: 60 } }),

          createRtlPara("==========================================================================", { alignment: AlignmentType.CENTER, color: "CBD5E1", spacing: { before: 120, after: 120 } }),

          // ANSWER KEY & RUBRIC SECTION
          createRtlPara("عناصر الإجابة وشبكة التنقيط المعيارية (خاصة بالأستاذ)", { bold: true, size: 24, color: "4F46E5", alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } }),
          
          // Situation 1 Answers
          createRtlPara("عناصر إجابة الوضعية الأولى (6 نقط):", { bold: true, size: 19, color: "1E40AF" }),
          ...exam.answerKey.situation1Answers.map(ans => createRtlPara(`• ${ans.question} (${ans.points}ن): ${ans.answer}`, { size: 15 })),

          // Situation 2 Answers
          createRtlPara("عناصر إجابة الوضعية الثانية (7 نقط):", { bold: true, size: 19, color: "1E40AF", spacing: { before: 60, after: 30 } }),
          ...exam.answerKey.situation2Answers.map(ans => createRtlPara(`• س ${ans.questionNumber} (${ans.points}ن): ${ans.answer}`, { size: 15 })),

          // Situation 3 Answer Guide
          createRtlPara("دليل تصحيح الوضعية الثالثة (7 نقط):", { bold: true, size: 19, color: "1E40AF", spacing: { before: 60, after: 30 } }),
          createRtlPara(`• الجانب المنهجي والشكلي (${exam.answerKey.situation3AnswerGuide.methodologicalPoints}ن): ${exam.answerKey.situation3AnswerGuide.methodologicalNotes}`, { size: 15 }),
          createRtlPara("• المضامين المعرفية:", { bold: true, size: 15 }),
          ...exam.answerKey.situation3AnswerGuide.knowledgeContent.map(kc => createRtlPara(`   - ${kc}`, { size: 15 })),

          createRtlPara("", { spacing: { before: 80 } }),

          // Criterion Rubric Table (RTL Order)
          createRtlPara("شبكة التنقيط المعيارية (Grille d'évaluation critériée):", { bold: true, size: 19, color: "4F46E5", spacing: { before: 60, after: 30 } }),
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell(createRtlPara("المعيار والمهارة", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "4F46E5" }),
                  createCell(createRtlPara("متحكم (Acquis)", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "15803D" }),
                  createCell(createRtlPara("في طور التحكم", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "CA8A04" }),
                  createCell(createRtlPara("غير متحكم", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "DC2626" }),
                ],
              }),
              ...exam.rubric.map(row => new TableRow({
                children: [
                  createCell([
                    createRtlPara(row.criterion, { bold: true, size: 15 }),
                    createRtlPara(row.subSkill, { size: 13, color: "475569" }),
                    createRtlPara(`الحد الأقصى: ${row.maxPoints} نقط`, { size: 13, color: "4F46E5", bold: true }),
                  ], { width: { size: 30, type: WidthType.PERCENTAGE } }),
                  createCell(createRtlPara(row.masteryIndicators.acquired, { size: 13 }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "F0FDF4" }),
                  createCell(createRtlPara(row.masteryIndicators.inProgress, { size: 13 }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "FEFCE8" }),
                  createCell(createRtlPara(row.masteryIndicators.notAcquired, { size: 13 }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "FEF2F2" }),
                ],
              })),
            ],
          }),

          createRtlPara("", { spacing: { before: 80 } }),

          // Remediation Plan Table (RTL Order)
          createRtlPara("خطة المعالجة والدعم البعدي للتعثرات (Plan de Remédiation):", { bold: true, size: 19, color: "1E40AF", spacing: { before: 60, after: 30 } }),
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell(createRtlPara("موطن الصعوبة", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "1E293B" }),
                  createCell(createRtlPara("مظهر النقص المرصود", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "1E293B" }),
                  createCell(createRtlPara("النشاط العلاجي المقترح", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 40, type: WidthType.PERCENTAGE }, shading: "1E293B" }),
                ],
              }),
              ...exam.remediationPlan.map(plan => new TableRow({
                children: [
                  createCell([
                    createRtlPara(plan.difficultyArea, { bold: true, size: 15 }),
                    createRtlPara(`صيغة: ${plan.activityFormat}`, { size: 13, color: "4F46E5" }),
                  ], { width: { size: 25, type: WidthType.PERCENTAGE } }),
                  createCell(createRtlPara(plan.observedDeficit, { size: 13 }), { width: { size: 35, type: WidthType.PERCENTAGE } }),
                  createCell(createRtlPara(plan.remedialActivity, { size: 13, bold: true, color: "047857" }), { width: { size: 40, type: WidthType.PERCENTAGE }, shading: "F0FDF4" }),
                ],
              })),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `فرض_الريادة_${(exam.title || "الفرض").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Failed to export Rayada Exam Word:", error);
    throw error;
  }
};

/**
 * تصدير رائز TaRL والموضعة التشخيصية لمؤسسات الريادة بصيغة Word من اليمين إلى اليسار
 */
export const downloadRayadaTarlWord = async (tarl: RayadaTarlTest) => {
  if (!tarl) return;

  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 500, right: 500, bottom: 500, left: 500 },
          },
        },
        children: [
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell([
                    createRtlPara("رائز الموضعة والتشخيص (TaRL مادة الاجتماعيات)", { bold: true, size: 20, color: "4F46E5", alignment: AlignmentType.CENTER }),
                    createRtlPara(`المستوى: ${tarl.level} | المكون: ${tarl.subject}`, { bold: true, size: 17, color: "0F172A", alignment: AlignmentType.CENTER }),
                    createRtlPara(`المجال: ${tarl.domain}`, { size: 15, color: "64748B", alignment: AlignmentType.CENTER }),
                  ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "EEF2FF" }),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 80 } }),

          createRtlPara("المستويات التشخيصية المتدرجة:", { bold: true, size: 20, color: "1E40AF" }),
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell(createRtlPara("المستوى", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "4F46E5" }),
                  createCell(createRtlPara("السؤال / النشاط التشخيصي", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 50, type: WidthType.PERCENTAGE }, shading: "4F46E5" }),
                  createCell(createRtlPara("معيار المرور والتمكن", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "4F46E5" }),
                ],
              }),
              ...tarl.diagnosticLevels.map(lvl => new TableRow({
                children: [
                  createCell(createRtlPara(lvl.levelName, { bold: true, size: 15, alignment: AlignmentType.CENTER }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
                  createCell([
                    createRtlPara(lvl.testItem, { bold: true, size: 15 }),
                    createRtlPara(`التعليمة: ${lvl.instruction}`, { size: 13, color: "475569" }),
                  ], { width: { size: 50, type: WidthType.PERCENTAGE } }),
                  createCell(createRtlPara(lvl.passCriteria, { size: 13, color: "166534", bold: true }), { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "F0FDF4" }),
                ],
              })),
            ],
          }),

          createRtlPara("", { spacing: { before: 100 } }),

          createRtlPara("شبكة تفيؤ المتعلمين وخطط الدعم الموجهة (Grille de positionnement):", { bold: true, size: 20, color: "1E40AF" }),
          new Table({
            visuallyRightToLeft: true,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  createCell(createRtlPara("الفئة المستهدفة", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "1E293B" }),
                  createCell(createRtlPara("الحاجة البيداغوجية المرصودة", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "1E293B" }),
                  createCell(createRtlPara("التدخل العلاجي المستهدف", { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "1E293B" }),
                ],
              }),
              ...tarl.levelingGrid.map(g => new TableRow({
                children: [
                  createCell(createRtlPara(g.studentProfile, { bold: true, size: 15 }), { width: { size: 30, type: WidthType.PERCENTAGE } }),
                  createCell(createRtlPara(g.identifiedNeed, { size: 13 }), { width: { size: 35, type: WidthType.PERCENTAGE } }),
                  createCell(createRtlPara(g.targetedIntervention, { size: 13, bold: true, color: "047857" }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "F0FDF4" }),
                ],
              })),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `رائز_TaRL_الريادة_${tarl.level}_${tarl.subject}.docx`);
  } catch (error) {
    console.error("Failed to export Rayada TaRL Word:", error);
    throw error;
  }
};
