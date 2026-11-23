/**
 * Utilities to normalize and parse learner tasks ("مهام المتعلم" / studentActivities)
 * into concise, structured bullet-point answers ("رؤوس أقلام").
 */

const LEADING_META_VERBS =
  /^(?:يقوم المتعلم(?:ون)? بـ?\s*|يجيب المتعلم(?:ون)?(?:\s+عن الأسئلة)?(?:\s*[:\-–])?\s*|يستخرج المتعلم(?:ون)?\s*|يحدد المتعلم(?:ون)?\s*|يرصد المتعلم(?:ون)?\s*|يبرز المتعلم(?:ون)?\s*|يستنتج المتعلم(?:ون)?\s*|يصنف المتعلم(?:ون)?\s*|يوظف المتعلم(?:ون)?\s*|يوط[ّ]?ن المتعلم(?:ون)?\s*|يرتب المتعلم(?:ون)?\s*|يشارك المتعلم(?:ون)? في\s*|يعمل المتعلم(?:ون)? على\s*)/;

function cleanSingleBulletLine(line: string): string {
  let cleaned = line.trim();
  // Remove leading bullet symbols (•, ●, ▪, -, *, –) and question/answer prefixes (ج1:, 1., 1-)
  cleaned = cleaned.replace(/^[•●▪▫\-–—*]+\s*/g, '');
  cleaned = cleaned.replace(/^(?:ج\s*\d+\s*[:\-–.]\s*|\d+\s*[.\-)]\s*)/g, '');
  cleaned = cleaned.replace(/^[•●▪▫\-–—*]+\s*/g, '');

  // Strip passive third-person learner narration prefix if followed by substantial content
  const withoutMeta = cleaned.replace(LEADING_META_VERBS, '').trim();
  if (withoutMeta.length >= 12) {
    cleaned = withoutMeta;
  }

  return cleaned.trim();
}

/**
 * Parses any studentActivities string into clean individual bullet-point strings (without the bullet character).
 */
export function parseStudentActivitiesBullets(raw?: string): string[] {
  if (!raw || typeof raw !== 'string') return [];

  // Normalize inline bullets into newline-separated items
  const normalized = raw
    .replace(/\r\n/g, '\n')
    .replace(/\s*[•●▪]\s*/g, '\n• ')
    .trim();

  let lines = normalized
    .split('\n')
    .map((l) => cleanSingleBulletLine(l))
    .filter((l) => l.length > 0);

  // If everything was a single long paragraph without newlines/bullets, split carefully by sentence/semicolon
  if (lines.length === 1 && lines[0].length > 90) {
    const parts = lines[0]
      .split(/(?:\s*[؛]\s*|\.\s+(?=[\u0600-\u06FF]))/)
      .map((p) => cleanSingleBulletLine(p))
      .filter((p) => p.length > 0);
    if (parts.length > 1) {
      lines = parts;
    }
  }

  return lines;
}

/**
 * Formats studentActivities into a canonical multi-line string with "• " bullet points.
 */
export function formatStudentActivitiesAsBulletPoints(raw?: string): string {
  const bullets = parseStudentActivitiesBullets(raw);
  if (bullets.length === 0) return '';
  return bullets.map((b) => `• ${b}`).join('\n');
}
