import {
  createAccessToken,
  createRefreshToken,
  getRefreshCookie,
  hashToken,
  setSessionCookies,
  verifyRefreshToken,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { secureJson } from '@/lib/security';

export async function POST() {
  const refreshToken = await getRefreshCookie();

  if (!refreshToken) {
    return secureJson({ error: 'Missing refresh token' }, { status: 401 });
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
      return secureJson({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const accessToken = await createAccessToken(stored.user);
    const nextRefreshToken = await createRefreshToken(stored.user);

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { tokenHash: stored.tokenHash },
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: hashToken(nextRefreshToken),
          userId: stored.user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    await setSessionCookies(accessToken, nextRefreshToken);

    return secureJson({ success: true });
  } catch {
    return secureJson({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
