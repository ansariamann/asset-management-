import React from "react";
import "./ErrorDisplay.css";
import { ApiError } from "../utils/errorHandler";

interface ErrorDisplayProps {
  error: ApiError;
  title?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
  backText?: string;
  retryText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = "An error occurred",
  onDismiss,
  onRetry,
  onBack,
  backText = "Go Back",
  retryText = "Try Again",
}) => {
  return (
    <div className="error-display-container" role="alert" aria-live="assertive">
      <div className="error-display-card">
        <div className="error-display-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="error-display-title">{title}</h2>
        <p className="error-display-message">{error.message}</p>
        {error.code && <p className="error-display-code">{error.code}</p>}
        {error.details && (
          <div className="error-display-details">
            {Object.entries(error.details).map(([key, value]) => (
              <p key={key} className="error-display-detail">
                {String(value)}
              </p>
            ))}
          </div>
        )}
        <div className="error-display-actions">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="btn btn-secondary"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-secondary"
              aria-label={backText}
            >
              {backText}
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn btn-primary"
              aria-label={retryText}
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
