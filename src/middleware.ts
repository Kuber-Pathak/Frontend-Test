import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Better Auth uses 'better-auth.session_token' cookie
  const betterAuthSession = request.cookies.get(
    "better-auth.session_token",
  )?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/signup", "/"];

  // Check if the current path is public
  const isPublicPath = publicPaths.includes(pathname);

  // If user has session and is on public path (like login), redirect to chat
  if (betterAuthSession && isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If user has no session and is on protected path, redirect to login
  if (!betterAuthSession && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
