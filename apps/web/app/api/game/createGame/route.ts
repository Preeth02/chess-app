import { NextRequest, NextResponse } from "next/server";
import { gameSchema } from "schema/gameSchema";
import prisma from "@lib/prisma";
import Apiresponse from "@lib/ApiResponse";

export async function POST(req: NextRequest) {
  const game = await req.json();
  const result = gameSchema.safeParse(game);
  if (result.error) {
    console.log(result.error.message);
    return new Apiresponse(400, result.error.message);
  }
  const {
    createdAt,
    id,
    moves,
    player1,
    player2,
    result: gameResult,
  } = result.data;
  const createGame = await prisma.game.create({
    data: {
      id,
      moves,
      result: gameResult,
      createdAt,
      GamePlayer: {
        create: [
          { role: "white", userID: player1 },
          { role: "black", userID: player2 },
        ],
      },
    },
    include: {
      GamePlayer: true,
    },
  });
  if (!createGame) {
    return new Apiresponse(
      400,
      "Something went wrong while creating the game in the database"
    ).successResponse();
  }
  return new Apiresponse(
    200,
    "Game has been created successfully",
    createGame
  ).successResponse();
}
