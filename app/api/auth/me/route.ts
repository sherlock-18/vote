import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get the token from cookies
    const token = cookies().get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify the token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Get the user from the database
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, payload.id),
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    // Return the user data (excluding the password)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      aadharNumber: user.aadharNumber,
      accountAddress: user.accountAddress,
      isRegistered: user.isRegistered,
      hasVoted: user.hasVoted,
      role: user.role,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: "Failed to get user data" },
      { status: 500 }
    );
  }
}