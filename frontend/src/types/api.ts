export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export class ApiException extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
