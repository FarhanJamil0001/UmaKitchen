// app/dashboard/menu-items/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import EditMenuItemForm from "./edit-menu-item-form";

type Params = {
  params: {
    id: string;
  };
};

export default async function EditMenuItemPage({ params }: Params) {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: params.id },
  });

  if (!menuItem) {
    return <div className="p-4">Menu item not found</div>;
  }

  // Convert Decimal => string or number if necessary
  const serializedItem = {
    ...menuItem,
    price: menuItem.price.toString(), // if price is Decimal
    availableDate: menuItem.availableDate.toISOString(),
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Edit Menu Item</h1>
      <EditMenuItemForm item={serializedItem} />
    </div>
  );
}