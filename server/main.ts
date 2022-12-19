import * as http from "http";
import { Server } from "socket.io";

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("New client connected!");

  // Listen for incoming messages from this client
  socket.on("message", (msg: string) => {
    console.log(`Message received from client: ${msg}`);

    // Emit the incoming message to all connected users
    io.emit("message", msg);
  });

  socket.on("askForHost", (room: string) => {
    console.log(`Client asked for host in room ${room}`);

    // Emit the incoming message to all connected users
    io.emit("askForHost", room);
  });

  socket.on("host", (hostUuid: string) => {
    console.log(`Client ${hostUuid} is the host`);

    // Emit the incoming message to all connected users
    io.emit("host", hostUuid);
  });

  // When this client disconnects, let the other clients know
  socket.on("disconnect", () => {
    console.log("Client disconnected.");
    io.emit("disconnected", "A user has disconnected from the chat.");
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000...");
});
