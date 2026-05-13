import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./db.js";
import { configureSockets } from "./sockets/socket-hub.js";

const app = createApp();
const httpServer = createServer(app);

configureSockets(httpServer);

await connectDatabase();

httpServer.listen(env.API_PORT, () => {
  console.log(`API listening on http://localhost:${env.API_PORT}`);
});
