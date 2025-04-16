// backend/models/Game.js
class Game {
    constructor() {
      this.players = [];
      this.unlockedRegions = [];
      this.playerColors = [
        '#4F46E5', // Indigo
        '#10B981', // Green
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#F97316', // Orange
      ];
    }
  
    getRandomColor() {
      // Get unused colors first
      const usedColors = this.players.map(player => player.color);
      const availableColors = this.playerColors.filter(color => !usedColors.includes(color));
      
      if (availableColors.length > 0) {
        return availableColors[Math.floor(Math.random() * availableColors.length)];
      }
      
      // If all colors are used, return a random one
      return this.playerColors[Math.floor(Math.random() * this.playerColors.length)];
    }
  
    addPlayer(id, username) {
      // Check if player with this ID already exists
      const existingPlayer = this.players.find(player => player.id === id);
      if (existingPlayer) {
        return existingPlayer;
      }
      
      // Create a new player
      const newPlayer = {
        id,
        username,
        score: 0,
        color: this.getRandomColor(),
        position: {
          lat: 23.5937 + (Math.random() * 2 - 1), // Random position near center of India
          lng: 78.9629 + (Math.random() * 2 - 1)
        }
      };
      
      this.players.push(newPlayer);
      return newPlayer;
    }
  
    removePlayer(id) {
      this.players = this.players.filter(player => player.id !== id);
    }
  
    getPlayers() {
      return this.players;
    }
  
    getPlayerById(id) {
      return this.players.find(player => player.id === id);
    }
  
    incrementPlayerScore(id) {
      const player = this.getPlayerById(id);
      if (player) {
        player.score += 1;
      }
    }
  
    updatePlayerPosition(id, position) {
      const player = this.getPlayerById(id);
      if (player && position) {
        player.position = position;
      }
    }
  
    unlockRegion(regionId) {
      if (!this.unlockedRegions.includes(regionId)) {
        this.unlockedRegions.push(regionId);
        return true;
      }
      return false;
    }
  
    resetGame() {
      this.unlockedRegions = [];
      // Reset player scores but keep players in the game
      this.players.forEach(player => {
        player.score = 0;
      });
    }
  }
  
  module.exports = Game;