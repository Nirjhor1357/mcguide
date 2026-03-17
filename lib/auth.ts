import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const ACCESS_COOKIE = 'mc_access';
const REFRESH_COOKIE = 'mc_refresh';

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
);
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
);

type TokenPayload = {
  sub: string;
  email: string;
  username: string;
  type: 'access' | 'refresh';
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function signToken(
  payload: TokenPayload,
  expiresIn: string,
  secret: Uint8Array,
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function createAccessToken(user: {
  id: string;
  email: string;
  username: string;
}) {
  return signToken(
    { sub: user.id, email: user.email, username: user.username, type: 'access' },
    '15m',
    accessSecret,
  );
}

export async function createRefreshToken(user: {
  id: string;
  email: string;
  username: string;
}) {
  return signToken(
    { sub: user.id, email: user.email, username: user.username, type: 'refresh' },
    '30d',
    refreshSecret,
  );
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as TokenPayload;
}

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === 'production';

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function getAccessCookie() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshCookie() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function getSessionUser() {
  const accessToken = await getAccessCookie();

  if (!accessToken) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(accessToken);
    return prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        avatarSeed: true,
        createdAt: true,
      },
    });
  } catch {
    return null;
  }
}
