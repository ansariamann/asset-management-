import React from "react";
import "./FormErrorMessage.css";

interface FormErrorMessageProps {
  message: string;
  id?: string;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message, id }) => {
  if (!message) return null;

  return (
    <div className="form-error-message" id={id} role="alert" aria-live="polite">
      <span className="form-error-icon" aria-hidden="true">
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
      </span>
      <span className="form-error-text">{message}</span>
    </div>
  );
};

export default FormErrorMessage;
