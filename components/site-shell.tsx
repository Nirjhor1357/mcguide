import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';

type SiteShellProps = {
  user?: {
    username: string;
  } | null;
};

export function SiteShell({ user }: SiteShellProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between gap-4 py-4">
        <Link href="/">
          <BrandMark />
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-300">
          <Link className="transition hover:text-white" href="#features">
            Features
          </Link>
          <Link className="transition hover:text-white" href="#dashboard-preview">
            Preview
          </Link>
          {user ? (
            <>
              <Link className="transition hover:text-white" href="/dashboard">
                Dashboard
              </Link>
              <Link
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
                href="/profile"
              >
                {user.username}
              </Link>
            </>
          ) : (
            <>
              <Link className="transition hover:text-white" href="/login">
                Login
              </Link>
              <Link
                className="rounded-full bg-[var(--accent)] px-4 py-2 font-medium text-slate-950 transition hover:opacity-90"
                href="/register"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
