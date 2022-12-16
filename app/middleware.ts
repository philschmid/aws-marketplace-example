// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
// export { default } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request: NextRequest) {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // check if token.ex is expired
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     * - auth (auth routes) for signin
     */
    '/((?!api|_next/static|favicon.ico|auth|static).*)',
  ],
};
