import { WebSocket, WebSocketServer } from "ws";
import GameManager from "./GameManager";
import { randomUUID } from "crypto";
import { Redis } from "ioredis";

const redis = new Redis();

export interface ExtendedWebSocket extends WebSocket {
  id: string;
}

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager(redis);
wss.on("connection", function connection(ws: ExtendedWebSocket) {
  ws.on("error", console.error);
  ws.id = randomUUID();
  gameManager.addUser(ws);
  //   ws.send('something');
  ws.on("close", () => {
    gameManager.removeUser(ws);
  });
});
