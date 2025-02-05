import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteWindowButton from "./delete-window-button"; // A client component for deleting
import { toZonedTime, format } from "date-fns-tz";

function formatUTCInCST(utcDateString: Date): string {
  const CST_TIMEZONE = "America/Chicago";
  const date = new Date(utcDateString); // stored as UTC in DB
  const zoned = toZonedTime(date, CST_TIMEZONE);
  return format(zoned, "yyyy-MM-dd hh:mm aaa (z)", { timeZone: CST_TIMEZONE });
}

export default async function OrderingWindowsPage() {
  // Fetch only “upcoming” windows
  const now = new Date();
  const orderingWindows = await prisma.orderingWindow.findMany({
    where: {
      orderingEnd: {
        gte: now,
      },
    },
    orderBy: {
      orderingStart: "asc", // earliest start first
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Upcoming Ordering Windows</h1>

      <div className="flex justify-end mb-4">
        <Link
          href="/dashboard/ordering-windows/new"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Ordering Window
        </Link>
      </div>

      {orderingWindows.length === 0 ? (
        <p>No upcoming ordering windows found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Ordering Start</th>
              <th className="p-2 text-left">Ordering End</th>
              <th className="p-2 text-left">Pickup Date</th>
              <th className="p-2 text-left">Pickup Times</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orderingWindows.map((win) => {
              const orderingStartCST = formatUTCInCST(new Date(win.orderingStart));
              const orderingEndCST = formatUTCInCST(new Date(win.orderingEnd));
              const pickupDateCST = formatUTCInCST(new Date(win.pickupDate));

              return (
                <tr key={win.id} className="border-b">
                  <td className="p-2">{orderingStartCST}</td>
                  <td className="p-2">{orderingEndCST}</td>
                  <td className="p-2">{pickupDateCST}</td>
                  <td className="p-2">{win.pickupTimes.join(", ")}</td>
                  <td className="p-2 flex gap-2">
                    <DeleteWindowButton id={win.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}