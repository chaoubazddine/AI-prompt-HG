import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  Download, 
  Copy, 
  Printer, 
  Check, 
  Edit3, 
  BookOpen, 
  Layers, 
  Calendar,
  FileText,
  HelpCircle,
  Info,
  CheckSquare,
  Square,
  RotateCcw,
  Eye,
  Award,
  Table,
  Clock,
  Workflow,
  GitCommit,
  User,
  Building2
} from 'lucide-react';
import { ExamData, SubjectComponent, ExamDocument } from '../../types/exam';
import { generateMiddleSchoolExam } from '../../services/examService';
import { downloadExamWord, downloadAnswerKeyWord } from '../../utils/examWordExport';
import { LESSONS_DATA } from '../../constants';
import { trackUserUsage } from '../../services/usageTracker';

interface ExamGeneratorProps {
  initialLevel?: string;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  initialLevel = 'الثالثة إعدادي'
}) => {
  const [level, setLevel] = useState(initialLevel);
  const [term, setTerm] = useState<'الدورة الأولى' | 'الدورة الثانية'>('الدورة الأولى');
  const [examTitle, setExamTitle] = useState('الفرض الكتابي المحروس رقم 1');
  const [teacherName, setTeacherName] = useState('ذ. عبد السلام الحاضي');
  const [schoolName, setSchoolName] = useState('ثانوية السلام التأهيلية');
  
  // Situation components distribution (Must cover History, Geography, Citizenship distinctly)
  const [s1Comp, setS1Comp] = useState<SubjectComponent>('التربية على المواطنة');
  const [s2Comp, setS2Comp] = useState<SubjectComponent>('التاريخ');
  const [s3Comp, setS3Comp] = useState<SubjectComponent>('الجغرافيا');

  // Selected lessons per subject component
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [activeTab, setActiveTab] = useState<'exam' | 'answerKey'>('exam');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Scroll to top when mounted
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Helper to normalize level key for LESSONS_DATA
  const normalizeLevelKey = (rawLevel: string): string => {
    if (rawLevel.includes('الأولى') && rawLevel.includes('إعدادي')) return 'الأولى إعدادي';
    if (rawLevel.includes('الثانية') && rawLevel.includes('إعدادي')) return 'الثانية إعدادي';
    if (rawLevel.includes('الثالثة') && rawLevel.includes('إعدادي')) return 'الثالثة إعدادي';
    if (rawLevel.includes('الجذع') || rawLevel.includes('مشترك')) return 'الجذع المشترك';
    if (rawLevel.includes('الأولى') && (rawLevel.includes('باك') || rawLevel.includes('بكالوريا'))) return 'الأولى باك';
    if (rawLevel.includes('الثانية') && (rawLevel.includes('باك') || rawLevel.includes('بكالوريا'))) return 'الثانية باك';
    if (LESSONS_DATA[rawLevel]) return rawLevel;
    return 'الثالثة إعدادي';
  };

  const levelKey = normalizeLevelKey(level);

  // Get available lessons for all 3 components for this level and term
  const historyLessons = LESSONS_DATA[levelKey]?.['التاريخ']?.[term] || [];
  const geoLessons = LESSONS_DATA[levelKey]?.['الجغرافيا']?.[term] || [];
  const civicsLessons = LESSONS_DATA[levelKey]?.['التربية على المواطنة']?.[term] || [];

  // When level or term changes, pre-select default first 2 lessons of each component
  useEffect(() => {
    const defaultSelected = [
      ...(historyLessons.slice(0, 2)),
      ...(geoLessons.slice(0, 2)),
      ...(civicsLessons.slice(0, 2))
    ];
    setSelectedLessons(defaultSelected);
  }, [level, term]);

  const toggleLesson = (lessonName: string) => {
    if (selectedLessons.includes(lessonName)) {
      setSelectedLessons(selectedLessons.filter(l => l !== lessonName));
    } else {
      setSelectedLessons([...selectedLessons, lessonName]);
    }
  };

  const isHighSchool = level.includes('باك') || level.includes('بكالوريا') || level.includes('جذع') || level.includes('مشترك') || level.includes('تأهيلي');

  // Ensure component distribution is valid (no duplicates)
  const handleS1CompChange = (newComp: SubjectComponent) => {
    setS1Comp(newComp);
    if (newComp === s2Comp) {
      setS2Comp(s1Comp);
    } else if (newComp === s3Comp) {
      setS3Comp(s1Comp);
    }
  };

  const handleS2CompChange = (newComp: SubjectComponent) => {
    setS2Comp(newComp);
    if (isHighSchool) {
      setS3Comp(newComp === 'التاريخ' ? 'الجغرافيا' : 'التاريخ');
    } else {
      if (newComp === s1Comp) {
        setS1Comp(s2Comp);
      } else if (newComp === s3Comp) {
        setS3Comp(s2Comp);
      }
    }
  };

  const handleS3CompChange = (newComp: SubjectComponent) => {
    setS3Comp(newComp);
    if (isHighSchool) {
      setS2Comp(newComp === 'التاريخ' ? 'الجغرافيا' : 'التاريخ');
    } else {
      if (newComp === s1Comp) {
        setS1Comp(s3Comp);
      } else if (newComp === s2Comp) {
        setS2Comp(s3Comp);
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await generateMiddleSchoolExam(
        level,
        term,
        examTitle,
        selectedLessons,
        {
          situation1: s1Comp,
          situation2: s2Comp,
          situation3: s3Comp
        },
        {
          teacherName,
          schoolName
        }
      );
      setExamData(data);
      trackUserUsage('exam', `توليد فرض: ${level}`);
      setActiveTab('exam');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء توليد الامتحان. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!examData) return;

    let text = `=== ${examData.title} ===\n`;
    text += `المستوى: ${examData.level} | ${examData.term} | المدة: ${examData.duration}\n\n`;

    if (activeTab === 'exam') {
      // Exam text
      const s1 = examData.situation1;
      if (s1 && s1.title) {
        text += `■ ${s1.title}\n`;
        s1.termsToDefine?.forEach(t => {
          text += `- عرّف(ي) ${t.term} (${t.points}ن): ............\n`;
        });
        s1.objectiveQuestions?.forEach(q => {
          text += `• ${q.questionText}\n`;
          q.optionsOrMatches?.forEach(o => {
            text += `   - ${o.left} : ${o.right}\n`;
          });
        });
        text += `\n`;
      }

      const s2 = examData.situation2;
      if (s2) {
        text += `■ ${s2.title}\n`;
        s2.documents?.forEach(d => {
          text += `[الوثيقة ${d.docNumber}: ${d.title}]\n"${d.content}"\n`;
        });
        s2.questions?.forEach(q => {
          text += `${q.questionNumber}) ${q.questionText} (${q.points}ن)\n`;
        });
      }

      const s3 = examData.situation3;
      if (s3) {
        text += `\n■ ${s3.title}\n`;
        if (s3.choiceInstruction) {
          text += `${s3.choiceInstruction}\n\n`;
        }
        if (s3.topics && s3.topics.length > 0) {
          s3.topics.forEach((topic) => {
            text += `--- ${topic.title || `الموضوع ${topic.topicNumber}`} ---\n`;
            text += `نص الانطلاق: ${topic.contextText}\nالمطلوب:\n`;
            topic.instructions?.forEach(ins => {
              text += `- ${ins}\n`;
            });
            text += `\n`;
          });
        } else {
          text += `نص الانطلاق: ${s3.contextText}\nالمطلوب:\n`;
          s3.instructions?.forEach(ins => {
            text += `- ${ins}\n`;
          });
        }
        if (s3.methodologicalNotes) {
          text += `ملاحظة منهاجية: ${s3.methodologicalNotes}\n`;
        }
      }
    } else {
      // Answer Key text
      const ak = examData.answerKey;
      text += `=== عناصر الإجابة وسُلم التنقيط ===\n\n`;
      if (ak.situation1Answers && ak.situation1Answers.length > 0) {
        text += `■ أجوبة الوضعية الأولى:\n` + ak.situation1Answers.join('\n') + '\n\n';
      }
      text += `■ أجوبة الوضعية الثانية:\n` + (ak.situation2Answers?.map(a => `س${a.questionNumber}) ${a.answer} (${a.points}ن)`).join('\n') || '') + '\n\n';
      text += `■ توجيهات تصحيح الموضوع المقالي:\n`;
      if (ak.situation3AnswerGuides && ak.situation3AnswerGuides.length > 0) {
        ak.situation3AnswerGuides.forEach((guide) => {
          text += `\n[${guide.topicTitle || `إجابة الموضوع ${guide.topicNumber}`}]\n`;
          text += `مقدمة: ${guide.introduction}\n`;
          text += `العرض:\n` + (guide.development?.map(d => `- ${d}`).join('\n') || '') + '\n';
          text += `خاتمة: ${guide.conclusion}\n`;
        });
      } else if (ak.situation3AnswerGuide) {
        text += `مقدمة: ${ak.situation3AnswerGuide?.introduction}\n`;
        text += `العرض:\n` + (ak.situation3AnswerGuide?.development?.join('\n') || '') + '\n';
        text += `خاتمة: ${ak.situation3AnswerGuide?.conclusion}\n`;
      }
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const renderVisualDocument = (doc: ExamDocument, dIdx: number) => {
    const typeStr = (doc.docType || '').toLowerCase();
    const contentStr = doc.content || '';

    const isTable = !!doc.tableData || typeStr.includes('جدول') || typeStr.includes('إحصائ') || contentStr.includes('|');
    const isTimeline = !!doc.timelineData || typeStr.includes('زمني') || typeStr.includes('شريط') || typeStr.includes('كرونولوجيا');
    const isDiagram = !!doc.diagramData || typeStr.includes('خطاطة') || typeStr.includes('مخطط') || typeStr.includes('شكل');

    // 1. TABLE RENDER
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
        return (
          <div key={dIdx} className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-700 shrink-0" />
                {doc.title || `الوثيقة ${doc.docNumber}`} ({doc.docType || 'جدول معطيات إحصائية'})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-md border border-indigo-200">
                جدول إحصائي رسمـي
              </span>
            </div>

            <div className="overflow-x-auto my-2">
              <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm dir-rtl">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-center border-b-2 border-slate-900">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="border border-slate-900 p-2.5 text-center font-black">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="border border-slate-900 p-2.5 text-center font-bold text-slate-900">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {doc.source && <p className="text-[10px] font-bold text-slate-500 text-left pt-1 border-t border-slate-100">المصدر: {doc.source}</p>}
          </div>
        );
      }
    }

    // 2. TIMELINE RENDER
    if (isTimeline) {
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
        return (
          <div key={dIdx} className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                {doc.title || `الوثيقة ${doc.docNumber}`} ({doc.docType || 'خط زمني'})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-900 rounded-md border border-amber-300">
                خط زمني كرونولوجي
              </span>
            </div>

            <div className="relative py-6 px-3 my-2 bg-gradient-to-r from-amber-50/40 via-indigo-50/40 to-slate-50 rounded-xl border-2 border-slate-900 overflow-x-auto">
              <div className="relative min-w-[550px]">
                {/* Main Arrow Line */}
                <div className="absolute top-1/2 left-2 right-2 h-2 bg-indigo-950 rounded-full transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[14px] border-r-indigo-950"></div>

                {/* Milestones */}
                <div className="relative z-10 flex items-center justify-between gap-4 px-4 dir-rtl">
                  {events.map((evt, eIdx) => (
                    <div key={eIdx} className="flex flex-col items-center text-center max-w-[150px]">
                      <div className="bg-slate-950 text-amber-300 font-mono font-black text-xs px-2.5 py-1 rounded-lg border-2 border-amber-400 shadow-sm mb-2 whitespace-nowrap">
                        {evt.dateOrYear}
                      </div>
                      <div className="w-5 h-5 rounded-full bg-amber-400 border-4 border-slate-950 shadow-md my-1 z-20"></div>
                      <div className="mt-2 bg-white p-2.5 rounded-xl border-2 border-slate-800 shadow-sm text-right w-full">
                        <p className="font-black text-xs text-slate-950 leading-snug">{evt.title}</p>
                        {evt.detail && <p className="text-[10px] font-medium text-slate-600 leading-tight mt-1">{evt.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {doc.source && <p className="text-[10px] font-bold text-slate-500 text-left pt-1 border-t border-slate-100">المصدر: {doc.source}</p>}
          </div>
        );
      }
    }

    // 3. DIAGRAM / MIND MAP RENDER
    if (isDiagram) {
      let diagram = doc.diagramData;

      if (!diagram && contentStr) {
        const lines = contentStr.split('\n').map(l => l.trim()).filter(Boolean);
        let central = doc.title || 'الخطاطة المفاهيمية';
        const branches: { title: string; items: string[] }[] = [];
        let currentBranch: { title: string; items: string[] } | null = null;

        lines.forEach(line => {
          if (line.includes(':') && !line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*')) {
            const parts = line.split(/:(.+)/);
            currentBranch = {
              title: parts[0].replace(/^[\-\*•\d\.\)]+/, '').trim(),
              items: parts[1] ? parts[1].split(/[,،\.]/).map(s => s.trim()).filter(Boolean) : []
            };
            branches.push(currentBranch);
          } else if (currentBranch) {
            const cleanItem = line.replace(/^[\-\*•\d\.\)]+/, '').trim();
            if (cleanItem) currentBranch.items.push(cleanItem);
          } else {
            const parts = line.split(/[:\-\u2013]/);
            branches.push({
              title: parts[0].replace(/^[\-\*•\d\.\)]+/, '').trim() || 'عنصر',
              items: parts.slice(1).join(' ').split(/[,،\.\t]/).map(s => s.trim()).filter(Boolean)
            });
          }
        });

        diagram = {
          centralConcept: central,
          branches: branches.length > 0 ? branches : [
            { title: 'العنصر الرئيسي', items: [contentStr] }
          ]
        };
      }

      if (diagram) {
        return (
          <div key={dIdx} className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-900 shadow-sm space-y-4 overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-emerald-700 shrink-0" />
                {doc.title || `الوثيقة ${doc.docNumber}`} ({doc.docType || 'خطاطة مفاهيمية'})
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-md border border-emerald-300 shrink-0">
                شكل بياني / خطاطة
              </span>
            </div>

            <div className="p-4 sm:p-5 bg-emerald-50/40 rounded-xl border-2 border-slate-900 space-y-4 overflow-visible">
              <div className="mx-auto max-w-xl bg-slate-900 text-white p-3.5 rounded-xl border-2 border-slate-950 text-center shadow-md">
                <span className="font-black text-xs sm:text-sm block leading-relaxed">{diagram.centralConcept}</span>
              </div>
              <div className="w-0.5 h-4 bg-slate-900 mx-auto"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full overflow-visible">
                {diagram.branches?.map((branch, bIdx) => (
                  <div key={bIdx} className="bg-white p-3.5 rounded-xl border-2 border-slate-800 shadow-sm space-y-2 flex flex-col justify-start overflow-visible min-w-0">
                    <div className="bg-emerald-100 text-emerald-950 px-2.5 py-1.5 rounded-lg font-black text-xs sm:text-sm text-center border border-emerald-300 leading-snug break-words">
                      {branch.title}
                    </div>
                    {branch.items && branch.items.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-slate-900 pr-1 pt-1">
                        {branch.items.map((item, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-1.5 font-medium leading-relaxed break-words">
                            <span className="text-emerald-700 font-bold shrink-0">•</span>
                            <span className="break-words leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {doc.source && <p className="text-[10px] font-bold text-slate-500 text-left pt-1 border-t border-slate-100">المصدر: {doc.source}</p>}
          </div>
        );
      }
    }

    // 4. DEFAULT TEXT DOCUMENT
    return (
      <div key={dIdx} className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-900 shrink-0" />
            {doc.title || `الوثيقة ${doc.docNumber}`} ({doc.docType})
          </span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-900 font-medium italic bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line dir-rtl text-justify">
          "{doc.content}"
        </p>
        {doc.source && <p className="text-[10px] font-bold text-slate-500 text-left pt-1">المصدر: {doc.source}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-right dir-rtl p-2 sm:p-4" dir="rtl">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/30 text-indigo-300 rounded-2xl shrink-0 border border-indigo-400/30">
              <FileCheck2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  السلكان الإعدادي والتأهيلي
                </span>
                <span className="text-xs text-indigo-200">الأطر المرجعية المحينة للامتحانات</span>
              </div>
              <h2 className="text-base sm:text-xl font-black mt-1">مولّد الامتحانات والفروض الكتابية المحروسة</h2>
            </div>
          </div>
          
          <div className="text-xs bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
            <Award size={14} className="text-indigo-400 shrink-0" />
            <span>3 وضعيات اختبارية مع عناصر الإجابة (20 ن)</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          إعداد فرض كتابي محروس وفق المنهج الرسمي المؤطر للسلكين الإعدادي والتأهيلي: وضعية المفاهيم والأسئلة الموضوعية، وضعية الاشتغال على الوثائق، ووضعية الموضوع المقالي (مقترح واحد إجباري للإعدادي / موضوعان اختياريان للتأهيلي)، مع توليد شبكة التنقيط وعناصر الإجابة الرسمية.
        </p>
      </div>

      {/* Exam Configuration Form */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <form onSubmit={handleGenerate} className="space-y-5">
          
          {/* Row 1: Level, Term, Exam Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Level Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-600" />
                <span>المستوى الدراسي:</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <optgroup label="التعليم الثانوي الإعدادي">
                  <option value="الأولى ثانوي إعدادي">الأولى ثانوي إعدادي</option>
                  <option value="الثانية ثانوي إعدادي">الثانية ثانوي إعدادي</option>
                  <option value="الثالثة ثانوي إعدادي">الثالثة ثانوي إعدادي</option>
                </optgroup>
                <optgroup label="التعليم الثانوي التأهيلي">
                  <option value="الجذع المشترك">الجذع المشترك</option>
                  <option value="الأولى بكالوريا">الأولى بكالوريا</option>
                  <option value="الثانية بكالوريا">الثانية بكالوريا</option>
                </optgroup>
              </select>
            </div>

            {/* Term Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                <span>الدورة الدراسية:</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTerm('الدورة الأولى')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${term === 'الدورة الأولى' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  الدورة الأولى
                </button>
                <button
                  type="button"
                  onClick={() => setTerm('الدورة الثانية')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${term === 'الدورة الثانية' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  الدورة الثانية
                </button>
              </div>
            </div>

            {/* Exam Title Select/Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" />
                <span>نوع وطبيعة الفرض:</span>
              </label>
              <select
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="الفرض الكتابي المحروس رقم 1">الفرض الكتابي المحروس رقم 1</option>
                <option value="الفرض الكتابي المحروس رقم 2">الفرض الكتابي المحروس رقم 2</option>
                <option value="الامتحان الجهوي الموحد (تجريبي)">الامتحان الجهوي الموحد (نموذج تجريبي)</option>
              </select>
            </div>

          </div>

          {/* Row 1.5: Teacher Name & Institution Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" />
                <span>اسم الأستاذ(ة):</span>
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value);
                  if (examData) setExamData({ ...examData, teacherName: e.target.value });
                }}
                placeholder="مثال: ذ. عبد السلام الحاضي"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-600" />
                <span>اسم المؤسسة التعليمية:</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => {
                  setSchoolName(e.target.value);
                  if (examData) setExamData({ ...examData, schoolName: e.target.value });
                }}
                placeholder="مثال: ثانوية السلام التأهيلية"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Situation Component Assignments */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Info size={16} className="text-indigo-600" />
                <span>
                  {isHighSchool
                    ? 'توزيع المكونات على الوضعيتين الاختباريتين (التأهيلي - 10ن للوثائق + 10ن للمقالي):'
                    : 'توزيع المكونات على الوضعيات الاختبارية الثلاث (الإعدادي - 6ن موضوعية + 7ن وثائق + 7ن مقالي):'}
                </span>
              </label>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                يجب توزيع المكونات دون تكرار
              </span>
            </div>

            {isHighSchool ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Situation 1 (Documents - 10pts) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 block">الوضعية 1: الاشتغال على الوثائق (10ن)</span>
                  <select
                    value={s2Comp}
                    onChange={(e) => handleS2CompChange(e.target.value as SubjectComponent)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="التاريخ">التاريخ</option>
                    <option value="الجغرافيا">الجغرافيا</option>
                  </select>
                </div>

                {/* Situation 2 (Essay - 10pts) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 block">الوضعية 2: تحرير موضوع مقالي (10ن)</span>
                  <select
                    value={s3Comp}
                    onChange={(e) => handleS3CompChange(e.target.value as SubjectComponent)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="الجغرافيا">الجغرافيا</option>
                    <option value="التاريخ">التاريخ</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Situation 1 Component */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 block">الوضعية 1: تعاريف وأسئلة موضوعية (6ن)</span>
                  <select
                    value={s1Comp}
                    onChange={(e) => handleS1CompChange(e.target.value as SubjectComponent)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="التربية على المواطنة">التربية على المواطنة</option>
                    <option value="التاريخ">التاريخ</option>
                    <option value="الجغرافيا">الجغرافيا</option>
                  </select>
                </div>

                {/* Situation 2 Component */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 block">الوضعية 2: الاشتغال على الوثائق (7ن)</span>
                  <select
                    value={s2Comp}
                    onChange={(e) => handleS2CompChange(e.target.value as SubjectComponent)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="التاريخ">التاريخ</option>
                    <option value="الجغرافيا">الجغرافيا</option>
                    <option value="التربية على المواطنة">التربية على المواطنة</option>
                  </select>
                </div>

                {/* Situation 3 Component */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-900 block">الوضعية 3: الموضوع المقالي (7ن)</span>
                  <select
                    value={s3Comp}
                    onChange={(e) => handleS3CompChange(e.target.value as SubjectComponent)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="الجغرافيا">الجغرافيا</option>
                    <option value="التاريخ">التاريخ</option>
                    <option value="التربية على المواطنة">التربية على المواطنة</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Lesson Selector Checkboxes for the exam */}
          <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <BookOpen size={16} className="text-indigo-600" />
                <span>تحديد الدروس المستهدفة بالامتحان ({level} - {term}):</span>
              </label>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-md">
                {selectedLessons.length} دروس مختارة
              </span>
            </div>

            <div className={`grid grid-cols-1 ${isHighSchool ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
              
              {/* History Lessons */}
              <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-2">
                <span className="text-xs font-black text-amber-900 border-b border-slate-100 pb-1 block">مكون التاريخ:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {historyLessons.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-bold p-2 text-center">لا توجد دروس محددة لهذا المكون</p>
                  ) : historyLessons.map((l, idx) => {
                    const isChecked = selectedLessons.includes(l);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleLesson(l)}
                        className={`w-full text-right text-[11px] p-1.5 rounded-lg font-bold flex items-center justify-between transition-all ${isChecked ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="line-clamp-1">{l}</span>
                        {isChecked ? <CheckSquare size={14} className="text-amber-600 shrink-0" /> : <Square size={14} className="text-slate-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Geography Lessons */}
              <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-2">
                <span className="text-xs font-black text-teal-900 border-b border-slate-100 pb-1 block">مكون الجغرافيا:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {geoLessons.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-bold p-2 text-center">لا توجد دروس محددة لهذا المكون</p>
                  ) : geoLessons.map((l, idx) => {
                    const isChecked = selectedLessons.includes(l);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleLesson(l)}
                        className={`w-full text-right text-[11px] p-1.5 rounded-lg font-bold flex items-center justify-between transition-all ${isChecked ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="line-clamp-1">{l}</span>
                        {isChecked ? <CheckSquare size={14} className="text-teal-600 shrink-0" /> : <Square size={14} className="text-slate-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Civics Lessons (Middle School only) */}
              {!isHighSchool && (
                <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-2">
                  <span className="text-xs font-black text-indigo-900 border-b border-slate-100 pb-1 block">مكون التربية على المواطنة:</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {civicsLessons.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold p-2 text-center">لا توجد دروس محددة لهذا المكون</p>
                    ) : civicsLessons.map((l, idx) => {
                      const isChecked = selectedLessons.includes(l);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleLesson(l)}
                          className={`w-full text-right text-[11px] p-1.5 rounded-lg font-bold flex items-center justify-between transition-all ${isChecked ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span className="line-clamp-1">{l}</span>
                          {isChecked ? <CheckSquare size={14} className="text-indigo-600 shrink-0" /> : <Square size={14} className="text-slate-300 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري صياغة موضوع الامتحان بجميع وضعياته...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>توليد موضوع الامتحان الآن</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}
      </div>

      {/* Generated Exam Output Result */}
      {examData && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Action Header Bar */}
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Check size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{examData.title}</h3>
                <span className="text-[11px] text-slate-400">
                  مادة الاجتماعيات • {examData.level} • {examData.term}
                </span>
              </div>
            </div>

            {/* Toggle Tabs between Exam Paper & Answer Key */}
            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('exam')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'exam' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'}`}
              >
                <FileText size={14} />
                <span>ورقة الامتحان</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('answerKey')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'answerKey' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'}`}
              >
                <Award size={14} />
                <span>عناصر الإجابة والسُلم</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyText}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              {activeTab === 'exam' ? (
                <button
                  type="button"
                  onClick={() => downloadExamWord(examData)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="تصدير موضوع الامتحان فقط بدون إجابات"
                >
                  <Download size={14} />
                  <span>تصدير موضوع الامتحان (Word)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => downloadAnswerKeyWord(examData)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="تصدير عناصر الإجابة وسُلم التنقيط للأستاذ"
                >
                  <Download size={14} />
                  <span>تصدير عناصر الإجابة (Word)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl transition-all"
                title="طباعة"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>

          {/* Printable Exam Paper Document View */}
          {activeTab === 'exam' && (
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-300 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
              
              {/* Moroccan Official Exam Header Box */}
              <div className="border-2 border-slate-900 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-900 border-b border-slate-300 pb-3">
                  <div className="space-y-1 text-right">
                    <p className="font-black text-sm">المملكة المغربية</p>
                    <p>وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
                    <p className="text-slate-800 font-bold">المؤسسة: <span className="font-black text-indigo-950">{examData.schoolName || schoolName || 'المؤسسة التعليمية'}</span></p>
                    <p className="text-indigo-900 font-black">مادة الاجتماعيات | {examData.cycle || 'السلك الثانوي'}</p>
                  </div>
                  <div className="text-left space-y-1 dir-ltr">
                    <p className="font-black text-sm">{examData.level}</p>
                    <p>{examData.term} | المدة الزمانية: {examData.duration}</p>
                    <p className="text-slate-800 font-bold dir-rtl text-right">الأستاذ(ة): <span className="font-black text-slate-950">{examData.teacherName || teacherName || 'أستاذ المادة'}</span></p>
                    <p className="text-slate-700 dir-rtl text-right">الاسم والنسب: ...........................................</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <h1 className="text-base sm:text-lg font-black text-slate-950 text-center w-full">
                    {examData.title}
                  </h1>
                  <span className="text-xs font-black bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg shrink-0">
                    النقطة: ..... / 20
                  </span>
                </div>
              </div>

              {/* SITUATION 1: OBJECTIVE & TERMS (IF PRESENT - MIDDLE SCHOOL) */}
              {examData.situation1 && examData.situation1.totalPoints > 0 && (
                <div className="space-y-4">
                  <div className="border-b-2 border-slate-900 pb-1 flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-black text-slate-950 underline underline-offset-4 decoration-2">
                      {examData.situation1.title || `I. مكون ${examData.situation1.component}: مصطلحات وأسئلة موضوعية (${examData.situation1.totalPoints}ن)`}
                    </h2>
                    <span className="text-xs font-black bg-slate-100 border border-slate-300 text-slate-900 px-2 py-0.5 rounded">
                      {examData.situation1.totalPoints} نقط
                    </span>
                  </div>

                  {/* Terms to Define */}
                  {examData.situation1.termsToDefine && examData.situation1.termsToDefine.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {examData.situation1.termsToDefine.map((t, idx) => (
                        <div key={idx} className="text-xs sm:text-sm leading-relaxed space-y-1.5">
                          <span className="font-bold text-slate-900 block">
                            1- عرف(ي) بالمفهوم {t.term}:
                          </span>
                          <div className="space-y-1 pt-0.5 font-mono text-slate-400">
                            <p className="border-b border-dotted border-slate-400 w-full leading-relaxed h-4"></p>
                            <p className="border-b border-dotted border-slate-400 w-full leading-relaxed h-4"></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Objective Questions */}
                  {examData.situation1.objectiveQuestions && examData.situation1.objectiveQuestions.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {examData.situation1.objectiveQuestions.map((q, idx) => {
                        const isTrueFalse = q.type === 'true_false' || q.questionText.includes('صحيح') || q.questionText.includes('خطأ') || q.questionText.includes('علامة');
                        const isMatching = q.type === 'matching' || q.questionText.includes('صل');

                        const questionNum = idx + (examData.situation1?.termsToDefine?.length ? 2 : 1);

                        return (
                          <div key={idx} className="space-y-2 text-xs sm:text-sm">
                            <span className="font-bold text-slate-900 block">
                              {questionNum}- {q.questionText}
                            </span>

                            {/* True / False Table Format */}
                            {isTrueFalse && q.optionsOrMatches && (
                              <div className="my-2 overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-900 text-xs sm:text-sm dir-rtl">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-900 font-bold text-slate-900">
                                      <th className="border border-slate-900 p-2 text-center w-[70%]">العبارة</th>
                                      <th className="border border-slate-900 p-2 text-center w-[15%]">صحيح</th>
                                      <th className="border border-slate-900 p-2 text-center w-[15%]">خطأ</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {q.optionsOrMatches.map((item, iIdx) => (
                                      <tr key={iIdx} className="border-b border-slate-900">
                                        <td className="border border-slate-900 p-2.5 font-medium text-slate-900 text-right">{item.left}</td>
                                        <td className="border border-slate-900 p-2.5 text-center"></td>
                                        <td className="border border-slate-900 p-2.5 text-center"></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Matching (صل بسهم) Format */}
                            {isMatching && q.optionsOrMatches && (
                              <div className="my-3 py-2 px-2">
                                <div className="grid grid-cols-2 gap-8 items-start dir-rtl">
                                  {/* Right Column (Group A) */}
                                  <div className="space-y-4 text-right">
                                    {q.optionsOrMatches.map((item, iIdx) => (
                                      <div key={iIdx} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-900">
                                        <span className="text-slate-900 text-lg leading-none shrink-0">•</span>
                                        <span className="pt-0.5">{item.left}</span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Left Column (Group B) */}
                                  <div className="space-y-4 text-right">
                                    {q.optionsOrMatches.map((item, iIdx) => (
                                      <div key={iIdx} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-900">
                                        <span className="text-slate-900 text-lg leading-none shrink-0">•</span>
                                        <span className="pt-0.5">{item.right}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Other / Fill in blank Format */}
                            {!isTrueFalse && !isMatching && q.optionsOrMatches && (
                              <div className="space-y-2 pr-2 my-2">
                                {q.optionsOrMatches.map((item, iIdx) => (
                                  <div key={iIdx} className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-dotted border-slate-300">
                                    <span className="font-medium text-slate-900">{item.left}</span>
                                    <span className="font-mono text-slate-400">...................................................</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SITUATION 2: DOCUMENTS WORKING (7 POINTS) */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-black flex items-center gap-2">
                    <span>{examData.situation2.title}</span>
                  </h2>
                  <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                    {examData.situation2.totalPoints} نقط
                  </span>
                </div>

                {/* Documents List */}
                <div className="space-y-4">
                  {examData.situation2.documents?.map((doc, dIdx) => renderVisualDocument(doc, dIdx))}
                </div>

                {/* Document Questions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-black text-slate-900 block">الأسئلة المطلوب الإجابة عنها اعتماداً على الوثائق والتعلمات:</span>
                  <div className="space-y-4 pr-2 pt-2">
                    {examData.situation2.questions?.map((q, qIdx) => (
                      <div key={qIdx} className="text-xs text-slate-800 space-y-2">
                        <span className="font-bold text-indigo-900 block">{q.questionNumber}) {q.questionText} ({q.points}ن)</span>
                        <div className="space-y-1.5 font-mono text-slate-400 pt-0.5">
                          <p className="border-b border-dotted border-slate-400 w-full leading-relaxed h-4"></p>
                          <p className="border-b border-dotted border-slate-400 w-full leading-relaxed h-4"></p>
                          <p className="border-b border-dotted border-slate-400 w-full leading-relaxed h-4"></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SITUATION 3: ESSAY TOPIC (10 or 7 POINTS) */}
              <div className="space-y-4">
                <div className="bg-indigo-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between">
                  <h2 className="text-xs sm:text-sm font-black flex items-center gap-2">
                    <span>{examData.situation3.title}</span>
                  </h2>
                  <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                    {examData.situation3.totalPoints} نقط
                  </span>
                </div>

                {examData.situation3.choiceInstruction && (
                  <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl text-amber-950 font-black text-xs sm:text-sm text-center">
                    📌 {examData.situation3.choiceInstruction}
                  </div>
                )}

                {/* If multiple topics exist (High School / التأهيلي Table Format) */}
                {examData.situation3.topics && examData.situation3.topics.length > 1 ? (
                  <div className="overflow-x-auto my-2">
                    <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm dir-rtl bg-white">
                      <thead>
                        <tr className="bg-indigo-950 text-white font-black">
                          {examData.situation3.topics.map((topic, tIdx) => (
                            <th key={tIdx} className="border border-slate-900 p-2.5 text-center w-1/2 text-xs sm:text-sm">
                              {topic.title || `الموضوع ${topic.topicNumber || tIdx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {examData.situation3.topics.map((topic, tIdx) => (
                            <td key={tIdx} className="border border-slate-900 p-3.5 align-top w-1/2 bg-slate-50/50 space-y-3">
                              <div className="space-y-1">
                                <span className="font-black text-slate-900 block text-xs underline">نص الانطلاق والسياق:</span>
                                <p className="text-xs leading-relaxed text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200 text-justify">
                                  {topic.contextText}
                                </p>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <span className="font-black text-indigo-950 block text-xs underline">المطلوب:</span>
                                <ul className="space-y-1.5 pr-1">
                                  {topic.instructions?.map((ins, idx) => (
                                    <li key={idx} className="text-xs font-bold text-slate-900 flex items-start gap-1.5">
                                      <span className="text-indigo-600 font-black shrink-0">•</span>
                                      <span>{ins}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {examData.situation3.methodologicalNotes && (
                                <div className="pt-2 border-t border-slate-200 text-[10px] text-amber-900 font-bold">
                                  * {examData.situation3.methodologicalNotes}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Single Mandatory Topic (Middle School / الإعدادي Format) */
                  (() => {
                    const singleTopic = (examData.situation3.topics && examData.situation3.topics.length > 0)
                      ? examData.situation3.topics[0]
                      : examData.situation3;
                    
                    return (
                      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-xs font-black text-slate-900 block underline">نص الانطلاق والسياق الإشكالي:</span>
                          <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-medium bg-white p-3.5 rounded-xl border border-slate-200 text-justify">
                            {singleTopic.contextText}
                          </p>
                        </div>

                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-black text-indigo-950 block underline">المطلوب:</span>
                          <ul className="space-y-2 pr-2">
                            {singleTopic.instructions?.map((ins: string, idx: number) => (
                              <li key={idx} className="text-xs sm:text-sm font-bold text-indigo-900 flex items-start gap-2">
                                <span className="text-indigo-600 font-black">•</span>
                                <span>{ins}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {examData.situation3.methodologicalNotes && (
                          <div className="pt-3 border-t border-slate-200 text-[11px] text-amber-900 font-bold">
                            * ملاحظة منهاجية: {examData.situation3.methodologicalNotes}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

            </div>
          )}

          {/* Answer Key & Scoring Guide View (Official Didactic Management Table) */}
          {activeTab === 'answerKey' && (
            <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-300 shadow-sm space-y-6 print:p-0 print:border-none dir-rtl">
              
              {/* Official Document Header */}
              <div className="border-2 border-slate-900 p-4 rounded-xl space-y-3 bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right gap-2 text-xs font-bold text-slate-900">
                  <div>
                    <p>الأكاديمية الجهوية للتربية والتكوين</p>
                    <p>المديرية الإقليمية: ....................</p>
                    <p>المؤسسة: {schoolName || '....................'}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-black text-indigo-900">المملكة المغربية</p>
                    <p className="text-xs font-bold text-slate-800">وزارة التربية الوطنية والتعليم الأولي والرياضة</p>
                    <span className="inline-block bg-emerald-800 text-white px-3 py-1 rounded-full text-xs font-black shadow-xs">
                      شبكة عناصر الإجابة والتدبير الديداكتيكي وسُلم التنقيط
                    </span>
                  </div>
                  <div className="text-left md:text-left">
                    <p>الأستاذ(ة): {teacherName || 'شعوب عزالدين'}</p>
                    <p>المادة: الاجتماعيات</p>
                    <p>السلك: {examData.cycle || 'التعليم الثانوي'}</p>
                  </div>
                </div>

                <div className="border-t border-slate-300 pt-2 flex flex-wrap justify-between items-center text-xs font-black text-slate-800 gap-2 bg-white p-2.5 rounded-lg border">
                  <span>المستوى: {examData.level}</span>
                  <span>عنوان الامتحان: {examData.title}</span>
                  <span>الدورة: {examData.term}</span>
                  <span>مدة الإنجاز: {examData.duration || 'ساعة واحدة'}</span>
                </div>
              </div>

              {/* Official Didactic Management Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-slate-900 text-xs text-slate-900 bg-white dir-rtl">
                  <thead>
                    <tr className="bg-slate-900 text-white text-center font-black">
                      <th className="border border-slate-900 p-2.5 w-24">المكون</th>
                      <th className="border border-slate-900 p-2.5 w-44">الكفايات والقدرات المستهدفة</th>
                      <th className="border border-slate-900 p-2.5" colSpan={2}>
                        التدبير الديداكتيكي
                      </th>
                      <th className="border border-slate-900 p-2.5 w-20">السلم</th>
                    </tr>
                    <tr className="bg-slate-800 text-white text-center font-bold">
                      <th className="border border-slate-900 p-1.5" colSpan={2}></th>
                      <th className="border border-slate-900 p-2 w-1/2">المطلوب (الأسئلة/الوضعيات)</th>
                      <th className="border border-slate-900 p-2 w-1/2">عناصر الإجابة النموذجية</th>
                      <th className="border border-slate-900 p-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* Situation 1 (If Present - e.g. Middle School / الإعدادي) */}
                    {examData.situation1 && (
                      <tr className="border-b-2 border-slate-900 align-top">
                        <td className="border border-slate-900 p-3 font-black text-center bg-slate-50">
                          {examData.situation1.component}
                          <span className="block text-[11px] text-indigo-900 font-bold mt-1">(تعاريف وأسئلة موضوعية)</span>
                          <span className="block text-xs text-emerald-800 font-black mt-1">({examData.situation1.totalPoints || 6}ن)</span>
                        </td>
                        <td className="border border-slate-900 p-3 font-medium bg-slate-50/50">
                          <p className="font-bold mb-1">اختبار قدرة المتعلم على:</p>
                          <ul className="space-y-1 list-disc pr-4 text-[11px] leading-relaxed">
                            <li>تحديد المفاهيم والأعلام والرموز.</li>
                            <li>توظيف المكتسبات للتمييز الصحيح والخطأ.</li>
                            <li>توظيف التعلمات في سياقات ودعامات جديدة.</li>
                          </ul>
                        </td>
                        <td className="border border-slate-900 p-3 space-y-2">
                          {((examData.situation1.termsToDefine && examData.situation1.termsToDefine.length > 0) || (examData.situation1.definitions && examData.situation1.definitions.length > 0)) && (
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 underline">1. المفاهيم والمصطلحات المطلوبة:</p>
                              <ul className="list-disc pr-4 text-slate-800 space-y-0.5 text-[11px]">
                                {(examData.situation1.termsToDefine || examData.situation1.definitions)?.map((d: any, idx: number) => (
                                  <li key={idx}>
                                    <span className="font-bold text-slate-900">{d.term || d}</span>
                                    {d.points ? <span className="text-indigo-900 font-bold mr-1">({d.points}ن)</span> : null}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {examData.situation1.objectiveQuestions && examData.situation1.objectiveQuestions.length > 0 && (
                            <div className="space-y-2 pt-1 border-t border-slate-200">
                              <p className="font-bold text-slate-900 underline">2. الأسئلة الموضوعية المطروحة:</p>
                              {examData.situation1.objectiveQuestions.map((q, qIdx) => (
                                <div key={qIdx} className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200 text-[11px]">
                                  <p className="font-bold text-indigo-950">س{qIdx + 1}) {q.questionText} {q.points ? `(${q.points}ن)` : ''}</p>
                                  {q.optionsOrMatches && q.optionsOrMatches.length > 0 && (
                                    <ul className="list-disc pr-4 text-slate-700 space-y-0.5">
                                      {q.optionsOrMatches.map((item: any, iIdx: number) => (
                                        <li key={iIdx}>
                                          <span>{item.left}</span>
                                          {item.right ? <span className="font-bold text-indigo-900"> ⬅️ {item.right}</span> : null}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-900 p-3 bg-emerald-50/30 space-y-2">
                          {examData.answerKey.situation1Answers && examData.answerKey.situation1Answers.length > 0 ? (
                            <ul className="space-y-1.5 pr-2 font-medium">
                              {examData.answerKey.situation1Answers.map((ans, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="font-bold text-emerald-800">•</span>
                                  <span>{ans}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-600 font-medium">عناصر الإجابة الرسمية للوضعية الأولى.</p>
                          )}
                        </td>
                        <td className="border border-slate-900 p-3 text-center font-black text-emerald-900 bg-slate-50">
                          ({examData.situation1.totalPoints || 6}ن)
                        </td>
                      </tr>
                    )}

                    {/* Situation 2 (Document Analysis - Middle & High School) */}
                    <tr className="border-b-2 border-slate-900 align-top">
                      <td className="border border-slate-900 p-3 font-black text-center bg-slate-50">
                        {examData.situation2.component}
                        <span className="block text-[11px] text-indigo-900 font-bold mt-1">(الاشتغال على الوثائق)</span>
                        <span className="block text-xs text-emerald-800 font-black mt-1">({examData.situation2.totalPoints || 10}ن)</span>
                      </td>
                      <td className="border border-slate-900 p-3 font-medium bg-slate-50/50">
                        <p className="font-bold mb-1">اختبار قدرة المتعلم على:</p>
                        <ul className="space-y-1 list-disc pr-4 text-[11px] leading-relaxed">
                          <li>الاشتغال بوثائق مختلفة (نصوص، جداول، خطاطات).</li>
                          <li>تحديد نوعية وسياق وموضوع الوثائق.</li>
                          <li>استخراج واستثمار المعطيات وتفسيرها وتركيبها.</li>
                        </ul>
                      </td>
                      <td className="border border-slate-900 p-3 space-y-2">
                        <p className="font-bold text-slate-900 mb-1">الأسئلة الموجهة للوثائق:</p>
                        <ol className="space-y-1.5 list-decimal pr-4 font-medium">
                          {examData.situation2.questions?.map((q, idx) => (
                            <li key={idx} className="leading-relaxed">
                              <span>{q.questionText}</span>
                              <span className="font-bold text-indigo-900 text-[11px] mr-1">({q.points}ن)</span>
                            </li>
                          ))}
                        </ol>
                      </td>
                      <td className="border border-slate-900 p-3 bg-emerald-50/30 space-y-2">
                        <p className="font-bold text-emerald-950 mb-1">الإجابات النموذجية:</p>
                        <div className="space-y-2 pr-1 font-medium">
                          {examData.answerKey.situation2Answers?.map((ans, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-md border border-emerald-200">
                              <span className="font-bold text-emerald-900">س{ans.questionNumber}) </span>
                              <span>{ans.answer}</span>
                              <span className="font-bold text-emerald-800 text-[11px] mr-1">({ans.points}ن)</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="border border-slate-900 p-3 text-center font-black text-emerald-900 bg-slate-50">
                        <div className="space-y-2">
                          {examData.situation2.questions?.map((q, idx) => (
                            <div key={idx} className="border-b border-slate-300 pb-1 last:border-none">
                              ({q.points}ن)
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Situation 3 (Essay Writing - Middle & High School) */}
                    <tr className="border-b-2 border-slate-900 align-top">
                      <td className="border border-slate-900 p-3 font-black text-center bg-slate-50">
                        {examData.situation3.component}
                        <span className="block text-[11px] text-indigo-900 font-bold mt-1">(الموضوع المقالي)</span>
                        <span className="block text-xs text-emerald-800 font-black mt-1">({examData.situation3.totalPoints || 10}ن)</span>
                      </td>
                      <td className="border border-slate-900 p-3 font-medium bg-slate-50/50">
                        <p className="font-bold mb-1">اختبار تمكن المتعلم من:</p>
                        <ul className="space-y-1 list-disc pr-4 text-[11px] leading-relaxed">
                          <li>صياغة موضوع مقالي محكم التصميم ومترابط.</li>
                          <li>مراعاة الجانب المنهجي (مقدمة، تصميم، خاتمة).</li>
                          <li>استيفاء العناصر والتحليل المعرفي.</li>
                          <li>مراعاة الجانب الشكلي ونظافة الورقة وسلامة اللغة.</li>
                        </ul>
                      </td>
                      <td className="border border-slate-900 p-3 space-y-3">
                        {/* High School (Multiple Choice Essay Topics) */}
                        {examData.situation3.topics && examData.situation3.topics.length > 1 ? (
                          <div className="space-y-3">
                            <p className="font-bold text-indigo-950 underline">{examData.situation3.choiceInstruction || 'اكتب في أحد الموضوعين التاليين:'}</p>
                            {examData.situation3.topics.map((t, idx) => (
                              <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                                <p className="font-black text-slate-900 mb-1">{t.title || `الموضوع ${idx + 1}`}:</p>
                                <p className="text-slate-700 mb-1.5 leading-relaxed">{t.contextText}</p>
                                <p className="font-bold text-indigo-900 mb-0.5">المطلوب:</p>
                                <ul className="list-disc pr-4 space-y-0.5">
                                  {t.instructions?.map((ins, iIdx) => (
                                    <li key={iIdx}>{ins}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Middle School (Single Essay Topic) */
                          <div className="space-y-2 text-[11px]">
                            <p className="font-bold text-slate-900 underline">نص الموضوع المقالي:</p>
                            <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border">
                              {examData.situation3.topics?.[0]?.contextText || examData.situation3.contextText}
                            </p>
                            <p className="font-bold text-indigo-900">المطلوب معالجته:</p>
                            <ul className="list-disc pr-4 space-y-0.5">
                              {(examData.situation3.topics?.[0]?.instructions || examData.situation3.instructions)?.map((ins: string, iIdx: number) => (
                                <li key={iIdx}>{ins}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-900 p-3 bg-emerald-50/30 space-y-3">
                        {examData.answerKey.situation3AnswerGuides && examData.answerKey.situation3AnswerGuides.length > 0 ? (
                          <div className="space-y-3">
                            {examData.answerKey.situation3AnswerGuides.map((guide, gIdx) => (
                              <div key={gIdx} className="bg-white p-2.5 rounded-lg border border-emerald-300 space-y-1.5 text-[11px]">
                                <p className="font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded text-center">
                                  {guide.topicTitle || `عناصر إجابة الموضوع ${gIdx + 1}`}
                                </p>
                                <p className="leading-relaxed"><strong>• الجانب المنهجي:</strong> {guide.introduction} - {guide.conclusion}</p>
                                <p className="font-bold text-emerald-900"><strong>• الجانب المعرفي (العرض):</strong></p>
                                <ul className="list-disc pr-4 space-y-0.5 text-slate-800">
                                  {guide.development?.map((d, dIdx) => (
                                    <li key={dIdx}>{d}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            <p className="text-[10px] text-slate-600 font-bold border-t border-emerald-200 pt-1">
                              * الجانب الشكلي: سلامة اللغة، خلو العمل من الأخطاء ونظافة ورقة التحرير.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 text-[11px] bg-white p-2.5 rounded-lg border border-emerald-300">
                            <p><strong>• الجانب المنهجي:</strong> {examData.answerKey.situation3AnswerGuide?.introduction} - {examData.answerKey.situation3AnswerGuide?.conclusion}</p>
                            <p className="font-bold text-emerald-900"><strong>• الجانب المعرفي:</strong></p>
                            <ul className="list-disc pr-4 space-y-0.5 text-slate-800">
                              {examData.answerKey.situation3AnswerGuide?.development?.map((d, dIdx) => (
                                <li key={dIdx}>{d}</li>
                              ))}
                            </ul>
                            <p className="text-[10px] text-slate-600 font-bold border-t border-emerald-200 pt-1">
                              * الجانب الشكلي: خلو الورقة من الأخطاء والتنظيم.
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="border border-slate-900 p-3 text-center font-black text-emerald-900 bg-slate-50 text-[11px]">
                        <div className="space-y-1">
                          <p>الجانب المنهجي والشكلي: ({examData.situation3.totalPoints === 7 ? '2ن' : '2ن'})</p>
                          <p>الجانب المعرفي: ({examData.situation3.totalPoints === 7 ? '5ن' : '8ن'})</p>
                          <p className="border-t border-slate-300 pt-1 font-black text-xs text-indigo-950">
                            المجموع: ({examData.situation3.totalPoints || 10}ن)
                          </p>
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
