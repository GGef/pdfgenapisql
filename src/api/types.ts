export interface ApiResponse<T = any> {
  dateImported: string | number | Date;
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}