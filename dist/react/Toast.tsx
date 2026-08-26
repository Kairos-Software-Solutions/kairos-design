'use client';

import { type ReactNode, useEffect, useState } from 'react';

export interface ToastProps {
  children: ReactNode;
}

/**
 * The region toasts appear in. Mount once, near the root.
 *
 * Fixed in one place in the DOM while toasts come and go, so a screen reader
 * announces each new one rather than re-announcing the container. `status`
 * rather than `alert`: a toast confirms something the user just did, and does
 * not need to interrupt what they are reading now.
 */
export function ToastRegion({ children }: { children: ReactNode }) {
  return (
    <div className="kairos-toast-region" role="status" aria-live="polite">
      {children}
    </div>
  );
}

export default function Toast({ children }: ToastProps) {
  return <div className="kairos-toast">{children}</div>;
}

/**
 * A toast that dismisses itself.
 *
 * `duration` is capped rather than free: anything a person needs longer than a
 * few seconds to read is not a toast, and putting a long message in one hides
 * it from anybody who looked away. Use a `Banner` for that.
 */
export function TransientToast({ children, duration = 4000 }: ToastProps & { duration?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), Math.min(duration, 8000));
    return () => clearTimeout(timer);
  }, [duration]);

  return visible ? <Toast>{children}</Toast> : null;
}
