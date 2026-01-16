import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for accessToken cookie
  // Note: We use "accessToken" because that's what the backend sets
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Define public paths that don't increase auth
  const publicPaths = ["/", "/login", "/signup", "/otp", "/verification"];

  // If user is accessing a public path or asset, let them through
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Files like favicon.ico
  ) {
    // Optional: Redirect logged-in users away from login page?
    // if (accessToken && (pathname === "/login" || pathname === "/signup")) {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }
    return NextResponse.next();
  }

  // Protected Routes Check
  // If no token and trying to access protected route (everything else)
  if (!accessToken) {
    // Redirect to login
    const loginUrl = new URL("/login", request.url);
    // loginUrl.searchParams.set("from", pathname); // Optional: remember where they were going
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
