import { CurriculumReference } from '../../types/knowledgeBase';
import { OFFICIAL_CURRICULUM_REFERENCES } from './data/curriculumSeed';

/**
 * CurriculumService
 * Dedicated Reference Curriculum Layer service managing official Moroccan curriculum specifications
 * (Competencies, Cognitive/Skill/Affective Objectives, Key Concepts, Official Pedagogical Guidance).
 */
export class CurriculumService {
  private static curriculumStore: Map<string, CurriculumReference> = new Map();
  private static isInitialized = false;

  private static ensureInitialized() {
    if (this.isInitialized) return;
    OFFICIAL_CURRICULUM_REFERENCES.forEach(ref => {
      this.curriculumStore.set(ref.id, { ...ref });
    });
    this.isInitialized = true;
  }

  /**
   * Find exact or best matching CurriculumReference for a given setup query
   */
  static async getCurriculumReference(params: {
    subject: string;
    schoolLevel: string;
    component: string;
    lesson: string;
    unit?: string;
  }): Promise<CurriculumReference | null> {
    this.ensureInitialized();
    const { subject, schoolLevel, component, lesson, unit } = params;

    const allActive = Array.from(this.curriculumStore.values()).filter(
      r => r.status === 'ACTIVE'
    );

    // 1. Try exact match on subject + schoolLevel + component + lesson
    const exactMatch = allActive.find(r =>
      r.subject === subject &&
      r.schoolLevel === schoolLevel &&
      r.component === component &&
      this.normalizeText(r.lesson) === this.normalizeText(lesson)
    );
    if (exactMatch) return exactMatch;

    // 2. Try partial match on lesson title (includes keywords)
    const normalizedTargetLesson = this.normalizeText(lesson);
    const partialMatch = allActive.find(r =>
      r.subject === subject &&
      r.component === component &&
      (this.normalizeText(r.lesson).includes(normalizedTargetLesson) ||
        normalizedTargetLesson.includes(this.normalizeText(r.lesson)))
    );
    if (partialMatch) return partialMatch;

    // 3. Try component + keywords overlap
    const lessonKeywords = this.extractKeywords(lesson);
    let bestScore = 0;
    let bestCandidate: CurriculumReference | null = null;

    for (const ref of allActive) {
      if (ref.subject !== subject || ref.component !== component) continue;

      let score = 0;
      if (ref.schoolLevel === schoolLevel) score += 3;

      const refText = `${ref.lesson} ${ref.unit || ''} ${ref.keyConcepts.join(' ')}`;
      const normalizedRef = this.normalizeText(refText);

      for (const kw of lessonKeywords) {
        if (normalizedRef.includes(kw)) {
          score += 2;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = ref;
      }
    }

    if (bestCandidate && bestScore >= 4) {
      return bestCandidate;
    }

    return null;
  }

  /**
   * List all curriculum references with optional filters
   */
  static async listReferences(filters?: {
    subject?: string;
    schoolLevel?: string;
    component?: string;
    status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNDER_REVIEW';
  }): Promise<CurriculumReference[]> {
    this.ensureInitialized();
    let result = Array.from(this.curriculumStore.values());

    if (!filters) return result;

    if (filters.status) {
      result = result.filter(r => r.status === filters.status);
    }
    if (filters.subject) {
      result = result.filter(r => r.subject === filters.subject);
    }
    if (filters.schoolLevel) {
      result = result.filter(r => r.schoolLevel === filters.schoolLevel);
    }
    if (filters.component) {
      result = result.filter(r => r.component === filters.component);
    }

    return result;
  }

  /**
   * Add or update a CurriculumReference (Admin usage)
   */
  static async upsertReference(ref: CurriculumReference): Promise<CurriculumReference> {
    this.ensureInitialized();
    this.curriculumStore.set(ref.id, { ...ref });
    return ref;
  }

  /**
   * Helper to normalize Arabic text for comparison (removes alef variations and diacritics)
   */
  private static normalizeText(str: string): string {
    return str
      .replace(/[\u064B-\u065F]/g, '') // remove diacritics
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .toLowerCase()
      .trim();
  }

  private static extractKeywords(str: string): string[] {
    return this.normalizeText(str)
      .split(/[\s,،.()/:\-\n]+/)
      .filter(s => s.length >= 3 && !['درس', 'مادة', 'الوحدة', 'الدرس', 'مكون', 'في'].includes(s));
  }
}
