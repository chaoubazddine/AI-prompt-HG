import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MoroccanLevel, 
  EducationCycle, 
  DiagnosticDossier,
  StudentScoreRow
} from '../../types/diagnostic';
import { DIAGNOSTIC_FRAMEWORKS } from '../../constants/diagnosticData';
import { generateDiagnosticDossier } from '../../services/diagnosticService';
import { DiagnosticTestView } from './DiagnosticTestView';
import { DiagnosticScoringView } from './DiagnosticScoringView';
import { DiagnosticReportView } from './DiagnosticReportView';
import { DiagnosticRemediationView } from './DiagnosticRemediationView';
import { DiagnosticSupportJadhaView } from './DiagnosticSupportJadhaView';
import { 
  ClipboardCheck, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Users, 
  BarChart3, 
  Target, 
  CheckCircle2, 
  Download, 
  Info, 
  RefreshCw, 
  ChevronRight, 
  Award,
  Layers,
  HelpCircle,
  FolderDown,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { trackUserUsage, checkAndRecordDownload } from '../../services/usageTracker';
import { 
  downloadDiagnosticTestDocx, 
  downloadDiagnosticReportDocx, 
  downloadRemediationPlanDocx, 
  downloadSupportJadhaDocx 
} from '../../utils/diagnosticWordExport';

interface Props {
  profInfo: {
    name: string;
    academy: string;
    directorate: string;
    school: string;
    year: string;
  };
  onBack?: () => void;
}

export const DiagnosticHub: React.FC<Props> = ({ profInfo, onBack }) => {
  const [cycle, setCycle] = useState<EducationCycle>('prep');
  const [level, setLevel] = useState<MoroccanLevel>('الأولى إعدادي');
  const [classGroup, setClassGroup] = useState('1/1');
  const [customFocus, setCustomFocus] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [dossier, setDossier] = useState<DiagnosticDossier | null>(null);
  const [activeTab, setActiveTab] = useState<'test' | 'scoring' | 'report' | 'remediation' | 'jadha'>('test');
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Available levels for selected cycle
  const levels: MoroccanLevel[] = cycle === 'prep' 
    ? ['الأولى إعدادي', 'الثانية إعدادي', 'الثالثة إعدادي']
    : ['الجذع المشترك', 'الأولى باك', 'الثانية باك'];

  const currentFramework = DIAGNOSTIC_FRAMEWORKS[level] || DIAGNOSTIC_FRAMEWORKS['الأولى إعدادي'];

  // Switch level when cycle changes
  useEffect(() => {
    if (cycle === 'prep' && !['الأولى إعدادي', 'الثانية إعدادي', 'الثالثة إعدادي'].includes(level)) {
      setLevel('الأولى إعدادي');
    } else if (cycle === 'secondary' && !['الجذع المشترك', 'الأولى باك', 'الثانية باك'].includes(level)) {
      setLevel('الجذع المشترك');
    }
  }, [cycle]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('جاري إعداد ملف التقويم التشخيصي المعتمد وفق التوجيهات الرسمية...');

    try {
      const generated = await generateDiagnosticDossier(
        level,
        cycle,
        {
          academy: profInfo.academy || 'جهة الدار البيضاء سطات',
          directorate: profInfo.directorate || 'سيدي البرنوصي',
          school: profInfo.school || '',
          teacherName: profInfo.name || '',
          academicYear: profInfo.year || '2025/2026',
          classGroup: classGroup || 'فوج 1'
        },
        customFocus
      );

      setDossier(generated);
      trackUserUsage('diagnostic', `تقويم تشخيصي: ${level}`);
      toast.success(`تم إنشاء ملف التقويم التشخيصي لمستوى ${level} بنجاح!`, { id: toastId });
    } catch (err: any) {
      console.error("Diagnostic generation failed:", err);
      toast.error('حدث خطأ أثناء الإنشاء، يرجى المحاولة مرة أخرى', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStudents = (updatedStudents: StudentScoreRow[]) => {
    if (!dossier) return;
    
    // Recalculate stats
    const totalTested = updatedStudents.length;
    const acquis = updatedStudents.filter(s => s.levelCategory === 'متحكم').length;
    const inProg = updatedStudents.filter(s => s.levelCategory === 'في طور التحكم').length;
    const nonAcq = updatedStudents.filter(s => s.levelCategory === 'غير متحكم').length;

    const avg = totalTested > 0 ? Number((updatedStudents.reduce((acc, s) => acc + (s.totalScore || 0), 0) / totalTested).toFixed(2)) : 0;
    const highest = updatedStudents.length > 0 ? Math.max(...updatedStudents.map(s => s.totalScore || 0)) : 0;
    const lowest = updatedStudents.length > 0 ? Math.min(...updatedStudents.map(s => s.totalScore || 0)) : 0;
    const successRate = totalTested > 0 ? Number((((acquis + inProg) / totalTested) * 100).toFixed(1)) : 0;

    // Recalculate domain analyses if questions exist
    const domainAnalyses = (dossier.report.domainAnalyses || []).map(domain => {
      const domainQuestions = (dossier.test?.questions || []).filter(q => q.domain === domain.domain);
      if (domainQuestions.length === 0 || totalTested === 0) return domain;

      let totalDomainPoints = 0;
      let earnedDomainPoints = 0;

      domainQuestions.forEach(q => {
        const qKey = q.id || `q${q.number}`;
        const maxScore = q.maxScore || 3;
        totalDomainPoints += maxScore * totalTested;
        updatedStudents.forEach(st => {
          earnedDomainPoints += (st.scores?.[qKey] || 0);
        });
      });

      const successPct = totalDomainPoints > 0 ? Math.round((earnedDomainPoints / totalDomainPoints) * 100) : domain.successRate;
      let masteryLevel = domain.masteryLevel;
      if (successPct >= 70) masteryLevel = 'تحكم متقدم';
      else if (successPct >= 50) masteryLevel = 'تحكم متوسط';
      else masteryLevel = 'تعثر يستدعي الدعم';

      return {
        ...domain,
        successRate: successPct,
        masteryLevel
      };
    });

    const nonAcquisNames = updatedStudents.filter(s => s.levelCategory === 'غير متحكم').map(s => s.studentName);
    const inProgressNames = updatedStudents.filter(s => s.levelCategory === 'في طور التحكم').map(s => s.studentName);
    const acquisNames = updatedStudents.filter(s => s.levelCategory === 'متحكم').map(s => s.studentName);
    const femaleTestedCount = updatedStudents.filter(s => s.gender === 'أنثى').length;

    // Update support groups with actual student lists if plan exists
    const updatedSupportGroups = (dossier.remediationPlan?.supportGroups || []).map(group => {
      if (group.category === 'غير متحكم') {
        return {
          ...group,
          studentCount: nonAcq,
          targetedStudents: nonAcquisNames.length > 0 ? nonAcquisNames : group.targetedStudents
        };
      } else if (group.category === 'في طور التحكم') {
        return {
          ...group,
          studentCount: inProg,
          targetedStudents: inProgressNames.length > 0 ? inProgressNames : group.targetedStudents
        };
      } else {
        return {
          ...group,
          studentCount: acquis,
          targetedStudents: acquisNames.length > 0 ? acquisNames : group.targetedStudents
        };
      }
    });

    const updatedDossier: DiagnosticDossier = {
      ...dossier,
      sampleScoringGrid: { sampleStudents: updatedStudents },
      report: {
        ...dossier.report,
        institutionInfo: {
          ...dossier.report.institutionInfo,
          totalTested: totalTested,
          totalEnrolled: Math.max(dossier.report.institutionInfo?.totalEnrolled || 0, totalTested),
          femaleTested: femaleTestedCount,
          femaleEnrolled: Math.max(dossier.report.institutionInfo?.femaleEnrolled || 0, femaleTestedCount)
        },
        overallStats: {
          averageScore: avg,
          highestScore: highest,
          lowestScore: lowest,
          successRate: successRate
        },
        categoriesStats: [
          {
            category: 'متحكم',
            minThreshold: '14 - 20',
            studentCount: acquis,
            percentage: totalTested > 0 ? Number(((acquis / totalTested) * 100).toFixed(1)) : 0,
            description: dossier.report.categoriesStats[0]?.description || 'تحكم متين وتفوق في مكتسبات السلك السابق',
            characteristics: dossier.report.categoriesStats[0]?.characteristics || []
          },
          {
            category: 'في طور التحكم',
            minThreshold: '10 - 13.75',
            studentCount: inProg,
            percentage: totalTested > 0 ? Number(((inProg / totalTested) * 100).toFixed(1)) : 0,
            description: dossier.report.categoriesStats[1]?.description || 'تحكم جزئي مع وجود بعض الثغرات المنهجية',
            characteristics: dossier.report.categoriesStats[1]?.characteristics || []
          },
          {
            category: 'غير متحكم',
            minThreshold: 'أقل من 10',
            studentCount: nonAcq,
            percentage: totalTested > 0 ? Number(((nonAcq / totalTested) * 100).toFixed(1)) : 0,
            description: dossier.report.categoriesStats[2]?.description || 'تعثرات بنيوية عميقة تستدعي دعماً استدراكياً فورياً',
            characteristics: dossier.report.categoriesStats[2]?.characteristics || []
          }
        ],
        domainAnalyses
      },
      remediationPlan: dossier.remediationPlan ? {
        ...dossier.remediationPlan,
        supportGroups: updatedSupportGroups
      } : dossier.remediationPlan
    };

    setDossier(updatedDossier);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 text-right" dir="rtl">
      
      {/* Hero / Header Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                <ClipboardCheck size={14} />
                <span>المقرر الوزاري لتنظيم السنة الدراسية - مادة الاجتماعيات</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                فضاء التقويم التشخيصي والدعم الاستدراكي
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                إنشاء روائز التقويم التشخيصي المعتمدة، شبكات تفريغ النقط ومصفوفة التفيؤ، التقارير التربوية الإحصائية، وخطط وجذاذات الدعم والمعالجة حسب الأسلاك التعليمية.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <Info size={16} className="text-indigo-600" />
                <span>{showGuidelines ? 'إخفاء التوجيهات البيداغوجية' : 'التوجيهات والأطر المرجعية'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Collapsible Official Pedagogical Guidelines */}
        <AnimatePresence>
          {showGuidelines && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-indigo-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-300" />
                    <h3 className="font-black text-base">
                      الإطار المرجعي للتقويم التشخيصي لمستوى {level} (تشخيص مكتسبات {currentFramework.prerequisiteLevel})
                    </h3>
                  </div>
                  <span className="text-xs bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-full font-bold">
                    المذكرات الوزارية المنظمة
                  </span>
                </div>

                <p className="text-xs text-indigo-100 leading-relaxed">
                  {currentFramework.frameworkContext}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  {currentFramework.keyDomains.map((kd, idx) => (
                    <div key={idx} className="bg-indigo-800/60 p-3.5 rounded-2xl border border-indigo-700/60 space-y-2">
                      <p className="font-bold text-indigo-200">{kd.domain}</p>
                      <ul className="space-y-1 text-indigo-100 list-disc list-inside text-[11px] pr-1">
                        {kd.competencies.map((comp, ci) => (
                          <li key={ci}>{comp}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-indigo-950/70 p-3.5 rounded-2xl border border-indigo-800 space-y-1">
                    <p className="font-bold text-amber-300">أبرز التعثرات الشائعة المرصودة:</p>
                    <ul className="space-y-1 text-indigo-200 list-disc list-inside text-[11px]">
                      {currentFramework.commonMisconceptions.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-950/70 p-3.5 rounded-2xl border border-indigo-800 space-y-1">
                    <p className="font-bold text-emerald-300">أولويات الدعم والاستدراك الموصى بها:</p>
                    <ul className="space-y-1 text-indigo-200 list-disc list-inside text-[11px]">
                      {currentFramework.remediationPriorities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration & Generation Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <span>تحديد المعطيات وتوليد ملف التقويم التشخيصي</span>
            </h3>
            <span className="text-xs text-slate-500">
              المؤسسة: <strong>{profInfo.school || 'المؤسسة التعليمية'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cycle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">السلك التعليمي:</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCycle('prep')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${cycle === 'prep' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  الثانوي الإعدادي
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('secondary')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${cycle === 'secondary' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  الثانوي التأهيلي
                </button>
              </div>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">المستوى الدراسي المستهدف:</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as MoroccanLevel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {levels.map((lvl, lvlIdx) => (
                  <option key={`diag-lvl-${lvlIdx}-${lvl}`} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Class Group */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">الفوج / القسم:</label>
              <input
                type="text"
                value={classGroup}
                onChange={(e) => setClassGroup(e.target.value)}
                placeholder="مثال: 1/1 أو 2/3"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Custom Focus / Optional */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">تركيز أو توجيه خاص (اختياري):</label>
              <input
                type="text"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                placeholder="مثال: التركيز على قراءة الخرائط والنهج التاريخي"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto bg-[#4F46E5] text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>جاري إعداد وتحليل ملف التقويم التشخيصي...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>توليد ملف التقويم التشخيصي الشامل لمستوى {level}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dossier Viewer if generated */}
        {dossier && (
          <div className="space-y-5">
            {/* Navigation Tabs Bar */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto p-1">
                <button
                  onClick={() => setActiveTab('test')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'test' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText size={15} />
                  <span>1. الرائز وعناصر الإجابة</span>
                </button>

                <button
                  onClick={() => setActiveTab('scoring')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'scoring' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users size={15} />
                  <span>2. شبكة التفريغ والتفيؤ</span>
                </button>

                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'report' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 size={15} />
                  <span>3. التقرير والتحليل النوعي</span>
                </button>

                <button
                  onClick={() => setActiveTab('remediation')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'remediation' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Target size={15} />
                  <span>4. خطة الدعم والمعالجة</span>
                </button>

                <button
                  onClick={() => setActiveTab('jadha')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'jadha' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Award size={15} />
                  <span>5. جذاذة أنشطة الدعم</span>
                </button>
              </div>

              {/* Bulk Export Button */}
              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={async () => {
                    if (!dossier) return;
                    const allowed = await checkAndRecordDownload(`تحميل الملف الشامل للتقويم التشخيصي (${dossier.level})`);
                    if (!allowed) return;
                    downloadDiagnosticTestDocx(dossier);
                    setTimeout(() => downloadDiagnosticReportDocx(dossier), 600);
                    setTimeout(() => downloadRemediationPlanDocx(dossier), 1200);
                    setTimeout(() => downloadSupportJadhaDocx(dossier), 1800);
                    toast.success('جاري تصدير جميع وثائق ملف التقويم التشخيصي بصيغة Word RTL!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  title="تحميل جميع وثائق الملف دفعة واحدة"
                >
                  <FolderDown size={15} />
                  <span>تحميل الملف كاملاً (.docx)</span>
                </button>
              </div>
            </div>

            {/* Active Tab View */}
            <div className="transition-all">
              {activeTab === 'test' && <DiagnosticTestView dossier={dossier} />}
              {activeTab === 'scoring' && (
                <DiagnosticScoringView 
                  dossier={dossier} 
                  onUpdateStudents={handleUpdateStudents} 
                  onRecalculateDossier={handleUpdateStudents}
                />
              )}
              {activeTab === 'report' && <DiagnosticReportView dossier={dossier} />}
              {activeTab === 'remediation' && <DiagnosticRemediationView dossier={dossier} />}
              {activeTab === 'jadha' && <DiagnosticSupportJadhaView dossier={dossier} />}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
