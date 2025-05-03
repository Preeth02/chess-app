import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import prisma from "./prisma";

// const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    // crossSubDomainCookies: {
    //   enabled: true,
    // },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "Lax", // allows cookie on cross-site WS handshake
    },
    trustedOrigins: ["ws://localhost:8080", "http://localhost:3000"],
  },
  // plugins: [
  //   jwt({
  //     jwt: {
  //       definePayload: ({ user }) => {
  //         return {
  //           id: user.id,
  //           email: user.email,
  //           role: user.role,
  //         };
  //       },
  //     },
  //   }),
  // ],
});
