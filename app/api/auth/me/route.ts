import { getSessionUser } from '@/lib/auth';
import { secureJson } from '@/lib/security';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return secureJson({ error: 'Unauthorized' }, { status: 401 });
  }

  return secureJson({ user });
}
