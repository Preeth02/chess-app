/*
  Warnings:

  - You are about to drop the column `userId1` on the `game` table. All the data in the column will be lost.
  - You are about to drop the column `userId2` on the `game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "game" DROP COLUMN "userId1",
DROP COLUMN "userId2";
