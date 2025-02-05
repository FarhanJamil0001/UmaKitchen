/*
  Warnings:

  - You are about to drop the column `end` on the `OrderingWindow` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `OrderingWindow` table. All the data in the column will be lost.
  - You are about to drop the `PickupDay` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orderingEnd` to the `OrderingWindow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingStart` to the `OrderingWindow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupDate` to the `OrderingWindow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notifyUpdates" BOOLEAN,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "pickedUp" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderingWindow" DROP COLUMN "end",
DROP COLUMN "start",
ADD COLUMN     "orderingEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "orderingStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pickupDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pickupTimes" TEXT[];

-- DropTable
DROP TABLE "PickupDay";
