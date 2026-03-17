import { prisma } from '@/lib/prisma';
import { secureJson } from '@/lib/security';
import { getDashboardData } from '@/server/dashboard';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      avatarSeed: true,
      createdAt: true,
    },
  });

  if (!user) {
    return secureJson({ error: 'Profile not found' }, { status: 404 });
  }

  const dashboard = await getDashboardData(user.id);
  return secureJson({ user, dashboard });
}
