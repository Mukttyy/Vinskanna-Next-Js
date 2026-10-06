'use client';

import { useEffect, useState } from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface ToastPayload {
  message: string;
  type?: AlertType;
}

function inferType(msg: string): AlertType {
  const lower = msg.toLowerCase();
  if (lower.includes('gagal') || lower.includes('tidak') || lower.includes('error') || lower.includes('penuh')) {
    return 'error';
  }
  if (lower.includes('maksimal') || lower.includes('perhatian') || lower.includes('warning') || lower.includes('batas')) {
    return 'warning';
  }
  if (lower.includes('dihapus')) {
    return 'info';
  }
  return 'success';
}

function AlertIcon({ type }: { type: AlertType }) {
  switch (type) {
    case 'info':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 h-6 w-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case 'error':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'success':
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
}

export function StatusToast() {
  const [toast, setToast] = useState<{ message: string; type: AlertType } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handler = (e: CustomEvent<string | ToastPayload>) => {
      const detail = e.detail;
      if (typeof detail === 'string') {
        setToast({ message: detail, type: inferType(detail) });
      } else if (detail && typeof detail === 'object') {
        setToast({
          message: detail.message,
          type: detail.type || inferType(detail.message)
        });
      }
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 3500);
    };

    window.addEventListener('vinskanna:notify' as any, handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('vinskanna:notify' as any, handler);
    };
  }, []);

  if (!toast) {
    return <div id="store-status" role="alert" aria-live="polite" className="store-status" hidden />;
  }

  return (
    <div
      id="store-status"
      role="alert"
      aria-live="polite"
      className={`alert alert-${toast.type} store-status`}
      onClick={() => setToast(null)}
      title="Klik untuk menutup"
    >
      <AlertIcon type={toast.type} />
      <span>{toast.message}</span>
    </div>
  );
}

export function notify(detail: string | ToastPayload, explicitType?: AlertType) {
  if (typeof window !== 'undefined') {
    const payload: ToastPayload =
      typeof detail === 'string'
        ? { message: detail, type: explicitType || inferType(detail) }
        : { message: detail.message, type: detail.type || explicitType || inferType(detail.message) };
    window.dispatchEvent(new CustomEvent('vinskanna:notify', { detail: payload }));
  }
}
