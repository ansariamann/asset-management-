import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Formats an error from any source into a consistent ApiError object
 */
export const formatError = (error: unknown): ApiError => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Handle structured API errors
    if (
      responseData &&
      typeof responseData === "object" &&
      "error" in responseData &&
      responseData.error &&
      typeof responseData.error === "object"
    ) {
      const errorObj = responseData.error as any;
      return {
        message: errorObj.message || "An error occurred",
        code: errorObj.code || `HTTP_${status}`,
        status,
        details: errorObj.details,
      };
    }

    // Handle plain text API errors
    if (responseData && typeof responseData === "string") {
      return {
        message: responseData,
        code: `HTTP_${status}`,
        status,
      };
    }

    // Handle network errors
    if (error.message === "Network Error") {
      return {
        message:
          "Unable to connect to the server. Please check your internet connection.",
        code: "NETWORK_ERROR",
      };
    }

    // Default Axios error
    return {
      message: error.message || "An unexpected error occurred",
      code: `HTTP_${status || "ERROR"}`,
      status,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
      code: "APP_ERROR",
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      code: "APP_ERROR",
    };
  }

  // Handle unknown errors
  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
};

/**
 * Returns a user-friendly error message based on the error type and status
 */
export const getUserFriendlyErrorMessage = (error: ApiError): string => {
  // Handle specific HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return "The request contains invalid data. Please check your input and try again.";
      case 401:
        return "You need to be logged in to perform this action.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This operation couldn't be completed due to a conflict with existing data.";
      case 422:
        return "The submitted data is invalid. Please check your input and try again.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "An internal server error occurred. Please try again later.";
      case 503:
        return "The service is temporarily unavailable. Please try again later.";
    }
  }

  // Handle specific error codes
  if (error.code) {
    switch (error.code) {
      case "NETWORK_ERROR":
        return "Unable to connect to the server. Please check your internet connection.";
      case "TIMEOUT_ERROR":
        return "The request timed out. Please try again later.";
      case "DUPLICATE_SERIAL":
        return "An asset with this serial number already exists.";
    }
  }

  // Return the original message if we don't have a specific user-friendly message
  return error.message;
};

/**
 * Type guard to check if an error is an AxiosError
 */
function isAxiosError(error: any): error is AxiosError {
  return error && error.isAxiosError === true;
}
