export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
