import { WebSocket, WebSocketServer } from "ws";
import GameManager from "./GameManager";
import { randomUUID } from "crypto";
import { Redis } from "ioredis";
import { parse } from "cookie";
import http from "http";

const redis = new Redis();

export interface ExtendedWebSocket extends WebSocket {
  id: string;
}

const server = http.createServer();

const wss = new WebSocketServer({
  noServer: true,
});

server.on("upgrade", async (req, socket, head) => {
  try {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    console.log(err);
  }
});

const gameManager = new GameManager(redis);
wss.on("connection", async function connection(ws: ExtendedWebSocket, req) {
  const rawCookies = req.headers.cookie || "";
  const { "better-auth.session_token": sessionToken } = parse(rawCookies);

  if (!sessionToken) {
    console.log("No session cookie");
  }

  // Call your existing Next.js auth route
  // const res1=await api
  const res = await fetch(`http://localhost:3000/api/me`, {
    headers: {
      // Forward the cookie for authentication
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
    credentials: "include",
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok) {
    console.log(`Auth API responded ${res.status}`);
  }
  ws.on("error", console.error);
  ws.id = randomUUID();
  gameManager.addUser(ws);
  //   ws.send('something');
  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});

server.listen(8080, () => {
  console.log("Websocket server listening on port 8080");
});
