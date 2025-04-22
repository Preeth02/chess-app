import { z } from "zod";

export const gameInitSchema = z.object({
  type: z.literal("init_game"),
});

export const MoveSchema = z.object({
  from: z.string(),
  to: z.string(),
  promotion: z.enum(["q", "r", "b", "n"]).optional(),
});
export const PayloadSchema = z.object({
  gameId: z.string(),
  move: MoveSchema,
});

export const makeMoveSchema = z.object({
  type: z.literal("make_move"),
  payload: PayloadSchema,
});

export const gameSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  result: z.string(),
  player1: z.string(),
  player2: z.string(),
  moves: z.array(z.string()),
});
