import { format as dateFnsFormat, parseISO, isValid } from 'date-fns';

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'No date';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date value:', date);
      return 'Invalid date';
    }
    
    return dateFnsFormat(dateObj, 'PPP');
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
};

export const parseDate = (date: string | Date): Date => {
  if (date instanceof Date) return date;
  try {
    const parsed = parseISO(date);
    if (!isValid(parsed)) throw new Error('Invalid date');
    return parsed;
  } catch {
    return new Date();
  }
};