

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("body: "+body);
    // Validate the request body
    const validatedData = signupSchema.parse(body);
    console.log("validateData: "+validatedData);
    // Remove confirmPassword from the data we'll save
    const { confirmPassword, ...userData } = validatedData;
    
    // Check if email already exists
    
    
    // if (existingUserByEmail) {
    //   return NextResponse.json(
    //     { message: "Email already in use" },
    //     { status: 400 }
    //   );
    // }
    
    // Check if Aadhar already exists
    // const existingUserByAadhar = await db.query.users.findFirst({
    //   where: (users, { eq }) => eq(users.aadharNumber, userData.aadharNumber),
    // });
    
    // if (existingUserByAadhar) {
    //   return NextResponse.json(
    //     { message: "Aadhar number already in use" },
    //     { status: 400 }
    //   );
    // }
    
    // Hash the password
    //const hashedPassword = await hashPassword(userData.password);
    console.log("creating user");
    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        aadharNumber: userData.aadharNumber,
        role: "user",
      })
      .returning();
    console.log("user created successfully");
    return NextResponse.json(
      { message: "User created successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}