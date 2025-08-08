// src/utils/dateUtils.ts
export function getDateValue(date: Date | null): string | null {
    return date ? date.toISOString().split('T')[0] : null; // Convert Date to string or return null
}

export function parseDateValue(dateString: string | null): Date | null {
  return dateString ? new Date(dateString) : null; // Convert string to Date or return null
}
