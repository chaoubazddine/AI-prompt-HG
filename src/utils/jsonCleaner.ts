/**
 * Cleans and repairs JSON strings returned by LLMs (e.g., Gemini) before parsing.
 * Fixes common issues like:
 * - Markdown code fences
 * - Leading/trailing non-JSON text
 * - Smart/curly quotes
 * - Unescaped control characters inside string literals (newlines, tabs)
 * - Trailing commas before closing braces/brackets
 * - Incomplete/truncated JSON output (auto-closes open quotes, brackets, and braces)
 * - Stray unescaped double quotes inside strings
 */

const VALID_JSON_ESCAPE_CHARS = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);

/**
 * Repairs unbalanced quotes, brackets, and braces if an LLM truncated the JSON.
 */
function repairTruncatedJson(json: string): string {
  let cleaned = json.trim();
  if (!cleaned) return '{}';

  // Check state of quotes and brackets
  let inString = false;
  let isEscaped = false;
  const stack: ('{' | '[')[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  // If string was left open due to truncation, close it
  if (inString) {
    cleaned += '"';
  }

  // Remove trailing commas right before end
  cleaned = cleaned.replace(/,\s*$/, '');

  // Close unclosed arrays and objects
  while (stack.length > 0) {
    const top = stack.pop();
    if (top === '{') {
      cleaned = cleaned.replace(/,\s*$/, '') + '}';
    } else if (top === '[') {
      cleaned = cleaned.replace(/,\s*$/, '') + ']';
    }
  }

  return cleaned;
}

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
  } else if (firstBrace !== -1) {
    cleaned = cleaned.substring(firstBrace);
  }

  // 3. Replace smart quotes
  cleaned = cleaned
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'");

  // 4. Character-by-character pass to repair string literals and control characters
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
        // Lookahead heuristic: is this quote closing the string, or is it an unescaped internal quote?
        // A closing quote is typically followed by whitespace, then one of: ',', '}', ']', ':'
        let j = i + 1;
        while (j < cleaned.length && /\s/.test(cleaned[j])) j++;
        const nextChar = cleaned[j];
        
        if (nextChar === ',' || nextChar === '}' || nextChar === ']' || nextChar === ':' || j === cleaned.length) {
          result += char;
          inString = false;
        } else {
          // It's likely an unescaped double quote inside the Arabic/English text (e.g. quote around word)
          result += '\\"';
        }
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

  // 6. Repair any truncated structure
  result = repairTruncatedJson(result);

  return result;
};

export const safeJsonParse = <T = any>(text: string): T => {
  const cleaned = cleanJsonString(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    // If standard parse fails, try additional relaxed fallback
    try {
      // Remove any double escaped quotes that might conflict
      const fallbackClean = cleaned.replace(/\\"/g, "'").replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(repairTruncatedJson(fallbackClean)) as T;
    } catch {
      console.error("JSON parse error:", err?.message, "Cleaned JSON preview:", cleaned.slice(0, 300));
      throw err;
    }
  }
};

