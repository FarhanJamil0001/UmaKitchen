// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import twilio from "twilio";

// Initialize Twilio client with account SID and auth token
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const {
            customerName,
            phoneNumber,
            notifyUpdates,
            pickupDateTime,
            instructions,
            items, // if you have item data
        } = data;

        // Basic validation
        if (!customerName || !pickupDateTime) {
            return NextResponse.json(
                { success: false, error: "Missing required fields." },
                { status: 400 }
            );
        }

        // 1. Create the order in your DB
        const order = await prisma.order.create({
            data: {
              customerName,
              phoneNumber,
              notifyUpdates,
              pickupDateTime: new Date(pickupDateTime),
              instructions: instructions || null,
              orderItems: {
                create:
                  items?.map((item: any) => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                  })) || [],
              },
            },
            include: {
              orderItems: {
                include: { menuItem: true }, // ✅ Ensure menuItem is included
              },
            },
          });

        // Only attempt to send SMS if Twilio is properly configured
        if (client && notifyUpdates && phoneNumber) {
            try {
                await client.messages.create({
                    body: `Thanks, ${customerName}! Your order has been placed.`,
                    from: process.env.TWILIO_FROM_NUMBER,
                    to: phoneNumber,
                });
            } catch (smsError) {
                console.error("Error sending customer SMS:", smsError);
                // Continue execution even if SMS fails
            }
        }

        // Send admin notification if configured
        if (client && process.env.ADMIN_PHONE) {
            const itemNames = order.orderItems
                .map((oi) => `${oi.menuItem.name} (x${oi.quantity})`)
                .join(", ");

            try {
                await client.messages.create({
                    body: `New order placed by ${customerName} for: ${itemNames}`,
                    from: process.env.TWILIO_FROM_NUMBER,
                    to: process.env.ADMIN_PHONE,
                });
            } catch (smsError) {
                console.error("Error sending admin SMS:", smsError);
                // Continue execution even if SMS fails
            }
        }

        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error: any) {
        console.error("Error creating order:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}