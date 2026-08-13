import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { LessonSummaryData } from '../types/summary';

export const downloadSummaryWord = async (summaryData: LessonSummaryData) => {
  if (!summaryData) return;

  try {
    const createRtlPara = (text: string, options: any = {}) => {
      return new Paragraph({
        // @ts-ignore
        bidirectional: true,
        alignment: options.alignment || AlignmentType.RIGHT,
        spacing: options.spacing || { before: 80, after: 80 },
        children: [
          new TextRun({
            text,
            rightToLeft: true,
            bold: options.bold,
            size: options.size || 22,
            color: options.color || "1E293B",
            font: "Arial"
          })
        ],
      });
    };

    const paragraphs: Paragraph[] = [];

    // Main Header Title
    paragraphs.push(
      createRtlPara(`مادة ${summaryData.subject || "الاجتماعيات"} - ملخص مركز`, {
        alignment: AlignmentType.CENTER,
        size: 28,
        bold: true,
        color: "4F46E5",
        spacing: { before: 100, after: 60 }
      }),
      createRtlPara(`درس: ${summaryData.title}`, {
        alignment: AlignmentType.CENTER,
        size: 32,
        bold: true,
        color: "0F172A",
        spacing: { before: 60, after: 200 }
      }),
      createRtlPara(`المستوى: ${summaryData.level}`, {
        alignment: AlignmentType.CENTER,
        size: 20,
        color: "64748B",
        spacing: { before: 0, after: 300 }
      })
    );

    // Introduction
    paragraphs.push(
      createRtlPara("مقدمة والتمهيد الإشكالي:", { bold: true, size: 24, color: "1E40AF", alignment: AlignmentType.RIGHT }),
      createRtlPara(summaryData.introduction.context, { size: 22, spacing: { before: 60, after: 120 }, alignment: AlignmentType.RIGHT })
    );

    if (summaryData.introduction.questions && summaryData.introduction.questions.length > 0) {
      summaryData.introduction.questions.forEach((q) => {
        paragraphs.push(createRtlPara(`• ${q}`, { size: 20, bold: true, color: "334155", alignment: AlignmentType.RIGHT }));
      });
    }

    paragraphs.push(createRtlPara("", { spacing: { before: 200, after: 200 }, alignment: AlignmentType.RIGHT }));

    // Sections
    summaryData.sections.forEach((sec) => {
      paragraphs.push(
        createRtlPara(sec.mainTitle, {
          bold: true,
          size: 26,
          color: "0369A1",
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 100 }
        })
      );

      sec.subsections.forEach((sub) => {
        paragraphs.push(
          createRtlPara(sub.subTitle, {
            bold: true,
            size: 22,
            color: "0F766E",
            alignment: AlignmentType.RIGHT,
            spacing: { before: 120, after: 60 }
          })
        );

        sub.content.forEach((point) => {
          paragraphs.push(
            createRtlPara(`- ${point}`, {
              size: 20,
              alignment: AlignmentType.RIGHT,
              spacing: { before: 40, after: 40 }
            })
          );
        });
      });

      paragraphs.push(createRtlPara("", { spacing: { before: 150, after: 150 }, alignment: AlignmentType.RIGHT }));
    });

    // Conclusion
    paragraphs.push(
      createRtlPara("خاتمة وتركيب عام:", { bold: true, size: 24, color: "1E40AF", alignment: AlignmentType.RIGHT }),
      createRtlPara(summaryData.conclusion, { size: 22, spacing: { before: 60, after: 200 }, alignment: AlignmentType.RIGHT })
    );

    // Collect all key terms (from root keyTerms or subsections) to place at the very end
    const allTerms: { term: string; definition: string }[] = [];
    if (summaryData.keyTerms && summaryData.keyTerms.length > 0) {
      allTerms.push(...summaryData.keyTerms);
    }
    summaryData.sections.forEach(sec => {
      sec.subsections.forEach(sub => {
        if (sub.keyTerms && sub.keyTerms.length > 0) {
          allTerms.push(...sub.keyTerms);
        }
      });
    });

    if (allTerms.length > 0) {
      paragraphs.push(
        createRtlPara("", { spacing: { before: 200, after: 100 }, alignment: AlignmentType.RIGHT }),
        createRtlPara("المفاهيم والمصطلحات الأساسية:", { bold: true, size: 24, color: "B45309", alignment: AlignmentType.RIGHT })
      );

      allTerms.forEach((term) => {
        paragraphs.push(
          createRtlPara(`▪ ${term.term}: ${term.definition}`, {
            size: 20,
            color: "334155",
            alignment: AlignmentType.RIGHT,
            spacing: { before: 50, after: 50 }
          })
        );
      });
    }

    const doc = new Document({
      sections: [{
        properties: {
          // @ts-ignore
          bidi: true,
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Summary_${(summaryData.title || "Lesson").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Summary Word export failed:", error);
    alert("عذراً، فشل تصدير ملخص الدرس كملف Word.");
  }
};
