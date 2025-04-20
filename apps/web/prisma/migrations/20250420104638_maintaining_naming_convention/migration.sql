/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GamePlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_gameID_fkey";

-- DropForeignKey
ALTER TABLE "GamePlayer" DROP CONSTRAINT "GamePlayer_userID_fkey";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "GamePlayer";

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "userId1" TEXT NOT NULL,
    "userId2" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "moves" TEXT[],

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamePlayer" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "gameID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "gamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gamePlayer_gameID_role_key" ON "gamePlayer"("gameID", "role");

-- AddForeignKey
ALTER TABLE "gamePlayer" ADD CONSTRAINT "gamePlayer_userID_fkey" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamePlayer" ADD CONSTRAINT "gamePlayer_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
