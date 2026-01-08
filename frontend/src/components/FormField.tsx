import React from "react";
import FormErrorMessage from "./FormErrorMessage";
import "./FormField.css";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  required = false,
  children,
  hint,
}) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  // Determine if the child is an input, select, or textarea to pass aria attributes
  const childWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? errorId : hint ? hintId : undefined,
        ...child.props,
      });
    }
    return child;
  });

  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>

      {hint && (
        <div id={hintId} className="form-hint">
          {hint}
        </div>
      )}

      {childWithProps}

      <FormErrorMessage message={error || ""} id={errorId} />
    </div>
  );
};

export default FormField;
