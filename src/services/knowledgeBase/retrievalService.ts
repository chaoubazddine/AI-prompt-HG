import {
  KnowledgeRetrievalQueryParams,
  RetrievedKnowledge,
  AuthorityLevel,
  GroundedContext
} from '../../types/knowledgeBase';
import { KnowledgeDocumentService } from './documentService';
import { CurriculumService } from './curriculumService';

/**
 * Priority Weights according to Source Hierarchy:
 * OFFICIAL_MOROCCAN (1.0) > OWNER_PROVIDED (0.85) > TRUSTED_EDUCATIONAL (0.7)
 */
const AUTHORITY_WEIGHTS: Record<string, number> = {
  OFFICIAL_MOROCCAN: 1.0,
  OFFICIAL: 1.0,
  OWNER_PROVIDED: 0.85,
  TRUSTED_EDUCATIONAL: 0.7,
  TRUSTED_EXTERNAL: 0.7
};

/**
 * KnowledgeRetrievalService
 * High-performance, multi-stage retrieval engine for Moroccan Social Studies Curriculum.
 * Grounded pipeline combining CurriculumReference specifications + Grounded Chunk retrieval.
 */
export class KnowledgeRetrievalService {
  /**
   * Main Grounded Retrieval Pipeline:
   * Returns a clean GroundedContext object containing official curriculum specs,
   * top verified official document chunks, and pedagogical enrichment sources.
   */
  static async getGroundedContext(params: {
    subject: string;
    schoolLevel: string;
    component: string;
    lesson: string;
    unit?: string;
  }): Promise<GroundedContext> {
    const { subject, schoolLevel, component, lesson, unit } = params;

    // Phase 1: Retrieve Official Reference Curriculum Specification
    const curriculumRef = await CurriculumService.getCurriculumReference({
      subject,
      schoolLevel,
      component,
      lesson,
      unit
    });

    // Phase 2 & 3: Retrieve Verified Document Chunks
    const retrievedChunks = await this.retrieve({
      query: `${subject} ${component} ${lesson} ${unit || ''}`,
      subject,
      schoolLevel,
      component,
      lesson,
      unit,
      topK: 6
    });

    // Phase 4: Separate into Official Curriculum Chunks vs Pedagogical Enrichment
    const officialChunks = retrievedChunks.filter(
      r => r.knowledgeCategory === 'CURRICULUM_KNOWLEDGE' || r.authorityLevel === 'OFFICIAL_MOROCCAN' || r.authorityLevel === 'OFFICIAL'
    );

    const enrichmentChunks = retrievedChunks.filter(
      r => r.knowledgeCategory === 'PEDAGOGICAL_ENRICHMENT' && r.authorityLevel !== 'OFFICIAL_MOROCCAN' && r.authorityLevel !== 'OFFICIAL'
    );

    // Collect verified sources for citation
    const sourcesMap = new Map<string, {
      documentId: string;
      title: string;
      sourceUrl?: string;
      pageNumber?: number;
      authorityLevel: AuthorityLevel;
    }>();

    if (curriculumRef) {
      curriculumRef.officialSources.forEach((src, idx) => {
        sourcesMap.set(`curric-${refId(curriculumRef.id)}-${idx}`, {
          documentId: curriculumRef.id,
          title: src.title,
          sourceUrl: src.url,
          pageNumber: src.pageNumber,
          authorityLevel: 'OFFICIAL_MOROCCAN'
        });
      });
    }

    retrievedChunks.forEach(chunk => {
      sourcesMap.set(chunk.documentId, {
        documentId: chunk.documentId,
        title: `${chunk.documentTitle}${chunk.sectionTitle ? ` (${chunk.sectionTitle})` : ''}`,
        sourceUrl: chunk.sourceUrl,
        pageNumber: chunk.pageNumber,
        authorityLevel: chunk.authorityLevel
      });
    });

    const sources = Array.from(sourcesMap.values());

    // Phase 5: Synthesize a lean Grounded Context summary
    let summaryText = '';

    if (curriculumRef) {
      summaryText += `=== المرجعية الرسمية للمنهاج المغربي (الكفايات والأهداف) ===\n`;
      summaryText += `الدرس: ${curriculumRef.lesson} [كود: ${curriculumRef.lessonCode || 'رسمي'}]\n`;
      summaryText += `الكفايات المستهدفة: ${curriculumRef.competencies.join(' | ')}\n`;
      summaryText += `الأهداف المعرفية: ${curriculumRef.learningObjectives.cognitive.join(' ؛ ')}\n`;
      summaryText += `الأهداف المهارية: ${curriculumRef.learningObjectives.skill.join(' ؛ ')}\n`;
      summaryText += `الأهداف الوجدانية/المواطنية: ${curriculumRef.learningObjectives.affective.join(' ؛ ')}\n`;
      summaryText += `المفاهيم والأعلام الأساسية: ${curriculumRef.keyConcepts.join(' - ')}\n`;
      summaryText += `التوجيهات الديداكتيكية الرسمية: ${curriculumRef.officialGuidance}\n\n`;
    }

    if (officialChunks.length > 0) {
      summaryText += `=== المقتطفات الرسمية الموثقة من التوجيهات والأطر المرجعية ===\n`;
      summaryText += officialChunks.map(c => `• [${c.documentTitle} - ص. ${c.pageNumber || 'غير محدد'}]:\n${c.text}`).join('\n\n');
      summaryText += `\n\n`;
    }

    if (enrichmentChunks.length > 0) {
      summaryText += `=== الموارد التربوية المعتمدة للإثراء والدعم ===\n`;
      summaryText += enrichmentChunks.map(c => `• [${c.documentTitle}]:\n${c.text}`).join('\n\n');
    }

    if (!curriculumRef && officialChunks.length === 0) {
      summaryText = `ملاحظة منهجية: لم يتم العثور على وثيقة رسمية تفصيلية خاصة بهذا الدرس بعينه في النواة المعرفية الحالية، ويتم الاعتماد على الأطر المرجعية والتوجيهات العامة للمنهاج المغربي لمادة الاجتماعيات.`;
    }

    return {
      curriculumReference: curriculumRef || undefined,
      officialChunks,
      enrichmentChunks,
      sources,
      summaryText,
      hasOfficialReference: !!curriculumRef || officialChunks.length > 0
    };
  }

