import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // Clear the auth cookie
    cookies().set({
      name: "auth-token",
      value: "",
      expires: new Date(0),
      path: "/",
    });
    
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Failed to log out" },
      { status: 500 }
    );
  }
}