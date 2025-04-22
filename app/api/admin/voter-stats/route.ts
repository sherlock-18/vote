import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, votes } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { count, eq } from "drizzle-orm";

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
    
    // Count total number of users (voters)
    const totalVotersResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "user"));
    
    const totalVoters = totalVotersResult[0]?.count || 0;
    
    // Count registered voters
    const registeredVotersResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "user"))
      .where(eq(users.isRegistered, true));
    
    const registeredVoters = registeredVotersResult[0]?.count || 0;
    
    // Count total votes
    const totalVotesResult = await db
      .select({ count: count() })
      .from(votes);
    
    const totalVotes = totalVotesResult[0]?.count || 0;
    
    return NextResponse.json({
      totalVoters,
      registeredVoters,
      totalVotes,
    });
  } catch (error) {
    console.error("Get voter stats error:", error);
    return NextResponse.json(
      { message: "Failed to get voter statistics" },
      { status: 500 }
    );
  }
}