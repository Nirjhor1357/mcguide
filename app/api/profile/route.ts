import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { secureJson, verifyCsrf } from '@/lib/security';
import { profileSchema } from '@/lib/validators';
import { parseJson } from '@/server/api';
import { sanitizeText } from '@/lib/utils';

export async function PATCH(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return secureJson({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await verifyCsrf(request))) {
    return secureJson({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  const body = await parseJson(request, profileSchema);
  const username = sanitizeText(body.username);
  const avatarUrl = body.avatarUrl ? sanitizeText(body.avatarUrl) : null;

  const conflict = await prisma.user.findFirst({
    where: {
      username,
      id: {
        not: user.id,
      },
    },
  });

  if (conflict) {
    return secureJson({ error: 'Username is already taken' }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      avatarUrl,
      avatarSeed: username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      avatarSeed: true,
      createdAt: true,
    },
  });

  return secureJson({ user: updated });
}
