const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMesssage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Web Socket connection");

  socket.emit("message", generateMesssage("Welcome!"));

  socket.broadcast.emit("message", generateMesssage("A new user joined"));

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    io.emit("message", generateMesssage(message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    socket.broadcast.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMesssage("A user has left the chat"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
