import Game from "./Game";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MAKE_MOVE } from "./messages";
import { randomUUID } from "crypto";
import { ExtendedWebSocket } from ".";
import { Redis } from "ioredis";

class GameManager {
  private games: Map<string, Game>;
  private pendingUser: Map<string, WebSocket>;
  private users: WebSocket[];
  private redis: Redis;
  private numberOfCurrentGames = 0;
  private totalNumberOfUser = 0;

  //TODO: Try to store all this in redis

  constructor(redis: Redis) {
    this.games = new Map();
    this.pendingUser = new Map<string, WebSocket>();
    this.users = [];
    this.redis = redis;
  }

  // Functions to interact with redis:
  private async addPendingUser(userId: string) {
    //   console.log("User object: ", user.id);
    try {
      await this.redis.rpush("pending-users", userId);
    } catch (error) {
      console.log(error);
    }
  }

  private async getPendingUser(): Promise<string | null> {
    let pendingUser;
    try {
      pendingUser = await this.redis.lpop("pending-users");
    } catch (error) {
      console.log(error);
    }
    if (!pendingUser) {
      console.log("No pending user in the DB");
      return null;
    }
    return pendingUser;
  }

  private async addUsersToRedis(userId: any) {
    const data = {
      data: JSON.stringify(userId),
    };
    try {
      await this.redis.hset(`users:${userId}`, data);
    } catch (error) {
      console.log(error);
    }
  }

  private async deleteUser(userId: any) {
    try {
      await this.redis.hdel(`users:${userId}`, "data");
    } catch (error) {
      console.log(error);
    }
  }

  private async addGameToRedis(game: Game) {
    this.numberOfCurrentGames++;
    const gameObj = {
      game: JSON.stringify(game),
    };
    try {
      await this.redis.hset(`game:${game.gameId}`, gameObj);
    } catch (error) {
      console.log(error);
    }
  }
  private async getGame(gameId: string): Promise<Game | null> {
    let game;
    try {
      game = await this.redis.hget(`game:${gameId}`, "game");
    } catch (error) {
      console.log(error);
    }
    if (!game) {
      return null;
    }
    return JSON.parse(game);
  }

  async addUser(ws: ExtendedWebSocket) {
    this.users.push(ws);
    this.handler(ws);
    await this.addUsersToRedis(ws.id);
    this.totalNumberOfUser++;
  }

  async removeUser(ws: ExtendedWebSocket) {
    this.users = this.users.filter((user) => user !== ws);
    this.pendingUser.delete(ws.id);
    await this.deleteUser(ws.id);
    this.totalNumberOfUser--;
  }

  handler(ws: ExtendedWebSocket) {
    ws.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      //Following code works until there is no logic in matchmaking based on the ratings

      if (this.pendingUser.size === 0) {
        this.pendingUser.set(ws.id, ws);
        await this.addPendingUser(ws.id);
      } else {
        const toss = Math.floor(Math.random() * 2 + 1);
        if (message.type === INIT_GAME) {
          // Checking if the pending user and requested user are same and
          // if they are then end the function there itself

          const isSameUser = this.pendingUser.has(ws.id);
          if (isSameUser) {
            return;
          }

          const pendingUserId = await this.getPendingUser();
          if (!pendingUserId) {
            return;
          }
          const userWs = this.pendingUser.get(
            pendingUserId
          ) as ExtendedWebSocket;
          if (!userWs) {
            console.log("There's no pending user with the following user id");
            return;
          }

          let newGame;
          if (toss == 1) {
            if (message.payload.timer) {
              newGame = new Game(userWs, ws, this.redis, message.payload.timer);
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
              newGame = new Game(ws, userWs, this.redis, message.payload.timer);
            } else {
              newGame = new Game(
                ws,
                userWs,
                this.redis,
                message.payload.timer,
                message.payload.timer2
              );
            }
          }
          this.pendingUser = new Map();
          this.games.set(newGame.gameId, newGame);
          this.addGameToRedis(newGame);
        }
      }
      if (message.type === MAKE_MOVE) {
        const game = this.games.get(message.payload.gameId.toString());
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
