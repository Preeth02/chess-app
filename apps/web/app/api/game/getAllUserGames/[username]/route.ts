import Apiresponse from "@lib/ApiResponse";
import prisma from "@lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username;
  if (username.length < 2) {
    return new Apiresponse(
      401,
      "Please provide a valid username"
    ).successResponse();
  }
  const user = await prisma.user.findFirst({
    where: { name: username },
    select: {
      id: true,
      name: true,
    },
  });
  if (!user) {
    return new Apiresponse(
      404,
      "User with the following name is not found"
    ).successResponse();
  }
  const lastGameId = await req.json();
  // const userGames = await prisma.gamePlayer.findMany({
  //   where: { userID: user.id },
  //   include: { game: true, user: true },
  //   take: 10,
  //   orderBy: { game: { createdAt: "desc" } },
  //   cursor: { id: lastGameId },
  // });

  const userGames = await prisma.game.findMany({
    where: {
      GamePlayer: { some: { userID: user.id } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    ...(lastGameId && {
      cursor: { id: lastGameId },
      skip: 1,
    }),
    include: { GamePlayer: true },
  });
  if (!userGames) {
    return new Apiresponse(
      401,
      "Something went wrong while fetching all the games of the user"
    ).successResponse();
  }
}
