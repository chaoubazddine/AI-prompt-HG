/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  Award, 
  Compass, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Check
} from 'lucide-react';

export interface JadhaStep {
  phase: string;
  subPhase?: string;
  teacherActivities?: string;
  studentActivities?: string;
  tools?: string;
  timing?: string;
  evaluation?: string;
  workForm?: string;
  isHeader?: boolean;
  isSynthesis?: boolean;
  isEvaluation?: boolean;
}

export interface KeyConceptItem {
  term: string;
  definition: string;
}

export interface DidacticExtensions {
  priorPrerequisites?: string[];
  subsequentLessons?: string[];
  crossCurricular?: string[];
}

export interface DifferentiationActivities {
  remedial?: string[];
  enrichment?: string[];
}

export interface EvaluationCriterion {
  criterion: string;
  indicators: string[];
  targetLevel?: string;
}

export interface JadhaData {
  title: string;
  level: string;
  year: string;
  duration: string;
  unit: string;
  unitNumber?: string;
  lessonNumber?: string;
  module?: string;
  academy?: string;
  directorate?: string;
  school?: string;
  teacherName?: string;
  inspectorName?: string;
  references?: string;
  competencies: string[];
  capabilities: string[];
  objectives: {
    cognitive: string[];
    skill: string[];
    affective: string[];
  };
  problematic?: string;
  keyConcepts?: KeyConceptItem[];
  didacticExtensions?: DidacticExtensions;
  differentiationActivities?: DifferentiationActivities;
  evaluationGrid?: EvaluationCriterion[];
  teacherNotes?: string;
  introductionSteps: JadhaStep[];
  steps: JadhaStep[];
  summary?: string;
  finalEvaluation?: string[];
}

interface TableJadhaProps {
  data: JadhaData;
  onUpdateData?: (updated: JadhaData) => void;
}

