import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
//import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface UserJwtPayload {
  id: number;
  email: string;
  role: string;
}

// Generate JWT token for authenticated users
export async function generateToken(payload: UserJwtPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(JWT_SECRET));
}

// Set the JWT token as a cookie
export async function setTokenCookie(token: string) {
  cookies().set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

// Verify JWT token and return user data
export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return verified.payload as UserJwtPayload;
  } catch (error) {
    return null;
  }
}

// Hash a password
// export async function hashPassword(password: string): Promise<string> {
//   return await bcrypt.hash(password, 10);
// }

// Verify a password
// export async function verifyPassword(
//   password: string,
//   hashedPassword: string
// ): Promise<boolean> {
//   return await bcrypt.compare(password, hashedPassword);
// }

// Get the authenticated user from the request
export async function getAuthUser(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.id),
    });

    return user;
  } catch (error) {
    return null;
  }
}

// Check if the user is authenticated
export async function isAuthenticated(req: NextRequest) {
  const user = await getAuthUser(req);
  return !!user;
}

// Check if the user is an admin
export async function isAdmin(req: NextRequest) {
  const user = await getAuthUser(req);
  return user?.role === "admin";
}

// Middleware for protected routes
export async function authMiddleware(req: NextRequest) {
  const isAuth = await isAuthenticated(req);
  
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  return null;
}

// Middleware for admin-only routes
export async function adminMiddleware(req: NextRequest) {
  const isAdminUser = await isAdmin(req);
  
  if (!isAdminUser) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  return null;
}