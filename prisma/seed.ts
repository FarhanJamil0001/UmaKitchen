import { PrismaClient } from "@prisma/client";

// 1. Instantiate the Prisma client
const prisma = new PrismaClient();

async function main() {
  // 2. Seed your data here
  // Example: creating a menu item
  await prisma.menuItem.create({
    data: {
      name: "Chicken Sandwich",
      price: 8.99,
      availableDate: new Date("2025-01-20T00:00:00.000Z"),
      description: "A delicious chicken sandwich with crispy lettuce and mayo.",
    },
  });

  // pickup is on Jan 19, from times 10:00 AM, 10:30 AM, etc.
  await prisma.orderingWindow.create({
    data: {
      orderingStart: new Date("2025-01-18T09:00:00.000Z"),
      orderingEnd: new Date("2025-01-18T17:00:00.000Z"),
      pickupDate: new Date("2025-01-19T00:00:00.000Z"),
      pickupTimes: ["10:00 AM", "10:30 AM", "11:00 AM"],
    },
  });

  // Another window: Orders open Feb 2 at 8:00 AM, close at 12:00 PM,
  // pickup is on Feb 3, times from 1:00 PM, 1:30 PM, etc.
  await prisma.orderingWindow.create({
    data: {
      orderingStart: new Date("2025-02-02T08:00:00.000Z"),
      orderingEnd: new Date("2025-02-02T12:00:00.000Z"),
      pickupDate: new Date("2025-02-03T00:00:00.000Z"),
      pickupTimes: ["13:00", "13:30", "14:00"], // or "1:00 PM", "1:30 PM", etc.
    },
  });


  // You can add as many create statements as you need for your initial data
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1); // Ensure the script fails if there's an error
  })
  .finally(async () => {
    await prisma.$disconnect(); // Properly disconnect Prisma
  });