class Player {
  constructor({ x, y, score, id }) {
    this.x = x || 0;
    this.y = y || 0;
    this.score = score || 0;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case 'up': this.y -= speed; break;
      case 'down': this.y += speed; break;
      case 'left': this.x -= speed; break;
      case 'right': this.x += speed; break;
    }
  }

  collision(item) {
    // Se asume que el avatar mide 20x20 y el item tiene propiedad size
    return (
      this.x < item.x + item.size &&
      this.x + 20 > item.x &&
      this.y < item.y + item.size &&
      this.y + 20 > item.y
    );
  }

  calculateRank(arr) {
    const sorted = [...arr].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(p => p.id === this.id) + 1;
    return `Rank: ${rank}/${arr.length}`;
  }
}

module.exports = Player;

