/* src/components/Toast.jsx */

import React, { useEffect, useState } from "react";
import ToastStore from "./ToastStore";
import "./Toast.css";

const ICONS = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

function Toast({ type, message, onClose }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span aria-hidden="true">{ICONS[type] || ICONS.info}</span>
      <span>{message}</span>
      <button type="button" className="close-toast" onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}

/**
 * ToastContainer
 * Mount once near the app root. Subscribes to ToastStore and renders
 * whatever toasts are currently active.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => ToastStore.subscribe(setToasts), []);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => ToastStore.remove(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * useToast Hook
 * Convenient hook for triggering toast notifications from any component.
 */
export function useToast() {
  return {
    success: (message, duration) => ToastStore.success(message, duration),
    error: (message, duration) => ToastStore.error(message, duration),
    warning: (message, duration) => ToastStore.warning(message, duration),
    info: (message, duration) => ToastStore.info(message, duration),
  };
}

export default Toast;
