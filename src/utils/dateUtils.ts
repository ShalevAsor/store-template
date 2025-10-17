// /**
//  * Format  date for display
//  */
// export const formatDate = (date: Date): string => {
//   return date.toLocaleDateString(undefined, {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };
// src/utils/dateUtils.ts

/**
 * Format date for table display (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

// /**
//  * Format date with time (e.g., "January 15, 2024 at 10:30 AM")
//  */
// export function formatDateTime(date: Date | string): string {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;

//   return new Intl.DateTimeFormat("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   }).format(dateObj);
// }

// /**
//  * Format date in short format (e.g., "1/15/24")
//  */
// export function formatDateShort(date: Date | string): string {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;

//   return new Intl.DateTimeFormat("en-US", {
//     month: "numeric",
//     day: "numeric",
//     year: "2-digit",
//   }).format(dateObj);
// }

// /**
//  * Format date in ISO format (e.g., "2024-01-15")
//  */
// export function formatDateISO(date: Date | string): string {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;
//   return dateObj.toISOString().split('T')[0];
// }

// /**
//  * Get relative time (e.g., "2 hours ago", "in 3 days")
//  */
// export function formatRelativeTime(date: Date | string): string {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;
//   const now = new Date();
//   const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

//   const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

//   // Past times
//   if (diffInSeconds > 0) {
//     if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
//     if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
//     if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
//     if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
//     if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
//     if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
//     return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
//   }

//   // Future times
//   const absDiff = Math.abs(diffInSeconds);
//   if (absDiff < 60) return rtf.format(absDiff, 'second');
//   if (absDiff < 3600) return rtf.format(Math.floor(absDiff / 60), 'minute');
//   if (absDiff < 86400) return rtf.format(Math.floor(absDiff / 3600), 'hour');
//   if (absDiff < 604800) return rtf.format(Math.floor(absDiff / 86400), 'day');
//   if (absDiff < 2592000) return rtf.format(Math.floor(absDiff / 604800), 'week');
//   if (absDiff < 31536000) return rtf.format(Math.floor(absDiff / 2592000), 'month');
//   return rtf.format(Math.floor(absDiff / 31536000), 'year');
// }

// /**
//  * Format time only (e.g., "10:30 AM")
//  */
// export function formatTime(date: Date | string): string {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;

//   return new Intl.DateTimeFormat("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   }).format(dateObj);
// }

// /**
//  * Check if date is today
//  */
// export function isToday(date: Date | string): boolean {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;
//   const today = new Date();

//   return (
//     dateObj.getDate() === today.getDate() &&
//     dateObj.getMonth() === today.getMonth() &&
//     dateObj.getFullYear() === today.getFullYear()
//   );
// }

// /**
//  * Check if date is in the past
//  */
// export function isPast(date: Date | string): boolean {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;
//   return dateObj < new Date();
// }

// /**
//  * Check if date is in the future
//  */
// export function isFuture(date: Date | string): boolean {
//   const dateObj = typeof date === 'string' ? new Date(date) : date;
//   return dateObj > new Date();
// }

// /**
//  * Get days between two dates
//  */
// export function getDaysBetween(startDate: Date | string, endDate: Date | string): number {
//   const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
//   const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

//   const diffInMilliseconds = Math.abs(end.getTime() - start.getTime());
//   return Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
// }
