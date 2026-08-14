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
                createRtlPara(`المؤسسة: ${examData.schoolName || 'المؤسسة التعليمية'}`, { size: 16, bold: true, alignment: AlignmentType.CENTER }),
                createRtlPara(`المادة: اجتماعيات | ${examData.cycle || 'السلك الثانوي'}`, { size: 18, bold: true, color: "1E40AF", alignment: AlignmentType.CENTER })
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                createRtlPara(`المستوى: ${examData.level}`, { size: 18, bold: true, alignment: AlignmentType.CENTER }),
                createRtlPara(`${examData.term} | المدة الزمانية: ${examData.duration}`, { size: 16, alignment: AlignmentType.CENTER }),
                createRtlPara(`الأستاذ(ة): ${examData.teacherName || 'أستاذ المادة'}`, { size: 16, bold: true, alignment: AlignmentType.CENTER }),
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

    paragraphs.push(createRtlPara("الأسئلة المطلوب الإجابة عنها اعتماداً على الوثائق والتعلمات:", { bold: true, size: 20, color: "0F766E", spacing: { before: 120, after: 80 } }));
    if (s2.questions && s2.questions.length > 0) {
      s2.questions.forEach((q) => {
        paragraphs.push(
          createRtlPara(`${q.questionNumber}) ${q.questionText} (${q.points} ن)`, { size: 18, bold: true, spacing: { before: 80, after: 40 } }),
          createRtlPara(`....................................................................................................................................................`, { size: 16, color: "64748B", spacing: { before: 20, after: 20 } }),
          createRtlPara(`....................................................................................................................................................`, { size: 16, color: "64748B", spacing: { before: 20, after: 20 } }),
          createRtlPara(`....................................................................................................................................................`, { size: 16, color: "64748B", spacing: { before: 20, after: 80 } })
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

    if (s3.topics && s3.topics.length === 2) {
      const topic1 = s3.topics[0];
      const topic2 = s3.topics[1];

      const essayTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { fill: "1E1B4B" },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                  left: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                  right: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                },
                children: [
                  createRtlPara(topic1.title || "الموضوع الأول", { bold: true, color: "FFFFFF", size: 20, alignment: AlignmentType.CENTER })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { fill: "1E1B4B" },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                  left: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                  right: { style: BorderStyle.SINGLE, size: 8, color: "1E1B4B" },
                },
                children: [
                  createRtlPara(topic2.title || "الموضوع الثاني", { bold: true, color: "FFFFFF", size: 20, alignment: AlignmentType.CENTER })
                ]
              }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                  left: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                  right: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                },
                children: [
                  createRtlPara("نص الانطلاق والسياق:", { bold: true, size: 18, color: "0F172A", spacing: { before: 60, after: 40 } }),
                  createRtlPara(topic1.contextText, { size: 16, color: "1E293B", spacing: { before: 20, after: 60 } }),
                  createRtlPara("المطلوب:", { bold: true, size: 18, color: "1E40AF", spacing: { before: 60, after: 30 } }),
                  ...(topic1.instructions?.map(ins => createRtlPara(`• ${ins}`, { size: 16, spacing: { before: 20, after: 20 } })) || [])
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                  left: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                  right: { style: BorderStyle.SINGLE, size: 6, color: "334155" },
                },
                children: [
                  createRtlPara("نص الانطلاق والسياق:", { bold: true, size: 18, color: "0F172A", spacing: { before: 60, after: 40 } }),
                  createRtlPara(topic2.contextText, { size: 16, color: "1E293B", spacing: { before: 20, after: 60 } }),
                  createRtlPara("المطلوب:", { bold: true, size: 18, color: "1E40AF", spacing: { before: 60, after: 30 } }),
                  ...(topic2.instructions?.map(ins => createRtlPara(`• ${ins}`, { size: 16, spacing: { before: 20, after: 20 } })) || [])
                ]
              }),
            ]
          })
        ]
      });

      // @ts-ignore
      paragraphs.push(essayTable as any);
    } else if (s3.topics && s3.topics.length === 1) {
      const topic = s3.topics[0];
      paragraphs.push(
        createRtlPara("نص الانطلاق والسياق الإشكالي:", { bold: true, size: 20, color: "0F172A", spacing: { before: 80, after: 40 } }),
        createRtlPara(topic.contextText, { size: 18, color: "1E293B", spacing: { before: 20, after: 60 } }),
        createRtlPara("المطلوب:", { bold: true, size: 20, color: "1E40AF", spacing: { before: 60, after: 30 } })
      );

      if (topic.instructions && topic.instructions.length > 0) {
        topic.instructions.forEach((ins) => {
          paragraphs.push(createRtlPara(`• ${ins}`, { size: 18, spacing: { before: 20, after: 20 } }));
        });
      }
    } else if (s3.topics && s3.topics.length > 1) {
      s3.topics.forEach((topic) => {
        paragraphs.push(
          createRtlPara(`--- ${topic.title || `الموضوع ${topic.topicNumber}`} ---`, { bold: true, size: 22, color: "0F172A", spacing: { before: 120, after: 60 } }),
          createRtlPara(`نص الانطلاق والسياق: ${topic.contextText}`, { size: 18, color: "1E293B" }),
          createRtlPara("المطلوب:", { bold: true, size: 18, color: "1E40AF", spacing: { before: 60, after: 30 } })
        );

        if (topic.instructions && topic.instructions.length > 0) {
          topic.instructions.forEach((ins) => {
            paragraphs.push(createRtlPara(`• ${ins}`, { size: 18, spacing: { before: 20, after: 20 } }));
          });
        }
        paragraphs.push(createRtlPara("", { spacing: { before: 60, after: 60 } }));
      });
    } else {
      paragraphs.push(
        createRtlPara(`نص الانطلاق والسياق: ${s3.contextText}`, { size: 20, color: "0F172A" }),
        createRtlPara("المطلوب:", { bold: true, size: 20, color: "1E40AF", spacing: { before: 80, after: 40 } })
      );

      if (s3.instructions && s3.instructions.length > 0) {
        s3.instructions.forEach((ins) => {
          paragraphs.push(createRtlPara(`• ${ins}`, { size: 18, spacing: { before: 20, after: 20 } }));
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
        spacing: options.spacing || { before: 60, after: 60 },
        children: [
          new TextRun({
            text,
            rightToLeft: true,
            bold: options.bold,
            size: options.size || 20,
            color: options.color || "1E293B",
            font: "Arial"
          })
        ],
      });
    };

    const paragraphs: (Paragraph | Table)[] = [];

    // Main Header Block
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              children: [
                createRtlPara("الأكاديمية الجهوية للتربية والتكوين", { size: 16, bold: true, alignment: AlignmentType.RIGHT }),
                createRtlPara("المديرية الإقليمية: ....................", { size: 16, alignment: AlignmentType.RIGHT }),
                createRtlPara("المؤسسة: ....................", { size: 16, alignment: AlignmentType.RIGHT }),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              children: [
                createRtlPara("المملكة المغربية", { size: 18, bold: true, alignment: AlignmentType.CENTER, color: "1E3A8A" }),
                createRtlPara("وزارة التربية الوطنية والتعليم الأولي والرياضة", { size: 16, bold: true, alignment: AlignmentType.CENTER }),
                createRtlPara("شبكة عناصر الإجابة والتدبير الديداكتيكي وسُلم التنقيط", { size: 18, bold: true, alignment: AlignmentType.CENTER, color: "065F46" }),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              children: [
                createRtlPara("المادة: الاجتماعيات", { size: 16, bold: true, alignment: AlignmentType.LEFT }),
                createRtlPara(`السلك: ${examData.cycle || 'التعليم الثانوي'}`, { size: 16, alignment: AlignmentType.LEFT }),
                createRtlPara(`الأستاذ(ة): شعوب عزالدين`, { size: 16, alignment: AlignmentType.LEFT }),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
          ]
        })
      ]
    });

    paragraphs.push(
      // @ts-ignore
      headerTable as any,
      createRtlPara(`المستوى: ${examData.level} | الفرض: ${examData.title} | الدورة: ${examData.term} | مدة الإنجاز: ${examData.duration || 'ساعة واحدة'}`, {
        alignment: AlignmentType.CENTER,
        size: 18,
        bold: true,
        color: "0F172A",
        spacing: { before: 120, after: 180 }
      })
    );

    const ak = examData.answerKey;

    // Didactic Grid Table Rows
    const tableRows: TableRow[] = [];

    // Header Row 1
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [createRtlPara("المكون", { bold: true, alignment: AlignmentType.CENTER, color: "FFFFFF" })],
            shading: { fill: "0F172A" }
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            children: [createRtlPara("الكفايات والقدرات", { bold: true, alignment: AlignmentType.CENTER, color: "FFFFFF" })],
            shading: { fill: "0F172A" }
          }),
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            children: [createRtlPara("التدبير الديداكتيكي: المطلوب", { bold: true, alignment: AlignmentType.CENTER, color: "FFFFFF" })],
            shading: { fill: "0F172A" }
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [createRtlPara("عناصر الإجابة النموذجية", { bold: true, alignment: AlignmentType.CENTER, color: "FFFFFF" })],
            shading: { fill: "0F172A" }
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [createRtlPara("السلم", { bold: true, alignment: AlignmentType.CENTER, color: "FFFFFF" })],
            shading: { fill: "0F172A" }
          }),
        ]
      })
    );

    // Row for Situation 1 (If Middle School / الإعدادي)
    if (examData.situation1) {
      const reqList: Paragraph[] = [createRtlPara("1. الأسئلة والتعاريف المطلوبة:", { bold: true, size: 18 })];
      const terms = examData.situation1.termsToDefine || examData.situation1.definitions;
      if (terms && terms.length > 0) {
        reqList.push(createRtlPara("المفاهيم والمصطلحات:", { bold: true, size: 16, color: "1E3A8A" }));
        terms.forEach((d: any) => reqList.push(createRtlPara(`• ${d.term || d} ${d.points ? `(${d.points}ن)` : ''}`, { size: 15 })));
      }
      if (examData.situation1.objectiveQuestions && examData.situation1.objectiveQuestions.length > 0) {
        reqList.push(createRtlPara("الأسئلة الموضوعية:", { bold: true, size: 16, color: "1E3A8A", spacing: { before: 60, after: 20 } }));
        examData.situation1.objectiveQuestions.forEach((q, qIdx) => {
          reqList.push(createRtlPara(`س${qIdx + 1}) ${q.questionText} (${q.points || 0}ن)`, { bold: true, size: 15 }));
          if (q.optionsOrMatches && q.optionsOrMatches.length > 0) {
            q.optionsOrMatches.forEach((item: any) => {
              reqList.push(createRtlPara(`   - ${item.left}${item.right ? ` ⬅️ ${item.right}` : ''}`, { size: 14, color: "475569" }));
            });
          }
        });
      }

      const ansList: Paragraph[] = [createRtlPara("عناصر إجابة الوضعية 1:", { bold: true, size: 18, color: "065F46" })];
      if (ak.situation1Answers) {
        ak.situation1Answers.forEach(ans => ansList.push(createRtlPara(`• ${ans}`, { size: 16 })));
      }

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                createRtlPara(examData.situation1.component || "المكون 1", { bold: true, alignment: AlignmentType.CENTER }),
                createRtlPara("(تعاريف وأسئلة موضوعية)", { size: 14, alignment: AlignmentType.CENTER, color: "1E3A8A" }),
                createRtlPara(`(${examData.situation1.totalPoints || 6}ن)`, { bold: true, alignment: AlignmentType.CENTER, color: "065F46" })
              ]
            }),
            new TableCell({
              children: [
                createRtlPara("• تحديد المفاهيم والأعلام.", { size: 16 }),
                createRtlPara("• توظيف التعلمات للتمييز بين الصحيح والخطأ.", { size: 16 }),
              ]
            }),
            new TableCell({ children: reqList }),
            new TableCell({ children: ansList }),
            new TableCell({
              children: [createRtlPara(`(${examData.situation1.totalPoints || 6}ن)`, { bold: true, alignment: AlignmentType.CENTER, color: "065F46" })]
            })
          ]
        })
      );
    }

    // Row for Situation 2 (Document Analysis)
    const sit2Reqs: Paragraph[] = [createRtlPara("أسئلة الاشتغال على الوثائق المطروحة:", { bold: true, size: 18 })];
    if (examData.situation2.documents && examData.situation2.documents.length > 0) {
      const docTitles = examData.situation2.documents.map((d: any) => d.title || `الوثيقة ${d.docNumber}`).join(' / ');
      sit2Reqs.push(createRtlPara(`الوثائق: ${docTitles}`, { size: 14, color: "475569", spacing: { before: 20, after: 40 } }));
    }
    if (examData.situation2.questions) {
      examData.situation2.questions.forEach(q => {
        sit2Reqs.push(createRtlPara(`س${q.questionNumber}) ${q.questionText} (${q.points}ن)`, { size: 15 }));
      });
    }

    const sit2Ans: Paragraph[] = [createRtlPara("عناصر الإجابة النموذجية:", { bold: true, size: 18, color: "065F46" })];
    if (ak.situation2Answers) {
      ak.situation2Answers.forEach(ans => {
        sit2Ans.push(createRtlPara(`س${ans.questionNumber}) ${ans.answer} (${ans.points}ن)`, { size: 16 }));
      });
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              createRtlPara(examData.situation2.component || "المكون 2", { bold: true, alignment: AlignmentType.CENTER }),
              createRtlPara("(الاشتغال على الوثائق)", { size: 14, alignment: AlignmentType.CENTER, color: "1E3A8A" }),
              createRtlPara(`(${examData.situation2.totalPoints || 10}ن)`, { bold: true, alignment: AlignmentType.CENTER, color: "065F46" })
            ]
          }),
          new TableCell({
            children: [
              createRtlPara("• الاشتغال بوثائق مختلفة (نصوص، جداول، خطاطات).", { size: 16 }),
              createRtlPara("• تحديد السياق والمفاهيم واستخراج المعطيات وتفسيرها.", { size: 16 }),
            ]
          }),
          new TableCell({ children: sit2Reqs }),
          new TableCell({ children: sit2Ans }),
          new TableCell({
            children: [createRtlPara(`(${examData.situation2.totalPoints || 10}ن)`, { bold: true, alignment: AlignmentType.CENTER, color: "065F46" })]
          })
        ]
      })
    );

    // Row for Situation 3 (Essay Topic)
    const sit3Reqs: Paragraph[] = [createRtlPara("الموضوع المقالي المطلوب معالجته:", { bold: true, size: 18 })];
    if (examData.situation3.topics && examData.situation3.topics.length > 1) {
      sit3Reqs.push(createRtlPara(examData.situation3.choiceInstruction || "اكتب في أحد الموضوعين:", { bold: true, size: 15, color: "1E3A8A" }));
      examData.situation3.topics.forEach((t: any, idx: number) => {
        sit3Reqs.push(createRtlPara(`• الموضوع ${idx + 1}: ${t.contextText}`, { size: 14, bold: true }));
        if (t.instructions) {
          t.instructions.forEach((ins: string) => sit3Reqs.push(createRtlPara(`   - ${ins}`, { size: 14 })));
        }
      });
    } else {
      const top = examData.situation3.topics?.[0];
      sit3Reqs.push(createRtlPara(`• ${top?.contextText || examData.situation3.contextText}`, { size: 15 }));
      const instrs = top?.instructions || examData.situation3.instructions;
      if (instrs) {
        instrs.forEach((ins: string) => sit3Reqs.push(createRtlPara(`   - ${ins}`, { size: 14 })));
      }
    }

    const sit3Ans: Paragraph[] = [createRtlPara("توجيهات وسُلم تصحيح المقال:", { bold: true, size: 18, color: "065F46" })];
    if (ak.situation3AnswerGuides && ak.situation3AnswerGuides.length > 0) {
      ak.situation3AnswerGuides.forEach(g => {
        sit3Ans.push(
          createRtlPara(`• ${g.topicTitle || 'دليل الإجابة'}:`, { bold: true, size: 16, color: "1E3A8A" }),
          createRtlPara(`- الجانب المنهجي: ${g.introduction} - ${g.conclusion}`, { size: 15 }),
          createRtlPara(`- الجانب المعرفي: ${g.development?.join(' / ')}`, { size: 15 })
        );
      });
    } else if (ak.situation3AnswerGuide) {
      sit3Ans.push(
        createRtlPara(`- الجانب المنهجي: ${ak.situation3AnswerGuide.introduction} - ${ak.situation3AnswerGuide.conclusion}`, { size: 15 }),
        createRtlPara(`- الجانب المعرفي: ${ak.situation3AnswerGuide.development?.join(' / ')}`, { size: 15 })
      );
    }
    sit3Ans.push(createRtlPara("* الجانب الشكلي: سلامة اللغة والخط ونظافة ورقة التحرير.", { size: 14, color: "64748B" }));

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              createRtlPara(examData.situation3.component || "المكون 3", { bold: true, alignment: AlignmentType.CENTER }),
              createRtlPara("(الموضوع المقالي)", { size: 14, alignment: AlignmentType.CENTER, color: "1E3A8A" }),
              createRtlPara(`(${examData.situation3.totalPoints || 10}ن)`, { bold: true, alignment: AlignmentType.CENTER, color: "065F46" })
            ]
          }),
          new TableCell({
            children: [
              createRtlPara("• صياغة موضوع مقالي محكم التصميم ومترابط.", { size: 16 }),
              createRtlPara("• مراعاة الجوانب المنهجية والمعرفية والشكلية.", { size: 16 }),
            ]
          }),
          new TableCell({ children: sit3Reqs }),
          new TableCell({ children: sit3Ans }),
          new TableCell({
            children: [
              createRtlPara(`منهجي وشكلي: 2ن`, { size: 14, alignment: AlignmentType.CENTER }),
              createRtlPara(`معرفي: ${examData.situation3.totalPoints === 7 ? '5ن' : '8ن'}`, { size: 14, alignment: AlignmentType.CENTER }),
              createRtlPara(`المجموع: (${examData.situation3.totalPoints || 10}ن)`, { bold: true, alignment: AlignmentType.CENTER, color: "065F46" })
            ]
          })
        ]
      })
    );

    const gridTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows
    });

    // @ts-ignore
    paragraphs.push(gridTable as any);

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
