import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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