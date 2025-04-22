import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electionSettings } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest) {
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
    const isActive = !!body.isActive;
    
    // Get existing settings
    const existingSettings = await db.query.electionSettings.findFirst();
    
    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(electionSettings)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .returning();
      
      return NextResponse.json(updatedSettings);
    } else {
      // Create new settings if they don't exist
      // Use default dates if not provided
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const [newSettings] = await db
        .insert(electionSettings)
        .values({
          startDate: now,
          endDate: tomorrow,
          isActive,
        })
        .returning();
      
      return NextResponse.json(newSettings);
    }
  } catch (error) {
    console.error("Update election status error:", error);
    return NextResponse.json(
      { message: "Failed to update election status" },
      { status: 500 }
    );
  }
}