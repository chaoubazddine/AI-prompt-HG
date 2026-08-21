import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { DiagnosticDossier } from '../types/diagnostic';

/**
 * Helper to create RTL Arabic Paragraphs
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
 * Helper to create clean RTL Table Cells
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
    margins: options.margins || { top: 120, bottom: 120, left: 140, right: 140 },
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
    },
    children: children,
  });
};

/**
 * Creates the Official Ministerial Header (RTL 3-Column)
 */
const createDiagnosticHeaderTable = (dossier: DiagnosticDossier, subTitle: string) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    // @ts-ignore
    visuallyRightToLeft: true,
    rows: [
      new TableRow({
        children: [
          // Column 1 (Right): Ministry & Project
          createCell([
            createRtlPara("المملكة المغربية", { size: 18, bold: true, alignment: AlignmentType.CENTER }),
            createRtlPara("وزارة التربية الوطنية والتعليم الأولي والرياضة", { size: 16, alignment: AlignmentType.CENTER }),
            createRtlPara(`الأكاديمية: ${dossier.institutionInfo.academy}`, { size: 14, alignment: AlignmentType.CENTER }),
            createRtlPara(`المديرية: ${dossier.institutionInfo.directorate}`, { size: 14, alignment: AlignmentType.CENTER }),
            createRtlPara(`المؤسسة: ${dossier.institutionInfo.school || "...................."}`, { size: 14, alignment: AlignmentType.CENTER }),
          ], { width: { size: 33, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),

          // Column 2 (Center): Main Title Box
          createCell([
            createRtlPara(subTitle, { size: 24, bold: true, alignment: AlignmentType.CENTER, color: "0F172A" }),
            createRtlPara("مادة الاجتماعيات (التاريخ - الجغرافيا - التربية على المواطنة)", { size: 16, bold: true, alignment: AlignmentType.CENTER, color: "4338CA" }),
            createRtlPara(`المستوى المستهدف: ${dossier.level} (${dossier.cycle === 'prep' ? 'السلك الإعدادي' : 'السلك التأهيلي'})`, { size: 15, bold: true, alignment: AlignmentType.CENTER }),
            dossier.prerequisiteLevel ? createRtlPara(`المكتسبات القبلية المفحوصة: مكتسبات ${dossier.prerequisiteLevel}`, { size: 14, bold: true, alignment: AlignmentType.CENTER, color: "047857" }) : createRtlPara("", { size: 1 })
          ], { width: { size: 40, type: WidthType.PERCENTAGE }, shading: "EEF2FF" }),

          // Column 3 (Left): Year & Teacher Details
          createCell([
            createRtlPara(`الموسم الدراسي: ${dossier.institutionInfo.academicYear}`, { size: 15, bold: true, alignment: AlignmentType.CENTER }),
            createRtlPara(`الأستاذ(ة): ${dossier.institutionInfo.teacherName || "...................."}`, { size: 15, alignment: AlignmentType.CENTER }),
            createRtlPara(`الفوج / القسم: ${dossier.institutionInfo.classGroup || "جميع الأقسام"}`, { size: 15, alignment: AlignmentType.CENTER }),
            createRtlPara(`المدة: ${dossier.test.duration}`, { size: 14, alignment: AlignmentType.CENTER }),
            createRtlPara("المقرر الوزاري المنظم للسنة الدراسية", { size: 13, color: "64748B", alignment: AlignmentType.CENTER }),
          ], { width: { size: 27, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
        ]
      })
    ]
  });
};

/**
 * 1. Export Diagnostic Test Sheet & Answer Key to Word (.docx)
 */
export const downloadDiagnosticTestDocx = async (dossier: DiagnosticDossier) => {
  const children: (Paragraph | Table)[] = [
    createDiagnosticHeaderTable(dossier, "رائز التقويم التشخيصي"),
    createRtlPara("", { spacing: { before: 100, after: 100 } }),

    // Instructions Box
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara("توجيهات وإرشادات هامة للمتعلم(ة):", { bold: true, size: 18, color: "1E3A8A" }),
              ...dossier.test.instructions.map((inst, i) => createRtlPara(`• ${inst}`, { size: 16, color: "334155" }))
            ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "F1F5F9" })
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Student Info Blank
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell(createRtlPara("اسم ونسب المتعلم(ة): ................................................................", { size: 16, bold: true }), { width: { size: 50, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara("الرقم الترتيبي: .........  |  القسم: .....................", { size: 16, bold: true }), { width: { size: 30, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara("النقطة المحصلة: ......... / 20", { size: 16, bold: true, color: "DC2626", alignment: AlignmentType.CENTER }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "FEF2F2" }),
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 140, after: 140 } }),
  ];

  // Questions
  dossier.test.questions.forEach((q, idx) => {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        // @ts-ignore
        visuallyRightToLeft: true,
        rows: [
          // Question Header
          new TableRow({
            children: [
              createCell([
                createRtlPara(`السؤال رقم ${q.number}: [${q.component} - ${q.domain}]`, { bold: true, size: 18, color: "1E293B" }),
                createRtlPara(`الكفاية/المهارة المشخصة: ${q.prerequisiteSkill}`, { size: 14, color: "64748B" })
              ], { width: { size: 85, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
              createCell(createRtlPara(`(${q.maxScore} نقط)`, { bold: true, size: 18, color: "4338CA", alignment: AlignmentType.CENTER }), { width: { size: 15, type: WidthType.PERCENTAGE }, shading: "EEF2FF" })
            ]
          }),
          // Document Support if exists
          ...(q.documentSupport ? [
            new TableRow({
              children: [
                createCell([
                  createRtlPara(`دعامة مساعدة: ${q.documentSupport.title} (${q.documentSupport.type})`, { bold: true, size: 15, color: "047857" }),
                  createRtlPara(q.documentSupport.content, { size: 15, color: "1E293B" }),
                  ...(q.documentSupport.source ? [createRtlPara(`المصدر: ${q.documentSupport.source}`, { size: 13, color: "64748B" })] : [])
                ], { width: { size: 100, type: WidthType.PERCENTAGE }, columnSpan: 2, shading: "F0FDF4" })
              ]
            })
          ] : []),
          // Question Body
          new TableRow({
            children: [
              createCell([
                createRtlPara(q.questionText, { size: 17, bold: true }),
                ...(q.options ? q.options.map(opt => createRtlPara(`  ${opt}`, { size: 16 })) : []),
                createRtlPara("الإجابة:", { size: 15, bold: true, color: "475569", spacing: { before: 80 } }),
                createRtlPara("...........................................................................................................................................................", { size: 14, color: "94A3B8" }),
                createRtlPara("...........................................................................................................................................................", { size: 14, color: "94A3B8" })
              ], { width: { size: 100, type: WidthType.PERCENTAGE }, columnSpan: 2 })
            ]
          })
        ]
      }),
      createRtlPara("", { spacing: { before: 80, after: 80 } })
    );
  });

  // Add Answer Key Section
  children.push(
    createRtlPara("", { spacing: { before: 200, after: 100 } }),
    createRtlPara("──────────────────────────────────────────", { alignment: AlignmentType.CENTER, color: "CBD5E1" }),
    createRtlPara("عناصر الإجابة النموذجية وسلم التنقيط الرسمي (خاص بالأستاذ)", { size: 22, bold: true, color: "4338CA", alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell(createRtlPara("رقم السؤال والمكون", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("عناصر الإجابة النموذجية المعتمدة", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 60, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("سلم التنقيط", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 15, type: WidthType.PERCENTAGE }, shading: "E2E8F0" })
          ]
        }),
        ...dossier.test.questions.map(q => new TableRow({
          children: [
            createCell([
              createRtlPara(`سؤال ${q.number}`, { bold: true, alignment: AlignmentType.CENTER }),
              createRtlPara(q.component, { size: 14, color: "64748B", alignment: AlignmentType.CENTER })
            ], { width: { size: 25, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(q.expectedAnswer, { size: 15 }), { width: { size: 60, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(`${q.maxScore} ن`, { bold: true, alignment: AlignmentType.CENTER, color: "4338CA" }), { width: { size: 15, type: WidthType.PERCENTAGE } })
          ]
        }))
      ]
    })
  );

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `رائز_التقويم_التشخيصي_${dossier.level.replace(/\s+/g, '_')}.docx`);
};

/**
 * 2. Export Diagnostic Report & Scoring/Positioning Grid to Word (.docx)
 */
export const downloadDiagnosticReportDocx = async (dossier: DiagnosticDossier) => {
  const report = dossier.report;

  const children: (Paragraph | Table)[] = [
    createDiagnosticHeaderTable(dossier, "تقرير التقويم التشخيصي واستثمار النتائج"),
    createRtlPara("", { spacing: { before: 100, after: 100 } }),

    // Context
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara("1. الإطار المرجعي والسياق العام:", { bold: true, size: 18, color: "1E3A8A" }),
              createRtlPara(report.generalContext, { size: 15, color: "334155" })
            ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "F8FAFC" })
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 100, after: 100 } }),

    // General Stats Summary
    createRtlPara("2. المعطيات الإحصائية الإجمالية:", { bold: true, size: 18, color: "0F172A" }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell(createRtlPara("عدد المسجلين", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 16, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("عدد المفحوصين", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 16, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("عدد الغائبين", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 16, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("معدل القسم", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 18, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("أعلى نقطة", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 17, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("نسبة النجاح (>=10)", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 17, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
          ]
        }),
        new TableRow({
          children: [
            createCell(createRtlPara(`${report.institutionInfo.totalEnrolled}`, { size: 16, alignment: AlignmentType.CENTER }), { width: { size: 16, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(`${report.institutionInfo.totalTested}`, { size: 16, alignment: AlignmentType.CENTER, bold: true }), { width: { size: 16, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(`${report.institutionInfo.absentCount}`, { size: 16, alignment: AlignmentType.CENTER }), { width: { size: 16, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(`${report.overallStats.averageScore} / 20`, { size: 16, alignment: AlignmentType.CENTER, bold: true, color: "4338CA" }), { width: { size: 18, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(`${report.overallStats.highestScore} / 20`, { size: 16, alignment: AlignmentType.CENTER, color: "047857" }), { width: { size: 17, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(`${report.overallStats.successRate}%`, { size: 16, alignment: AlignmentType.CENTER, bold: true, color: "047857" }), { width: { size: 17, type: WidthType.PERCENTAGE }, shading: "F0FDF4" }),
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Level Categories
    createRtlPara("3. مصفوفة تفيؤ المتعلمين حسب عتبات التحكم الرسمية:", { bold: true, size: 18, color: "0F172A" }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell(createRtlPara("الفئة والمعدل", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("العدد والنسبة", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("التشخيص والخصائص البيداغوجية", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 55, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
          ]
        }),
        ...report.categoriesStats.map(cat => new TableRow({
          children: [
            createCell([
              createRtlPara(cat.category, { bold: true, size: 17, color: cat.category === 'متحكم' ? '047857' : cat.category === 'في طور التحكم' ? 'D97706' : 'DC2626', alignment: AlignmentType.CENTER }),
              createRtlPara(`عتبة النقط: ${cat.minThreshold}`, { size: 14, color: "64748B", alignment: AlignmentType.CENTER })
            ], { width: { size: 25, type: WidthType.PERCENTAGE } }),
            createCell([
              createRtlPara(`${cat.studentCount} تلميذ(ة)`, { bold: true, alignment: AlignmentType.CENTER }),
              createRtlPara(`(${cat.percentage}%)`, { size: 14, color: "4338CA", alignment: AlignmentType.CENTER })
            ], { width: { size: 20, type: WidthType.PERCENTAGE } }),
            createCell([
              createRtlPara(cat.description, { size: 15, bold: true }),
              ...cat.characteristics.map(ch => createRtlPara(`- ${ch}`, { size: 14, color: "475569" }))
            ], { width: { size: 55, type: WidthType.PERCENTAGE } })
          ]
        }))
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Qualitative Analysis
    createRtlPara("4. القراءة النوعية والتحليل البيداغوجي للتعثرات:", { bold: true, size: 18, color: "0F172A" }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara("مكون التاريخ والنهج التاريخي:", { bold: true, size: 16, color: "1E293B" }),
              ...report.qualitativeAnalysis.historicalThinkingDeficits.map(d => createRtlPara(`• ${d}`, { size: 14, color: "334155" }))
            ], { width: { size: 50, type: WidthType.PERCENTAGE } }),
            createCell([
              createRtlPara("مكون الجغرافيا والنهج الجغرافي:", { bold: true, size: 16, color: "1E293B" }),
              ...report.qualitativeAnalysis.geographicalThinkingDeficits.map(d => createRtlPara(`• ${d}`, { size: 14, color: "334155" }))
            ], { width: { size: 50, type: WidthType.PERCENTAGE } }),
          ]
        }),
        new TableRow({
          children: [
            createCell([
              createRtlPara("التربية على المواطنة والوعي الحقوقي:", { bold: true, size: 16, color: "1E293B" }),
              ...report.qualitativeAnalysis.citizenshipDeficits.map(d => createRtlPara(`• ${d}`, { size: 14, color: "334155" }))
            ], { width: { size: 50, type: WidthType.PERCENTAGE } }),
            createCell([
              createRtlPara("الجانب المنهجي والتعبير المقالي:", { bold: true, size: 16, color: "1E293B" }),
              ...report.qualitativeAnalysis.methodologicalDeficits.map(d => createRtlPara(`• ${d}`, { size: 14, color: "334155" }))
            ], { width: { size: 50, type: WidthType.PERCENTAGE } }),
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Conclusions & Recommendations
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara("5. الاستنتاجات والتوصيات التربوية:", { bold: true, size: 17, color: "1E3A8A" }),
              createRtlPara("الاستنتاجات:", { bold: true, size: 15, color: "0F172A" }),
              ...report.generalConclusions.map(c => createRtlPara(`• ${c}`, { size: 14 })),
              createRtlPara("التوصيات العملية:", { bold: true, size: 15, color: "0F172A", spacing: { before: 60 } }),
              ...report.administrativeRecommendations.map(r => createRtlPara(`• ${r}`, { size: 14 }))
            ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "F8FAFC" })
          ]
        })
      ]
    })
  ];

  // If sample scoring grid exists, attach it as Appendix
  if (dossier.sampleScoringGrid?.sampleStudents?.length) {
    children.push(
      createRtlPara("", { spacing: { before: 180, after: 100 } }),
      createRtlPara("ملحق: شبكة تفريغ نقط المتعلمين وتصنيفهم:", { bold: true, size: 18, color: "4338CA" }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        // @ts-ignore
        visuallyRightToLeft: true,
        rows: [
          new TableRow({
            children: [
              createCell(createRtlPara("الرقم", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 10, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
              createCell(createRtlPara("اسم المتعلم(ة)", { bold: true }), { width: { size: 40, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
              createCell(createRtlPara("الجنس", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 15, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
              createCell(createRtlPara("النقطة / 20", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 15, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
              createCell(createRtlPara("التصنيف", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            ]
          }),
          ...dossier.sampleScoringGrid.sampleStudents.map(s => new TableRow({
            children: [
              createCell(createRtlPara(`${s.studentNumber}`, { alignment: AlignmentType.CENTER }), { width: { size: 10, type: WidthType.PERCENTAGE } }),
              createCell(createRtlPara(s.studentName, { bold: true }), { width: { size: 40, type: WidthType.PERCENTAGE } }),
              createCell(createRtlPara(s.gender, { alignment: AlignmentType.CENTER }), { width: { size: 15, type: WidthType.PERCENTAGE } }),
              createCell(createRtlPara(`${s.totalScore}`, { bold: true, alignment: AlignmentType.CENTER, color: s.totalScore >= 10 ? '047857' : 'DC2626' }), { width: { size: 15, type: WidthType.PERCENTAGE } }),
              createCell(createRtlPara(s.levelCategory, { bold: true, alignment: AlignmentType.CENTER, color: s.levelCategory === 'متحكم' ? '047857' : s.levelCategory === 'في طور التحكم' ? 'D97706' : 'DC2626' }), { width: { size: 20, type: WidthType.PERCENTAGE } }),
            ]
          }))
        ]
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `تقرير_التقويم_التشخيصي_${dossier.level.replace(/\s+/g, '_')}.docx`);
};

/**
 * 3. Export Remediation Plan to Word (.docx)
 */
export const downloadRemediationPlanDocx = async (dossier: DiagnosticDossier) => {
  const plan = dossier.remediationPlan;

  const children: (Paragraph | Table)[] = [
    createDiagnosticHeaderTable(dossier, "خطة الدعم والاستدراك البيداغوجي"),
    createRtlPara("", { spacing: { before: 100, after: 100 } }),

    // Meta Box
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara(`المجال الزمني للتنفيذ: ${plan.timeframe}`, { bold: true, size: 16, color: "1E293B" }),
              createRtlPara(`آلية التتبع والمواكبة: ${plan.monitoringMechanism}`, { size: 15, color: "475569" }),
              createRtlPara(`تاريخ التقويم البعدي للتحقق: ${plan.finalEvaluationDate}`, { size: 15, color: "4338CA", bold: true })
            ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "F8FAFC" })
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Strategic Axes
    createRtlPara("المحاور الاستراتيجية الكبرى لخطة الدعم:", { bold: true, size: 18, color: "0F172A" }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell(createRtlPara("المحور الاستراتيجي", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("الهدف البيداغوجي الإجرائي", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 35, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("الأنشطة ذات الأولوية", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
          ]
        }),
        ...plan.strategicAxes.map(axis => new TableRow({
          children: [
            createCell(createRtlPara(axis.axisName, { bold: true, size: 15 }), { width: { size: 35, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(axis.objective, { size: 14 }), { width: { size: 35, type: WidthType.PERCENTAGE } }),
            createCell(axis.priorityActivities.map(act => createRtlPara(`• ${act}`, { size: 13, color: "334155" })), { width: { size: 30, type: WidthType.PERCENTAGE } }),
          ]
        }))
      ]
    }),
    createRtlPara("", { spacing: { before: 140, after: 140 } }),

    // Detailed Activities
    createRtlPara("بطاقات الأنشطة العلاجية والتطبيقية المبرمجة:", { bold: true, size: 18, color: "0F172A" }),
  ];

  plan.activities.forEach(act => {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        // @ts-ignore
        visuallyRightToLeft: true,
        rows: [
          // Activity Header
          new TableRow({
            children: [
              createCell([
                createRtlPara(act.title, { bold: true, size: 17, color: "1E293B" }),
                createRtlPara(`المجال: ${act.targetedDomain}  |  الفئة المستهدفة: ${act.targetCategory}  |  الصيغة: ${act.modality}`, { size: 14, color: "4338CA" })
              ], { width: { size: 80, type: WidthType.PERCENTAGE }, shading: "EEF2FF" }),
              createCell(createRtlPara(`المدة: ${act.duration}`, { bold: true, alignment: AlignmentType.CENTER, size: 15 }), { width: { size: 20, type: WidthType.PERCENTAGE }, shading: "EEF2FF" })
            ]
          }),
          // Objective & Difficulty
          new TableRow({
            children: [
              createCell([
                createRtlPara(`التعثر المرصود: ${act.detectedDifficulty}`, { size: 14, color: "DC2626", bold: true }),
                createRtlPara(`الهدف العلاجي: ${act.pedagogicalObjective}`, { size: 14, color: "047857", bold: true }),
                createRtlPara(`الدعامات المعتمدة: ${act.didacticTools.join("، ")}`, { size: 13, color: "64748B" })
              ], { width: { size: 100, type: WidthType.PERCENTAGE }, columnSpan: 2 })
            ]
          }),
          // Procedure Steps
          new TableRow({
            children: [
              createCell([
                createRtlPara("خطوات التدبير الديداكتيكي للنشاط العلاجي:", { bold: true, size: 15, color: "1E293B" }),
                ...act.procedureSteps.map(step => [
                  createRtlPara(`◄ ${step.stepTitle}`, { bold: true, size: 14, color: "4338CA" }),
                  createRtlPara(`  - دور الأستاذ: ${step.teacherGuidance}`, { size: 13, color: "334155" }),
                  createRtlPara(`  - دور المتعلم: ${step.studentActions}`, { size: 13, color: "334155" })
                ]).flat()
              ], { width: { size: 100, type: WidthType.PERCENTAGE }, columnSpan: 2 })
            ]
          }),
          // Verification Indicator
          new TableRow({
            children: [
              createCell(createRtlPara(`مؤشر التحقق والنجاح البعدي: ${act.evaluationIndicator}`, { bold: true, size: 14, color: "047857" }), { width: { size: 100, type: WidthType.PERCENTAGE }, columnSpan: 2, shading: "F0FDF4" })
            ]
          })
        ]
      }),
      createRtlPara("", { spacing: { before: 80, after: 80 } })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `خطة_الدعم_والمعالجة_${dossier.level.replace(/\s+/g, '_')}.docx`);
};

/**
 * 4. Export Support Jadha to Word (.docx)
 */
export const downloadSupportJadhaDocx = async (dossier: DiagnosticDossier) => {
  const jadha = dossier.supportJadha;

  const children: (Paragraph | Table)[] = [
    createDiagnosticHeaderTable(dossier, "جذاذة أنشطة الدعم والاستدراك البيداغوجي"),
    createRtlPara("", { spacing: { before: 100, after: 100 } }),

    // Metadata
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara(`موضوع الحصة: ${jadha.remediationTitle}`, { bold: true, size: 17, color: "1E293B" }),
              createRtlPara(`التعثر المستهدف: ${jadha.targetedDeficit}`, { size: 14, color: "DC2626", bold: true }),
              createRtlPara(`الكفاية/الهدف المراد تثبيته: ${jadha.prerequisiteGoal}`, { size: 14, color: "047857", bold: true })
            ], { width: { size: 70, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
            createCell([
              createRtlPara(`المدة: ${jadha.duration}`, { bold: true, size: 15, alignment: AlignmentType.CENTER }),
              createRtlPara("المعينات الديداكتيكية:", { bold: true, size: 13, color: "64748B" }),
              ...jadha.pedagogicalMaterial.map(m => createRtlPara(`• ${m}`, { size: 12 }))
            ], { width: { size: 30, type: WidthType.PERCENTAGE }, shading: "EEF2FF" })
          ]
        })
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Main Didactic Steps Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell(createRtlPara("المرحلة والمدة", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 18, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("الوضعية والدعامة", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("مهام الأستاذ(ة)", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 25, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("أنشطة المتعلمين وصيغة العمل", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 22, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
            createCell(createRtlPara("التقويم التكويني", { bold: true, alignment: AlignmentType.CENTER }), { width: { size: 10, type: WidthType.PERCENTAGE }, shading: "E2E8F0" }),
          ]
        }),
        ...jadha.steps.map(step => new TableRow({
          children: [
            createCell([
              createRtlPara(step.phaseName, { bold: true, size: 15, color: "1E293B" }),
              createRtlPara(`(${step.duration})`, { size: 13, color: "64748B", alignment: AlignmentType.CENTER })
            ], { width: { size: 18, type: WidthType.PERCENTAGE } }),
            createCell([
              createRtlPara(step.learningSituation, { size: 14 }),
              createRtlPara(`الدعامة: ${step.didacticSupport}`, { size: 13, color: "047857", bold: true })
            ], { width: { size: 25, type: WidthType.PERCENTAGE } }),
            createCell(step.teacherTasks.map(t => createRtlPara(`• ${t}`, { size: 13 })), { width: { size: 25, type: WidthType.PERCENTAGE } }),
            createCell([
              ...step.studentTasks.map(s => createRtlPara(`• ${s}`, { size: 13 })),
              createRtlPara(`صيغة العمل: [${step.workForm}]`, { size: 12, color: "4338CA", bold: true, spacing: { before: 40 } })
            ], { width: { size: 22, type: WidthType.PERCENTAGE } }),
            createCell(createRtlPara(step.formativeCheck, { size: 12, alignment: AlignmentType.CENTER }), { width: { size: 10, type: WidthType.PERCENTAGE }, shading: "F8FAFC" }),
          ]
        }))
      ]
    }),
    createRtlPara("", { spacing: { before: 120, after: 120 } }),

    // Retention & Post-Evaluation
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      // @ts-ignore
      visuallyRightToLeft: true,
      rows: [
        new TableRow({
          children: [
            createCell([
              createRtlPara("الخلاصة والتثبيت المنهجي:", { bold: true, size: 16, color: "1E3A8A" }),
              createRtlPara(jadha.synthesisAndRetention, { size: 14, color: "334155" }),
              createRtlPara("التقويم البعدي للتحقق من استدامة الأثر:", { bold: true, size: 16, color: "047857", spacing: { before: 60 } }),
              createRtlPara(jadha.postSupportEvaluation, { size: 14, color: "334155" })
            ], { width: { size: 100, type: WidthType.PERCENTAGE }, shading: "F0FDF4" })
          ]
        })
      ]
    })
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `جذاذة_الدعم_والاستدراك_${dossier.level.replace(/\s+/g, '_')}.docx`);
};

/**
 * 5. Export Complete All-In-One Diagnostic Dossier
 */
export const downloadCompleteDiagnosticDossierDocx = async (dossier: DiagnosticDossier) => {
  // Combine all sections in one document with clear headings
  const children: (Paragraph | Table)[] = [
    createDiagnosticHeaderTable(dossier, "الملف الشامل للتقويم التشخيصي والدعم الاستدراكي"),
    createRtlPara("", { spacing: { before: 100, after: 100 } }),
    createRtlPara("يتضمن هذا الملف الرسمي الوثائق الأربع المعتمدة في التقويم التشخيصي:", { bold: true, size: 17, color: "1E3A8A" }),
    createRtlPara("1. رائز التقويم التشخيصي وعناصر الإجابة وسلم التنقيط", { size: 15 }),
    createRtlPara("2. شبكة تفريغ النقط ومصفوفة تفيؤ المتعلمين", { size: 15 }),
    createRtlPara("3. تقرير التقويم التشخيصي والقراءة النوعية للتعثرات", { size: 15 }),
    createRtlPara("4. خطة الدعم والمعالجة البيداغوجية وجذاذة حصة الاستدراك", { size: 15 }),
    createRtlPara("──────────────────────────────────────────", { alignment: AlignmentType.CENTER, color: "CBD5E1", spacing: { before: 100, after: 100 } }),
  ];

  // We can trigger download for each or bundle the comprehensive document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children
    }]
  });

  // Call the test, report, remediation, and support jadha directly or export the master file
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `الملف_الشامل_للتقويم_التشخيصي_${dossier.level.replace(/\s+/g, '_')}.docx`);
};
