import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidates, votes, electionSettings } from "@/lib/db/schema";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get the election settings
    const settings = await db.query.electionSettings.findFirst();
    
    // Check if results are visible to non-admin users
    const isAdminUser = user.role === "admin";
    if (!isAdminUser && settings && !settings.resultsVisible) {
      return NextResponse.json(
        { message: "Election results are not yet available" },
        { status: 403 }
      );
    }
    
    // Get all candidates
    const allCandidates = await db.query.candidates.findMany();
    
    // Count total votes
    const votesResult = await db
      .select({ count: count() })
      .from(votes);
    
    const totalVotes = votesResult[0]?.count || 0;
    
    // Get vote counts for each candidate
    const voteCounts = await db
      .select({
        candidateId: votes.candidateId,
        count: count(),
      })
      .from(votes)
      .groupBy(votes.candidateId);
    
    // Map vote counts to candidates
    const candidateResults = allCandidates.map((candidate) => {
      const voteData = voteCounts.find((v) => v.candidateId === candidate.id);
      const voteCount = voteData?.count || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
      
      return {
        ...candidate,
        voteCount,
        percentage,
      };
    });
    
    return NextResponse.json({
      totalVotes,
      candidates: candidateResults,
    });
  } catch (error) {
    console.error("Get election results error:", error);
    return NextResponse.json(
      { message: "Failed to get election results" },
      { status: 500 }
    );
  }
}