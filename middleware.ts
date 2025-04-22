import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/signup", "/admin/login"];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => path === publicPath || path.startsWith('/api/auth'));
  
  // Get the token from the cookies
  const token = request.cookies.get("auth-token")?.value;
  
  // Redirect based on authentication status and path
  if (isPublicPath && token) {
    // If user has a token and is trying to access public paths like login/signup
    // Verify the token first
    const payload = token ? await verifyToken(token) : null;
    
    if (payload) {
      // If token is valid, redirect based on role
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }
  
  if (!isPublicPath && !token) {
    // If user is trying to access protected routes without a token
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Admin paths require admin role
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const payload = token ? await verifyToken(token) : null;
    
    if (!payload || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth routes (to avoid endless redirects for authentication)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. .*\\..*$ (files with extensions, for example, favicon.ico)
     */
    '/((?!_next|static|.*\\..*$).*)',
  ],
};