"use client";

import { useState, useMemo } from "react";
import { toZonedTime, format } from "date-fns-tz";

function formatUTCInCST(utcDateString: Date): string {
  const CST_TIMEZONE = "America/Chicago";
  const date = new Date(utcDateString); // stored as UTC in DB
  const zoned = toZonedTime(date, CST_TIMEZONE);
  return format(zoned, "yyyy-MM-dd hh:mm aaa (z)", { timeZone: CST_TIMEZONE });
}

function formatUTCInCSTTime(utcDateString: Date): string {
  const CST_TIMEZONE = "America/Chicago";
  const date = new Date(utcDateString); // stored as UTC in DB
  const zoned = toZonedTime(date, CST_TIMEZONE);
  return format(zoned, "hh:mm aaa (z)", { timeZone: CST_TIMEZONE });
}
type MenuItem = {
  name: string;
  price: number;
};

type OrderItem = {
  id: string;
  quantity: number;
  menuItem: MenuItem;
};

type Order = {
  id: string;
  customerName: string;
  instructions: string | null;
  pickedUp: boolean;
  pickupDateTime: string; // Stored as an ISO string
  orderItems: OrderItem[];
};

type AdminOrdersTableProps = {
  orders: Order[];
};

export default function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [localOrders, setLocalOrders] = useState(orders);
  let totalRevenue = 0;

  // Memoized summary calculations
  const { foodSummary, earliestPickup } = useMemo(() => {
    const summary: Record<string, number> = {};
    let earliest: string | null = null;

    localOrders.forEach((order) => {
      // Update earliest pickup
      const pickupDate = formatUTCInCST(new Date(order.pickupDateTime));
      if (!earliest || pickupDate < earliest) {
        earliest = pickupDate;
      }

      // Calculate food quantities
      order.orderItems.forEach((item) => {
        summary[item.menuItem.name] =
          (summary[item.menuItem.name] || 0) + item.quantity;
      });
    });

    return {
      foodSummary: summary,
      earliestPickup: earliest,
    };
  }, [localOrders]);

  async function updatePickedUp(orderId: string, pickedUp: boolean) {
    try {
      await fetch(`/api/orders/${orderId}/picked`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickedUp }),
      });

      setLocalOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, pickedUp } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Error updating order. Please try again.");
    }
  }

  return (
    <div className="overflow-auto">
      {/* Orders Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Customer Name</th>
            <th className="text-left p-2">Food / Qty</th>
            <th className="text-left p-2">Total</th>
            <th className="text-left p-2">Day</th>
            <th className="text-left p-2">Time</th>
            <th className="text-left p-2">Notes</th>
            <th className="text-left p-2">Picked Up?</th>
          </tr>
        </thead>
        <tbody>
          {localOrders.map((order) => {
            const pickupDate = new Date(order.pickupDateTime);
            const dayString = format(pickupDate, "yyyy-MM-dd");
            const timeString = formatUTCInCSTTime(new Date(pickupDate));

            const itemsDisplay = order.orderItems
              .map(
                (oi) => `${oi.menuItem.name} (x${oi.quantity})`
              )
              .join(", ");
              const totalCost = order.orderItems.reduce((acc, oi) => {
                return acc + oi.quantity * oi.menuItem.price;
              }, 0);
              totalRevenue += totalCost;

            return (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.customerName}</td>
                <td className="p-2">{itemsDisplay}</td>
                <td className="p-2">${totalCost.toFixed(2)}</td>
                <td className="p-2">{dayString}</td>
                <td className="p-2">{timeString}</td>
                <td className="p-2">{order.instructions ?? ""}</td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={order.pickedUp}
                    onChange={(e) =>
                      updatePickedUp(order.id, e.target.checked)
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Food Summary */}
      <div className="mt-6 ml-1 mb-4 border-t pt-4 outline rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold">Food Preparation Summary</h2>
        <ul className="mt-2">
          {Object.entries(foodSummary).map(([food, qty]) => (
            <li key={food} className="text-lg">
              {food}: {qty}
            </li>
          ))}
        </ul>
        {totalRevenue && (
            <h3 className="mt-3 text-lg font-semibold">
            Total Revenue: {" "}
            <span className="font-bold text-green-600">
                {totalRevenue}
            </span>
        </h3>
        )}
        {earliestPickup && (
          <p className="mt-4 text-md text-gray-600">
            Earliest Pickup:{" "}
            <span className="font-bold">
              {formatUTCInCST(earliestPickup)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}