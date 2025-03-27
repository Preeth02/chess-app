import Game from "./Game";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MAKE_MOVE } from "./messages";

class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  //TODO: Try to store all this in redis

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(ws: WebSocket) {
    this.users.push(ws);
    this.handler(ws);
  }

  removeUser(ws: WebSocket) {
    this.users = this.users.filter((user) => user !== ws);
  }

  handler(ws: WebSocket) {
    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (!this.pendingUser) {
          this.pendingUser = ws;
        } else {
          const toss = Math.floor(Math.random() * 2 + 1);
          let newGame;
          if (toss == 1) {
            if (message.payload.timer) {
              newGame = new Game(this.pendingUser, ws, message.payload.timer);
            } else {
              newGame = new Game(
                this.pendingUser,
                ws,
                message.payload.timer,
                message.payload.timer2
              );
            }
          } else {
            if (message.payload.timer) {
              newGame = new Game(ws, this.pendingUser, message.payload.timer);
            } else {
              newGame = new Game(
                ws,
                this.pendingUser,
                message.payload.timer,
                message.payload.timer2
              );
            }
          }
          this.games.push(newGame);
          this.pendingUser = null;
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
