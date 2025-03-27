import WebSocket, { Data } from "ws";
import { randomUUID } from "crypto";
import { Chess, Move } from "chess.js";
import {
  DEFAULT_GAME_TIME,
  GAME_OVER,
  INIT_GAME,
  MAKE_MOVE,
  TIME_IN_MIN,
} from "./messages";

type gameStatus = "COMPLETED" | "ABANDONED" | "PLAYER_EXIT";
type gameResult =
  | "Checkmate • Black wins"
  | "Checkmate • White wins"
  | "Insufficient Material • Draw"
  | "Three fold repetition • Draw"
  | "Stalemate"
  | "White time out • Black is victorious"
  | "Black time out • White is victorious"
  | "White left the game • Black is victorious"
  | "Black left the game • White is victorious";

class Game {
  public gameId: string;
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private moveCounter = 0;
  private player1Timer: number;
  private player2Timer: number;
  private createdOn = new Date();
  private lastMoveTime = new Date();
  private result: gameResult | null = null;

  constructor(
    player1: WebSocket,
    player2: WebSocket,
    player1Timer: number,
    player2Timer?: number
  ) {
    this.player1 = player1;
    this.player2 = player2;
    this.gameId = randomUUID();
    this.board = new Chess();
    this.lastMoveTime = new Date();

    if (player1Timer) {
      this.player1Timer = this.player2Timer = player1Timer * TIME_IN_MIN;
    } else if (player1Timer && player2Timer) {
      this.player1Timer = player1Timer * TIME_IN_MIN;
      this.player2Timer = player2Timer * TIME_IN_MIN;
    } else {
      this.player1Timer = DEFAULT_GAME_TIME;
      this.player2Timer = DEFAULT_GAME_TIME;
    }

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: this.gameId,
          color: "white",
          message: "You have joined the game.",
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: this.gameId,
          color: "black",
          message: "You have joined the game",
        },
      })
    );
  }
  makeMove(ws: WebSocket, move: Move) {
    if (this.moveCounter % 2 === 0 && ws !== this.player1) {
      return;
    }
    if (this.moveCounter % 2 === 1 && ws !== this.player2) {
      return;
    }

    const timer = new Date();
    const timeElapsed = timer.getTime() - this.lastMoveTime.getTime();

    if (this.player1Timer <= 0 || this.player2Timer <= 0) {
      if (this.player1Timer <= 0)
        this.endGame("COMPLETED", "White time out • Black is victorious");
      else this.endGame("COMPLETED", "Black time out • White is victorious");

      return;
    }

    try {
      this.board.move(move);
    } catch (error) {
      console.log(error);
      return;
    }
    if (this.board.turn() === "w") {
      this.player1Timer = this.player1Timer - timeElapsed;
    }
    if (this.board.turn() === "b") {
      this.player2Timer = this.player2Timer - timeElapsed;
    }
    this.lastMoveTime = timer;

    if (this.player1Timer <= 0 || this.player2Timer <= 0) {
      if (this.player1Timer <= 0)
        this.endGame("COMPLETED", "White time out • Black is victorious");
      else this.endGame("COMPLETED", "Black time out • White is victorious");

      return;
    }

    if (this.board.isGameOver()) {
      if (this.board.isCheckmate()) {
        const result = this.board.turn() === "w";
        this.endGame(
          "COMPLETED",
          result ? "Checkmate • White wins" : "Checkmate • Black wins"
        );
      } else if (this.board.isDraw()) {
        if (this.board.isStalemate()) {
          this.endGame("COMPLETED", "Stalemate");
        } else if (this.board.isInsufficientMaterial()) {
          this.endGame("COMPLETED", "Insufficient Material • Draw");
        } else if (this.board.isThreefoldRepetition()) {
          this.endGame("COMPLETED", "Three fold repetition • Draw");
        }
      }
      return;
    }
    if (this.moveCounter % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MAKE_MOVE,
          payload: {
            move,
          },
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MAKE_MOVE,
          payload: {
            move,
          },
        })
      );
    }
    this.moveCounter++;
  }

  endGame(status: gameStatus, result: gameResult) {
    this.player1.send(
      JSON.stringify({
        type: GAME_OVER,
        status,
        payload: {
          message: result,
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: GAME_OVER,
        status,
        payload: {
          message: result,
        },
      })
    );
    return;
  }
}

export default Game;
