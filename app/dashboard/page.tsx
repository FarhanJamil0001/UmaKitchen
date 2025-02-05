import { prisma } from "@/lib/prisma";
import AdminOrdersTable from "./admin-orders-table";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Get the current user's session
  const { userId } = await auth();
  
  // If not logged in, redirect to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // Get authorized emails from environment variable
  const authorizedEmails = process.env.AUTHORIZED_EMAILS?.split(",") || [];
  
  // Get user's email from Clerk
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // Check if user's email is authorized
  if (!userEmail || !authorizedEmails.includes(userEmail)) {
    redirect("/"); // Redirect unauthorized users to home page
  }

  // Fetch orders and include all necessary fields
  const orders = await prisma.order.findMany({
    include: {
      orderItems: {
        include: {
          menuItem: true, // Include menu item details
        },
      },
    },
    orderBy: {
      pickupDateTime: "asc", // Sort by pickup time
    },
  });

  // Serialize orders for the client component
  const serializedOrders = orders.map((order) => ({
    ...order,
    pickupDateTime: order.pickupDateTime.toISOString(), // Convert Date to string
    pickedUp: order.pickedUp ?? false, // Default pickedUp
    orderItems: order.orderItems.map((item) => ({
      ...item,
      menuItem: {
        ...item.menuItem,
        price: item.menuItem.price.toNumber(), // Convert Decimal to number
      },
    })),
  }));

  return (
    <div className="p-4">
      <h1 className="text-2xl">Admin Dashboard</h1>
      {/* Pass serialized orders to client component */}
      <AdminOrdersTable orders={serializedOrders} />
    </div>
  );
}