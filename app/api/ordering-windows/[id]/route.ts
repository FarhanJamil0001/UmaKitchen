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