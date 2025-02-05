// app/api/menu-items/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// If you use Prisma Decimal, you might need: import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { name, price, availableDate, description } = await request.json();

    if (!name || !price || !availableDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert your date string to a Date
    const date = new Date(availableDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    // If "price" is a Decimal in your Prisma schema, create a new Prisma.Decimal
    // OR if your schema expects a numeric type, pass `price` as a number
    // e.g. if price is a Decimal field, do:
    // const decimalPrice = new Prisma.Decimal(price);

    // Create the menu item in the DB
    const newMenuItem = await prisma.menuItem.create({
      data: {
        name,
        price, // or decimalPrice
        availableDate: date,
        description: description || "",
      },
    });

    return NextResponse.json({ success: true, menuItem: newMenuItem });
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}