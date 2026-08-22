import React, { useState, useEffect, useMemo } from 'react';
import { DiagnosticDossier, StudentScoreRow, DiagnosticQuestionItem } from '../../types/diagnostic';
import { 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download, 
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Award,
  Check,
  ClipboardPaste,
  HelpCircle
} from 'lucide-react';
import { downloadDiagnosticReportDocx } from '../../utils/diagnosticWordExport';
import { toast } from 'sonner';

interface Props {
  dossier: DiagnosticDossier;
  onUpdateStudents?: (students: StudentScoreRow[]) => void;
  onRecalculateDossier?: (students: StudentScoreRow[]) => void;
}

function normalizeStudentScores(
  rawStudents: any[], 
  questions: DiagnosticQuestionItem[], 
  totalPoints: number = 20
): StudentScoreRow[] {
  if (!Array.isArray(rawStudents)) return [];

  return rawStudents.map((s, idx) => {
    const rawScores = s.scores || s.itemScores || {};
    const validScores: Record<string, number> = {};

    let computedTotal = 0;
    questions.forEach((q, qIdx) => {
      const qKey = q.id || `q${qIdx + 1}`;
      let val = rawScores[qKey];
      if (val === undefined) val = rawScores[String(q.number)];
      if (val === undefined) val = rawScores[`q${q.number}`];
      if (val === undefined) val = rawScores[`Q${q.number}`];
      if (val === undefined || isNaN(Number(val))) val = 0;
      
      const maxScore = q.maxScore || 3;
      const numVal = Math.min(maxScore, Math.max(0, Number(val)));
      validScores[qKey] = numVal;
      computedTotal += numVal;
    });

    computedTotal = Math.round(computedTotal * 2) / 2;
    const finalTotal = typeof s.totalScore === 'number' && !isNaN(s.totalScore) && s.totalScore > 0
      ? s.totalScore
      : computedTotal;

    const percentage = typeof s.percentage === 'number' && !isNaN(s.percentage)
      ? s.percentage
      : Math.round((finalTotal / (totalPoints || 20)) * 100);

    let category: 'متحكم' | 'في طور التحكم' | 'غير متحكم' = s.levelCategory;
    if (!category || !['متحكم', 'في طور التحكم', 'غير متحكم'].includes(category)) {
      if (finalTotal >= 14) category = 'متحكم';
      else if (finalTotal >= 10) category = 'في طور التحكم';
      else category = 'غير متحكم';
    }

    return {
      studentNumber: s.studentNumber || idx + 1,
      studentName: s.studentName || `تلميذ(ة) ${idx + 1}`,
      gender: s.gender === 'أنثى' ? 'أنثى' : 'ذكر',
      scores: validScores,
      totalScore: finalTotal,
      percentage,
      levelCategory: category
    };
  });
}

