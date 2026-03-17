'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include',
    }).catch(() => undefined);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  return null;
}