export const TableJadha: React.FC<TableJadhaProps> = ({ data, onUpdateData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<JadhaData>(data);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Sync if prop updates and not currently editing
  React.useEffect(() => {
    if (!isEditing) {
      setEditableData(data);
    }
  }, [data, isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateData) {
      onUpdateData(editableData);
    }
  };

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const currentData = isEditing ? editableData : data;

  return (
    <div 
      className="w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 bg-white text-black font-sans print:p-0 print:max-w-none text-right transition-all" 
      style={{ backgroundColor: '#ffffff', color: '#000000' }} 
      dir="rtl"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.7cm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
          }
          .jadha-section {
            page-break-inside: avoid !important;
          }
        }
        .jadha-table td, .jadha-table th {
          border: 1px solid black !important;
        }
      `}} />

      {/* Editor & Control Bar (Screen only) */}
      <div className="no-print mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={16} className="text-indigo-600" />
            جذاذة تربوية معيارية موسّعة
          </span>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
            وفق الأطر التوجيهية الرسمية
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save size={14} />
              <span>حفظ التعديلات</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Edit3 size={14} />
              <span>تعديل محتوى الجذاذة</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Header Structure (3-box Moroccan Standard Grid) */}
      <div className="flex border border-black mb-3 text-[10px] leading-tight min-h-[110px] jadha-section" dir="rtl">
        {/* Right Box (Arabic RTL) */}
        <div className="w-[32%] border-l border-black p-3 space-y-1.5 flex flex-col justify-center bg-white">
          <p className="break-words">
            الأكاديمية: {isEditing ? (
              <input 
                type="text" 
                value={editableData.academy || ''} 
                onChange={e => setEditableData({...editableData, academy: e.target.value})}
                className="border border-slate-300 p-0.5 rounded text-[10px] w-36"
              />
            ) : (currentData.academy || 'جهة الدار البيضاء سطات')}
          </p>
          <p className="break-words">
            المديرية الإقليمية: {isEditing ? (
              <input 
                type="text" 
                value={editableData.directorate || ''} 
                onChange={e => setEditableData({...editableData, directorate: e.target.value})}
                className="border border-slate-300 p-0.5 rounded text-[10px] w-36"
              />
            ) : (currentData.directorate || 'سيدي البرنوصي')}
          </p>
          <p className="break-words">المادة: <span className="font-bold">{currentData.unit || 'الاجتماعيات'}</span></p>
          <p className="break-words">المراجع: {currentData.references || 'المقرر المدرسي المعتمد - التوجيهات الرسمية'}</p>
          <p className="break-words">الوحدة: {currentData.unitNumber || 'الأولى'}</p>
        </div>
        
        {/* Center Box */}
        <div className="w-[36%] border-l border-black p-3 flex flex-col items-center justify-center text-center bg-white">
          <p className="text-[10px] text-slate-800 font-bold break-words w-full mb-1">
            {isEditing ? (
              <input 
                type="text" 
                value={editableData.school || ''} 
                onChange={e => setEditableData({...editableData, school: e.target.value})}
                placeholder="اسم المؤسسة التعليمية"
                className="border border-slate-300 p-0.5 rounded text-[10px] text-center w-full"
              />
            ) : (currentData.school || 'المؤسسة التعليمية')}
          </p>
          <p className="font-bold text-[11px] text-blue-800 break-words w-full mb-1">
            {currentData.lessonNumber || 'الدرس 01'}
          </p>
          <h1 className="font-bold text-sm md:text-base leading-snug break-words w-full text-red-600">
            {isEditing ? (
              <input 
                type="text" 
                value={editableData.title} 
                onChange={e => setEditableData({...editableData, title: e.target.value})}
                className="border border-slate-300 p-1 rounded font-bold text-center w-full text-red-600"
              />
            ) : currentData.title}
          </h1>
        </div>
        
        {/* Left Box */}
        <div className="w-[32%] p-3 space-y-1.5 flex flex-col justify-center bg-white">
          <p className="break-words">الموسم الدراسي: {currentData.year || '2025/2026'}</p>
          <p className="break-words">
            إعداد الأستاذ(ة): {isEditing ? (
              <input 
                type="text" 
                value={editableData.teacherName || ''} 
                onChange={e => setEditableData({...editableData, teacherName: e.target.value})}
                placeholder="اسم الأستاذ"
                className="border border-slate-300 p-0.5 rounded text-[10px] w-32"
              />
            ) : (currentData.teacherName || 'أستاذ المادة')}
          </p>
          <p className="break-words">
            الغلاف الزمني: {isEditing ? (
              <input 
                type="text" 
                value={editableData.duration} 
                onChange={e => setEditableData({...editableData, duration: e.target.value})}
                className="border border-slate-300 p-0.5 rounded text-[10px] w-28"
              />
            ) : (currentData.duration || 'ساعتان (2س)')}
          </p>
          <p className="break-words">المستوى: <span className="font-bold">{currentData.level || 'الثالثة إعدادي'}</span></p>
          <p className="break-words text-[9px] leading-snug text-slate-700">
            المجزوءة/الدورة: {currentData.module || 'الدورة الأولى / المجزوءة الأولى'}
          </p>
        </div>
      </div>

      {/* Competencies, Capacities, Objectives Table (3-Columns) */}
      <div className="grid grid-cols-3 border border-black mb-3 text-[10px] jadha-section" dir="rtl">
        {/* Right: الكفايات المستهدفة */}
        <div className="border-l border-black p-0 flex flex-col">
          <h3 className="font-bold text-center border-b border-black p-1.5 bg-[#e6f0fa] text-black">
            الكفايات المستهدفة (المنهجية، التواصلية، والقيمية)
          </h3>
          <div className="p-2.5 flex-1 bg-white">
            <ul className="list-none space-y-1.5 text-black">
              {currentData.competencies.map((c, i) => (
                <li key={i} className="leading-relaxed">
                  • <span className="font-semibold">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle: القدرات */}
        <div className="border-l border-black p-0 flex flex-col">
          <h3 className="font-bold text-center border-b border-black p-1.5 bg-[#e6f0fa] text-black">
            القدرات والمهارات الأساسية
          </h3>
          <div className="p-2.5 flex-1 bg-white">
            <ul className="list-none space-y-1.5 text-black">
              {currentData.capabilities.map((c, i) => (
                <li key={i} className="leading-relaxed">• {c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Left: الأهداف التعلمية الإجرائية */}
        <div className="p-0 flex flex-col">
          <h3 className="font-bold text-center border-b border-black p-1.5 bg-[#e6f0fa] text-black">
            أهداف التعلم (معرفية، مهارية، ووجدانية)
          </h3>
          <div className="p-2.5 flex-1 bg-white">
            <ul className="list-none space-y-1 text-black">
              {currentData.objectives.cognitive?.map((o, i) => (
                <li key={`cog-${i}`} className="leading-relaxed">
                  <span className="font-bold text-indigo-900">[معرفي]</span> {o}
                </li>
              ))}
              {currentData.objectives.skill?.map((o, i) => (
                <li key={`skl-${i}`} className="leading-relaxed">
                  <span className="font-bold text-emerald-900">[مهاري]</span> {o}
                </li>
              ))}
              {currentData.objectives.affective?.map((o, i) => (
                <li key={`aff-${i}`} className="leading-relaxed">
                  <span className="font-bold text-amber-900">[وجداني]</span> {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ENRICHMENT SECTION 1: Key Concepts & Terms Glossary (المفاهيم والمصطلحات المهيكلة) */}
      {currentData.keyConcepts && currentData.keyConcepts.length > 0 && (
        <div className="mb-3 border border-black p-2.5 bg-slate-50/50 text-[10px] jadha-section">
          <div className="flex items-center justify-between border-b border-black/30 pb-1 mb-1.5">
            <h4 className="font-bold text-black flex items-center gap-1">
              <BookOpen size={13} className="text-indigo-700" />
              المفاهيم والمصطلحات المركزية المؤطرة للدرس (معجم المادة):
            </h4>
            <span className="text-[9px] text-slate-600">مطابقة للأطر المرجعية المعتمدة</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {currentData.keyConcepts.map((item, idx) => (
              <div key={idx} className="bg-white p-1.5 border border-slate-300 rounded">
                <span className="font-black text-indigo-900 block mb-0.5">• {item.term}:</span>
                <p className="text-slate-800 text-[9.5px] leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENRICHMENT SECTION 2: Didactic Extensions & Cross-Curricular Links (الامتدادات والتقاطعات) */}
      {currentData.didacticExtensions && (
        <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-0 border border-black text-[9.5px] jadha-section">
          {/* M مكتسبات سابقة */}
          <div className="border-b sm:border-b-0 sm:border-l border-black p-2 bg-white">
            <h5 className="font-bold text-black border-b border-slate-200 pb-1 mb-1 flex items-center gap-1">
              <Compass size={12} className="text-blue-700" />
              المكتسبات القبلية:
            </h5>
            <ul className="list-none space-y-0.5 text-slate-800">
              {(currentData.didacticExtensions.priorPrerequisites || ['مكتسبات السنوات السابقة', 'مفاهيم الوحدة السابقة']).map((item, i) => (
                <li key={i} className="leading-snug">- {item}</li>
              ))}
            </ul>
          </div>

          {/* امتدادات مرتقبة */}
          <div className="border-b sm:border-b-0 sm:border-l border-black p-2 bg-white">
            <h5 className="font-bold text-black border-b border-slate-200 pb-1 mb-1 flex items-center gap-1">
              <Layers size={12} className="text-emerald-700" />
              الامتدادات اللاحقة:
            </h5>
            <ul className="list-none space-y-0.5 text-slate-800">
              {(currentData.didacticExtensions.subsequentLessons || ['الدروس اللاحقة بنفس المكون', 'مقررات السلك الموالي']).map((item, i) => (
                <li key={i} className="leading-snug">- {item}</li>
              ))}
            </ul>
          </div>

          {/* تقاطعات مع مواد أخرى */}
          <div className="p-2 bg-white">
            <h5 className="font-bold text-black border-b border-slate-200 pb-1 mb-1 flex items-center gap-1">
              <Award size={12} className="text-amber-700" />
              التقاطعات مع مواد أخرى:
            </h5>
            <ul className="list-none space-y-0.5 text-slate-800">
              {(currentData.didacticExtensions.crossCurricular || ['اللغة العربية (تحليل النصوص)', 'التربية الإسلامية (القيم)', 'الفلسفة/علوم الحياة والأرض']).map((item, i) => (
                <li key={i} className="leading-snug">- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Table 1: Introduction Steps Table (وضعيات التعلم الاستهلالية) */}
      <div className="mb-3 overflow-hidden border border-black jadha-section">
        <div className="bg-[#e6f0fa] border-b border-black p-1.5 text-center font-black text-[11px] text-black">
          محطة الانطلاق: الوضعيات التعلمية الاستهلالية (التمهيد والتعاقد الديداكتيكي)
        </div>
        <table className="w-full border-collapse text-[10px] jadha-table" dir="rtl">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black p-2 w-24 text-center">وضعيات التعلم</th>
              <th className="border border-black p-2 w-28 text-center">أهداف التعلم</th>
              <th className="border border-black p-2 w-24 text-center">الدعامات الديداكتيكية</th>
              <th className="border border-black p-2 text-center">التدبير الديداكتيكي: مهام المدرس</th>
              <th className="border border-black p-2 text-center">التدبير الديداكتيكي: مهام المتعلم</th>
              <th className="border border-black p-2 w-20 text-center">أشكال العمل</th>
            </tr>
          </thead>
          <tbody>
            {currentData.introductionSteps.map((step, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 font-bold text-center align-middle">{step.phase}</td>
                <td className="border border-black p-2 text-center align-middle">{step.subPhase}</td>
                <td className="border border-black p-2 text-center align-middle text-[9px]">{step.tools}</td>
                <td className="border border-black p-2.5 text-right whitespace-pre-wrap leading-relaxed">
                  {step.teacherActivities}
                </td>
                <td className="border border-black p-2.5 text-right whitespace-pre-wrap leading-relaxed">
                  {step.studentActivities}
                </td>
                <td className="border border-black p-2 text-center align-middle">{step.workForm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table 2: Main Table (المقاطع والأنشطة التعلمية) */}
      <div className="overflow-hidden border border-black mb-3 jadha-section">
        <div className="bg-[#e6f0fa] border-b border-black p-1.5 text-center font-black text-[11px] text-black">
          محطة البناء: المقاطع والأنشطة التعلمية التفاعلية
        </div>
        <table className="w-full border-collapse text-[10px] jadha-table" dir="rtl">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black p-2 w-24 text-center">وضعيات التعلم</th>
              <th className="border border-black p-2 w-28 text-center">أهداف التعلم</th>
              <th className="border border-black p-2 w-24 text-center">الدعامات</th>
              <th className="border border-black p-2 text-center">مهام الأستاذ(ة)</th>
              <th className="border border-black p-2 text-center">مهام المتعلمين(ات)</th>
              <th className="border border-black p-2 w-20 text-center">أشكال العمل</th>
            </tr>
          </thead>
          <tbody>
            {currentData.steps.map((step, index) => {
              if (step.isHeader) {
                return (
                  <tr key={index} className="bg-slate-100 font-bold">
                    <td colSpan={6} className="border border-black p-2 text-center text-[11px] bg-slate-200/80 text-black">
                      {step.phase}
                    </td>
                  </tr>
                );
              }
              
              if (step.isSynthesis) {
                return (
                  <tr key={index} className="bg-emerald-50/20">
                    <td className="border border-black p-2 font-bold text-center align-middle w-24 text-emerald-900 bg-emerald-50/40">
                      وضعية تركيبية
                    </td>
                    <td colSpan={5} className="border border-black p-3 text-right">
                      <div className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-700" />
                        بناء المنتوج (المعارف الأساسية التي يدوّنها المتعلم في دفتر الدروس):
                      </div>
                      <div className="leading-relaxed text-black whitespace-pre-wrap text-[10.5px]">
                        {step.teacherActivities || step.studentActivities}
                      </div>
                    </td>
                  </tr>
                );
              }

              if (step.isEvaluation) {
                return (
                  <tr key={index} className="bg-amber-50/20">
                    <td className="border border-black p-2 font-bold text-center align-middle w-24 text-amber-900 bg-amber-50/40">
                      وضعية تقويمية
                    </td>
                    <td colSpan={5} className="border border-black p-2.5 text-right">
                      <div className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                        <HelpCircle size={13} className="text-amber-700" />
                        تقويم تكويني مرحلي (التحقق من تحقق أهداف المقطع):
                      </div>
                      <div className="leading-relaxed text-black whitespace-pre-wrap">
                        {step.teacherActivities}
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={index} className="bg-white">
                  <td className="border border-black p-2 font-bold text-center align-middle w-24">{step.phase}</td>
                  <td className="border border-black p-2 text-center align-middle w-28">{step.subPhase}</td>
                  <td className="border border-black p-2 text-center text-[9px] align-middle w-24">{step.tools}</td>
                  <td className="border border-black p-2.5 text-right whitespace-pre-wrap leading-relaxed">
                    {step.teacherActivities}
                  </td>
                  <td className="border border-black p-2.5 text-right whitespace-pre-wrap leading-relaxed">
                    {step.studentActivities}
                  </td>
                  <td className="border border-black p-2 text-center align-middle w-20">{step.workForm}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ENRICHMENT SECTION 3: Final Evaluation (تقويم إجمالي) */}
      {currentData.finalEvaluation && currentData.finalEvaluation.length > 0 && (
        <div className="mb-3 border border-black p-3 jadha-section bg-white text-[10px]" dir="rtl">
          <h3 className="font-bold text-[11px] mb-2 text-black flex items-center gap-1.5">
            <Award size={14} className="text-indigo-700" />
            تقويم إجمالي وإشهاد للمكتسبات:
          </h3>
          <ul className="list-none space-y-1.5 text-black">
            {currentData.finalEvaluation.map((item, i) => (
              <li key={i} className="leading-relaxed">
                <span className="font-bold text-indigo-900">{i + 1}.</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ENRICHMENT SECTION 4: Differentiation & Remediation (بيداغوجيا التمايز والدعم الفوري) */}
      {currentData.differentiationActivities && (
        <div className="mb-3 border border-black grid grid-cols-1 md:grid-cols-2 text-[9.5px] jadha-section">
          {/* Remedial */}
          <div className="p-2.5 border-b md:border-b-0 md:border-l border-black bg-white">
            <h4 className="font-bold text-rose-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              أنشطة الدعم والمعالجة الفورية (للمتعثرين):
            </h4>
            <ul className="list-none space-y-1 text-slate-800">
              {(currentData.differentiationActivities.remedial || [
                'إعادة صياغة المفاهيم المركزية بواسطة خطاطة توضيحية مبسطة.',
                'الاشتغال على دعامات إضافية ذات مؤشرات بصرية واضحة ومباشرة.',
                'تنظيم عمل أقران موجه (تلميذ مساعد) لضبط منهجية استخراج المعطيات.'
              ]).map((act, i) => (
                <li key={i} className="leading-snug">• {act}</li>
              ))}
            </ul>
          </div>

          {/* Enrichment */}
          <div className="p-2.5 bg-white">
            <h4 className="font-bold text-emerald-900 border-b border-slate-200 pb-1 mb-1.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              أنشطة الإغناء والتثمين (للمتفوقين):
            </h4>
            <ul className="list-none space-y-1 text-slate-800">
              {(currentData.differentiationActivities.enrichment || [
                'تحرير فقرة تركيبية معمقة تربط سياق الدرس بقضايا راهنة.',
                'إعداد ملصق حائطي أو بطاقة تعريفية بيوغرافية حول إحدى الشخصيات/الظواهر.',
                'البحث في مراجع تكميلية وتأطير نقاش صفي موجز.'
              ]).map((act, i) => (
                <li key={i} className="leading-snug">• {act}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ENRICHMENT SECTION 5: Formative Assessment Criteria Grid (شبكة معايير ومؤشرات التحقق) */}
      {currentData.evaluationGrid && currentData.evaluationGrid.length > 0 && (
        <div className="mb-3 border border-black overflow-hidden jadha-section text-[9.5px]">
          <div className="bg-[#e6f0fa] border-b border-black p-1.5 font-bold text-center text-black">
            شبكة معايير ومؤشرات التقويم والملاحظة التكوينية
          </div>
          <table className="w-full border-collapse jadha-table">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-1.5 w-40 text-center font-bold">المعيار الديداكتيكي</th>
                <th className="border border-black p-1.5 text-center font-bold">مؤشرات التحقق والإنجاز</th>
                <th className="border border-black p-1.5 w-24 text-center font-bold">درجة التحكم</th>
              </tr>
            </thead>
            <tbody>
              {currentData.evaluationGrid.map((item, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="border border-black p-2 font-bold text-center align-middle">{item.criterion}</td>
                  <td className="border border-black p-2 text-right">
                    <ul className="list-none space-y-0.5">
                      {item.indicators.map((ind, iIdx) => (
                        <li key={iIdx}>- {ind}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-black p-2 text-center text-[9px] align-middle">{item.targetLevel || 'مكتسب / في طور الاكتساب'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Signatures and Observations (Moroccan Official Standard) */}
      <div className="border border-black p-3 grid grid-cols-2 text-center text-[10px] jadha-section bg-white">
        <div className="border-l border-black pr-2">
          <p className="font-bold mb-6">توقيع وملاحظات أستاذ(ة) المادة:</p>
          <p className="text-slate-400 text-[9px]">................................................</p>
        </div>
        <div className="pl-2">
          <p className="font-bold mb-6">توقيع وتأشيرة المفتش(ة) التربوي(ة):</p>
          <p className="text-slate-400 text-[9px]">................................................</p>
        </div>
      </div>
    </div>
  );
};

