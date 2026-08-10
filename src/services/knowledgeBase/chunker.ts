import { KnowledgeDocument, KnowledgeChunk } from '../../types/knowledgeBase';

export interface ChunkingOptions {
  maxChunkSize?: number; // Target max characters per chunk (default 600)
  overlapSize?: number;  // Overlap characters between chunks (default 80)
  preserveSections?: boolean;
}

/**
 * KnowledgeChunker
 * Utility for splitting official educational documents into searchable, metadata-enriched chunks.
 */
export class KnowledgeChunker {
  /**
   * Chunks a document based on section headers or structural paragraphs.
   */
  static chunkDocument(
    doc: KnowledgeDocument,
    rawText: string,
    options: ChunkingOptions = {}
  ): KnowledgeChunk[] {
    const maxChunkSize = options.maxChunkSize || 600;
    const overlapSize = options.overlapSize || 80;

    // Split text into lines/sections first
    const lines = rawText.split('\n');
    const chunks: KnowledgeChunk[] = [];

    let currentSectionTitle = doc.title;
    let currentBuffer = '';
    let currentPageNumber = 1;
    let chunkCounter = 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect page markers like [ص. 12] or [Page 5]
      const pageMatch = trimmed.match(/\[(?:ص|صفحة|Page)\s*[:.]?\s*(\d+)\]/i);
      if (pageMatch) {
        currentPageNumber = parseInt(pageMatch[1], 10);
      }

      // Detect header markers like ### Section Title or 1. Title
      if (trimmed.startsWith('#') || trimmed.match(/^(?:القسم|المحور|المقطع|الباب|النهج|المادة|الفقرة|\d+\.)\s*:/)) {
        if (currentBuffer.length >= 100) {
          chunks.push(this.createChunkObject(doc, currentBuffer, currentSectionTitle, currentPageNumber, chunkCounter++));
          // keep overlap
          currentBuffer = currentBuffer.slice(Math.max(0, currentBuffer.length - overlapSize));
        }
        currentSectionTitle = trimmed.replace(/^#+\s*/, '').trim();
      }

      currentBuffer += (currentBuffer ? '\n' : '') + trimmed;

      if (currentBuffer.length >= maxChunkSize) {
        chunks.push(this.createChunkObject(doc, currentBuffer, currentSectionTitle, currentPageNumber, chunkCounter++));
        currentBuffer = currentBuffer.slice(Math.max(0, currentBuffer.length - overlapSize));
      }
    }

    if (currentBuffer.trim().length > 20) {
      chunks.push(this.createChunkObject(doc, currentBuffer, currentSectionTitle, currentPageNumber, chunkCounter++));
    }

    return chunks;
  }

  private static createChunkObject(
    doc: KnowledgeDocument,
    text: string,
    sectionTitle: string,
    pageNumber: number,
    index: number
  ): KnowledgeChunk {
    // Extract keywords from text
    const textKeywords = text
      .split(/[\s,،.()/:\-\n]+/)
      .filter(w => w.length > 3)
      .slice(0, 10);

    const mergedKeywords = Array.from(new Set([...doc.keywords, ...textKeywords]));

    return {
      id: `chunk-${doc.id}-${index}-${Date.now().toString(36)}`,
      documentId: doc.id,
      text: text.trim(),
      pageNumber,
      sectionTitle,
      subject: doc.subject,
      schoolLevel: doc.schoolLevel,
      component: doc.component,
      unit: doc.unit,
      lesson: doc.lesson,
      keywords: mergedKeywords,
      createdAt: Date.now()
    };
  }
}
