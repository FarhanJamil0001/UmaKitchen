// app/api/orders/[orderId]/picked/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
    params: {
        orderId: string;
    };
};

export async function PUT(request: Request, { params }: Params) {
    const { orderId } = params;
    try {
        const body = await request.json();
        const { pickedUp } = body;

        await prisma.order.update({
            where: { id: orderId },
            data: { pickedUp },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating pickedUp status:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}