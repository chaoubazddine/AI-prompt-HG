import { KnowledgeSource } from '../../types/smartAssistant';
import { KnowledgeRetrievalService } from './retrievalService';
import { AuthorityLevel } from '../../types/knowledgeBase';

export * from '../../types/knowledgeBase';
export * from './retrievalService';
export * from './documentService';
export * from './curriculumService';
export * from './chunker';

export interface KnowledgeQueryResult {
  sources: KnowledgeSource[];
  summaryContext: string;
  hasExactMatch: boolean;
}

/**
 * Backward-compatible Knowledge Base Query Wrapper
 * Connects directly to the new multi-stage KnowledgeRetrievalService engine.
 */
export async function queryKnowledgeBase(params: {
  subject: string;
  level: string;
  component: string;
  lessonTitle: string;
  unit?: string;
}): Promise<KnowledgeQueryResult> {
  const groundedContext = await KnowledgeRetrievalService.getGroundedContext({
    subject: params.subject,
    schoolLevel: params.level,
    component: params.component,
    lesson: params.lessonTitle,
    unit: params.unit
  });

  const sources: KnowledgeSource[] = groundedContext.sources.map((src, idx) => ({
    id: `${src.documentId}-${idx}`,
    title: src.title,
    source: src.title,
    url: src.sourceUrl,
    type: 'official',
    subject: params.subject,
    level: params.level,
    component: params.component,
    lesson: params.lessonTitle,
    reliability: src.authorityLevel === 'OFFICIAL_MOROCCAN' ? 1.0 : 0.85,
    snippet: groundedContext.summaryText.substring(0, 150),
    documentId: src.documentId,
    authorityLevel: src.authorityLevel as AuthorityLevel,
    pageNumber: src.pageNumber
  }));

  return {
    sources,
    summaryContext: groundedContext.summaryText,
    hasExactMatch: groundedContext.hasOfficialReference
  };
}
