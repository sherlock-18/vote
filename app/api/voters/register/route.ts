import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { voterRegistrationSchema } from "@/lib/utils/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if the user is already registered
    if (user.isRegistered) {
      return NextResponse.json(
        { message: "You are already registered" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Validate the request body
    const validatedData = voterRegistrationSchema.parse(body);
    
    // Verify that the Aadhar number matches
    if (validatedData.aadharNumber !== user.aadharNumber) {
      return NextResponse.json(
        { message: "Aadhar number does not match your account" },
        { status: 400 }
      );
    }
    
    // Update the user record
    const [updatedUser] = await db
      .update(users)
      .set({
        accountAddress: validatedData.accountAddress,
        isRegistered: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    
    return NextResponse.json(
      { message: "Registration successful", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Voter registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to register" },
      { status: 500 }
    );
  }
}