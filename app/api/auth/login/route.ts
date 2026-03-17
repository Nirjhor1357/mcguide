import { prisma } from '@/lib/prisma';
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setSessionCookies,
  verifyPassword,
} from '@/lib/auth';
import { rateLimit, secureJson } from '@/lib/security';
import { loginSchema } from '@/lib/validators';
import { parseJson } from '@/server/api';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local';

  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return secureJson({ error: 'Too many login attempts' }, { status: 429 });
  }

  const body = await parseJson(request, loginSchema);
  const email = body.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return secureJson({ error: 'Invalid email or password' }, { status: 401 });
  }

  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await setSessionCookies(accessToken, refreshToken);

  return secureJson({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      avatarSeed: user.avatarSeed,
    },
  });
}
