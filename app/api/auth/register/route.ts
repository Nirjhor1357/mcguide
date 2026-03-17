import { prisma } from '@/lib/prisma';
import {
  createAccessToken,
  createRefreshToken,
  hashPassword,
  hashToken,
  setSessionCookies,
} from '@/lib/auth';
import { rateLimit, secureJson } from '@/lib/security';
import { registerSchema } from '@/lib/validators';
import { parseJson } from '@/server/api';
import { ensureCatalogSeeded } from '@/server/catalog-sync';
import { sanitizeText } from '@/lib/utils';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local';

  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return secureJson({ error: 'Too many registration attempts' }, { status: 429 });
  }

  const body = await parseJson(request, registerSchema);
  const email = body.email.toLowerCase();
  const username = sanitizeText(body.username);
  await ensureCatalogSeeded();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    return secureJson({ error: 'Account already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      avatarSeed: username,
    },
  });

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
