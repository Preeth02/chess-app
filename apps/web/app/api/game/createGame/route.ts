import { NextRequest } from "next/server";
import { Game } from "app/generated/prisma";

export async function POST(req:NextRequest) {
    const game=await req.json()
}