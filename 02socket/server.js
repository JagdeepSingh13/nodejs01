const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();

const server = http.createServer(app);

// initiate socket.io and attach to http server
const io = socketIo(server);

app.use(express.static("public"));

const users = new Set();

io.on("connection", (socket) => {
  console.log("user connected");

  // handle users when they join
  socket.on("join", (userName) => {
    users.add(userName);
    socket.userName = userName;

    // bradcast all users that a new user has joined
    io.emit("userJoined", userName);

    // send the updated user-list to all clients
    io.emit("userList", Array.from(users));
  });

  // handle incoming chat msgs
  socket.on("chatMessage", (message) => {
    // broadcast the message to all users
    io.emit("chatMessage", message);
  });

  // handle user disconnected
  socket.on("disconnect", () => {
    console.log("user disconnected");

    users.forEach((user) => {
      if (user === socket.userName) {
        users.delete(user);

        io.emit("userLeft", user);
        io.emit("userList", Array.from(users));
      }
    });
  });
});

const port = 3000;
server.listen(port, () => {
  console.log("server running on port: 3000");
});
