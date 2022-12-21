import io from "socket.io-client";
// Import EventEmitter
import { EventEmitter } from "events";

const socket = io("http://localhost:3000");

let room = "";

let isHost = false;

let host: string = "";

// Generate a UUID for this client
const uuid =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

// Create a new EventEmitter
const eventEmitter = new EventEmitter();

socket.on("connect", () => {
  console.log("Connected to server!");
});

// Listen for incoming messages from the server
socket.on("message", (msg: string) => {
  // Parse JSON
  const parsedMsg = JSON.parse(msg);

  if (!parsedMsg.room || parsedMsg.room != room || room == "") return;

  if (parsedMsg.uuid == uuid) return;

  // Emit the message event
  eventEmitter.emit("messageIncoming", parsedMsg.message);
});

eventEmitter.on("messageOutgoing", (msg: string) => {
  let toSend = JSON.stringify({
    room: room,
    message: msg,
    uuid: uuid,
  });

  // Emit the message to the server
  socket.emit("message", toSend);
});

socket.on("askForHost", (hostRoom: string) => {
  console.log("Asked for host in room " + hostRoom);
  if (hostRoom != room) return;

  console.log("Checking if host...");
  if (isHost) {
    console.log("Sending host...");
    socket.emit("host", uuid);
  }
});

socket.on("host", (hostUuid: string) => {
  host = hostUuid;
});

// When not host, ask for host until host is found
setInterval(() => {
  if (!isHost && room != "" && host == "") {
    console.log("Asking for host...");
    socket.emit("askForHost", room);
  }
}, 1000);

function changeRoom(newRoom: string): void {
  room = newRoom;

  // Reset all variables
  isHost = false;
  host = "";
}

function getRoom(): string {
  return room;
}

function setHost(): string {
  if (room == "") return "No room set!";

  console.log(host);
  if (host != "") return "Host already set!";

  console.log("Setting host...");

  isHost = true;

  return "Host set!";
}

function getIsHost(): boolean {
  return isHost;
}

export { eventEmitter, changeRoom, getRoom, setHost, getIsHost };
