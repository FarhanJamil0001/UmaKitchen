// app/dashboard/menu-items/new/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateMenuItemPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [description, setDescription] = useState("");

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!name || !price || !availableDate) {
      alert("Please fill out name, price, and available date");
      return;
    }

    try {
      // Convert price to number
      const numericPrice = parseFloat(price);
      if (Number.isNaN(numericPrice)) {
        alert("Price must be a valid number");
        return;
      }

      // POST request to create a new menu item
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: numericPrice,
          availableDate,
          description,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create menu item");
      }

      // Success - optionally redirect or show a success message
      alert("Menu item created successfully!");
      router.push("/dashboard"); // Redirect back to dashboard or wherever you prefer
    } catch (error: any) {
      alert(`Error creating menu item: ${error.message}`);
      console.error(error);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Create a New Menu Item</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
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
          <label htmlFor="price" className="block font-medium mb-1">
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
          <label htmlFor="availableDate" className="block font-medium mb-1">
            Available Date
          </label>
          {/* Use date, datetime-local, or text. Just ensure you parse correctly on the server. */}
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
          <label htmlFor="description" className="block font-medium mb-1">
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
          Create Menu Item
        </button>
      </form>
    </div>
  );
}