/**
 * Utility to dynamically calculate and format the Moroccan academic school year.
 * The academic year in Morocco runs from September (month index 8) to July/August.
 * For example:
 * - November 2026 -> "2026/2027"
 * - March 2027 -> "2026/2027"
 * - September 2027 -> "2027/2028"
 */

export function getCurrentAcademicYear(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0 is January, 8 is September

  if (month >= 8) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

export function formatAcademicYear(customYear?: string | null): string {
  if (customYear && customYear.trim()) {
    return customYear.trim();
  }
  return getCurrentAcademicYear();
}
