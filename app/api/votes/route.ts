import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, votes, candidates } from "@/lib/db/schema";
import { getAuthUser } from "@/lib/auth";
import { voteSchema } from "@/lib/utils/validators";
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
    
    // Check if the user is registered
    if (!user.isRegistered) {
      return NextResponse.json(
        { message: "You must be registered to vote" },
        { status: 400 }
      );
    }
    
    // Check if the user has already voted
    if (user.hasVoted) {
      return NextResponse.json(
        { message: "You have already cast your vote" },
        { status: 400 }
      );
    }
    
    // Check if the election is active
    const electionSettings = await db.query.electionSettings.findFirst();
    
    if (!electionSettings?.isActive) {
      return NextResponse.json(
        { message: "Voting is not currently active" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Validate the request body
    const validatedData = voteSchema.parse(body);
    
    // Check if the candidate exists
    const candidate = await db.query.candidates.findFirst({
      where: (candidates, { eq }) => eq(candidates.id, validatedData.candidateId),
    });
    
    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    
    // Create the vote record
    const [newVote] = await db
      .insert(votes)
      .values({
        userId: user.id,
        candidateId: validatedData.candidateId,
      })
      .returning();
    
    // Update the user's hasVoted status
    await db
      .update(users)
      .set({
        hasVoted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    
    return NextResponse.json(
      { message: "Vote cast successfully", vote: newVote },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vote error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to cast vote" },
      { status: 500 }
    );
  }
}