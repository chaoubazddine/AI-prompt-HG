import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { JadhaData } from '../components/TableJadha';

export const downloadWord = async (jadhaData: JadhaData) => {
  if (!jadhaData) return;

  try {
    const createRtlPara = (text: string, options: any = {}) => {
      return new Paragraph({
        // @ts-ignore
        bidirectional: true,
        alignment: options.alignment || AlignmentType.RIGHT,
        spacing: options.spacing || { before: 40, after: 40 },
        children: [new TextRun({ 
          text, 
          rightToLeft: true, 
          bold: options.bold, 
          size: options.size || 22, 
          color: options.color,
          font: "Arial"
        })],
      });
    };

    const createCell = (content: string | Paragraph[], options: any = {}) => {
      return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        shading: options.shading,
        columnSpan: options.columnSpan,
        width: options.width,
        children: typeof content === 'string' ? [createRtlPara(content, { bold: options.bold, alignment: options.alignment || AlignmentType.CENTER, size: options.size })] : content,
      });
    };

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          // Header Structure (3-column grid)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.RIGHT,
            rows: [
              new TableRow({
                children: [
                  // Left Box
                  createCell([
                    createRtlPara(`الموسم الدراسي: ${jadhaData.year}`, { size: 16 }),
                    createRtlPara(`إعداد: ${jadhaData.teacherName || "................"}`, { size: 16 }),
                    createRtlPara(`الغلاف الزمني: ${jadhaData.duration}`, { size: 16 }),
                    createRtlPara(`المستوى: ${jadhaData.level}`, { size: 16 }),
                  ], { width: { size: 30, type: WidthType.PERCENTAGE } }),
                  // Center Box
                  createCell([
                    createRtlPara(jadhaData.school || "المؤسسة التعليمية", { bold: true, size: 20, color: "DC2626", alignment: AlignmentType.CENTER }),
                    createRtlPara(`الدرس ${jadhaData.lessonNumber || "...."}:`, { bold: true, size: 18, color: "1E40AF", alignment: AlignmentType.CENTER }),
                    createRtlPara(jadhaData.title, { bold: true, size: 24, color: "DC2626", alignment: AlignmentType.CENTER }),
                  ], { width: { size: 40, type: WidthType.PERCENTAGE } }),
                  // Right Box
                  createCell([
                    createRtlPara(`الأكاديمية: ${jadhaData.academy || "................"}`, { size: 16 }),
                    createRtlPara(`المديرية الإقليمية: ${jadhaData.directorate || "................"}`, { size: 16 }),
                    createRtlPara(`المادة: ${jadhaData.unit || "الاجتماعيات"}`, { size: 16 }),
                    createRtlPara(`المراجع: ${jadhaData.references || "................"}`, { size: 16 }),
                  ], { width: { size: 30, type: WidthType.PERCENTAGE } }),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 200 } }),

          // Competencies, Capacities, Objectives Table (3 columns)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.RIGHT,
            rows: [
              new TableRow({
                children: [
                  createCell("الأهداف", { shading: { fill: "DBEAFE" }, bold: true }),
                  createCell("القدرات", { shading: { fill: "DBEAFE" }, bold: true }),
                  createCell("الكفايات", { shading: { fill: "DBEAFE" }, bold: true }),
                ],
              }),
              new TableRow({
                children: [
                  createCell([
                    ...[...(jadhaData.objectives?.cognitive || []), ...(jadhaData.objectives?.skill || []), ...(jadhaData.objectives?.affective || [])].map(o => createRtlPara(`• ${o}`, { size: 16 })),
                  ]),
                  createCell([
                    ...(jadhaData.capabilities || []).map(c => createRtlPara(`• ${c}`, { size: 16 })),
                  ]),
                  createCell([
                    ...(jadhaData.competencies || []).map(c => createRtlPara(`• ${c}`, { size: 16 })),
                  ]),
                ],
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 200 } }),

          // Introduction Steps Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.RIGHT,
            rows: [
              new TableRow({
                children: [
                  createCell("أشكال العمل", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 10, type: WidthType.PERCENTAGE } }),
                  createCell("مهام المتعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 25, type: WidthType.PERCENTAGE } }),
                  createCell("مهام المدرس", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 25, type: WidthType.PERCENTAGE } }),
                  createCell("الدعامات", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 12, type: WidthType.PERCENTAGE } }),
                  createCell("أهداف التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 14, type: WidthType.PERCENTAGE } }),
                  createCell("وضعيات التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 14, type: WidthType.PERCENTAGE } }),
                ],
              }),
              ...(jadhaData.introductionSteps || []).map(step => new TableRow({
                children: [
                  createCell(step.workForm || ""),
                  createCell(step.studentActivities || "", { alignment: AlignmentType.RIGHT, size: 16 }),
                  createCell(step.teacherActivities || "", { alignment: AlignmentType.RIGHT, size: 16 }),
                  createCell(step.tools || "", { size: 15 }),
                  createCell(step.subPhase || ""),
                  createCell(step.phase || "", { bold: true }),
                ],
              })),
            ],
          }),

          createRtlPara("", { spacing: { before: 200 } }),

          // Main Content Table (Learning Segments)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.RIGHT,
            rows: [
              new TableRow({
                children: [
                  createCell("أشكال العمل", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 10, type: WidthType.PERCENTAGE } }),
                  createCell("أنشطة المتعلمين(ات)", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 27, type: WidthType.PERCENTAGE } }),
                  createCell("ممارسات المدرس", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 25, type: WidthType.PERCENTAGE } }),
                  createCell("الدعامات", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 12, type: WidthType.PERCENTAGE } }),
                  createCell("أهداف التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 13, type: WidthType.PERCENTAGE } }),
                  createCell("وضعيات التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 13, type: WidthType.PERCENTAGE } }),
                ],
              }),
              ...(jadhaData.steps || []).flatMap(step => {
                if (step.isHeader) {
                  return [new TableRow({
                    children: [
                      createCell(step.phase, { columnSpan: 6, shading: { fill: "F1F5F9" }, bold: true }),
                    ],
                  })];
                }
                if (step.isSynthesis) {
                  return [new TableRow({
                    children: [
                      createCell([
                        createRtlPara("بناء المنتوج (يكتب على الدفتر):", { bold: true, color: "065f46" }),
                        createRtlPara(step.teacherActivities || step.studentActivities || "", { size: 16 }),
                      ], { columnSpan: 5 }),
                      createCell("وضعية تركيبية", { shading: { fill: "ECFDF5" }, bold: true }),
                    ],
                  })];
                }
                if (step.isEvaluation) {
                  return [new TableRow({
                    children: [
                      createCell([
                        createRtlPara("تقويم مرحلي:", { bold: true, color: "9a3412" }),
                        createRtlPara(step.teacherActivities || "", { size: 16 }),
                      ], { columnSpan: 5 }),
                      createCell("وضعية تقويمية", { shading: { fill: "FFF7ED" }, bold: true }),
                    ],
                  })];
                }
                return [new TableRow({
                  children: [
                    createCell(step.workForm || ""),
                    createCell(
                      step.studentActivities 
                        ? step.studentActivities.split('\n').map(line => createRtlPara(line, { size: 16 }))
                        : [createRtlPara("")], 
                      { alignment: AlignmentType.RIGHT }
                    ),
                    createCell(
                      step.teacherActivities 
                        ? step.teacherActivities.split('\n').map(line => createRtlPara(line, { size: 16 }))
                        : [createRtlPara("")], 
                      { alignment: AlignmentType.RIGHT }
                    ),
                    createCell(step.tools || "", { size: 14 }),
                    createCell(step.subPhase || ""),
                    createCell(step.phase, { bold: true, shading: { fill: "F8FAFC" } }),
                  ],
                })];
              }),
            ],
          }),

          createRtlPara("", { spacing: { before: 400 } }),

          // Final Evaluation Section
          ...(Array.isArray(jadhaData.finalEvaluation) && jadhaData.finalEvaluation.length > 0 ? [
            createRtlPara("تقويم إجمالي:", { bold: true, size: 24, color: "9a3412" }),
            ...jadhaData.finalEvaluation.map((item, i) => createRtlPara(`${i + 1}. ${item}`, { size: 20 })),
          ] : []),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Jadha_${(jadhaData.title || "Lesson").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Word Export Error:", error);
    alert("عذراً، فشل تصدير ملف Word. يرجى المحاولة مرة أخرى.");
  }
};

