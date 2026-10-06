'use client';

import { useEffect, useState } from 'react';

export function StatusToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setMessage(e.detail);
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('vinskanna:notify' as any, handler);
    return () => window.removeEventListener('vinskanna:notify' as any, handler);
  }, []);

  if (!message) return <div id="store-status" role="status" aria-live="polite" className="store-status" hidden />;

  return (
    <div id="store-status" role="status" aria-live="polite" className="store-status">
      {message}
    </div>
  );
}

export function notify(msg: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vinskanna:notify', { detail: msg }));
  }
}
