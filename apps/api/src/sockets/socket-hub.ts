import { Server } from "socket.io";
import { Server as HttpServer } from "node:http";
import { env } from "../config/env.js";

let io: Server | undefined;

export function configureSockets(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("match:join", (matchId: string) => socket.join(`match:${matchId}`));
    socket.on("match:leave", (matchId: string) => socket.leave(`match:${matchId}`));
  });

  return io;
}

export function emitGlobal(event: string, payload: unknown) {
  io?.emit(event, payload);
}

export function emitMatch(matchId: string, event: string, payload: unknown) {
  io?.to(`match:${matchId}`).emit(event, payload);
}
