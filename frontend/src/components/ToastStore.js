/* src/components/ToastStore.js - Centralized Toast Management */

let toasts = [];
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(toasts));
}

const ToastStore = {
  /** Subscribe to toast list changes. Returns an unsubscribe function. */
  subscribe(listener) {
    listeners.add(listener);
    listener(toasts);
    return () => listeners.delete(listener);
  },

  add({ message, type = "info", duration = 5000 }) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    toasts = [...toasts, { id, message, type }];
    notify();

    if (duration > 0) {
      setTimeout(() => ToastStore.remove(id), duration);
    }

    return id;
  },

  remove(id) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },

  removeAll() {
    toasts = [];
    notify();
  },

  success(message, duration) {
    return ToastStore.add({ message, type: "success", duration });
  },
  error(message, duration) {
    return ToastStore.add({ message, type: "error", duration });
  },
  warning(message, duration) {
    return ToastStore.add({ message, type: "warning", duration });
  },
  info(message, duration) {
    return ToastStore.add({ message, type: "info", duration });
  },
};

export default ToastStore;
