import React from "react";
import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "text";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  loadingText,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  className = "",
  ...props
}) => {
  const buttonClasses = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full-width" : "",
    isLoading ? "btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClasses}
      disabled={isLoading || disabled}
      aria-busy={isLoading ? "true" : "false"}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner" aria-hidden="true">
          <span className="spinner-circle"></span>
        </span>
      )}

      <span className="btn-content">
        {icon && iconPosition === "left" && (
          <span className="btn-icon btn-icon-left">{icon}</span>
        )}

        <span className="btn-text">
          {isLoading && loadingText ? loadingText : children}
        </span>

        {icon && iconPosition === "right" && (
          <span className="btn-icon btn-icon-right">{icon}</span>
        )}
      </span>
    </button>
  );
};

export default Button;
