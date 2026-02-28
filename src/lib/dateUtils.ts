/**
 * Date utility functions for consistent dd/mm/yyyy formatting across the system
 */

/**
 * Format a date to dd/mm/yyyy format
 * @param date - Date string (ISO format) or Date object
 * @returns Formatted date string in dd/mm/yyyy format
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Convert dd/mm/yyyy format to ISO format (yyyy-mm-dd) for API
 * @param dateString - Date string in dd/mm/yyyy format
 * @returns ISO format date string (yyyy-mm-dd)
 */
export const parseDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error parsing date:', error);
    return '';
  }
};

/**
 * Convert ISO format (yyyy-mm-dd) to format suitable for HTML5 date input
 * HTML5 date inputs require yyyy-mm-dd format for the value attribute
 * @param isoDate - Date string in ISO format (yyyy-mm-dd) or dd/mm/yyyy format
 * @returns Date string in yyyy-mm-dd format for input value
 */
export const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return '';
  
  // If already in yyyy-mm-dd format, return as is
  if (isoDate.includes('-') && !isoDate.includes('/')) return isoDate;
  
  // If in dd/mm/yyyy format, convert to yyyy-mm-dd
  if (isoDate.includes('/')) return parseDate(isoDate);
  
  return isoDate;
};

/**
 * Convert dd/mm/yyyy to ISO yyyy-mm-dd for API/database storage
 * @param displayDate - Date string in dd/mm/yyyy format
 * @returns ISO format date string (yyyy-mm-dd)
 */
export const convertToISODate = (displayDate: string): string => {
  if (!displayDate) return '';
  
  // If already in ISO format, return as is
  if (displayDate.includes('-') && !displayDate.includes('/')) return displayDate;
  
  return parseDate(displayDate);
};
