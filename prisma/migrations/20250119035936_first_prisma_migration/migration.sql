/*
  Warnings:

  - You are about to drop the column `times` on the `PickupDay` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PickupDay" DROP COLUMN "times",
ADD COLUMN     "pickupTimes" TEXT[];
