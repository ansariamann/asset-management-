import React, { Component, ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="error-boundary-container">
      <div className="error-boundary-content">
        <h1 className="error-boundary-title">Something went wrong</h1>
        <p className="error-boundary-message">
          We're sorry, but an unexpected error has occurred.
        </p>
        {error && (
          <div className="error-boundary-details">
            <p className="error-name">{error.name}</p>
            <p className="error-message">{error.message}</p>
          </div>
        )}
        <div className="error-boundary-actions">
          <button
            onClick={handleReload}
            className="btn btn-primary"
            aria-label="Reload the page"
          >
            Reload Page
          </button>
          <button
            onClick={handleGoHome}
            className="btn btn-secondary"
            aria-label="Go to home page"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// This wrapper is needed to use hooks with class components
const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