  /**
   * Multi-stage Chunk Retrieval method
   */
  static async retrieve(params: KnowledgeRetrievalQueryParams): Promise<RetrievedKnowledge[]> {
    const {
      query,
      subject = 'الاجتماعيات',
      schoolLevel,
      component,
      unit,
      lesson,
      topK = 5
    } = params;

    // 1. Get all verified & active chunks from DocumentService
    const items = await KnowledgeDocumentService.getAllActiveChunks();

    // 2. Metadata Filtering Phase
    const filteredItems = items.filter(({ doc, chunk }) => {
      // Filter by subject
      if (subject && doc.subject !== subject) return false;

      // Filter by school level (Exact match OR 'جميع المستويات')
      if (
        schoolLevel &&
        doc.schoolLevel !== 'جميع المستويات' &&
        schoolLevel !== 'جميع المستويات' &&
        !this.isLevelCompatible(doc.schoolLevel, schoolLevel)
      ) {
        return false;
      }

      // Filter by component ('التاريخ', 'الجغرافيا', 'التربية على المواطنة', or 'عام')
      if (
        component &&
        component !== 'عام' &&
        doc.component !== 'عام' &&
        chunk.component !== 'عام' &&
        doc.component !== component &&
        chunk.component !== component
      ) {
        return false;
      }

      return true;
    });

    // 3. Scoring & Ranking Phase
    const queryKeywords = this.extractKeywords(`${query} ${unit || ''} ${lesson || ''}`);

    const scoredResults: RetrievedKnowledge[] = filteredItems.map(({ doc, chunk }) => {
      let matchCount = 0;
      const combinedText = `${doc.title} ${chunk.sectionTitle || ''} ${chunk.text} ${chunk.keywords.join(' ')}`.toLowerCase();

      // Check keyword overlap
      for (const kw of queryKeywords) {
        if (combinedText.includes(kw.toLowerCase())) {
          matchCount++;
        }
      }

      // Exact lesson/unit title boost
      if (lesson && combinedText.includes(lesson.toLowerCase())) {
        matchCount += 3;
      }
      if (unit && combinedText.includes(unit.toLowerCase())) {
        matchCount += 2;
      }

      // Base keyword density score (0.0 - 1.0)
      const keywordDensity = queryKeywords.length > 0 ? matchCount / (queryKeywords.length + 2) : 0.5;

      // Weight by authority level hierarchy
      const authorityWeight = AUTHORITY_WEIGHTS[doc.authorityLevel] || 0.7;

      // Category Weighting: Curriculum Knowledge vs Enrichment
      const categoryWeight = doc.knowledgeCategory === 'CURRICULUM_KNOWLEDGE' ? 1.0 : 0.8;

      const relevanceScore = Math.min(
        1.0,
        (keywordDensity * authorityWeight * categoryWeight) + (matchCount > 0 ? 0.3 : 0.1)
      );

      return {
        text: chunk.text,
        source: doc.sourceName,
        sourceUrl: doc.sourceUrl,
        documentTitle: doc.title,
        documentId: doc.id,
        pageNumber: chunk.pageNumber,
        sectionTitle: chunk.sectionTitle,
        relevanceScore: Number(relevanceScore.toFixed(2)),
        authorityLevel: doc.authorityLevel,
        sourceType: doc.sourceType,
        knowledgeCategory: doc.knowledgeCategory || 'PEDAGOGICAL_ENRICHMENT',
        verificationStatus: doc.verificationStatus || 'VERIFIED',
        metadata: {
          subject: doc.subject,
          schoolLevel: doc.schoolLevel,
          component: doc.component,
          unit: doc.unit || chunk.unit,
          lesson: doc.lesson || chunk.lesson,
          keywords: chunk.keywords
        }
      };
    });

    // 4. Sort by Relevance Score (descending), then Authority Level
    scoredResults.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return (AUTHORITY_WEIGHTS[b.authorityLevel] || 0.7) - (AUTHORITY_WEIGHTS[a.authorityLevel] || 0.7);
    });

    // 5. Deduplicate and return Top K results
    return this.deduplicateResults(scoredResults).slice(0, topK);
  }

  private static isLevelCompatible(docLevel: string, targetLevel: string): boolean {
    if (docLevel === targetLevel) return true;
    if (docLevel.includes('إعدادي') && targetLevel.includes('إعدادي')) return true;
    if (docLevel.includes('تأهيلي') && targetLevel.includes('تأهيلي')) return true;
    return false;
  }

  private static extractKeywords(str: string): string[] {
    return str
      .split(/[\s,،.()/:\-\n]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 3 && !['درس', 'مادة', 'الوحدة', 'الدرس', 'مكون', 'الثانية', 'الأولى', 'الثالثة'].includes(s));
  }

  private static deduplicateResults(results: RetrievedKnowledge[]): RetrievedKnowledge[] {
    const seen = new Set<string>();
    const deduplicated: RetrievedKnowledge[] = [];

    for (const r of results) {
      const key = `${r.documentId}-${r.pageNumber || 0}-${r.sectionTitle || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(r);
      }
    }

    return deduplicated;
  }
}

function refId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '');
}
