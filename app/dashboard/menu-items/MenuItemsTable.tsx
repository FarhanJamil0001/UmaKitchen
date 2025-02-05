"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";

type MenuItem = {
  id: string;
  name: string;
  price: string; // or number
  availableDate: string; // ISO string
  description: string | null;
};

type Props = {
  initialItems: MenuItem[];
};

export default function MenuItemsTable({ initialItems }: Props) {
  const [menuItems, setMenuItems] = useState(initialItems);

  async function handleDelete(itemId: string) {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/menu-items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete item.");
      }

      // Remove the deleted item from the state
      setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err: any) {
      alert("Error deleting item: " + err.message);
    }
  }

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Available Date</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.name}</td>
              <td className="p-2">${item.price}</td>
              <td className="p-2">{format(new Date(item.availableDate), "yyyy-MM-dd")}</td>
              <td className="p-2">{item.description}</td>
              <td className="p-2 flex gap-2">
                <Link
                  href={`/dashboard/menu-items/${item.id}/edit`}
                  className="bg-yellow-500 hover:bg-yellow-400 text-white px-2 py-1 rounded"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}