export const DiagnosticScoringView: React.FC<Props> = ({ 
  dossier, 
  onUpdateStudents,
  onRecalculateDossier 
}) => {
  const questions = useMemo(() => dossier.test?.questions || [], [dossier.test?.questions]);
  const totalPoints = dossier.test?.totalPoints || 20;

  const [students, setStudents] = useState<StudentScoreRow[]>(() => {
    return normalizeStudentScores(dossier.sampleScoringGrid?.sampleStudents || [], questions, totalPoints);
  });

  // Keep students in sync when a new dossier is loaded
  useEffect(() => {
    if (dossier.sampleScoringGrid?.sampleStudents) {
      const normalized = normalizeStudentScores(
        dossier.sampleScoringGrid.sampleStudents, 
        questions, 
        totalPoints
      );
      setStudents(normalized);
    }
  }, [dossier.id]);

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const updateStudentRow = (updatedList: StudentScoreRow[]) => {
    setStudents(updatedList);
    if (onUpdateStudents) {
      onUpdateStudents(updatedList);
    }
  };

  // Helper to parse pasted grade sheet text
  const parseImportData = (rawText: string): StudentScoreRow[] => {
    if (!rawText.trim()) return [];
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const totalTestPoints = totalPoints || 20;

    return lines.map((line, idx) => {
      // Split by tab, semicolon, comma, or multiple spaces
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else if (line.includes(';')) {
        parts = line.split(';').map(p => p.trim());
      } else if (line.includes(',')) {
        parts = line.split(',').map(p => p.trim());
      } else {
        // Space/dash separated
        parts = line.split(/\s{2,}|\s*-\s*|\s*:\s*/).map(p => p.trim());
      }

      // Filter out empty parts
      parts = parts.filter(p => p.length > 0);

      let studentNumber = idx + 1;
      let name = '';
      let gender: 'ذكر' | 'أنثى' = 'ذكر';
      const extractedNumbers: number[] = [];

      // Look through parts to identify rank, name, gender, and numbers
      parts.forEach((part) => {
        // Check gender
        const lowerPart = part.toLowerCase();
        if (part === 'أنثى' || part === 'انثى' || part === 'F' || part === 'f' || lowerPart === 'femme' || lowerPart === 'fille') {
          gender = 'أنثى';
          return;
        }
        if (part === 'ذكر' || part === 'M' || part === 'm' || lowerPart === 'garcon' || lowerPart === 'homme') {
          gender = 'ذكر';
          return;
        }

        // Check if pure number / score
        const cleanedNumberStr = part.replace(',', '.');
        const num = parseFloat(cleanedNumberStr);
        if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(cleanedNumberStr)) {
          extractedNumbers.push(num);
          return;
        }

        // Otherwise consider it text (name or rank + name)
        if (!name) {
          name = part;
        } else {
          name += ` ${part}`;
        }
      });

      // Handle rank at the start of name if present (e.g. "1. أحمد المنصوري" or "01 - فاطمة")
      const rankMatch = name.match(/^(\d+)[\.\-\)\s]+(.+)$/);
      if (rankMatch) {
        studentNumber = parseInt(rankMatch[1], 10) || (idx + 1);
        name = rankMatch[2].trim();
      } else if (extractedNumbers.length > 0 && extractedNumbers[0] === idx + 1 && extractedNumbers.length > 1) {
        // First extracted number was likely the rank
        studentNumber = extractedNumbers.shift()!;
      }

      if (!name) {
        name = `تلميذ(ة) ${idx + 1}`;
      }

      const qScores: Record<string, number> = {};
      let finalTotal = 0;

      if (extractedNumbers.length >= questions.length && questions.length > 0) {
        // Detailed scores for all questions were provided
        let sum = 0;
        questions.forEach((q, qIdx) => {
          const qKey = q.id || `q${qIdx + 1}`;
          const max = q.maxScore || 3;
          let val = extractedNumbers[qIdx] ?? 0;
          val = Math.min(max, Math.max(0, Math.round(val * 2) / 2));
          qScores[qKey] = val;
          sum += val;
        });
        finalTotal = Math.round(sum * 2) / 2;
      } else if (extractedNumbers.length > 0) {
        // A single total score (or last number) was provided on 20
        const rawScore = extractedNumbers[extractedNumbers.length - 1];
        finalTotal = Math.min(totalTestPoints, Math.max(0, Math.round(rawScore * 2) / 2));

        // Distribute proportionally across questions
        const ratio = totalTestPoints > 0 ? (finalTotal / totalTestPoints) : 0;
        let runningSum = 0;

        questions.forEach((q, qIdx) => {
          const qKey = q.id || `q${qIdx + 1}`;
          const max = q.maxScore || 3;
          let val = Math.round((ratio * max) * 2) / 2;
          val = Math.min(max, Math.max(0, val));
          qScores[qKey] = val;
          runningSum += val;
        });

        // Fine tune remainder to make sum strictly equal finalTotal
        let diff = Math.round((finalTotal - runningSum) * 2) / 2;
        let qIdx = 0;
        while (diff !== 0 && qIdx < questions.length) {
          const qKey = questions[qIdx].id || `q${qIdx + 1}`;
          const max = questions[qIdx].maxScore || 3;
          if (diff > 0 && qScores[qKey] < max) {
            const add = Math.min(0.5, diff, max - qScores[qKey]);
            qScores[qKey] = Math.round((qScores[qKey] + add) * 2) / 2;
            diff = Math.round((diff - add) * 2) / 2;
          } else if (diff < 0 && qScores[qKey] > 0) {
            const sub = Math.min(0.5, Math.abs(diff), qScores[qKey]);
            qScores[qKey] = Math.round((qScores[qKey] - sub) * 2) / 2;
            diff = Math.round((diff + sub) * 2) / 2;
          }
          qIdx++;
        }
      } else {
        // No score provided -> default to 0
        questions.forEach((q, qIdx) => {
          qScores[q.id || `q${qIdx + 1}`] = 0;
        });
        finalTotal = 0;
      }

      let cat: 'متحكم' | 'في طور التحكم' | 'غير متحكم' = 'غير متحكم';
      if (finalTotal >= 14) cat = 'متحكم';
      else if (finalTotal >= 10) cat = 'في طور التحكم';
      else cat = 'غير متحكم';

      return {
        studentNumber,
        studentName: name,
        gender,
        scores: qScores,
        totalScore: finalTotal,
        percentage: totalTestPoints > 0 ? Math.round((finalTotal / totalTestPoints) * 100) : 0,
        levelCategory: cat
      };
    });
  };

  // Live parsed preview for import modal
  const previewParsedStudents = useMemo(() => {
    return parseImportData(importText);
  }, [importText, questions, totalPoints]);

  const handleConfirmImport = () => {
    if (previewParsedStudents.length === 0) {
      toast.error('يرجى لصق بيانات شبكة النقط أولاً');
      return;
    }

    updateStudentRow(previewParsedStudents);
    if (onRecalculateDossier) {
      onRecalculateDossier(previewParsedStudents);
    }
    setShowImportModal(false);
    setImportText('');
    toast.success(`تم استيراد شبكة نقط ${previewParsedStudents.length} تلميذاً وتحديث النتائج والتقرير وخطة الدعم بنجاح!`);
  };

  const handleLoadSampleData = () => {
    const sample = `1	أحمد المنصوري	ذكر	16.5
2	فاطمة الزهراء العلوي	أنثى	18.0
3	يوسف بنعلي	ذكر	12.5
4	خديجة العلمي	أنثى	14.0
5	كريم التازي	ذكر	8.5
6	سميرة الإدريسي	أنثى	11.0
7	عمر الشاوي	ذكر	15.0
8	سلمى الوردي	أنثى	9.0
9	حمزة بنجلون	ذكر	13.5
10	مريم القادري	أنثى	17.5
11	أمين الصنهاجي	ذكر	7.0
12	هند السوسي	أنثى	14.5
13	عثمان الفاسي	ذكر	10.5
14	إيمان الزياني	أنثى	8.0
15	زكرياء بنكيران	ذكر	15.5`;
    setImportText(sample);
  };
  const handleScoreChange = (studentIdx: number, questionId: string, value: number, maxScore: number) => {
    const validVal = Math.min(maxScore, Math.max(0, isNaN(value) ? 0 : value));
    
    const updated = students.map((st, idx) => {
      if (idx !== studentIdx) return st;

      const currentScores = st.scores || {};
      const newScores = { ...currentScores, [questionId]: validVal };

      // Recompute total
      let tot = 0;
      questions.forEach((q, qIdx) => {
        const qKey = q.id || `q${qIdx + 1}`;
        tot += (newScores[qKey] || 0);
      });
      tot = Math.round(tot * 2) / 2;

      let cat: 'متحكم' | 'في طور التحكم' | 'غير متحكم' = 'غير متحكم';
      if (tot >= 14) cat = 'متحكم';
      else if (tot >= 10) cat = 'في طور التحكم';
      else cat = 'غير متحكم';

      return {
        ...st,
        scores: newScores,
        totalScore: tot,
        percentage: Math.round((tot / totalPoints) * 100),
        levelCategory: cat
      };
    });

    updateStudentRow(updated);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const initialScores: Record<string, number> = {};
    questions.forEach((q, qIdx) => {
      initialScores[q.id || `q${qIdx + 1}`] = 0;
    });

    const newStudent: StudentScoreRow = {
      studentNumber: students.length + 1,
      studentName: newStudentName.trim(),
      gender: newStudentGender,
      scores: initialScores,
      totalScore: 0,
      percentage: 0,
      levelCategory: 'غير متحكم'
    };

    const updated = [...students, newStudent];
    updateStudentRow(updated);
    setNewStudentName('');
  };

  const handleRemoveStudent = (idx: number) => {
    const updated = students.filter((_, i) => i !== idx).map((s, i) => ({
      ...s,
      studentNumber: i + 1
    }));
    updateStudentRow(updated);
  };

  const handleRandomFillDemo = () => {
    const updated = students.map(st => {
      const newScores: Record<string, number> = {};
      let tot = 0;
      questions.forEach((q, qIdx) => {
        const qKey = q.id || `q${qIdx + 1}`;
        const max = q.maxScore || 3;
        // Generate realistic score (0.5 step)
        const randRatio = Math.random() > 0.35 ? (0.4 + Math.random() * 0.6) : (Math.random() * 0.5);
        let score = Math.round((randRatio * max) * 2) / 2;
        score = Math.min(max, Math.max(0, score));
        newScores[qKey] = score;
        tot += score;
      });
      tot = Math.round(tot * 2) / 2;

      let cat: 'متحكم' | 'في طور التحكم' | 'غير متحكم' = 'غير متحكم';
      if (tot >= 14) cat = 'متحكم';
      else if (tot >= 10) cat = 'في طور التحكم';
      else cat = 'غير متحكم';

      return {
        ...st,
        scores: newScores,
        totalScore: tot,
        percentage: Math.round((tot / totalPoints) * 100),
        levelCategory: cat
      };
    });

    updateStudentRow(updated);
    toast.success('تمت تعبئة نقط تجريبية نموذجية للقسم بنجاح.');
  };

  const handleResetScores = () => {
    const updated = students.map(st => {
      const zeroScores: Record<string, number> = {};
      questions.forEach((q, qIdx) => {
        zeroScores[q.id || `q${qIdx + 1}`] = 0;
      });
      return {
        ...st,
        scores: zeroScores,
        totalScore: 0,
        percentage: 0,
        levelCategory: 'غير متحكم' as const
      };
    });
    updateStudentRow(updated);
    toast.success('تم تصفير جميع النقط.');
  };

  const handleApplyRecalculation = () => {
    if (onRecalculateDossier) {
      onRecalculateDossier(students);
    } else if (onUpdateStudents) {
      onUpdateStudents(students);
    }
    toast.success('تم تحديث التقرير الإحصائي وخطة المعالجة وجذاذة الدعم بناءً على النقط المدخلة!');
  };

  // Live Aggregate metrics
  const totalCount = students.length;
  const acquisCount = students.filter(s => s.levelCategory === 'متحكم').length;
  const inProgressCount = students.filter(s => s.levelCategory === 'في طور التحكم').length;
  const nonAcquisCount = students.filter(s => s.levelCategory === 'غير متحكم').length;

  const avgScore = totalCount > 0 
    ? (students.reduce((acc, s) => acc + (s.totalScore || 0), 0) / totalCount).toFixed(2)
    : '0';

  // Per-question stats
  const questionStats = useMemo(() => {
    return questions.map((q, qIdx) => {
      const qKey = q.id || `q${qIdx + 1}`;
      const max = q.maxScore || 3;
      if (totalCount === 0) return { avg: 0, masteryRate: 0, max };

      const sum = students.reduce((acc, s) => acc + (s.scores?.[qKey] || 0), 0);
      const avg = Number((sum / totalCount).toFixed(2));
      // Mastery threshold: >= 50% of question points
      const masters = students.filter(s => (s.scores?.[qKey] || 0) >= (max / 2)).length;
      const masteryRate = Math.round((masters / totalCount) * 100);

      return { avg, masteryRate, max };
    });
  }, [students, questions, totalCount]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">شبكة تفريغ واستثمار نتائج التقويم التشخيصي</h3>
            <p className="text-xs text-slate-500">
              إدخال النقط وتصنيف المتعلمين آلياً حسب عتبات التحكم الرسمية وتحديث التقرير وخطة الدعم
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5 shadow-xs"
            title="لصق جدول شبكة النقط من مسار أو إكسيل مع ترتيب التلاميذ وأسمائهم والنقط المحصل عليها"
          >
            <FileSpreadsheet size={15} className="text-indigo-600" />
            <span>استيراد شبكة النقط والنتائج (Excel / مسار)</span>
          </button>

          <button
            onClick={handleApplyRecalculation}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all flex items-center gap-1.5"
            title="تحديث التقرير وخطة المعالجة بناءً على نتائج النقط المدخلة"
          >
            <Sparkles size={15} />
            <span>تحديث التقرير وخطة الدعم</span>
          </button>

          <button
            onClick={() => downloadDiagnosticReportDocx(dossier)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download size={15} />
            <span>تصدير Word (.docx)</span>
          </button>
        </div>
      </div>

      {/* Live Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-bold">مجموع التلاميذ المفحوصين</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800">{totalCount}</span>
            <Users size={20} className="text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500">المعدل العام: <strong className="text-indigo-600 font-bold">{avgScore}/20</strong></p>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-bold">متحكم (14 - 20)</p>
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700">{acquisCount}</span>
          <p className="text-[11px] text-emerald-700 font-bold">
            {totalCount > 0 ? Math.round((acquisCount / totalCount) * 100) : 0}% من المفحوصين
          </p>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-bold">في طور التحكم (10 - 13.75)</p>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700">{inProgressCount}</span>
          <p className="text-[11px] text-amber-700 font-bold">
            {totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0}% من المفحوصين
          </p>
        </div>

        <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-800 font-bold">غير متحكم (أقل من 10)</p>
            <XCircle size={18} className="text-red-600" />
          </div>
          <span className="text-2xl font-black text-red-700">{nonAcquisCount}</span>
          <p className="text-[11px] text-red-700 font-bold">
            {totalCount > 0 ? Math.round((nonAcquisCount / totalCount) * 100) : 0}% (فئة الدعم ذات الأولوية)
          </p>
        </div>
      </div>

      {/* Quick Tools & Add Student Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Add Student Form */}
          <form onSubmit={handleAddStudent} className="flex-1 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="إضافة اسم ونسب تلميذ جديد..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 min-w-[220px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={newStudentGender}
              onChange={(e) => setNewStudentGender(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
            >
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>

            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus size={14} />
              <span>إضافة تلميذ</span>
            </button>
          </form>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
            <button
              onClick={handleRandomFillDemo}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-all flex items-center gap-1"
              title="تعبئة نقط نموذجية للتجربة"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>تعبئة تجريبية</span>
            </button>

            <button
              onClick={handleResetScores}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1"
              title="تصفير جميع النقط للبدء في التفريغ"
            >
              <RotateCcw size={13} />
              <span>تصفير النقط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Scoring Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 text-center w-10">الرقم</th>
                <th className="p-3 min-w-[170px]">اسم ونسب المتعلم(ة)</th>
                <th className="p-3 text-center w-14">الجنس</th>
                {questions.map((q, qIdx) => {
                  const keyId = q.id ? `${q.id}-${qIdx}` : `q-${qIdx}`;
                  return (
                    <th key={keyId} className="p-2 text-center min-w-[70px]">
                      <div className="font-black text-slate-800">س {q.number || qIdx + 1}</div>
                      <div className="text-[10px] text-indigo-600 font-bold">({q.maxScore || 3}ن)</div>
                    </th>
                  );
                })}
                <th className="p-3 text-center min-w-[85px] bg-slate-200/70 font-black">المجموع / 20</th>
                <th className="p-3 text-center min-w-[110px]">فئة التحكم</th>
                <th className="p-3 text-center w-10">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, sIdx) => {
                const categoryBadge = 
                  student.levelCategory === 'متحكم' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : student.levelCategory === 'في طور التحكم'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-red-100 text-red-800 border-red-200';

                return (
                  <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400">{student.studentNumber}</td>
                    <td className="p-3 font-bold text-slate-800">{student.studentName}</td>
                    <td className="p-3 text-center text-slate-500 font-semibold">{student.gender}</td>
                    
                    {questions.map((q, qIdx) => {
                      const qKey = q.id || `q${qIdx + 1}`;
                      const curVal = (student.scores && typeof student.scores[qKey] === 'number')
                        ? student.scores[qKey]
                        : 0;
                      return (
                        <td key={`st-${sIdx}-q-${qIdx}-${qKey}`} className="p-1.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={q.maxScore || 5}
                            step="0.5"
                            value={curVal}
                            onChange={(e) => handleScoreChange(sIdx, qKey, parseFloat(e.target.value), q.maxScore || 5)}
                            className="w-12 text-center bg-slate-50 border border-slate-300 rounded-lg py-1 text-xs font-bold focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                          />
                        </td>
                      );
                    })}

                    <td className="p-3 text-center font-black text-sm bg-slate-50/80">
                      <span className={student.totalScore >= 10 ? 'text-emerald-700' : 'text-red-600'}>
                        {student.totalScore}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${categoryBadge}`}>
                        {student.levelCategory}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleRemoveStudent(sIdx)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                        title="حذف المتعلم"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Bottom Row: Question Mastery Summary */}
            <tfoot>
              <tr className="bg-indigo-50/70 border-t-2 border-indigo-200 font-bold text-indigo-950">
                <td colSpan={3} className="p-3 text-right">
                  <div className="font-black text-xs">نسبة التمكن من كل سؤال (معدل القسم):</div>
                  <div className="text-[10px] text-indigo-700 font-medium">مؤشر رصد الكفايات المتعثرة التي تتطلب الدعم</div>
                </td>
                {questionStats.map((st, idx) => (
                  <td key={idx} className="p-2 text-center">
                    <div className="font-black text-xs text-indigo-900">{st.avg} <span className="text-[9px] text-indigo-600">/{st.max}</span></div>
                    <div className={`text-[10px] font-bold ${st.masteryRate >= 60 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {st.masteryRate}%
                    </div>
                  </td>
                ))}
                <td className="p-3 text-center font-black text-indigo-900 bg-indigo-100/50">
                  {avgScore}/20
                </td>
                <td colSpan={2} className="p-2 text-center text-[10px] text-indigo-700 font-semibold">
                  {totalCount > 0 ? `${Math.round(((acquisCount + inProgressCount) / totalCount) * 100)}% تحكم إجمالي` : '-'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal for Importing Grade Sheet & Students Matrix */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-700 font-black text-base">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">استيراد شبكة النقط والنتائج (Excel / مسار)</h4>
                  <p className="text-[11px] text-slate-500 font-normal">الترتيب، الاسم الكامل، والنقطة المحصل عليها لتعديل المؤشرات فوراً</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 pl-1">
              <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100/80 text-xs text-indigo-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <HelpCircle size={14} className="text-indigo-600 shrink-0" />
                  <span>طريقة الاستيراد واللصق المباشر:</span>
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  يمكنك نسخ أعمدة النتائج مباشرة من برنامج <strong>مسار (Massar)</strong> أو من جدول <strong>Excel</strong> ولصقها هنا.
                  يقبل النظام كلاً من: <br/>
                  • <code>[الرقم/الترتيب] [TAB] [الاسم الكامل] [TAB] [النقطة /20] [TAB] [الجنس]</code> <br/>
                  • أو لصق نقط الأسئلة المفصلة مباشرة: <code>[الاسم] [TAB] [س1] [TAB] [س2] [TAB] ... [TAB] [المجموع]</code>
                </p>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">محتوى الجدول المنسوخ:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>تحميل نموذج تجريبي جاهز</span>
                  </button>
                  {importText && (
                    <button
                      type="button"
                      onClick={() => setImportText('')}
                      className="text-[11px] font-bold text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>

              {/* Paste Textarea */}
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="1	أحمد المنصوري	ذكر	15.5&#10;2	فاطمة الزهراء العلوي	أنثى	17.0&#10;3	يوسف بنعلي	ذكر	11.5&#10;4	خديجة العلمي	أنثى	13.0&#10;5	كريم التازي	ذكر	8.5..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-mono font-bold leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />

              {/* Live Preview Section */}
              {previewParsedStudents.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      <span>معاينة البيانات المستخرجة ({previewParsedStudents.length} تلميذاً):</span>
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        المعدل: {(previewParsedStudents.reduce((acc, s) => acc + (s.totalScore || 0), 0) / previewParsedStudents.length).toFixed(2)}/20
                      </span>
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200">
                      <span className="font-bold">متحكم: </span>
                      <strong className="font-black text-sm">{previewParsedStudents.filter(s => s.levelCategory === 'متحكم').length}</strong>
                    </div>
                    <div className="bg-amber-50 text-amber-800 p-2 rounded-xl border border-amber-200">
                      <span className="font-bold">في طور التحكم: </span>
                      <strong className="font-black text-sm">{previewParsedStudents.filter(s => s.levelCategory === 'في طور التحكم').length}</strong>
                    </div>
                    <div className="bg-red-50 text-red-800 p-2 rounded-xl border border-red-200">
                      <span className="font-bold">غير متحكم: </span>
                      <strong className="font-black text-sm">{previewParsedStudents.filter(s => s.levelCategory === 'غير متحكم').length}</strong>
                    </div>
                  </div>

                  {/* Mini preview table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-1.5 text-center w-8">#</th>
                          <th className="p-1.5">الاسم الكامل</th>
                          <th className="p-1.5 text-center w-12">الجنس</th>
                          <th className="p-1.5 text-center w-16">النقطة</th>
                          <th className="p-1.5 text-center w-24">الفئة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewParsedStudents.slice(0, 10).map((st, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-1.5 text-center text-slate-400 font-bold">{st.studentNumber}</td>
                            <td className="p-1.5 font-bold text-slate-800">{st.studentName}</td>
                            <td className="p-1.5 text-center text-slate-500">{st.gender}</td>
                            <td className="p-1.5 text-center font-black text-indigo-700">{st.totalScore}/20</td>
                            <td className="p-1.5 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                st.levelCategory === 'متحكم' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : st.levelCategory === 'في طور التحكم'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {st.levelCategory}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {previewParsedStudents.length > 10 && (
                          <tr>
                            <td colSpan={5} className="p-1.5 text-center text-slate-400 text-[10px] italic">
                              ... والمزيد ({previewParsedStudents.length - 10} تلميذاً إضافياً)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
              <span className="text-xs text-slate-500">
                {previewParsedStudents.length > 0 
                  ? `سيتم استبدال الشبكة الحالية وتحديث التقرير والدعم فوراً`
                  : 'ألصق بيانات القسم للبدء'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={previewParsedStudents.length === 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg"
                >
                  <Check size={16} />
                  <span>تأكيد واستيراد شبكة النقط وتحديث النتائج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

