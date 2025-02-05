import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 0; // Disable revalidation, so it's fully dynamic

type Params = {
  params: {
    id: string;
  };
};

// Handle PUT requests
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();

    const { name, price, availableDate, description } = body;

    if (!name || !price || !availableDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price), // Ensure price is a number
        availableDate: new Date(availableDate),
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, menuItem: updatedItem });
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Handle DELETE requests
export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    const relatedOrders = await prisma.orderItem.findMany({
      where : {menuItemId : id},
    });

    if (relatedOrders.length > 0){
      return NextResponse.json(
        { success: false, error: "Cannot delete item with existing orders!"},
        { status: 400}
      );
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}