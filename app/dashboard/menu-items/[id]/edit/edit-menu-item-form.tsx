"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: string;
  name: string;
  price: string; // or number, but likely a string if you used .toString()
  availableDate: string; // ISO string
  description: string | null;
};

type Props = {
  item: MenuItem;
};

export default function EditMenuItemForm({ item }: Props) {
  const router = useRouter();

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [availableDate, setAvailableDate] = useState(
    item.availableDate.slice(0, 10) // "YYYY-MM-DD"
  );
  const [description, setDescription] = useState(item.description ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`/api/menu-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          availableDate,
          description,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update item");
      }

      alert("Menu item updated!");
      router.push("/dashboard/menu-items");
    } catch (error: any) {
      alert("Error updating menu item: " + error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      {/* Name */}
      <div>
        <label className="block font-medium mb-1" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="border p-2 w-full"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Price */}
      <div>
        <label className="block font-medium mb-1" htmlFor="price">
          Price
        </label>
        <input
          id="price"
          className="border p-2 w-full"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Available Date */}
      <div>
        <label className="block font-medium mb-1" htmlFor="availableDate">
          Available Date
        </label>
        <input
          id="availableDate"
          className="border p-2 w-full"
          type="date"
          value={availableDate}
          onChange={(e) => setAvailableDate(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="border p-2 w-full"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Update
      </button>
    </form>
  );
}