import Game from "./Game";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MAKE_MOVE } from "./messages";
import { randomUUID } from "crypto";
import { ExtendedWebSocket } from ".";
import { Redis } from "ioredis";

class GameManager {
  private games: Game[];
  private pendingUser: Map<string, WebSocket>;
  private users: WebSocket[];
  private redis: Redis;

  //TODO: Try to store all this in redis

  constructor(redis: Redis) {
    this.games = [];
    this.pendingUser = new Map<string, WebSocket>();
    this.users = [];
    this.redis = redis;
  }

  // Functions to interact with redis:
  private async addPendingUser(userId: string) {
    //   console.log("User object: ", user.id);
    await this.redis.rpush("pending-users", userId);
  }

  private async getPendingUser(): Promise<string | null> {
    const pendingUser = await this.redis.lpop("pending-users");
    if (!pendingUser) {
      console.log("No pending user in the DB");
      return null;
    }
    return pendingUser;
  }

  addUser(ws: WebSocket) {
    this.users.push(ws);
    this.handler(ws as ExtendedWebSocket);
  }

  removeUser(ws: WebSocket) {
    this.users = this.users.filter((user) => user !== ws);
  }

  async handler(ws: ExtendedWebSocket) {
    ws.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      //Following code works until there is no logic in matchmaking based on the ratings

      if (this.pendingUser.size === 0) {
        this.pendingUser.set(ws.id, ws);
        await this.addPendingUser(ws.id);
      } else {
        const toss = Math.floor(Math.random() * 2 + 1);
        if (message.type === INIT_GAME) {
          const pendingUserId = await this.getPendingUser();
          if (!pendingUserId) {
            return;
          }
          const userWs = this.pendingUser.get(pendingUserId);
          if (!userWs) {
            console.log("There's no pending user with the following user id");
            return;
          }
          let newGame;
          if (toss == 1) {
            if (message.payload.timer) {
              newGame = new Game(userWs, ws, message.payload.timer);
            } else {
              newGame = new Game(
                userWs,
                ws,
                message.payload.timer,
                message.payload.timer2
              );
            }
          } else {
            if (message.payload.timer) {
              newGame = new Game(ws, userWs, message.payload.timer);
            } else {
              newGame = new Game(
                ws,
                userWs,
                message.payload.timer,
                message.payload.timer2
              );
            }
          }
          this.games.push(newGame);
        }
      }
      if (message.type === MAKE_MOVE) {
        const game = this.games.find(
          (g) => g.gameId.toString() === message.payload.gameId.toString()
        );
        if (!game) {
          console.log("The game not found");
          return;
        }
        game.makeMove(ws, message.payload.move);
      }
    });
  }
}

export default GameManager;
