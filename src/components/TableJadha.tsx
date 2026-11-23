/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Edit3, 
  Save,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Bookmark,
  Plus,
  Layers,
  Split,
  ArrowLeftRight
} from 'lucide-react';
import { 
  getTextbookDetails, 
  getTextbooksForLevel,
  getTextbookComparison,
  isComparativeTextbookOption,
  TextbookDocument, 
  LessonTextbookDetails 
} from '../constants/textbookRegistry';
import { getCurrentAcademicYear } from '../utils/academicYear';
import { toast } from 'sonner';

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
  textbookName?: string;
  textbookPages?: string;
  parallelTextbooks?: Array<{ name: string; pages: string; summary?: string }>;
  isComparativeSynthesis?: boolean;
  textbookDocuments?: Array<{
    id?: string;
    docNumber: string;
    type: string;
    title: string;
    page: string | number;
    description?: string;
    didacticObjective?: string;
  }>;
  textbookKeyConcepts?: Array<{ term: string; definition: string; page?: string }>;
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
  isFallbackTemplate?: boolean;
  generationMethod?: 'ai' | 'curriculum_template';
}

interface TableJadhaProps {
  data: JadhaData;
  onUpdateData?: (updated: JadhaData) => void;
}

export const TableJadha: React.FC<TableJadhaProps> = ({ data, onUpdateData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<JadhaData>(data);
  const [showTextbookExplorer, setShowTextbookExplorer] = useState(false);
  const [selectedBookName, setSelectedBookName] = useState<string>(data.textbookName || '');
  const [activeExplorerTab, setActiveExplorerTab] = useState<'docs' | 'terms' | 'comparison'>('docs');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Sync if prop updates and not currently editing
  React.useEffect(() => {
    if (!isEditing) {
      setEditableData(data);
      if (data.textbookName) {
        setSelectedBookName(data.textbookName);
      }
    }
  }, [data, isEditing]);

  const currentData = isEditing ? editableData : data;

  // Resolve textbook grounded details from registry
  const resolvedTextbook = useMemo(() => {
    return getTextbookDetails(
      currentData.title,
      selectedBookName || currentData.textbookName || currentData.references,
      currentData.level,
      currentData.unit
    );
  }, [currentData.title, selectedBookName, currentData.textbookName, currentData.references, currentData.level, currentData.unit]);

  const availableBooks = useMemo(() => {
    return getTextbooksForLevel(currentData.level);
  }, [currentData.level]);

  // Retrieve all official registered textbooks for this lesson for cross-referencing and comparison
  const comparisonBooks = useMemo(() => {
    return getTextbookComparison(currentData.title, currentData.level, currentData.unit);
  }, [currentData.title, currentData.level, currentData.unit]);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateData) {
      onUpdateData(editableData);
    }
  };

  const handleInsertDocument = (doc: TextbookDocument, customBookName?: string, targetStepIndex?: number) => {
    const bookLabel = customBookName || resolvedTextbook?.textbookName || 'المقرر';
    const docCitation = `كتاب ${bookLabel}: ${doc.docNumber} (${doc.type}: ${doc.title}) - ${doc.page}`;
    
    // If target step provided, insert directly into its tools
    if (typeof targetStepIndex === 'number' && editableData.steps[targetStepIndex]) {
      const updatedSteps = [...editableData.steps];
      const existing = updatedSteps[targetStepIndex].tools || '';
      updatedSteps[targetStepIndex] = {
        ...updatedSteps[targetStepIndex],
        tools: existing ? `${existing} | ${docCitation}` : docCitation
      };
      setEditableData({ ...editableData, steps: updatedSteps });
      if (onUpdateData) onUpdateData({ ...editableData, steps: updatedSteps });
      toast.success(`تم إدراج ${doc.docNumber} من «${bookLabel}» في النشاط المحدد بنجاح!`);
      return;
    }

    // Otherwise copy to clipboard
    navigator.clipboard.writeText(docCitation);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2500);
    toast.success(`تم نسخ مرجع الوثيقة (${doc.docNumber} - «${bookLabel}» ${doc.page}) لربطه بالأنشطة!`);
  };

  const handleInsertCrossComparison = (docA: TextbookDocument, bookA: string, docB: TextbookDocument, bookB: string) => {
    const citation = `تقاطع ديداكتيكي: [كتاب ${bookA}]: ${docA.docNumber} (${docA.type}: ${docA.title} - ${docA.page}) موازي لـ [كتاب ${bookB}]: ${docB.docNumber} (${docB.type}: ${docB.title} - ${docB.page})`;
    navigator.clipboard.writeText(citation);
    toast.success('تم نسخ صيغة التقاطع الديداكتيكي بين المقررين لاستثمارها في الأنشطة التعلمية!');
  };

  const handleSwitchTextbook = (newBook: string) => {
    setSelectedBookName(newBook);
    const newDetails = getTextbookDetails(currentData.title, newBook, currentData.level, currentData.unit);
    if (newDetails) {
      const updated: JadhaData = {
        ...editableData,
        textbookName: newDetails.textbookName,
        textbookPages: newDetails.pagesRange,
        parallelTextbooks: newDetails.parallelTextbooks || [],
        isComparativeSynthesis: Boolean(newDetails.isComparativeSynthesis),
        textbookDocuments: newDetails.documents || [],
        textbookKeyConcepts: newDetails.keyConcepts || [],
        references: `${newDetails.textbookName} (${newDetails.pagesRange}) - التوجيهات التربوية الرسمية`
      };
      setEditableData(updated);
      if (onUpdateData) onUpdateData(updated);
      toast.success(`تم ربط الجذاذة بكتاب "${newDetails.textbookName}" (${newDetails.pagesRange})!`);
    }
  };

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
                placeholder="الأكاديمية الجهوية"
                className="border border-slate-300 p-0.5 rounded text-[10px] w-36"
              />
            ) : (currentData.academy || 'الأكاديمية الجهوية للتربية والتكوين')}
          </p>
          <p className="break-words">
            المديرية الإقليمية: {isEditing ? (
              <input 
                type="text" 
                value={editableData.directorate || ''} 
                onChange={e => setEditableData({...editableData, directorate: e.target.value})}
                placeholder="المديرية الإقليمية"
                className="border border-slate-300 p-0.5 rounded text-[10px] w-36"
              />
            ) : (currentData.directorate || 'المديرية الإقليمية')}
          </p>
          <p className="break-words">المادة: <span className="font-bold">{currentData.unit || 'الاجتماعيات'}</span></p>
          <p className="break-words">
            الكتاب المدرسي: <span className="font-bold text-indigo-950">{currentData.textbookName || resolvedTextbook?.textbookName || 'المقرر الرسمي'}</span>
            {(currentData.textbookPages || resolvedTextbook?.pagesRange) && (
              <span className="font-semibold text-slate-700 mr-1">
                ({currentData.textbookPages || resolvedTextbook?.pagesRange})
              </span>
            )}
          </p>
          {(resolvedTextbook?.parallelTextbooks && resolvedTextbook.parallelTextbooks.length > 0) && (
            <p className="break-words text-[9.5px] text-indigo-900 font-semibold">
              المقرر الموازي للتقاطع: <span className="font-bold text-slate-900">{resolvedTextbook.parallelTextbooks.map(p => `${p.name} (${p.pages})`).join(' | ')}</span>
            </p>
          )}
          <p className="break-words text-[9px] text-slate-600">المراجع: {currentData.references || 'المقرر المدرسي المعتمد - التوجيهات الرسمية'}</p>
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
          <p className="break-words">الموسم الدراسي: {currentData.year || getCurrentAcademicYear()}</p>
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

      {/* Textbook Direct Link & Interactive Didactic Explorer */}
      <div className="no-print mb-4 border border-indigo-200/90 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white rounded-2xl p-3.5 text-xs shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-xs">
                  الكتاب المدرسي المعتمد:
                </span>
                <span className="font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 text-xs shadow-xs">
                  {currentData.textbookName || resolvedTextbook?.textbookName || 'المقرر المعتمد'}
                </span>
                {(currentData.textbookPages || resolvedTextbook?.pagesRange) && (
                  <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {currentData.textbookPages || resolvedTextbook?.pagesRange}
                  </span>
                )}
                {isComparativeTextbookOption(currentData.textbookName || selectedBookName) && (
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Layers size={11} />
                    توليف متقاطع بين كافة المقررات الرسمية
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  ربط مباشر بالوثائق والدعامات الرسمية
                </span>
              </div>
              {resolvedTextbook?.parallelTextbooks && resolvedTextbook.parallelTextbooks.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px]">
                  <span className="font-bold text-slate-600">المقررات الموازية المعتمدة للتقاطع:</span>
                  {resolvedTextbook.parallelTextbooks.map((pBook, pbIdx) => (
                    <span 
                      key={pbIdx}
                      className="font-bold text-indigo-800 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200 text-[10.5px]"
                    >
                      {pBook.name} ({pBook.pages})
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-600 mt-0.5">
                تتطابق وضعيات وأنشطة هذه الجذاذة مباشرة مع وثائق وصفحات كتاب <strong>«{currentData.textbookName || resolvedTextbook?.textbookName}»</strong> مع إمكانية استثمار وثائق المقررات الموازية للمستوى.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {availableBooks.length > 1 && (
              <select
                value={selectedBookName || resolvedTextbook?.textbookName}
                onChange={e => handleSwitchTextbook(e.target.value)}
                className="bg-white border border-indigo-200 text-indigo-900 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer hover:border-indigo-400"
                title="تبديل الكتاب المدرسي المعتمد"
              >
                {availableBooks.map((b, bIdx) => (
                  <option key={bIdx} value={b}>مقرر: {b}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowTextbookExplorer(!showTextbookExplorer)}
              type="button"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs text-xs"
            >
              <BookOpen size={14} />
              <span>{showTextbookExplorer ? 'إغلاق مستكشف الوثائق' : 'استعراض ومقارنة وثائق المقررات'}</span>
              {showTextbookExplorer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Expandable Textbook Materials Panel */}
        {showTextbookExplorer && resolvedTextbook && (
          <div className="mt-3.5 pt-3 border-t border-indigo-100">
            {/* Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveExplorerTab('docs')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    activeExplorerTab === 'docs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
                  }`}
                >
                  <BookOpen size={13} />
                  <span>وثائق المقرر المعتمد ({resolvedTextbook.documents.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExplorerTab('comparison')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    activeExplorerTab === 'comparison'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  <Layers size={13} />
                  <span>مقارنة وتقاطع وثائق المقررات ({comparisonBooks.length} مقررات رسمية)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveExplorerTab('terms')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                    activeExplorerTab === 'terms'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
                  }`}
                >
                  <Bookmark size={13} />
                  <span>مفاهيم ومصطلحات الكتاب ({resolvedTextbook.keyConcepts.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                انقر على أي وثيقة لنسخ مرجعها واستثماره في الأنشطة التعلمية
              </span>
            </div>

            {/* Tab 1: Documents Grid */}
            {activeExplorerTab === 'docs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto p-1">
                {resolvedTextbook.documents.map((doc, dIdx) => (
                  <div
                    key={doc.id || dIdx}
                    className="p-2.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex flex-col justify-between gap-1.5 transition-all text-xs shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                            {doc.docNumber}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {doc.type}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {doc.page}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInsertDocument(doc)}
                          className="px-2 py-1 bg-slate-100 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors text-[10px] flex items-center gap-1 shrink-0"
                          title="نسخ مرجع الوثيقة"
                        >
                          {copiedDocId === doc.id ? (
                            <>
                              <Check size={11} className="text-emerald-600" />
                              <span className="text-emerald-700">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>نسخ المرجع</span>
                            </>
                          )}
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mb-1">
                        {doc.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 text-[10px] text-indigo-800 flex items-center justify-between">
                      <span>الهدف الديداكتيكي: {doc.didacticObjective}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Cross-Textbook Comparison & Parallel Alignment */}
            {activeExplorerTab === 'comparison' && (
              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-indigo-700 shrink-0" />
                    <span className="font-bold text-slate-900">
                      تقاطع المقررات المصادق عليها: مقارنة الوثائق والدعامات بين المقررات الرسمية لتعزيز الأنشطة التعلمية
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSwitchTextbook('توليف رسمي بين مقررات المستوى (مقارنة متقاطعة)')}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition-colors shadow-2xs"
                  >
                    تطبيق التوليف الشامل على هذه الجذاذة
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {comparisonBooks.map((bookDetails, bIdx) => {
                    const isCurrent = (currentData.textbookName || resolvedTextbook.textbookName) === bookDetails.textbookName;
                    return (
                      <div 
                        key={bIdx}
                        className={`rounded-2xl border p-3 flex flex-col justify-between transition-all ${
                          isCurrent 
                            ? 'bg-blue-50/40 border-indigo-300 ring-2 ring-indigo-500/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-xs text-indigo-950">
                                {bookDetails.textbookName}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {bookDetails.pagesRange}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                                  المعتمد حالياً
                                </span>
                              )}
                            </div>
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleSwitchTextbook(bookDetails.textbookName)}
                                className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-lg text-[10px] transition-colors"
                              >
                                اعتماد هذا المقرر
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {bookDetails.documents.map((doc, dIdx) => (
                              <div 
                                key={dIdx}
                                className="p-2 bg-slate-50/80 hover:bg-white border border-slate-200/80 rounded-xl text-xs flex flex-col justify-between gap-1.5 transition-all shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-indigo-800 text-[10.5px]">
                                      {doc.docNumber}
                                    </span>
                                    <span className="text-[9.5px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                      {doc.type}
                                    </span>
                                    <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                                      {doc.page}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleInsertDocument(doc, bookDetails.textbookName)}
                                    className="px-2 py-0.5 bg-white hover:bg-indigo-100 text-indigo-700 font-bold rounded-md border border-slate-200 text-[9.5px] flex items-center gap-1 transition-colors"
                                    title="نسخ مرجع الوثيقة من هذا المقرر"
                                  >
                                    <Copy size={10} />
                                    <span>نسخ المرجع</span>
                                  </button>
                                </div>
                                <h5 className="font-bold text-slate-900 text-[11px] leading-tight">
                                  {doc.title}
                                </h5>
                                <p className="text-[10px] text-slate-600 leading-snug">
                                  {doc.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {bookDetails.synthesisGuidance && (
                          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <span className="font-bold text-slate-800">التوجيه الديداكتيكي للمقرر: </span>
                            {bookDetails.synthesisGuidance}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Key Concepts */}
            {activeExplorerTab === 'terms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                {resolvedTextbook.keyConcepts.map((concept, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-800 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {concept.term}
                      </span>
                      {concept.page && (
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                          {concept.page}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed pt-1">
                      {concept.definition}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
