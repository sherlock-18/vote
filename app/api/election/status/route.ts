import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get the election settings
    const electionSettings = await db.query.electionSettings.findFirst();
    
    if (!electionSettings) {
      // If no settings exist, return default values
      return NextResponse.json({
        isActive: false,
        startDate: null,
        endDate: null,
        resultsVisible: false,
      });
    }
    
    return NextResponse.json({
      isActive: electionSettings.isActive,
      startDate: electionSettings.startDate,
      endDate: electionSettings.endDate,
      resultsVisible: electionSettings.resultsVisible,
    });
  } catch (error) {
    console.error("Get election status error:", error);
    return NextResponse.json(
      { message: "Failed to get election status" },
      { status: 500 }
    );
  }
}