// app/api/pickup-days/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust to your prisma client path

/**
 * GET /api/pickup-days?date=YYYY-MM-DD
 *   -> returns the PickupDay matching the date (if any)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date"); // e.g. "2025-01-20"

  if (!dateParam) {
    return NextResponse.json({ success: false, error: "No date provided." }, { status: 400 });
  }

  try {
    // Convert "YYYY-MM-DD" to a Date. We'll interpret it as local midnight.
    const date = new Date(dateParam);

    // We want to find a PickupDay that matches this date exactly. 
    // A simple approach is to find by day (ignoring time).
    // We'll define a helper function to get start/end of day in UTC or local.
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    // Query for a PickupDay whose date is in [startOfDay, endOfDay]
    const pickupDay = await prisma.pickupDay.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!pickupDay) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: pickupDay });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}