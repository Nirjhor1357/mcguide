import { TaskStage, TaskTheme } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { secureJson, verifyCsrf } from '@/lib/security';
import { customTaskSchema } from '@/lib/validators';
import { parseJson } from '@/server/api';
import { sanitizeText, slugify } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return secureJson({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await verifyCsrf(request))) {
    return secureJson({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  const body = await parseJson(request, customTaskSchema);
  const existingCustomCount = await prisma.task.count({
    where: { creatorId: user.id, isCustom: true },
  });

  const task = await prisma.task.create({
    data: {
      id: `custom-${user.id}-${slugify(body.title)}-${Date.now()}`,
      title: sanitizeText(body.title),
      description: sanitizeText(body.description),
      section: sanitizeText(body.section),
      stage: body.stage as TaskStage,
      theme: body.theme as TaskTheme,
      order: 10_000 + existingCustomCount + 1,
      xpReward: 35,
      isCore: false,
      isCustom: true,
      creatorId: user.id,
    },
  });

  return secureJson({ task }, { status: 201 });
}
