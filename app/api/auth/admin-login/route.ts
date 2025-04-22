import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { generateToken, setTokenCookie, verifyPassword } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = adminLoginSchema.parse(body);
    
    // Find the user by email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, validatedData.email),
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Verify the password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    );
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin privileges required" },
        { status: 403 }
      );
    }
    
    // Generate and set the JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    await setTokenCookie(token);
    
    return NextResponse.json(
      { 
        message: "Admin logged in successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to log in" },
      { status: 500 }
    );
  }
}