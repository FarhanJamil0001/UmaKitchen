"use client";

import React from "react";

type DeleteButtonProps = {
  itemId: string;
  onSuccess?: () => void; // Optional callback to trigger after deletion
};

export default function DeleteButton({ itemId, onSuccess }: DeleteButtonProps) {
  async function handleDelete() {
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

      alert("Item deleted successfully.");
      if (onSuccess) onSuccess(); // Call the callback if provided
    } catch (err: any) {
      console.error("Failed to delete item:", err);
      alert("Error deleting item. Please try again.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded"
    >
      Delete
    </button>
  );
}