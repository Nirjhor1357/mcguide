import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { secureJson, verifyCsrf } from '@/lib/security';
import { progressUpdateSchema } from '@/lib/validators';
import { parseJson } from '@/server/api';

export async function PATCH(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return secureJson({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await verifyCsrf(request))) {
    return secureJson({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  const body = await parseJson(request, progressUpdateSchema);
  const task = await prisma.task.findUnique({ where: { id: body.taskId } });

  if (!task) {
    return secureJson({ error: 'Task not found' }, { status: 404 });
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_taskId: {
        userId: user.id,
        taskId: body.taskId,
      },
    },
    update: {
      completed: body.completed,
      pinned: body.pinned,
      completedAt: body.completed ? new Date() : null,
    },
    create: {
      userId: user.id,
      taskId: body.taskId,
      completed: body.completed ?? false,
      pinned: body.pinned ?? false,
      completedAt: body.completed ? new Date() : null,
    },
  });

  return secureJson({ progress });
}
