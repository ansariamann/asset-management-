import React, { ComponentType, useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import LoadingIndicator from "./LoadingIndicator";
import ErrorBoundary from "./ErrorBoundary";

interface WithErrorHandlingProps {
  loading?: boolean;
  error?: any;
  retry?: () => void;
}

/**
 * Higher-order component that adds error handling and loading states
 * @param WrappedComponent The component to wrap
 * @param loadingMessage Custom loading message
 * @returns A component with error handling and loading states
 */
export function withErrorHandling<P extends object>(
  WrappedComponent: ComponentType<P>,
  loadingMessage: string = "Loading..."
) {
  return function WithErrorHandling(props: P & WithErrorHandlingProps) {
    const { loading, error, retry, ...rest } = props;
    const { showError } = useToast();
    const [hasShownError, setHasShownError] = useState(false);

    // Show error toast when error changes
    useEffect(() => {
      if (error && !hasShownError) {
        showError(error);
        setHasShownError(true);
      }
    }, [error, hasShownError, showError]);

    // Reset error state when component is retried
    useEffect(() => {
      if (!error) {
        setHasShownError(false);
      }
    }, [error]);

    if (loading) {
      return <LoadingIndicator text={loadingMessage} />;
    }

    return (
      <ErrorBoundary>
        <WrappedComponent {...(rest as P)} />
      </ErrorBoundary>
    );
  };
}

export default withErrorHandling;
