// Packages
import express from "express";
import http from "http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

// Instances
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serving static files (fix for script.js not found)
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname)); // Acum servește script.js și alte fișiere

// Serving HTML File
app.get("/", (req, res) => res.sendFile(join(__dirname, "index.html")));

// Define a connection event handler
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  // console.log(socket);
  socket.on('send-message', (message, room) => {
    if (room === '') {
      // send this message to every other socket except this one
      socket.broadcast.emit('receive-message', message)
    console.log(message)
    } else {
      socket.broadcast.to(room).emit('receive-message', message)
    }
  })
  // listen for the message with key: "join-room", and return a callback function which arguments are the objects send from client 
  socket.on('join-room', (room, cb) => {
    // custom room
    socket.join(room)
    cb(`Jointed ${room}`)
  })
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
