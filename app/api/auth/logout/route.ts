import { clearSessionCookies, getRefreshCookie, hashToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { secureJson } from '@/lib/security';

export async function POST() {
  const refreshToken = await getRefreshCookie();

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { tokenHash: hashToken(refreshToken) },
    });
  }

  await clearSessionCookies();

  return secureJson({ success: true });
}
