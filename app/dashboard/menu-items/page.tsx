// app/dashboard/menu-items/page.tsx
import { prisma } from "@/lib/prisma";
import MenuItemsTable from "./MenuItemsTable";
import Link from "next/link";

export default async function ListMenuItemsPage() {
  const menuItems = await prisma.menuItem.findMany({
    orderBy: {
      availableDate: "asc",
    },
  });

  const serializedMenuItems = menuItems.map((item) => ({
    ...item,
    price: item.price.toString(), // Ensure price is serializable
    availableDate: item.availableDate.toISOString(),
  }));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Menu Items</h1>
      <div className="flex justify-end mb-4">
        <Link
          href="/dashboard/menu-items/new"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Menu Item
        </Link>
      </div>
      <MenuItemsTable initialItems={serializedMenuItems} />
    </div>
  );
}