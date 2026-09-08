/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Edit3, 
  Save
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
  keyConcepts?: Array<{ term: string; definition: string }>;
  didacticExtensions?: any;
  differentiationActivities?: any;
  evaluationGrid?: any;
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

      {/* Editor Bar (Screen only) */}
      <div className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles size={16} className="text-indigo-600" />
            جذاذة تربوية نموذجية لمادة الاجتماعيات
          </span>
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
            وفق التوجيهات الرسمية المغربية
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
        {/* Right: الكفايات */}
        <div className="border-l border-black p-0 flex flex-col">
          <h3 className="font-bold text-center border-b border-black p-1.5 bg-[#e6f0fa] text-black">
            الكفايات
          </h3>
          <div className="p-2.5 flex-1 bg-white">
            <ul className="list-none space-y-1.5 text-black">
              {currentData.competencies?.map((c, i) => (
                <li key={i} className="leading-relaxed">
                  - {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle: القدرات */}
        <div className="border-l border-black p-0 flex flex-col">
          <h3 className="font-bold text-center border-b border-black p-1.5 bg-[#e6f0fa] text-black">
            القدرات
          </h3>
          <div className="p-2.5 flex-1 bg-white">
            <ul className="list-none space-y-1.5 text-black">
              {currentData.capabilities?.map((c, i) => (
                <li key={i} className="leading-relaxed">- {c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Left: الأهداف */}
        <div className="p-0 flex flex-col">
          <h3 className="font-bold text-center border-b border-black p-1.5 bg-[#e6f0fa] text-black">
            الأهداف
          </h3>
          <div className="p-2.5 flex-1 bg-white">
            <ul className="list-none space-y-1 text-black">
              {(() => {
                const allObjs = Array.isArray(currentData.objectives)
                  ? currentData.objectives
                  : [
                      ...(currentData.objectives?.cognitive || []),
                      ...(currentData.objectives?.skill || []),
                      ...(currentData.objectives?.affective || [])
                    ];
                return allObjs.map((o, i) => (
                  <li key={i} className="leading-relaxed">
                    - {o}
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
      </div>

      {/* Unified Didactic Table (Single continuous table matching the official Moroccan model) */}
      <div className="overflow-x-auto border border-black mb-3 jadha-section">
        <table className="w-full border-collapse text-[10px] jadha-table" dir="rtl">
          <thead>
            <tr className="bg-slate-100 font-bold border-b border-black">
              <th className="border border-black p-2 w-28 text-center">وضعيات التعلم</th>
              <th className="border border-black p-2 w-32 text-center">أهداف التعلم</th>
              <th className="border border-black p-2 w-36 text-center">الدعامات الديداكتيكية</th>
              <th className="border border-black p-2 text-center">التدبير الديداكتيكي: مهام المدرس</th>
              <th className="border border-black p-2 text-center">التدبير الديداكتيكي: مهام المتعلم</th>
              <th className="border border-black p-2 w-24 text-center">أشكال العمل</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Introduction Steps (الوضعيات الاستهلالية) */}
            {currentData.introductionSteps?.map((step, index) => (
              <tr key={`intro-${index}`} className="bg-white">
                <td className="border border-black p-2 font-bold text-center align-middle">{step.phase}</td>
                <td className="border border-black p-2 text-center align-middle">{step.subPhase}</td>
                <td className="border border-black p-2 text-center align-middle text-[9px]">
                  {isEditing ? (
                    <textarea
                      value={step.tools || ''}
                      onChange={(e) => {
                        const updated = [...editableData.introductionSteps];
                        updated[index] = { ...step, tools: e.target.value };
                        setEditableData({ ...editableData, introductionSteps: updated });
                      }}
                      rows={2}
                      className="w-full border border-slate-300 rounded p-1 text-[9px]"
                    />
                  ) : (
                    step.tools
                  )}
                </td>
                <td className="border border-black p-2 text-right leading-relaxed whitespace-pre-wrap">
                  {isEditing ? (
                    <textarea
                      value={step.teacherActivities || ''}
                      onChange={(e) => {
                        const updated = [...editableData.introductionSteps];
                        updated[index] = { ...step, teacherActivities: e.target.value };
                        setEditableData({ ...editableData, introductionSteps: updated });
                      }}
                      rows={3}
                      className="w-full border border-slate-300 rounded p-1 text-[9.5px]"
                    />
                  ) : (
                    step.teacherActivities
                  )}
                </td>
                <td className="border border-black p-2 text-right leading-relaxed whitespace-pre-wrap">
                  {isEditing ? (
                    <textarea
                      value={step.studentActivities || ''}
                      onChange={(e) => {
                        const updated = [...editableData.introductionSteps];
                        updated[index] = { ...step, studentActivities: e.target.value };
                        setEditableData({ ...editableData, introductionSteps: updated });
                      }}
                      rows={3}
                      className="w-full border border-slate-300 rounded p-1 text-[9.5px]"
                    />
                  ) : (
                    step.studentActivities
                  )}
                </td>
                <td className="border border-black p-2 text-center align-middle">{step.workForm}</td>
              </tr>
            ))}

            {/* Subheader repeating before learning stages (identical to official Moroccan PDF) */}
            <tr className="bg-slate-100 font-bold border-t border-b border-black">
              <th className="border border-black p-2 text-center">وضعيات التعلم</th>
              <th className="border border-black p-2 text-center">أهداف التعلم</th>
              <th className="border border-black p-2 text-center">الدعامات</th>
              <th className="border border-black p-2 text-center">مهام الأستاذ</th>
              <th className="border border-black p-2 text-center">مهام المتعلم</th>
              <th className="border border-black p-2 text-center">أشكال العمل</th>
            </tr>

            {/* 2. Main Steps (المقاطع والأنشطة التعلمية) */}
            {currentData.steps?.map((step, index) => {
              if (step.isHeader) {
                return (
                  <tr key={index} className="bg-slate-100 font-bold">
                    <td colSpan={6} className="border border-black p-2 text-center text-[11px] font-black bg-slate-200/90 text-black">
                      {step.phase}
                    </td>
                  </tr>
                );
              }
              
              if (step.isSynthesis) {
                return (
                  <tr key={index} className="bg-white">
                    <td className="border border-black p-2 font-bold text-center align-middle w-28">
                      وضعية تركيبية
                    </td>
                    <td colSpan={5} className="border border-black p-2.5 text-right">
                      <div className="font-bold text-black mb-1">
                        بناء المنتوج:
                      </div>
                      {isEditing ? (
                        <textarea
                          value={step.teacherActivities || step.studentActivities || ''}
                          onChange={(e) => {
                            const updatedSteps = [...editableData.steps];
                            updatedSteps[index] = { ...step, teacherActivities: e.target.value, studentActivities: e.target.value };
                            setEditableData({ ...editableData, steps: updatedSteps });
                          }}
                          rows={3}
                          className="w-full border border-slate-300 rounded p-1 text-[10px]"
                        />
                      ) : (
                        <div className="leading-relaxed text-black whitespace-pre-wrap text-[10px]">
                          {step.teacherActivities || step.studentActivities || ''}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }

              if (step.isEvaluation) {
                return (
                  <tr key={index} className="bg-white">
                    <td className="border border-black p-2 font-bold text-center align-middle w-28">
                      وضعية تقويمية
                    </td>
                    <td colSpan={5} className="border border-black p-2.5 text-right">
                      <div className="font-bold text-black mb-1">
                        تقويم مرحلي:
                      </div>
                      {isEditing ? (
                        <textarea
                          value={step.teacherActivities || ''}
                          onChange={(e) => {
                            const updatedSteps = [...editableData.steps];
                            updatedSteps[index] = { ...step, teacherActivities: e.target.value };
                            setEditableData({ ...editableData, steps: updatedSteps });
                          }}
                          rows={2}
                          className="w-full border border-slate-300 rounded p-1 text-[10px]"
                        />
                      ) : (
                        <div className="leading-relaxed text-black whitespace-pre-wrap">
                          {step.teacherActivities || ''}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={index} className="bg-white">
                  <td className="border border-black p-2 font-bold text-center align-middle w-28">{step.phase}</td>
                  <td className="border border-black p-2 text-center align-middle w-32">{step.subPhase}</td>
                  <td className="border border-black p-2 text-center text-[9px] align-middle w-36">
                    {isEditing ? (
                      <textarea
                        value={step.tools || ''}
                        onChange={(e) => {
                          const updatedSteps = [...editableData.steps];
                          updatedSteps[index] = { ...step, tools: e.target.value };
                          setEditableData({ ...editableData, steps: updatedSteps });
                        }}
                        rows={2}
                        className="w-full border border-slate-300 rounded p-1 text-[9px]"
                      />
                    ) : (
                      step.tools
                    )}
                  </td>
                  <td className="border border-black p-2 text-right leading-relaxed whitespace-pre-wrap">
                    {isEditing ? (
                      <textarea
                        value={step.teacherActivities || ''}
                        onChange={(e) => {
                          const updatedSteps = [...editableData.steps];
                          updatedSteps[index] = { ...step, teacherActivities: e.target.value };
                          setEditableData({ ...editableData, steps: updatedSteps });
                        }}
                        rows={3}
                        className="w-full border border-slate-300 rounded p-1 text-[9.5px]"
                      />
                    ) : (
                      step.teacherActivities
                    )}
                  </td>
                  <td className="border border-black p-2 text-right leading-relaxed whitespace-pre-wrap">
                    {isEditing ? (
                      <textarea
                        value={step.studentActivities || ''}
                        onChange={(e) => {
                          const updatedSteps = [...editableData.steps];
                          updatedSteps[index] = { ...step, studentActivities: e.target.value };
                          setEditableData({ ...editableData, steps: updatedSteps });
                        }}
                        rows={3}
                        className="w-full border border-slate-300 rounded p-1 text-[9.5px]"
                      />
                    ) : (
                      step.studentActivities
                    )}
                  </td>
                  <td className="border border-black p-2 text-center align-middle w-24">{step.workForm}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Final Evaluation (تقويم إجمالي) */}
      {currentData.finalEvaluation && currentData.finalEvaluation.length > 0 && (
        <div className="mb-3 border border-black p-3 jadha-section bg-white text-[10px]" dir="rtl">
          <h3 className="font-bold text-[11px] mb-2 text-black">
            تقويم إجمالي:
          </h3>
          <ul className="list-none space-y-1.5 text-black">
            {currentData.finalEvaluation.map((item, i) => (
              <li key={i} className="leading-relaxed">
                - {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
