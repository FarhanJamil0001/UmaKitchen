"use client";

import React from "react";

type Props = {
  id: string;
};

export default function DeleteWindowButton({ id }: Props) {
  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this ordering window?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/ordering-windows/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete ordering window.");
      }
      // Refresh page or revalidate
      window.location.reload();
    } catch (err: any) {
      alert("Error deleting ordering window: " + err.message);
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