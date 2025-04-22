import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { candidates } from "@/lib/db/schema";
import { addCandidateSchema } from "@/lib/utils/validators";
import { getAuthUser, isAdmin } from "@/lib/auth";

// Get all candidates
export async function GET(req: NextRequest) {
  try {
    const allCandidates = await db.query.candidates.findMany();
    
    return NextResponse.json(allCandidates);
  } catch (error) {
    console.error("Get candidates error:", error);
    return NextResponse.json(
      { message: "Failed to get candidates" },
      { status: 500 }
    );
  }
}

// Add a new candidate (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is an admin
    const isAdminUser = await isAdmin(req);
    
    if (!isAdminUser) {
      return NextResponse.json(
        { message: "Admin privileges required" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Validate the request body
    const validatedData = addCandidateSchema.parse(body);
    
    // Create the candidate
    const [newCandidate] = await db
      .insert(candidates)
      .values({
        name: validatedData.name,
        party: validatedData.party,
        age: validatedData.age,
        qualification: validatedData.qualification,
      })
      .returning();
    
    return NextResponse.json(
      { message: "Candidate added successfully", candidate: newCandidate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add candidate error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to add candidate" },
      { status: 500 }
    );
  }
}