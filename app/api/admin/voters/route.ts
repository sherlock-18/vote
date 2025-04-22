import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Check if user is an admin
    const isAdminUser = await isAdmin(req);
    
    if (!isAdminUser) {
      return NextResponse.json(
        { message: "Admin privileges required" },
        { status: 403 }
      );
    }
    
    // Get all users with role=user
    const voters = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.role, "user"),
    });
    
    // Filter out sensitive information like passwords
    const filteredVoters = voters.map((voter) => ({
      id: voter.id,
      name: voter.name,
      email: voter.email,
      aadharNumber: voter.aadharNumber,
      accountAddress: voter.accountAddress,
      isRegistered: voter.isRegistered,
      hasVoted: voter.hasVoted,
      createdAt: voter.createdAt,
    }));
    
    return NextResponse.json(filteredVoters);
  } catch (error) {
    console.error("Get voters error:", error);
    return NextResponse.json(
      { message: "Failed to get voters" },
      { status: 500 }
    );
  }
}