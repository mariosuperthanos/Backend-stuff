const joinRoomButton = document.getElementById("room-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");
const messageContainer = document.getElementById("message-container");
import { io } from "socket.io-client";
console.log(1);

const socket = io("http://localhost:3000");
socket.on("connect", () => {
  displayMessage(`You connected with id, ${socket.id}`);
});

socket.on('receive-message', (message) => {
  displayMessage(message)
})

// Check if all required elements exist
if (!form || !messageInput || !roomInput || !messageContainer) {
  console.error("Required elements not found");
  throw new Error("Required elements not found");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  const room = roomInput.value.trim();

  if (message === "") return;
  displayMessage(message);
  // sending events from the client to the server
  socket.emit("send-message", message, room);

  messageInput.value = "";
});

if (joinRoomButton) {
  joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value.trim();
    // Add room joining logic here
    socket.emit('join-room', room, message => {
      displayMessage(message);
    });
  });
}

function displayMessage(message) {
  const div = document.createElement("div");
  div.textContent = message;
  messageContainer.append(div);
}
