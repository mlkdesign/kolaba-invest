/**
 * Vercel Edge Middleware — optional HTTP Basic Auth for the private presentation.
 * Enabled only when both SITE_USER and SITE_PASSWORD are set in the project env.
 * The secret never reaches the client bundle.
 */
export const config = {
  matcher: ['/((?!_vercel|favicon.svg|robots.txt).*)'],
};


function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request: Request) {
  const user = process.env.SITE_USER;
  const password = process.env.SITE_PASSWORD;
  if (!user || !password) return; // access control disabled

  const auth = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme === 'Basic' && encoded) {
    const [u, ...rest] = atob(encoded).split(':');
    if (safeEqual(u, user) && safeEqual(rest.join(':'), password)) return;
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="KOLABA investor presentation", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
}
