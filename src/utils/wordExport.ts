import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, VerticalAlign } from 'docx';
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
        // New Header Structure from Image (3-column grid)
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
                  createRtlPara(`المجزوءة: ${jadhaData.module || "................"}`, { size: 16 }),
                ], { width: { size: 30, type: WidthType.PERCENTAGE } }),
                // Center Box
                createCell([
                  createRtlPara(jadhaData.school || "................", { bold: true, size: 20, color: "FF0000", alignment: AlignmentType.CENTER }),
                  createRtlPara(`الدرس ${jadhaData.lessonNumber || "...."}:`, { bold: true, size: 18, color: "0000FF", alignment: AlignmentType.CENTER }),
                  createRtlPara(jadhaData.title, { bold: true, size: 24, color: "FF0000", alignment: AlignmentType.CENTER }),
                ], { width: { size: 40, type: WidthType.PERCENTAGE } }),
                // Right Box
                createCell([
                  createRtlPara(`الأكاديمية: ${jadhaData.academy || "................"}`, { size: 16 }),
                  createRtlPara(`المديرية الإقليمية: ${jadhaData.directorate || "................"}`, { size: 16 }),
                  createRtlPara(`المادة: الاجتماعيات`, { size: 16 }),
                  createRtlPara(`المراجع: ${jadhaData.references || "................"}`, { size: 16 }),
                  createRtlPara(`الوحدة: ${jadhaData.lessonNumber || "...."}`, { size: 16 }),
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
                  ...[...(jadhaData.objectives?.cognitive || []), ...(jadhaData.objectives?.skill || []), ...(jadhaData.objectives?.affective || [])].map(o => createRtlPara(`- ${o}`, { size: 16 })),
                ]),
                createCell([
                  ...(jadhaData.capabilities || []).map(c => createRtlPara(`- ${c}`, { size: 16 })),
                ]),
                createCell([
                  ...(jadhaData.competencies || []).map(c => createRtlPara(`- ${c}`, { size: 16 })),
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
                createCell("التدبير الديداكتيكي: مهام المتعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 22.5, type: WidthType.PERCENTAGE } }),
                createCell("التدبير الديداكتيكي: مهام المدرس", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 22.5, type: WidthType.PERCENTAGE } }),
                createCell("الدعامات الديداكتيكية", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell("أهداف التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell("وضعيات التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
              ],
            }),
            ...(jadhaData.introductionSteps || []).map(step => new TableRow({
              children: [
                createCell(step.workForm || ""),
                createCell(step.studentActivities || "", { alignment: AlignmentType.RIGHT }),
                createCell(step.teacherActivities || "", { alignment: AlignmentType.RIGHT }),
                createCell(step.tools || "", { size: 16 }),
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
                createCell("مهام المتعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell("مهام الأستاذ", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell("الدعامات", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 10, type: WidthType.PERCENTAGE } }),
                createCell("أهداف التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell("وضعيات التعلم", { shading: { fill: "DBEAFE" }, bold: true, width: { size: 15, type: WidthType.PERCENTAGE } }),
              ],
            }),
            ...(jadhaData.steps || []).flatMap(step => {
              if (step.isHeader) {
                return [new TableRow({
                  children: [
                    createCell(step.phase, { columnSpan: 6, shading: { fill: "E0E7FF" }, bold: true }),
                  ],
                })];
              }
              if (step.isSynthesis) {
                return [new TableRow({
                  children: [
                    createCell([
                      createRtlPara("بناء المنتوج:", { bold: true, color: "065f46" }),
                      createRtlPara(step.teacherActivities || "", { size: 18 }),
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
                      createRtlPara(step.teacherActivities || "", { size: 18 }),
                    ], { columnSpan: 5 }),
                    createCell("وضعية تقويمية", { shading: { fill: "FFF7ED" }, bold: true }),
                  ],
                })];
              }
              return [new TableRow({
                children: [
                  createCell(step.workForm || ""),
                  createCell(step.studentActivities || "", { alignment: AlignmentType.RIGHT }),
                  createCell(step.teacherActivities || "", { alignment: AlignmentType.RIGHT }),
                  createCell(step.tools || "", { size: 16 }),
                  createCell(step.subPhase || ""),
                  createCell(step.phase, { bold: true, shading: { fill: "FEFCE8" } }),
                ],
              })];
            }),
          ],
        }),

        createRtlPara("", { spacing: { before: 400 } }),

        // Summary Section
        ...(jadhaData.summary ? [
          createRtlPara("خلاصة عامة للدرس:", { bold: true, size: 24, color: "065f46" }),
          createRtlPara(jadhaData.summary, { size: 20 }),
          createRtlPara("", { spacing: { before: 200 } }),
        ] : []),

        // Final Evaluation Section
        ...(jadhaData.finalEvaluation && jadhaData.finalEvaluation.length > 0 ? [
          createRtlPara("تقويم إجمالي:", { bold: true, size: 24, color: "9a3412" }),
          ...jadhaData.finalEvaluation.map(item => createRtlPara(`- ${item}`, { size: 20 })),
        ] : []),
      ],
    }],
  });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Jadha_${(jadhaData.title || "Lesson").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Word export failed:", error);
    alert("عذراً، فشل تصدير ملف Word. يرجى المحاولة مرة أخرى.");
  }
};
