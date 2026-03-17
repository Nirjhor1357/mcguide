import { notFound } from 'next/navigation';
import { SharedProfile } from '@/components/shared-profile';
import { serializeDashboard } from '@/lib/serialize-dashboard';
import { prisma } from '@/lib/prisma';
import { getDashboardData } from '@/server/dashboard';

export default async function SharedProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
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
    notFound();
  }

  const dashboard = serializeDashboard(await getDashboardData(user.id));

  return <SharedProfile dashboard={dashboard} user={user} />;
}
