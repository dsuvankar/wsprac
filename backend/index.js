const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let playerScores = [];
let activeUsers = 0;

io.on("connection", (socket) => {
  activeUsers++;
  io.emit("userCount", activeUsers);
  // send current list on connect
  socket.emit("playerScores", playerScores);

  socket.on("scores", (scores) => {
    playerScores.push({ ...scores, id: socket.id });
    io.emit("playerScores", playerScores);
  });

  socket.on("deleteScore", (index) => {
    if (
      typeof index === "number" &&
      index >= 0 &&
      index < playerScores.length
    ) {
      const targetScore = playerScores[index];

      if (targetScore.id === socket.id) {
        playerScores.splice(index, 1);
        io.emit("playerScores", playerScores);
      }
    }
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("displayTyping", data);
  });

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("userCount", activeUsers);
  });
});

httpServer.listen(3000, () => {
  console.log("server is running");
});
