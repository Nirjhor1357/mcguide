import { ensureCsrfCookie, secureJson } from '@/lib/security';

export async function GET() {
  const token = await ensureCsrfCookie();
  return secureJson({ csrfToken: token });
}
