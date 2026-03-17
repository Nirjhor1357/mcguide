import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const bucket = new Map<string, { count: number; expiresAt: number }>();
const CSRF_COOKIE = 'mc_csrf';

export function rateLimit(key: string, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const entry = bucket.get(key);

  if (!entry || entry.expiresAt < now) {
    bucket.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function ensureCsrfCookie() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const token = crypto.randomBytes(24).toString('hex');
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return token;
}

export async function verifyCsrf(request: Request) {
  const csrfHeader = request.headers.get('x-csrf-token');
  const cookieToken = (await cookies()).get(CSRF_COOKIE)?.value;
  return Boolean(csrfHeader && cookieToken && csrfHeader === cookieToken);
}

export function secureJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...init?.headers,
    },
  });
}
