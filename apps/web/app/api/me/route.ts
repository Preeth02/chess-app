import Apiresponse from "@lib/ApiResponse";
import { auth } from "@lib/auth";
import { toNextJsHandler } from "better-auth/dist/integrations/next-js";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const incomingHeaders = await headers();
  //   auth.handler
  console.log("Incoming headers: ", incomingHeaders);
  const session = await auth.api.getSession({ headers: incomingHeaders });
  //   toNextJsHandler
  console.log("Session: ", session?.user);
  if (!session) {
    return new Apiresponse(401, "Unauthorized").successResponse();
  }
  return new Apiresponse(201, "User data fetched successfully", {
    user: session.user,
  }).successResponse();
}
