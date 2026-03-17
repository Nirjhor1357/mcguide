import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile-form';
import { SiteShell } from '@/components/site-shell';
import { getSessionUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <SiteShell user={{ username: user.username }} />
      <main className="container-shell py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/40">Account</p>
            <h1 className="mt-2 text-4xl font-semibold text-white">Manage your profile</h1>
          </div>
          <Link
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>
        <ProfileForm user={user} />
      </main>
    </div>
  );
}
