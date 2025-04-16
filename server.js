const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const Game = require("./models/Game");

const app = express();
const server = http.createServer(app);

// ✅ Define allowed origins for both local and production
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "https://geoapp-phi.vercel.app", // Vercel deployed frontend
];

// ✅ CORS options for both Express and Socket.io
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
};

// 🔧 Use CORS for Express
app.use(cors(corsOptions));
app.use(express.json());

// 🔧 Use CORS for Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

// Initialize game state
const game = new Game();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinGame", ({ username }) => {
    const player = game.addPlayer(socket.id, username);
    if (game.players.length === 1) {
      game.resetGame();
    }
    socket.emit("updateMap", { unlockedRegions: game.unlockedRegions });
    io.emit("updatePlayers", game.getPlayers());
    console.log(`Player ${username} joined the game`);
  });

  socket.on("unlockRegion", ({ regionId }) => {
    if (game.unlockRegion(regionId)) {
      io.emit("updateMap", { unlockedRegions: game.unlockedRegions });
    }
  });

  socket.on("answerQuestion", ({ correct }) => {
    const player = game.getPlayerById(socket.id);
    if (player && correct) {
      game.incrementPlayerScore(socket.id);
      io.emit("updatePlayers", game.getPlayers());
    }
  });

  socket.on("updatePosition", ({ position }) => {
    game.updatePlayerPosition(socket.id, position);
    io.emit("updatePlayers", game.getPlayers());
  });

  socket.on("restartGame", () => {
    game.resetGame();
    io.emit("updateMap", { unlockedRegions: game.unlockedRegions });
    io.emit("updatePlayers", game.getPlayers());
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    game.removePlayer(socket.id);
    io.emit("updatePlayers", game.getPlayers());
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
