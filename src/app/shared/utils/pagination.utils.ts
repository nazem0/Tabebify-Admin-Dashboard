/**
 * Builds a pagination page array with ellipsis markers (null) for large page sets.
 * Centralises the algorithm previously duplicated across bookings, services, and payments.
 *
 * @returns An array of page indices (0-based) or null to represent an ellipsis gap.
 *
 * @example
 * buildPageArray(20, 10) → [0, null, 9, 10, 11, null, 19]
 */
export function buildPageArray(totalPages: number, currentPage: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const result: (number | null)[] = [0];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);

  if (start > 1) result.push(null);
  for (let i = start; i <= end; i++) result.push(i);
  if (end < totalPages - 2) result.push(null);
  result.push(totalPages - 1);

  return result;
}
