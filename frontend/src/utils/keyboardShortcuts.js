/* src/utils/keyboardShortcuts.js */

import { useEffect } from "react";

/**
 * Keyboard Shortcuts Utility
 * Provides keyboard accessibility for Vita Forge application
 */

function matchesCombo(event, combo) {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const needsCtrl = parts.includes("ctrl");
  const needsShift = parts.includes("shift");
  const needsAlt = parts.includes("alt");

  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  if (needsCtrl && !ctrlOrMeta) return false;
  if (!needsCtrl && ctrlOrMeta) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;

  return event.key.toLowerCase() === key;
}

/**
 * useKeyboardShortcuts
 * React hook to register a map of shortcuts ({ "ctrl+s": handler }) for as
 * long as the owning component is mounted. Handlers receive the KeyboardEvent.
 */
export function useKeyboardShortcuts(shortcuts, deps = []) {
  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      for (const [combo, handler] of Object.entries(shortcuts)) {
        if (matchesCombo(event, combo)) {
          // Allow plain single-key shortcuts (e.g. "f1") to be skipped while typing.
          if (isEditable && !combo.includes("+")) continue;
          event.preventDefault();
          handler(event);
          return;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Announce a message to screen readers via a visually-hidden live region.
 */
export function announceToScreenReader(message) {
  let region = document.getElementById("sr-announcer");
  if (!region) {
    region = document.createElement("div");
    region.id = "sr-announcer";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("role", "status");
    region.style.position = "absolute";
    region.style.width = "1px";
    region.style.height = "1px";
    region.style.overflow = "hidden";
    region.style.clip = "rect(0 0 0 0)";
    document.body.appendChild(region);
  }
  region.textContent = message;
}
