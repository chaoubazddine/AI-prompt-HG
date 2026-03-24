/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Map, 
  Globe, 
  Compass, 
  History, 
  BookOpen, 
  Target, 
  Layers, 
  User, 
  Clock, 
  Calendar, 
  School, 
  Library,
  Lightbulb,
  ClipboardList,
  HelpCircle,
  Info,
  Activity,
  GraduationCap
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
  lessonNumber?: string;
  module?: string;
  academy?: string;
  directorate?: string;
  school?: string;
  teacherName?: string;
  references?: string;
  competencies: string[];
  capabilities: string[];
  objectives: {
    cognitive: string[];
    skill: string[];
    affective: string[];
  };
  problematic?: string;
  introductionSteps: JadhaStep[];
  steps: JadhaStep[];
  summary?: string;
  finalEvaluation?: string[];
}

interface TableJadhaProps {
  data: JadhaData;
}

export const TableJadha: React.FC<TableJadhaProps> = ({ data }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-8 print:shadow-none print:p-0 print:max-w-none text-right transition-all duration-500" style={{ backgroundColor: '#ffffff', color: '#000000', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)', borderRadius: '24px' }} dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          .jadha-section {
            page-break-inside: avoid !important;
          }
          .jadha-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
        }
        /* For html2pdf specifically */
        .jadha-table tr {
          page-break-inside: avoid !important;
        }
        #jadha-content, #jadha-content * {
          --tw-ring-color: #4F46E5 !important;
          --tw-shadow-color: #000000 !important;
          --tw-border-opacity: 1 !important;
          --tw-bg-opacity: 1 !important;
          --tw-text-opacity: 1 !important;
        }
      `}} />
      
      {/* New Header Structure from Image */}
      <div className="flex border-2 border-black mb-8 text-[10px] leading-tight min-h-[120px] jadha-section rounded-xl overflow-hidden shadow-sm" dir="rtl">
        {/* Right Box (Arabic RTL) */}
        <div className="w-[30%] border-l-2 border-black p-4 space-y-2 flex flex-col justify-center" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-slate-400" />
            <p className="break-words">الأكاديمية: {data.academy || '....................'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Map size={12} className="text-slate-400" />
            <p className="break-words">المديرية الإقليمية: {data.directorate || '....................'}</p>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={12} className="text-slate-400" />
            <p className="break-words">المادة: الاجتماعيات</p>
          </div>
          <div className="flex items-center gap-2">
            <Library size={12} className="text-slate-400" />
            <p className="break-words">المراجع: {data.references || '....................'}</p>
          </div>
        </div>
        
        {/* Center Box */}
        <div className="w-[40%] border-l-2 border-black p-4 flex flex-col items-center justify-center text-center bg-white">
          <div className="px-4 py-1 rounded-full mb-2 no-print" style={{ backgroundColor: '#fef2f2' }}>
            <p className="font-bold text-[11px] break-words w-full" style={{ color: '#DC2626' }}>{data.school || 'المؤسسة التعليمية'}</p>
          </div>
          <p className="font-bold text-[10px] break-words w-full mb-1" style={{ color: '#1E40AF' }}>الدرس {data.lessonNumber || '....'}:</p>
          <h1 className="font-black text-xl leading-tight break-words w-full" style={{ color: '#DC2626' }}>{data.title}</h1>
        </div>
        
        {/* Left Box */}
        <div className="w-[30%] p-4 space-y-2 flex flex-col justify-center" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-slate-400" />
            <p className="break-words">الموسم الدراسي: {data.year}</p>
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-slate-400" />
            <p className="break-words">إعداد: {data.teacherName || '....................'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-400" />
            <p className="break-words">الغلاف الزمني: {data.duration}</p>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={12} className="text-slate-400" />
            <p className="break-words">المستوى: {data.level}</p>
          </div>
        </div>
      </div>

      {/* Competencies, Capacities, Objectives Table */}
      <div className="grid grid-cols-3 border-2 border-black mb-8 text-[11px] jadha-section rounded-xl overflow-hidden shadow-sm" dir="rtl">
        <div className="border-l-2 border-black p-0 flex flex-col">
          <h3 className="font-black text-center border-b-2 border-black p-2 flex items-center justify-center gap-2" style={{ backgroundColor: '#DBEAFE' }}>
            <Target size={14} className="text-blue-600" />
            الكفايات
          </h3>
          <div className="p-4 flex-1 bg-white">
            <ul className="list-none space-y-2">
              {data.competencies.map((c, i) => <li key={i} className="relative pr-4 before:content-['•'] before:absolute before:right-0 before:text-blue-400 before:font-black">{c}</li>)}
            </ul>
          </div>
        </div>
        <div className="border-l-2 border-black p-0 flex flex-col">
          <h3 className="font-black text-center border-b-2 border-black p-2 flex items-center justify-center gap-2" style={{ backgroundColor: '#DBEAFE' }}>
            <Compass size={14} className="text-blue-600" />
            القدرات
          </h3>
          <div className="p-4 flex-1 bg-white">
            <ul className="list-none space-y-2">
              {data.capabilities.map((c, i) => <li key={i} className="relative pr-4 before:content-['•'] before:absolute before:right-0 before:text-blue-400 before:font-black">{c}</li>)}
            </ul>
          </div>
        </div>
        <div className="p-0 flex flex-col">
          <h3 className="font-black text-center border-b-2 border-black p-2 flex items-center justify-center gap-2" style={{ backgroundColor: '#DBEAFE' }}>
            <Lightbulb size={14} className="text-blue-600" />
            الأهداف
          </h3>
          <div className="p-4 flex-1 bg-white">
            <ul className="list-none space-y-2">
              {[...data.objectives.cognitive, ...data.objectives.skill, ...data.objectives.affective].map((o, i) => (
                <li key={i} className="relative pr-4 before:content-['•'] before:absolute before:right-0 before:text-blue-400 before:font-black">{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Introduction Steps Table */}
      <div className="mb-8 overflow-hidden rounded-xl border-2 border-black shadow-sm jadha-section">
        <table className="w-full border-collapse text-[10px] jadha-table" dir="rtl">
          <thead>
            <tr style={{ backgroundColor: '#DBEAFE' }}>
              <th className="border-b-2 border-l-2 border-black p-3 w-20 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Activity size={12} className="text-blue-600" />
                  وضعيات التعلم
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 w-24 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Target size={12} className="text-blue-600" />
                  أهداف التعلم
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 w-20 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Library size={12} className="text-blue-600" />
                  الدعامات
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 font-black">
                <div className="flex items-center justify-center gap-2">
                  <User size={12} className="text-blue-600" />
                  مهام المدرس
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 font-black">
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap size={12} className="text-blue-600" />
                  مهام المتعلم
                </div>
              </th>
              <th className="border-b-2 border-black p-3 w-20 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Layers size={12} className="text-blue-600" />
                  أشكال العمل
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.introductionSteps.map((step, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td className="border-l-2 border-black p-3 font-bold text-center align-middle">{step.phase}</td>
                <td className="border-l-2 border-black p-3 text-center align-middle">{step.subPhase}</td>
                <td className="border-l-2 border-black p-3 text-center align-middle">{step.tools}</td>
                <td className="border-l-2 border-black p-4 text-right whitespace-pre-wrap leading-relaxed">{step.teacherActivities}</td>
                <td className="border-l-2 border-black p-4 text-right whitespace-pre-wrap leading-relaxed">{step.studentActivities}</td>
                <td className="p-3 text-center align-middle">{step.workForm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Table (Learning Segments) */}
      <div className="overflow-hidden rounded-xl border-2 border-black shadow-sm jadha-section">
        <table className="w-full border-collapse text-[10px] jadha-table" dir="rtl">
          <thead>
            <tr style={{ backgroundColor: '#DBEAFE' }}>
              <th className="border-b-2 border-l-2 border-black p-3 w-20 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Compass size={12} className="text-blue-600" />
                  وضعيات التعلم
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 w-24 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Target size={12} className="text-blue-600" />
                  أهداف التعلم
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 w-20 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Library size={12} className="text-blue-600" />
                  الدعامات
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 font-black">
                <div className="flex items-center justify-center gap-2">
                  <User size={12} className="text-blue-600" />
                  مهام الأستاذ
                </div>
              </th>
              <th className="border-b-2 border-l-2 border-black p-3 font-black">
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap size={12} className="text-blue-600" />
                  مهام المتعلم
                </div>
              </th>
              <th className="border-b-2 border-black p-3 w-20 font-black">
                <div className="flex items-center justify-center gap-2">
                  <Layers size={12} className="text-blue-600" />
                  أشكال العمل
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.steps.map((step, index) => {
              if (step.isHeader) {
                return (
                  <tr key={index} className="font-black" style={{ backgroundColor: '#F1F5F9' }}>
                    <td colSpan={6} className="border-b-2 border-black p-3 text-center uppercase tracking-widest text-[11px] bg-slate-100">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px bg-slate-300 flex-1"></div>
                        <span>{step.phase}</span>
                        <div className="h-px bg-slate-300 flex-1"></div>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              if (step.isSynthesis) {
                return (
                  <tr key={index} className="font-bold" style={{ backgroundColor: '#ECFDF5' }}>
                    <td className="border-l-2 border-black p-3 text-center align-middle" style={{ backgroundColor: '#D1FAE5' }}>
                      <div className="flex flex-col items-center gap-1">
                        <ClipboardList size={14} className="text-emerald-600" />
                        وضعية تركيبية
                      </div>
                    </td>
                    <td colSpan={5} className="p-4 text-right">
                      <div className="mb-2 flex items-center gap-2 text-emerald-800 font-black">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                        بناء المنتوج (يكتب على الدفتر):
                      </div>
                      <div className="font-normal leading-relaxed text-slate-700 whitespace-pre-wrap pr-4">{step.teacherActivities}</div>
                    </td>
                  </tr>
                );
              }

              if (step.isEvaluation) {
                return (
                  <tr key={index} className="font-bold" style={{ backgroundColor: '#FFF7ED' }}>
                    <td className="border-l-2 border-black p-3 text-center align-middle" style={{ backgroundColor: '#FFEDD5' }}>
                      <div className="flex flex-col items-center gap-1">
                        <HelpCircle size={14} className="text-amber-600" />
                        وضعية تقويمية
                      </div>
                    </td>
                    <td colSpan={5} className="p-4 text-right">
                      <div className="mb-2 flex items-center gap-2 text-amber-800 font-black">
                        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                        تقويم مرحلي:
                      </div>
                      <div className="font-normal leading-relaxed text-slate-700 whitespace-pre-wrap pr-4">{step.teacherActivities}</div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td className="border-l-2 border-black p-3 font-bold text-center align-middle">{step.phase}</td>
                  <td className="border-l-2 border-black p-3 text-center align-middle">{step.subPhase}</td>
                  <td className="border-l-2 border-black p-3 text-center text-[9px] align-middle">{step.tools}</td>
                  <td className="border-l-2 border-black p-4 text-right whitespace-pre-wrap leading-relaxed">{step.teacherActivities}</td>
                  <td className="border-l-2 border-black p-4 text-right whitespace-pre-wrap leading-relaxed text-slate-600">{step.studentActivities}</td>
                  <td className="p-3 text-center align-middle">{step.workForm}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Final Summary Section */}
      {data.summary && (
        <div className="mt-8 border-2 border-black p-6 jadha-section rounded-xl shadow-sm" style={{ backgroundColor: '#ECFDF5' }} dir="rtl">
          <div className="flex items-center gap-3 mb-4 text-emerald-800 border-b-2 border-emerald-100 pb-2">
            <ClipboardList size={20} />
            <h3 className="font-black text-lg">خلاصة عامة للدرس</h3>
          </div>
          <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{data.summary}</div>
        </div>
      )}

      {/* Final Evaluation Section */}
      {data.finalEvaluation && data.finalEvaluation.length > 0 && (
        <div className="mt-6 border-2 border-black p-6 jadha-section rounded-xl shadow-sm" style={{ backgroundColor: '#FFF7ED' }} dir="rtl">
          <div className="flex items-center gap-3 mb-4 text-amber-800 border-b-2 border-amber-100 pb-2">
            <HelpCircle size={20} />
            <h3 className="font-black text-lg">تقويم إجمالي</h3>
          </div>
          <ul className="list-none space-y-3 text-sm">
            {data.finalEvaluation.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <div className="mt-1 w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0">
                  {i + 1}
                </div>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-slate-100 text-center no-print">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <Info size={12} />
          تم توليد هذه الجذاذة بواسطة منصة جذاذات الاجتماعيات الذكية
        </div>
      </div>

    </div>
  );
};
