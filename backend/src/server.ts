import "dotenv/config";
import http from "node:http";
import app from "./app.js";
import { initSocketServer } from "./socket.js";

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});