// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// const RATE_LIMIT = 100; // max requests per WINDOW_MS
// const WINDOW_MS = 60_000; // 1 minute
// const userStore = new Map<string, { count: number; ts: number }>();

// // Clean up old entries every minute
// setInterval(() => {
//   const now = Date.now();
//   for (const [key, val] of userStore) {
//     console.log(key, val);
//     console.log(now - val.ts > WINDOW_MS * 2);
//     if (now - val.ts > WINDOW_MS * 2) console.log('ee');
//     userStore.delete(key);
//   }
// }, 60_000);

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // -------- AUTH --------
  const token =
  req.cookies.get('__Secure-next-auth.session-token')?.value ??
  req.cookies.get('next-auth.session-token')?.value;

  

  if (!token && (path.startsWith('/host') || path.startsWith('/api/private'))) {
    return NextResponse.redirect(new URL('/signIn', req.url));
  }

  // -------- RATE LIMIT --------
  // if (token && (path.startsWith('/host') || path.startsWith('/api/private'))) {
  //   const now = Date.now();
  //   const entry = userStore.get(token);

  //   if (!entry || now - entry.ts > WINDOW_MS) {
  //     userStore.set(token, { count: 1, ts: now });
  //   } else {
  //     entry.count++;
  //     entry.ts = now;
  //     if (entry.count > RATE_LIMIT) {
  //       console.log('Rate-limit hit for user token:', token);
  //       return new NextResponse('Too many requests', { status: 429 });
  //     }
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/host/:path*', '/api/private/:path*'], // only private routes
};
