import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { secureJson } from '@/lib/security';

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw NextResponse.json(
        {
          error: 'Validation failed',
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    throw NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

export function unauthorized(message = 'Unauthorized') {
  return secureJson({ error: message }, { status: 401 });
}
