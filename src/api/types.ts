export interface BaseApiResponse {
  success: boolean;
  error?: string;
}

export interface ApiResponse<T = any> extends BaseApiResponse {
  data?: T;
  dateImported?: string | number | Date;
}

export interface ImportApiResponse extends ApiResponse {
  dateImported: string | number | Date;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}