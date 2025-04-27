import Apiresponse from "@lib/ApiResponse";
import prisma from "@lib/prisma";
import { NextRequest } from "next/server";

async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  if (username.length < 2) {
    return new Apiresponse(400, "Provide a valid username");
  }
  const user = await prisma.user.findMany({
    where: { name: { contains: username, mode: "insensitive" } },
    take: 10,
  });
  if (!user) {
    return new Apiresponse(404, "There is no user with the following username");
  }
  return new Apiresponse(200, "User fetched successfully", user);
}
