import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, ToastProps } from "../components/Toast";
import {
  formatError,
  getUserFriendlyErrorMessage,
} from "../utils/errorHandler";
// import "./ToastContext.css";

interface ToastContextType {
  addToast: (
    message: string,
    type: ToastProps["type"],
    duration?: number
  ) => string;
  removeToast: (id: string) => void;
  showSuccess: (message: string, duration?: number) => string;
  showError: (error: unknown, duration?: number) => string;
  showInfo: (message: string, duration?: number) => string;
  showWarning: (message: string, duration?: number) => string;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastProps["type"], duration = 5000): string => {
      const id = uuidv4();
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message, type, duration, onClose: () => {} },
      ]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods for different toast types
  const showSuccess = useCallback(
    (message: string, duration?: number): string => {
      return addToast(message, "success", duration);
    },
    [addToast]
  );

  const showError = useCallback(
    (error: unknown, duration = 8000): string => {
      const formattedError = formatError(error);
      const userFriendlyMessage = getUserFriendlyErrorMessage(formattedError);
      return addToast(userFriendlyMessage, "error", duration);
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number): string => {
      return addToast(message, "info", duration);
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number): string => {
      return addToast(message, "warning", duration);
    },
    [addToast]
  );

  const contextValue = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
