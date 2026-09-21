/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MARATHI_DAYS = [
  'रविवार',
  'सोमवार',
  'मंगळवार',
  'बुधवार',
  'गुरुवार',
  'शुक्रवार',
  'शनिवार',
];

/**
 * Returns the day of the week in Marathi
 */
export function getMarathiDay(date: Date = new Date()): string {
  return MARATHI_DAYS[date.getDay()];
}

/**
 * Returns formatted date (DD/MM/YYYY)
 */
export function getFormattedDate(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Returns HTML date input format (YYYY-MM-DD)
 */
export function getInputDateFormat(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts YYYY-MM-DD to DD/MM/YYYY
 */
export function convertInputDateToDisplay(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

/**
 * Converts DD/MM/YYYY to YYYY-MM-DD
 */
export function convertDisplayDateToInput(displayDate: string): string {
  if (!displayDate) return '';
  const parts = displayDate.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return '';
}

/**
 * Returns formatted 12-hour time with AM/PM
 */
export function getFormattedTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Checks if a task is overdue
 */
export function isTaskOverdue(dueDateTime?: string, isCompleted?: boolean): boolean {
  if (!dueDateTime || isCompleted) return false;
  const due = new Date(dueDateTime).getTime();
  if (isNaN(due)) return false;
  return due < Date.now();
}

/**
 * Formats due date-time for display
 */
export function formatDueDateTime(dueDateTime?: string): string {
  if (!dueDateTime) return '';
  const d = new Date(dueDateTime);
  if (isNaN(d.getTime())) return dueDateTime;

  const dateStr = getFormattedDate(d);
  const timeStr = getFormattedTime(d);
  const dayStr = getMarathiDay(d);

  return `${dateStr} (${dayStr}) - ${timeStr} पर्यंत`;
}
