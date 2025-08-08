/**
 * Error handling utilities for API and application errors
 */

import { useUIStore } from '../stores/uiStore';

// Error types
export interface ApiError {
  message: string;
  status_code: number;
  error_id?: string;
  path?: string;
  method?: string;
  timestamp?: string;
  details?: any;
  code?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export class ApplicationError extends Error {
  public code?: string;
  public statusCode?: number;
  public details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Parse error from API response
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  let error: ApiError = {
    message: 'An unexpected error occurred',
    status_code: response.status
  };

  try {
    const data = await response.json();
    
    if (data.error) {
      error = data.error;
    } else if (data.detail) {
      // FastAPI default error format
      error.message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      error.details = data.detail;
    } else if (data.message) {
      error.message = data.message;
    }
  } catch (e) {
    // If response is not JSON, use status text
    error.message = response.statusText || 'Request failed';
  }

  return error;
};

/**
 * Handle API errors and show appropriate messages
 */
export const handleApiError = async (error: Response | Error): Promise<void> => {
  const { showToast } = useUIStore.getState();

  if (error instanceof Response) {
    const apiError = await parseApiError(error);
    
    // Handle specific error codes
    switch (apiError.status_code) {
      case 400:
        showToast('error', apiError.message || 'Invalid request');
        break;
      case 401:
        showToast('error', 'You are not authenticated. Please log in.');
        // Redirect to login if needed
        break;
      case 403:
        showToast('error', 'You do not have permission to perform this action.');
        break;
      case 404:
        showToast('error', apiError.message || 'Resource not found');
        break;
      case 409:
        showToast('error', apiError.message || 'Resource already exists');
        break;
      case 422:
        // Validation error
        if (apiError.details) {
          const errors = Object.entries(apiError.details)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          showToast('error', `Validation failed:\n${errors}`);
        } else {
          showToast('error', apiError.message || 'Validation failed');
        }
        break;
      case 429:
        showToast('error', 'Too many requests. Please try again later.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        showToast('error', 'Server error. Please try again later.');
        break;
      default:
        showToast('error', apiError.message || 'An unexpected error occurred');
    }

    throw new ApplicationError(
      apiError.message,
      apiError.code,
      apiError.status_code,
      apiError.details
    );
  } else if (error instanceof Error) {
    // Handle network errors
    if (error.message === 'Failed to fetch') {
      showToast('error', 'Network error. Please check your connection.');
    } else {
      showToast('error', error.message);
    }
    throw error;
  }
};

/**
 * Retry failed request with exponential backoff
 */
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApplicationError && 
          error.statusCode && 
          error.statusCode >= 400 && 
          error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
};

/**
 * Create safe API call wrapper
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<Response>,
  options?: {
    showSuccess?: boolean;
    successMessage?: string;
    showError?: boolean;
    errorMessage?: string;
    retry?: boolean;
    retryCount?: number;
  }
): Promise<T | null> => {
  const { showToast } = useUIStore.getState();
  const {
    showSuccess = false,
    successMessage = 'Operation successful',
    showError = true,
    errorMessage,
    retry = false,
    retryCount = 3
  } = options || {};

  try {
    const makeRequest = async () => {
      const response = await apiCall();
      
      if (!response.ok) {
        throw response;
      }
      
      return response.json();
    };

    const result = retry
      ? await retryRequest(makeRequest, retryCount)
      : await makeRequest();

    if (showSuccess) {
      showToast('success', successMessage);
    }

    return result;
  } catch (error) {
    if (showError) {
      if (errorMessage) {
        showToast('error', errorMessage);
      } else {
        await handleApiError(error as Response | Error);
      }
    }
    return null;
  }
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof ApplicationError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Log error to console (development) or error service (production)
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  } else {
    // TODO: Send to error logging service
    // logToService(error, context);
  }
};