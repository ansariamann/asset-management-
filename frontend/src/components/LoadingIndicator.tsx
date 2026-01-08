import React from "react";
import "./LoadingIndicator.css";

interface LoadingIndicatorProps {
  size?: "small" | "medium" | "large";
  text?: string;
  showText?: boolean;
  fullscreen?: boolean;
  fullPage?: boolean;
  overlay?: boolean;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "medium",
  text = "Loading...",
  showText = true,
  fullscreen = false,
  fullPage = false,
  overlay = false,
  className = "",
}) => {
  const baseClass = fullscreen ? "loading-overlay" : "loading-indicator";
  const sizeClass = size !== "medium" ? `${baseClass}-${size}` : baseClass;
  const containerClass = `${sizeClass} ${fullPage ? "full-page" : ""} ${
    overlay ? "overlay" : ""
  } ${className}`.trim();

  return (
    <div
      className={containerClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-circle"></div>
      </div>
      {showText && text && <p className="loading-text">{text}</p>}
      {showText && <span className="sr-only">{text}</span>}
    </div>
  );
};

export default LoadingIndicator;
