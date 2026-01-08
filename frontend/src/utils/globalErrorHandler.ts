/**
 * Global error handler for uncaught exceptions and promise rejections
 */

import { formatError } from "./errorHandler";

// Store the toast function for use in the global handlers
let showErrorToast: ((error: any) => void) | null = null;

/**
 * Initialize the global error handler with a toast function
 * @param errorToastFn Function to show error toasts
 */
export const initGlobalErrorHandler = (errorToastFn: (error: any) => void) => {
  showErrorToast = errorToastFn;

  // Set up global error handlers
  setupGlobalHandlers();
};

/**
 * Set up global error handlers for uncaught exceptions and unhandled promise rejections
 */
const setupGlobalHandlers = () => {
  // Handle uncaught exceptions
  window.addEventListener("error", (event) => {
    handleGlobalError(event.error || new Error(event.message));
    // Don't prevent default to allow browser's default error handling
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    handleGlobalError(event.reason);
    // Don't prevent default to allow browser's default error handling
  });
};

/**
 * Handle a global error by logging it and showing a toast if possible
 * @param error The error that occurred
 */
const handleGlobalError = (error: any) => {
  const formattedError = formatError(error);

  // Log the error to console
  console.error("Uncaught error:", formattedError);

  // Show toast notification if available
  if (showErrorToast) {
    showErrorToast(formattedError);
  }

  // You could also send the error to a monitoring service like Sentry here
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error);
  // }
};

export default initGlobalErrorHandler;
