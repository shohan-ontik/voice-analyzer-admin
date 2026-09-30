import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

function read(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // storage unavailable; the draft just won't survive navigation
  }
}

/**
 * Keeps an edited value across navigation (e.g. to another page and back) by mirroring it into
 * sessionStorage. Falls back to `serverValue` when there is no draft.
 * - `reset` discards the draft and shows `serverValue` again.
 * - `forget` only removes the stored copy (use after the value has been saved).
 */
export function useSessionDraft(key: string, serverValue: string) {
  const stored = useSyncExternalStore(
    subscribeNoop,
    () => read(key),
    () => null,
  );
  const [edited, setEdited] = useState<string | null>(null);
  const value = edited ?? stored ?? serverValue;

  // A stored draft that matches what the server now has is redundant.
  useEffect(() => {
    if (stored !== null && stored === serverValue) write(key, null);
  }, [key, stored, serverValue]);

  function setValue(next: string) {
    setEdited(next);
    write(key, next === serverValue ? null : next);
  }

  function reset() {
    setEdited(null);
    write(key, null);
  }

  function forget() {
    write(key, null);
  }

  return { value, setValue, reset, forget };
}
