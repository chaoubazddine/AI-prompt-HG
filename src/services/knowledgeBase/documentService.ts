import { KnowledgeDocument, KnowledgeChunk, KnowledgeQueryFilters } from '../../types/knowledgeBase';
import { OFFICIAL_MOROCCAN_DOCUMENTS } from './data/officialSeed';
import { KnowledgeChunker } from './chunker';

/**
 * KnowledgeDocumentService
 * Admin & Storage Service for KnowledgeDocuments and KnowledgeChunks.
 * Operates with verified seeds and filters out UNVERIFIED documents from grounding queries.
 */
export class KnowledgeDocumentService {
  private static documentsStore: Map<string, KnowledgeDocument> = new Map();
  private static chunksStore: Map<string, KnowledgeChunk[]> = new Map();
  private static isInitialized = false;

  private static ensureInitialized() {
    if (this.isInitialized) return;
    OFFICIAL_MOROCCAN_DOCUMENTS.forEach(item => {
      this.documentsStore.set(item.doc.id, { ...item.doc });
      this.chunksStore.set(item.doc.id, [...item.chunks]);
    });
    this.isInitialized = true;
  }

  /**
   * Create a new document in the Knowledge Base
   */
  static async createDocument(
    docInput: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>,
    rawContent?: string,
    providedChunks?: Omit<KnowledgeChunk, 'id' | 'documentId' | 'createdAt'>[]
  ): Promise<{ document: KnowledgeDocument; chunks: KnowledgeChunk[] }> {
    this.ensureInitialized();

    const id = `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const document: KnowledgeDocument = {
      ...docInput,
      id,
      verificationStatus: docInput.verificationStatus || 'REQUIRES_REVIEW',
      knowledgeCategory: docInput.knowledgeCategory || 'PEDAGOGICAL_ENRICHMENT',
      retrievalAllowed: docInput.retrievalAllowed !== false,
      createdAt: now,
      updatedAt: now
    };

    let chunks: KnowledgeChunk[] = [];

    if (rawContent && rawContent.trim().length > 0) {
      chunks = KnowledgeChunker.chunkDocument(document, rawContent);
    } else if (providedChunks && providedChunks.length > 0) {
      chunks = providedChunks.map((c, idx) => ({
        ...c,
        id: `chunk-${id}-${idx + 1}-${now.toString(36)}`,
        documentId: id,
        createdAt: now
      }));
    }

    this.documentsStore.set(id, document);
    this.chunksStore.set(id, chunks);

    return { document, chunks };
  }

  /**
   * Update an existing document metadata
   */
  static async updateDocument(
    id: string,
    updates: Partial<Omit<KnowledgeDocument, 'id' | 'createdAt'>>
  ): Promise<KnowledgeDocument> {
    this.ensureInitialized();
    const existing = this.documentsStore.get(id);
    if (!existing) {
      throw new Error(`KnowledgeDocument with ID "${id}" not found.`);
    }

    const updatedDoc: KnowledgeDocument = {
      ...existing,
      ...updates,
      updatedAt: Date.now()
    };

    this.documentsStore.set(id, updatedDoc);

    // Synchronize document metadata changes into chunks
    const chunks = this.chunksStore.get(id) || [];
    const updatedChunks = chunks.map(c => ({
      ...c,
      subject: updatedDoc.subject,
      schoolLevel: updatedDoc.schoolLevel,
      component: updatedDoc.component || c.component,
      unit: updatedDoc.unit || c.unit,
      lesson: updatedDoc.lesson || c.lesson
    }));
    this.chunksStore.set(id, updatedChunks);

    return updatedDoc;
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<KnowledgeDocument | null> {
    this.ensureInitialized();
    return this.documentsStore.get(id) || null;
  }

  /**
   * Delete a document and its associated chunks
   */
  static async deleteDocument(id: string): Promise<boolean> {
    this.ensureInitialized();
    const docExisted = this.documentsStore.delete(id);
    this.chunksStore.delete(id);
    return docExisted;
  }

  /**
   * List all documents matching optional filters
   */
  static async listDocuments(filters: KnowledgeQueryFilters = {}): Promise<KnowledgeDocument[]> {
    this.ensureInitialized();
    let docs = Array.from(this.documentsStore.values());

    if (filters.status) {
      docs = docs.filter(d => d.status === filters.status);
    }
    if (filters.verificationStatus) {
      docs = docs.filter(d => d.verificationStatus === filters.verificationStatus);
    }
    if (filters.knowledgeCategory) {
      docs = docs.filter(d => d.knowledgeCategory === filters.knowledgeCategory);
    }
    if (filters.subject) {
      docs = docs.filter(d => d.subject === filters.subject);
    }
    if (filters.schoolLevel && filters.schoolLevel !== 'جميع المستويات') {
      docs = docs.filter(d => d.schoolLevel === filters.schoolLevel || d.schoolLevel === 'جميع المستويات');
    }
    if (filters.component && filters.component !== 'عام') {
      docs = docs.filter(d => d.component === filters.component || d.component === 'عام');
    }
    if (filters.authorityLevel) {
      docs = docs.filter(d => d.authorityLevel === filters.authorityLevel);
    }

    return docs;
  }

  /**
   * Get all chunks associated with a document
   */
  static async getChunksForDocument(documentId: string): Promise<KnowledgeChunk[]> {
    this.ensureInitialized();
    return this.chunksStore.get(documentId) || [];
  }

  /**
   * Get all active & VERIFIED chunks across all active documents for retrieval engine
   */
  static async getAllActiveChunks(): Promise<{ doc: KnowledgeDocument; chunk: KnowledgeChunk }[]> {
    this.ensureInitialized();
    const result: { doc: KnowledgeDocument; chunk: KnowledgeChunk }[] = [];

    for (const doc of this.documentsStore.values()) {
      if (doc.status !== 'active') continue;
      // Rule 7 & 4: Unverified or non-retrievable documents are excluded from grounded retrieval
      if (doc.verificationStatus === 'UNVERIFIED') continue;
      if (doc.retrievalAllowed === false) continue;

      const chunks = this.chunksStore.get(doc.id) || [];
      for (const chunk of chunks) {
        result.push({ doc, chunk });
      }
    }

    return result;
  }
}
