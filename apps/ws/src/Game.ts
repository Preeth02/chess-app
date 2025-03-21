import WebSocket from "ws";
import { randomUUID } from "crypto";
import { Move } from "chess.js";

class Game {
  public gameId: string;
  public player1: WebSocket;
  public player2: WebSocket;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.gameId = randomUUID();
  }
  makeMove(ws: WebSocket, move:Move) {}
}

export default Game;
