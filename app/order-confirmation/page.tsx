// app/order-confirmation/page.tsx
import PageWrapper from "@/components/wrapper/page-wrapper";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import OrderPageWrapper from "@/components/wrapper/order-page-wrapper";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// This is a server component that uses an optional search param
export default async function OrderConfirmation({ searchParams }: Props) {
  // Await the searchParams before accessing
  const params = await searchParams;
  const orderId = typeof params.orderId === 'string' ? params.orderId : undefined;
  
  if (!orderId) {
    return notFound();
  }

  // Fetch the order from the database
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { menuItem: true } } },
  });

  if (!order) {
    return notFound();
  }

  // Calculate total
  const subtotal = order.orderItems.reduce((sum, item) => 
    sum + (item.menuItem.price.toNumber() * item.quantity), 0
  );
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  return (
    <OrderPageWrapper>
      <div className="min-h-screen p-4 md:p-8 bg-[#faf7f2]">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="backdrop-blur-xl bg-orange-50/90 rounded-2xl border border-orange-300 shadow-2xl p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-orange-950 mb-4">Order Confirmed!</h1>
              <p className="text-orange-900 text-lg">Thank you for your order, {order.customerName}!</p>
            </div>

            {/* Order Info */}
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl border border-orange-200">
                <div>
                  <p className="text-orange-900 font-medium">Order ID</p>
                  <p className="text-orange-950 font-mono">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-900 font-medium">Pickup Time</p>
                  <p className="text-orange-950">{new Date(order.pickupDateTime).toLocaleString()}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h2 className="font-bold text-xl text-orange-950">Order Details</h2>
                <div className="divide-y divide-orange-200">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="bg-orange-100 text-orange-950 w-8 h-8 rounded-full flex items-center justify-center font-medium">
                          {item.quantity}x
                        </span>
                        <span className="text-orange-900">{item.menuItem.name}</span>
                      </div>
                      <span className="text-orange-950 font-medium">
                        ${(item.menuItem.price.toNumber() * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t border-orange-300 pt-4 space-y-3 mt-6">
                  <div className="flex justify-between text-orange-900">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-orange-900">
                    <span>Tax (8.25%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-3 border-t border-orange-300 text-orange-950">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pickup Information */}
              <div className="bg-orange-100/50 rounded-xl p-6 space-y-3 border border-orange-200">
                <h2 className="font-bold text-lg text-orange-950">Pickup Information</h2>
                <p className="text-orange-900">📍 123 Main Street, CityName</p>
                <p className="text-orange-900">📞 (555) 555-5555</p>
                {order.instructions && (
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-sm font-medium text-orange-900">Special Instructions:</p>
                    <p className="text-orange-800 mt-1">{order.instructions}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <Link href="/order" className="flex-1">
                  <Button className="w-full bg-orange-100 text-orange-950 hover:bg-orange-200 border border-orange-300">
                    Place Another Order
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-orange-600 text-white hover:bg-orange-700 border border-orange-700">
                    Return Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrderPageWrapper>
  );
}