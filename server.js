// backend/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const Game = require("./models/Game");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Initialize game state
const game = new Game();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle player joining the game
  socket.on("joinGame", ({ username }) => {
    const player = game.addPlayer(socket.id, username);
    if (game.players.length === 1) {
      game.resetGame(); // also resets unlockedRegions
    }
    // Send current game state to the new player
    socket.emit("updateMap", {
      unlockedRegions: game.unlockedRegions,
    });

    // Broadcast updated player list to all clients
    io.emit("updatePlayers", game.getPlayers());

    console.log(`Player ${username} joined the game`);
  });

  // Handle region unlock requests
  socket.on("unlockRegion", ({ regionId }) => {
    if (game.unlockRegion(regionId)) {
      // Broadcast map update to all clients
      io.emit("updateMap", {
        unlockedRegions: game.unlockedRegions,
      });
    }
  });

  // Handle question answers
  socket.on("answerQuestion", ({ correct }) => {
    const player = game.getPlayerById(socket.id);
    if (player && correct) {
      game.incrementPlayerScore(socket.id);
      // Broadcast updated player list
      io.emit("updatePlayers", game.getPlayers());
    }
  });

  // Handle player position updates
  socket.on("updatePosition", ({ position }) => {
    game.updatePlayerPosition(socket.id, position);
    // Broadcast updated player list
    io.emit("updatePlayers", game.getPlayers());
  });

  // Handle game restart
  socket.on("restartGame", () => {
    game.resetGame();
    // Broadcast game reset to all clients
    io.emit("updateMap", {
      unlockedRegions: game.unlockedRegions,
    });
    io.emit("updatePlayers", game.getPlayers());
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    game.removePlayer(socket.id);
    // Broadcast updated player list
    io.emit("updatePlayers", game.getPlayers());
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
