class Collectible {
  constructor({ x, y, value, id }) {
    this.x = x || 0;
    this.y = y || 0;
    this.value = value || 1;
    this.id = id;
    this.size = 20; // Tamaño estándar para colisión
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch (e) {}

module.exports = Collectible;

