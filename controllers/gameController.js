// backend/controllers/gameController.js
const Game = require('../models/Game');

// This controller is reserved for future API endpoints
// Currently, most game logic is handled directly through Socket.io

const getGameStatus = (req, res) => {
  const game = req.app.locals.game;
  res.json({
    players: game.getPlayers(),
    unlockedRegions: game.unlockedRegions
  });
};

module.exports = {
  getGameStatus
};