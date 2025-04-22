import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

// Get a specific candidate
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid candidate ID" },
        { status: 400 }
      );
    }
    
    const candidate = await db.query.candidates.findFirst({
      where: (candidates, { eq }) => eq(candidates.id, id),
    });
    
    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Get candidate error:", error);
    return NextResponse.json(
      { message: "Failed to get candidate" },
      { status: 500 }
    );
  }
}

// Update a candidate (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is an admin
    const isAdminUser = await isAdmin(req);
    
    if (!isAdminUser) {
      return NextResponse.json(
        { message: "Admin privileges required" },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid candidate ID" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Update the candidate
    const [updatedCandidate] = await db
      .update(candidates)
      .set({
        name: body.name,
        party: body.party,
        age: body.age,
        qualification: body.qualification,
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, id))
      .returning();
    
    if (!updatedCandidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Candidate updated successfully", candidate: updatedCandidate }
    );
  } catch (error) {
    console.error("Update candidate error:", error);
    return NextResponse.json(
      { message: "Failed to update candidate" },
      { status: 500 }
    );
  }
}

// Delete a candidate (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is an admin
    const isAdminUser = await isAdmin(req);
    
    if (!isAdminUser) {
      return NextResponse.json(
        { message: "Admin privileges required" },
        { status: 403 }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid candidate ID" },
        { status: 400 }
      );
    }
    
    // Delete the candidate
    const [deletedCandidate] = await db
      .delete(candidates)
      .where(eq(candidates.id, id))
      .returning();
    
    if (!deletedCandidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Candidate deleted successfully" }
    );
  } catch (error) {
    console.error("Delete candidate error:", error);
    return NextResponse.json(
      { message: "Failed to delete candidate" },
      { status: 500 }
    );
  }
}