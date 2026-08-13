/**
 * Cleans and repairs JSON strings returned by LLMs (e.g., Gemini) before parsing.
 * Fixes common issues like:
 * - Markdown code fences
 * - Leading/trailing non-JSON text
 * - Smart/curly quotes
 * - Unescaped control characters inside string literals (newlines, tabs)
 * - Trailing commas before closing braces/brackets
 * - Invalid escape sequences inside strings
 */

const VALID_JSON_ESCAPE_CHARS = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);

export const cleanJsonString = (text: string): string => {
  if (!text) return '';

  // 1. Strip markdown fences
  let cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // 2. Find outermost JSON boundary
  const firstBrace = cleaned.search(/[{[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 3. Replace smart quotes
  cleaned = cleaned
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'");

  // 4. Character-by-character pass to repair string literals
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const code = char.charCodeAt(0);

    if (inString) {
      if (isEscaped) {
        if (!VALID_JSON_ESCAPE_CHARS.has(char)) {
          // If it was an invalid escape sequence, escape the backslash itself so \X becomes \\X
          result = result.slice(0, -1) + '\\\\' + char;
        } else {
          result += char;
        }
        isEscaped = false;
      } else if (char === '\\') {
        result += char;
        isEscaped = true;
      } else if (char === '"') {
        result += char;
        inString = false;
      } else if (code < 32) {
        // Unescaped control character inside string literal!
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          const hex = code.toString(16).padStart(4, '0');
          result += `\\u${hex}`;
        }
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }

  // 5. Remove trailing commas before closing braces/brackets
  result = result.replace(/,\s*([}\]])/g, '$1');

  return result;
};

export const safeJsonParse = <T = any>(text: string): T => {
  const cleaned = cleanJsonString(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    console.error("JSON parse error:", err?.message, "Cleaned JSON preview:", cleaned.slice(0, 200));
    throw err;
  }
};
