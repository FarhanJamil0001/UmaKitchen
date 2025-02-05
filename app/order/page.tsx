// app/order/page.tsx
import { prisma } from "@/lib/prisma"; // or your path to Prisma client
import OrderForm from "./OrderForm";
import OrderPageWrapper from "@/components/wrapper/order-page-wrapper";

export default async function OrderPage() {
  const menuItems = await prisma.menuItem.findMany();

  // Convert Decimal `price` to plain `number`
  const serializedMenuItems = menuItems.map((item) => ({
    ...item,
    price: item.price.toNumber(), // Convert Decimal to number
  }));

  return (
    <OrderPageWrapper>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Place Your Order
        </h1>
        <OrderForm menuItems={serializedMenuItems} />
      </div>
    </OrderPageWrapper>
  );
}