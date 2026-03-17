import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { secureJson, verifyCsrf } from '@/lib/security';

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return secureJson({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await verifyCsrf(request))) {
    return secureJson({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.progress.deleteMany({ where: { userId: user.id } }),
    prisma.userAchievement.deleteMany({ where: { userId: user.id } }),
  ]);

  return secureJson({ success: true });
}
