export function getCsrfTokenFromCookie() {
  if (typeof document === 'undefined') {
    return '';
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('mc_csrf='));

  return cookie?.split('=')[1] ?? '';
}

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.method && init.method !== 'GET'
        ? { 'x-csrf-token': getCsrfTokenFromCookie() }
        : {}),
      ...init?.headers,
    },
    credentials: 'include',
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload as T;
}
