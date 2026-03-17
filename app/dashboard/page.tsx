import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { getSessionUser } from '@/lib/auth';
import { serializeDashboard } from '@/lib/serialize-dashboard';
import { getDashboardData } from '@/server/dashboard';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const dashboard = await getDashboardData(user.id);
  const serialized = serializeDashboard(dashboard);

  return (
    <DashboardShell
      initialData={serialized}
      user={{
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        avatarSeed: user.avatarSeed,
      }}
    />
  );
}
