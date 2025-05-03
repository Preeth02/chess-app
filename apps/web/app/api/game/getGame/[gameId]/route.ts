import Apiresponse from "@lib/ApiResponse";
import prisma from "@lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  const gameId = params.gameId;
  if (gameId.split("-").length != 5) {
    return new Apiresponse(400, "Not a valid game ID");
  }
  const game = await prisma.gamePlayer.findFirst({
    where: { gameID: gameId },
    include: { game: true },
  });
  if (!game) {
    return new Apiresponse(
      404,
      "No game with the following game id"
    ).successResponse();
  }
  return new Apiresponse(
    200,
    "Game fetched successfully",
    game
  ).successResponse();
}
