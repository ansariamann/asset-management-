import React, { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  confirmVariant?: "primary" | "danger";
  isConfirmLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  confirmVariant = "primary",
  isConfirmLoading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element and focus the confirm button when the dialog opens
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the confirm button
      if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
      }
    } else if (previousFocusRef.current) {
      // Restore focus when dialog closes
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close the dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  // Handle tab key to trap focus within the dialog
  useEffect(() => {
    const handleTabKey = (event: KeyboardEvent) => {
      if (!isOpen || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // If shift+tab and focus is on first element, move to last element
      if (
        event.key === "Tab" &&
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab and focus is on last element, move to first element
      else if (
        event.key === "Tab" &&
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  // Prevent scrolling of the background when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-dialog-backdrop" onClick={handleBackdropClick}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        ref={dialogRef}
      >
        <div className="confirm-dialog-header">
          <h2 id="dialog-title">{title}</h2>
        </div>
        <div className="confirm-dialog-body">
          <p id="dialog-description">{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button
            className="cancel-button"
            onClick={onCancel}
            type="button"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-button ${
              confirmVariant === "danger" ? "btn-danger" : ""
            } ${isConfirmLoading ? "btn-loading" : ""}`}
            onClick={onConfirm}
            type="button"
            ref={confirmButtonRef}
            aria-label={confirmText}
            disabled={isConfirmLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
