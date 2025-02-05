import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
    params: { id: string };
  };
  
  export async function DELETE(request: Request, { params }: Params) {
    try {
      const { id } = params;
  
      // Optionally: If you have related records, you might block or cascade
      // e.g. check if there's an existing order referencing this window
  
      await prisma.orderingWindow.delete({
        where: { id },
      });
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting ordering window:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

export async function GET() {
  try {
    const windows = await prisma.orderingWindow.findMany({
      orderBy: { orderingStart: "asc" },
    });

    return NextResponse.json({ success: true, data: windows });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
      const data = await request.json();
  
      // Destructure the fields
      const {
        orderingStart,
        orderingEnd,
        pickupDate,
        pickupTimes,
      } = data;
  
      // Validate fields
      if (!orderingStart || !orderingEnd || !pickupDate || !pickupTimes) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }
  
      // Convert the strings to actual Date if needed
      // because JSON.parse from fetch body might give them as strings
      // If they are already date objects, ignore
      const startDate = new Date(orderingStart);
      const endDate = new Date(orderingEnd);
      const pickupDateObj = new Date(pickupDate);
  
      // Insert new record
      const created = await prisma.orderingWindow.create({
        data: {
          orderingStart: startDate,
          orderingEnd: endDate,
          pickupDate: pickupDateObj,
          pickupTimes, // string[]
        },
      });
  
      return NextResponse.json({ success: true, orderingWindow: created });
    } catch (error: any) {
      console.error("Error creating ordering window:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }