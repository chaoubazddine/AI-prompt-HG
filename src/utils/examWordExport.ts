import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { ExamData } from '../types/exam';

export const downloadExamWord = async (examData: ExamData) => {
  if (!examData) return;

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

    const paragraphs: (Paragraph | Table)[] = [];

    // Official Exam Header Table (Moroccan Format)
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                createRtlPara("المملكة المغربية", { size: 18, bold: true, alignment: AlignmentType.CENTER }),
                createRtlPara("وزارة التربية الوطنية والتعليم الأولي والرياضة", { size: 16, alignment: AlignmentType.CENTER }),
                createRtlPara(`المادة: اجتماعيات | ${examData.cycle || 'السلك الثانوي'}`, { size: 18, bold: true, color: "1E40AF", alignment: AlignmentType.CENTER })
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                createRtlPara(`المستوى: ${examData.level}`, { size: 18, bold: true, alignment: AlignmentType.CENTER }),
                createRtlPara(`${examData.term} | المدة الزمانية: ${examData.duration}`, { size: 16, alignment: AlignmentType.CENTER }),
                createRtlPara("الاسم والنسب: ....................................... النقطة: ...... / 20", { size: 16, bold: true, alignment: AlignmentType.CENTER })
              ],
            }),
          ],
        }),
      ],
    });

    // @ts-ignore
    paragraphs.push(headerTable as any);

    // Main Exam Title
    paragraphs.push(
      createRtlPara(examData.title, {
        alignment: AlignmentType.CENTER,
        size: 28,
        bold: true,
        color: "0F172A",
        spacing: { before: 200, after: 200 }
      })
    );

    // ================= SITUATION 1 =================
    const s1 = examData.situation1;
    if (s1 && (s1.totalPoints > 0) && (s1.termsToDefine?.length || s1.objectiveQuestions?.length)) {
      paragraphs.push(
        createRtlPara(s1.title || `I. مكون ${s1.component}: مصطلحات وأسئلة موضوعية (${s1.totalPoints}ن)`, {
          bold: true,
          size: 22,
          color: "000000",
          spacing: { before: 150, after: 100 }
        })
      );

      if (s1.termsToDefine && s1.termsToDefine.length > 0) {
        s1.termsToDefine.forEach((t) => {
          paragraphs.push(
            createRtlPara(`1- عرف(ي) بالمفهوم ${t.term}:`, { bold: true, size: 20 }),
            createRtlPara(`....................................................................................................................................................`, { size: 16, color: "64748B" }),
            createRtlPara(`....................................................................................................................................................`, { size: 16, color: "64748B", spacing: { before: 20, after: 100 } })
          );
        });
      }

      if (s1.objectiveQuestions && s1.objectiveQuestions.length > 0) {
        s1.objectiveQuestions.forEach((q, idx) => {
          const questionNum = idx + (s1.termsToDefine?.length ? 2 : 1);
          paragraphs.push(createRtlPara(`${questionNum}- ${q.questionText}`, { size: 20, bold: true, spacing: { before: 120, after: 80 } }));
          const isTrueFalse = q.type === 'true_false' || q.questionText.includes('صحيح') || q.questionText.includes('خطأ') || q.questionText.includes('علامة');
          const isMatching = q.type === 'matching' || q.questionText.includes('صل');

          if (q.optionsOrMatches) {
            if (isTrueFalse) {
              const tableRows: TableRow[] = [];
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 70, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                      },
                      children: [createRtlPara("العبارة", { bold: true, size: 18, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      width: { size: 15, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                      },
                      children: [createRtlPara("صحيح", { bold: true, size: 18, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                      width: { size: 15, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                      },
                      children: [createRtlPara("خطأ", { bold: true, size: 18, alignment: AlignmentType.CENTER })],
                    }),
                  ],
                })
              );

              q.optionsOrMatches.forEach((item) => {
                tableRows.push(
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        },
                        children: [createRtlPara(item.left, { size: 18 })],
                      }),
                      new TableCell({
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        },
                        children: [createRtlPara("", { size: 18 })],
                      }),
                      new TableCell({
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                          right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        },
                        children: [createRtlPara("", { size: 18 })],
                      }),
                    ],
                  })
                );
              });

              paragraphs.push(
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: tableRows,
                })
              );
            } else if (isMatching) {
              const matchRows: TableRow[] = [];
              q.optionsOrMatches.forEach((item) => {
                matchRows.push(
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 48, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        },
                        children: [createRtlPara(`•  ${item.left}`, { size: 18, bold: true })],
                      }),
                      new TableCell({
                        width: { size: 4, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        },
                        children: [createRtlPara("", { size: 18 })],
                      }),
                      new TableCell({
                        width: { size: 48, type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        },
                        children: [createRtlPara(`•  ${item.right}`, { size: 18 })],
                      }),
                    ],
                  })
                );
              });

              paragraphs.push(
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: matchRows,
                })
              );
            } else {
              q.optionsOrMatches.forEach((item) => {
                paragraphs.push(
                  createRtlPara(`   • ${item.left} : ....................................................................................`, { size: 18 })
                );
              });
            }
          }
        });
      }

      paragraphs.push(createRtlPara("", { spacing: { before: 200, after: 200 } }));
    }

    // ================= SITUATION 2 =================
    const s2 = examData.situation2;
    paragraphs.push(
      createRtlPara(s2.title || `الوضعية الثانية: الاشتغال على الوثائق (${s2.totalPoints} ن)`, {
        bold: true,
        size: 24,
        color: "0369A1",
        spacing: { before: 150, after: 100 }
      })
    );

    if (s2.documents && s2.documents.length > 0) {
      s2.documents.forEach((doc) => {
        const typeStr = (doc.docType || '').toLowerCase();
        const contentStr = doc.content || '';

        const isTable = !!doc.tableData || typeStr.includes('جدول') || typeStr.includes('إحصائ') || contentStr.includes('|');
        const isTimeline = !!doc.timelineData || typeStr.includes('زمني') || typeStr.includes('شريط') || typeStr.includes('كرونولوجيا');
        const isDiagram = !!doc.diagramData || typeStr.includes('خطاطة') || typeStr.includes('مخطط') || typeStr.includes('شكل');

        paragraphs.push(
          createRtlPara(`${doc.title || `الوثيقة رقم ${doc.docNumber}`} (${doc.docType || 'وثيقة'})`, { bold: true, size: 20, color: "0369A1", spacing: { before: 100, after: 60 } })
        );

        if (isTable) {
          let headers = doc.tableData?.headers;
          let rows = doc.tableData?.rows;

          if (!headers || !rows || headers.length === 0) {
            const lines = contentStr.split('\n').map(l => l.trim()).filter(Boolean);
            const parsedRows = lines.map(line => line.split(/[|\t]/).map(c => c.trim()).filter(Boolean));
            if (parsedRows.length > 1) {
              headers = parsedRows[0];
              rows = parsedRows.slice(1);
            }
          }

          if (headers && headers.length > 0 && rows && rows.length > 0) {
            const tableRows: TableRow[] = [];
            tableRows.push(
              new TableRow({
                children: headers.map(h => new TableCell({
                  shading: { fill: "0F172A" },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                    left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                    right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                  },
                  children: [createRtlPara(h, { bold: true, color: "FFFFFF", size: 18, alignment: AlignmentType.CENTER })]
                }))
              })
            );

            rows.forEach(r => {
              tableRows.push(
                new TableRow({
                  children: r.map(cell => new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                      left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                      right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                    },
                    children: [createRtlPara(cell, { size: 18, alignment: AlignmentType.CENTER })]
                  }))
                })
              );
            });

            paragraphs.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              })
            );
          } else {
            paragraphs.push(createRtlPara(`"${contentStr}"`, { size: 18, color: "334155" }));
          }
        } else if (isTimeline) {
          let events = doc.timelineData?.events;
          if (!events || events.length === 0) {
            const lines = contentStr.split('\n').map(l => l.trim()).filter(Boolean);
            events = [];
            lines.forEach(line => {
              const match = line.match(/^([0-9]{3,4}|\b[0-9]+\b)\s*[:\-\u2013]\s*(.+)$/);
              if (match) {
                const parts = match[2].split(/[:\(\)]/).map(p => p.trim()).filter(Boolean);
                events!.push({
                  dateOrYear: match[1],
                  title: parts[0] || match[2],
                  detail: parts[1] || undefined
                });
              }
            });
          }

          if (events && events.length > 0) {
            const timelineRows: TableRow[] = [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "1E3A8A" },
                    children: [createRtlPara("السنة / التاريخ", { bold: true, color: "FFFFFF", size: 18, alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    shading: { fill: "1E3A8A" },
                    children: [createRtlPara("الحدث التاريخي / الملاحظات الكرونولوجية", { bold: true, color: "FFFFFF", size: 18, alignment: AlignmentType.CENTER })]
                  })
                ]
              })
            ];

            events.forEach(evt => {
              timelineRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      shading: { fill: "F8FAFC" },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                      },
                      children: [createRtlPara(evt.dateOrYear, { bold: true, color: "1E3A8A", size: 18, alignment: AlignmentType.CENTER })]
                    }),
                    new TableCell({
                      width: { size: 75, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                      },
                      children: [createRtlPara(evt.detail ? `${evt.title} (${evt.detail})` : evt.title, { size: 18 })]
                    })
                  ]
                })
              );
            });

            paragraphs.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: timelineRows
              })
            );
          } else {
            paragraphs.push(createRtlPara(`"${contentStr}"`, { size: 18, color: "334155" }));
          }
        } else if (isDiagram) {
          let diagram = doc.diagramData;
          if (!diagram && contentStr) {
            const lines = contentStr.split('\n').map(l => l.trim()).filter(Boolean);
            diagram = {
              centralConcept: doc.title || 'الخطاطة المفاهيمية',
              branches: lines.map(line => {
                const parts = line.split(/[:\-\u2013]/);
                return {
                  title: parts[0] || 'عنصر',
                  items: parts.slice(1).join(' ').split(/[,،\.]/).map(s => s.trim()).filter(Boolean)
                };
              })
            };
          }

          if (diagram) {
            const diagramRows: TableRow[] = [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: "065F46" },
                    children: [createRtlPara(`المفهوم المحوري: ${diagram.centralConcept}`, { bold: true, color: "FFFFFF", size: 20, alignment: AlignmentType.CENTER })]
                  })
                ]
              })
            ];

            diagram.branches?.forEach(b => {
              const branchText = `${b.title}: ${b.items?.join(' • ') || ''}`;
              diagramRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                      },
                      children: [createRtlPara(branchText, { size: 18 })]
                    })
                  ]
                })
              );
            });

            paragraphs.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: diagramRows
              })
            );
          } else {
            paragraphs.push(createRtlPara(`"${contentStr}"`, { size: 18, color: "334155" }));
          }
        } else {
          paragraphs.push(createRtlPara(`"${contentStr}"`, { size: 18, color: "334155" }));
        }

        if (doc.source) {
          paragraphs.push(createRtlPara(`المصدر: ${doc.source}`, { size: 16, color: "64748B", spacing: { before: 40, after: 80 } }));
        }
        paragraphs.push(createRtlPara("", { spacing: { before: 60, after: 60 } }));
      });
    }

    paragraphs.push(createRtlPara("الأسئلة المطلوب الإجابة عنها اعتماداً على الوثائق والتعلمات:", { bold: true, size: 20, color: "0F766E" }));
    if (s2.questions && s2.questions.length > 0) {
      s2.questions.forEach((q) => {
        paragraphs.push(
          createRtlPara(`${q.questionNumber}) ${q.questionText} (${q.points} ن)`, { size: 18 })
        );
      });
    }

    paragraphs.push(createRtlPara("", { spacing: { before: 200, after: 200 } }));

    // ================= SITUATION 3 =================
    const s3 = examData.situation3;
    paragraphs.push(
      createRtlPara(s3.title || `الوضعية الثالثة: إنتاج موضوع مقالي (${s3.totalPoints} ن)`, {
        bold: true,
        size: 24,
        color: "1E40AF",
        spacing: { before: 150, after: 100 }
      })
    );

    if (s3.choiceInstruction) {
      paragraphs.push(
        createRtlPara(`📌 ${s3.choiceInstruction}`, { bold: true, size: 20, color: "B45309", spacing: { before: 60, after: 100 } })
      );
    }

    if (s3.topics && s3.topics.length > 0) {
      s3.topics.forEach((topic) => {
        paragraphs.push(
          createRtlPara(`--- ${topic.title || `الموضوع ${topic.topicNumber}`} ---`, { bold: true, size: 22, color: "0F172A", spacing: { before: 120, after: 60 } }),
          createRtlPara(`نص الانطلاق والسياق: ${topic.contextText}`, { size: 18, color: "1E293B" }),
          createRtlPara("المطلوب:", { bold: true, size: 18, color: "1E40AF", spacing: { before: 60, after: 30 } })
        );

        if (topic.instructions && topic.instructions.length > 0) {
          topic.instructions.forEach((ins) => {
            paragraphs.push(createRtlPara(`- ${ins}`, { size: 18 }));
          });
        }
        paragraphs.push(createRtlPara("", { spacing: { before: 60, after: 60 } }));
      });
    } else {
      paragraphs.push(
        createRtlPara(`نص الانطلاق: ${s3.contextText}`, { size: 20, color: "0F172A" }),
        createRtlPara("المطلوب:", { bold: true, size: 20, color: "1E40AF", spacing: { before: 80, after: 40 } })
      );

      if (s3.instructions && s3.instructions.length > 0) {
        s3.instructions.forEach((ins) => {
          paragraphs.push(createRtlPara(`- ${ins}`, { size: 18 }));
        });
      }
    }

    if (s3.methodologicalNotes) {
      paragraphs.push(
        createRtlPara(`* ملاحظة منهاجية: ${s3.methodologicalNotes}`, { size: 16, color: "B45309", spacing: { before: 80, after: 120 } })
      );
    }

    // EXPLICITLY NO ANSWER KEY IN THE STUDENT EXAM WORD FILE!

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
    saveAs(blob, `موضوع_امتحان_${(examData.title || "Exam").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Exam Word export failed:", error);
    alert("عذراً، فشل تصدير موضوع الامتحان كملف Word.");
  }
};

export const downloadAnswerKeyWord = async (examData: ExamData) => {
  if (!examData) return;

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

    // Main Answer Key Title Header
    paragraphs.push(
      createRtlPara("المملكة المغربية - وزارة التربية الوطنية والتعليم الأولي والرياضة", {
        alignment: AlignmentType.CENTER,
        size: 18,
        bold: true,
        color: "15803D"
      }),
      createRtlPara(`عناصر الإجابة وسُلم التنقيط الرسمية - ${examData.title}`, {
        alignment: AlignmentType.CENTER,
        size: 26,
        bold: true,
        color: "15803D",
        spacing: { before: 150, after: 200 }
      }),
      createRtlPara(`المستوى: ${examData.level} | ${examData.term} | مادة الاجتماعيات`, {
        alignment: AlignmentType.CENTER,
        size: 18,
        color: "334155",
        spacing: { before: 50, after: 200 }
      })
    );

    const ak = examData.answerKey;

    // Situation 1 Answers (If present)
    if (ak.situation1Answers && ak.situation1Answers.length > 0 && examData.situation1) {
      paragraphs.push(
        createRtlPara(`أولاً: عناصر إجابة الوضعية الأولى (${examData.situation1.title})`, { bold: true, size: 22, color: "15803D" })
      );
      ak.situation1Answers.forEach((ans) => {
        paragraphs.push(createRtlPara(`• ${ans}`, { size: 18 }));
      });
      paragraphs.push(createRtlPara("", { spacing: { before: 150, after: 150 } }));
    }

    // Situation 2 Answers
    if (ak.situation2Answers) {
      paragraphs.push(
        createRtlPara(`ثانياً: عناصر إجابة الوضعية الثانية (${examData.situation2.title})`, { bold: true, size: 22, color: "15803D" })
      );
      ak.situation2Answers.forEach((ans) => {
        paragraphs.push(createRtlPara(`س${ans.questionNumber}) ${ans.answer} (${ans.points}ن)`, { size: 18 }));
      });
    }

    paragraphs.push(createRtlPara("", { spacing: { before: 150, after: 150 } }));

    // Situation 3 Answers
    if (ak.situation3AnswerGuides && ak.situation3AnswerGuides.length > 0) {
      paragraphs.push(
        createRtlPara(`ثالثاً: توجيهات وسُلم تصحيح الموضوع المقالي (${examData.situation3?.title || ''})`, { bold: true, size: 22, color: "15803D", spacing: { before: 150, after: 100 } })
      );
      ak.situation3AnswerGuides.forEach((guide) => {
        paragraphs.push(
          createRtlPara(`📌 ${guide.topicTitle || `دليل إجابة الموضوع ${guide.topicNumber}`}`, { bold: true, size: 20, color: "065F46", spacing: { before: 100, after: 40 } }),
          createRtlPara(`المقدمة والجانب المنهجي: ${guide.introduction}`, { size: 18 }),
          createRtlPara(`عناصر العرض المعرفي:`, { bold: true, size: 18 })
        );
        guide.development?.forEach((devPoint) => {
          paragraphs.push(createRtlPara(`• ${devPoint}`, { size: 18 }));
        });
        paragraphs.push(createRtlPara(`الخاتمة والتركيب: ${guide.conclusion}`, { size: 18, spacing: { before: 40, after: 100 } }));
      });
    } else if (ak.situation3AnswerGuide) {
      paragraphs.push(
        createRtlPara(`ثالثاً: توجيهات وسُلم تصحيح الموضوع المقالي (${examData.situation3?.title || ''})`, { bold: true, size: 22, color: "15803D" }),
        createRtlPara(`المقدمة والجانب المنهجي: ${ak.situation3AnswerGuide.introduction}`, { size: 18 })
      );
      ak.situation3AnswerGuide.development?.forEach((devPoint, dIdx) => {
        paragraphs.push(createRtlPara(`العرض المعرفي (عنصر ${dIdx + 1}): ${devPoint}`, { size: 18 }));
      });
      paragraphs.push(createRtlPara(`الخاتمة والتركيب: ${ak.situation3AnswerGuide.conclusion}`, { size: 18 }));
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
    saveAs(blob, `عناصر_إجابة_${(examData.title || "Exam").replace(/\s+/g, '_')}.docx`);
  } catch (error) {
    console.error("Answer Key Word export failed:", error);
    alert("عذراً، فشل تصدير عناصر الإجابة كملف Word.");
  }
};
