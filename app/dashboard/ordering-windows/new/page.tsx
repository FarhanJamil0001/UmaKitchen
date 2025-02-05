"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toZonedTime } from "date-fns-tz";

const CST_TIMEZONE = "America/Chicago";

// Interpret the user input (e.g. "2025-01-28T09:00") as if it's local CST
function parseCSTDateTime(dateTimeString: string): Date {
  // The datetime-local input is "YYYY-MM-DDTHH:mm", e.g. "2025-01-28T09:00"
  // date-fns-tz expects a date/time string like "2025-01-28 09:00"
  const [datePart, timePart] = dateTimeString.split("T"); // ["2025-01-28", "09:00"]
  const cstString = `${datePart} ${timePart}`;            // "2025-01-28 09:00"
  return toZonedTime(cstString, CST_TIMEZONE);
}

export default function CreateOrderingWindowPage() {
  const router = useRouter();

  const [orderingStart, setOrderingStart] = useState("");
  const [orderingEnd, setOrderingEnd] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTimesString, setPickupTimesString] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Convert inputs from "2025-01-28T09:00" in CST => UTC Date
    const startUTC = parseCSTDateTime(orderingStart);
    const endUTC = parseCSTDateTime(orderingEnd);
    const pickupUTC = parseCSTDateTime(pickupDate);

    // Transform comma-separated times into a string[]
    const pickupTimes = pickupTimesString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/ordering-windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderingStart: startUTC.toISOString(), // store as UTC in DB
          orderingEnd: endUTC.toISOString(),
          pickupDate: pickupUTC.toISOString(),
          pickupTimes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create ordering window");
      }

      alert("Ordering window created successfully!");
      router.push("/dashboard/ordering-windows");
    } catch (error: any) {
      alert("Error creating ordering window: " + error.message);
      console.error(error);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Create Ordering Window</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {/* Ordering Start */}
        <div>
          <label htmlFor="orderingStart" className="block font-medium mb-1">
            Ordering Start (CST)
          </label>
          <input
            id="orderingStart"
            type="datetime-local"
            className="border p-2 w-full"
            value={orderingStart}
            onChange={(e) => setOrderingStart(e.target.value)}
            required
          />
        </div>

        {/* Ordering End */}
        <div>
          <label htmlFor="orderingEnd" className="block font-medium mb-1">
            Ordering End (CST)
          </label>
          <input
            id="orderingEnd"
            type="datetime-local"
            className="border p-2 w-full"
            value={orderingEnd}
            onChange={(e) => setOrderingEnd(e.target.value)}
            required
          />
        </div>

        {/* Pickup Date */}
        <div>
          <label htmlFor="pickupDate" className="block font-medium mb-1">
            Pickup Date/Time (CST)
          </label>
          <input
            id="pickupDate"
            type="datetime-local"
            className="border p-2 w-full"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
        </div>

        {/* Pickup Times */}
        <div>
          <label htmlFor="pickupTimes" className="block font-medium mb-1">
            Pickup Times (comma-separated)
          </label>
          <input
            id="pickupTimes"
            type="text"
            className="border p-2 w-full"
            value={pickupTimesString}
            onChange={(e) => setPickupTimesString(e.target.value)}
            placeholder="e.g. 10:00 AM, 10:30 AM"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Create
        </button>
      </form>
    </div>
  );
}