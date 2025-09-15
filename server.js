require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const Player = require('./public/Player.mjs');
const Collectible = require('./public/Collectible.mjs');

const app = express();

// 🛡️ Seguridad exigida por los tests
app.use(helmet());
app.use(helmet.noSniff()); // Test 16
app.use(helmet.xssFilter()); // Test 17
app.use(helmet.noCache()); // Test 18
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'PHP 7.4.3'); // Test 19
  next();
});

// Archivos estáticos
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS para FCC
app.use(cors({ origin: '*' }));

// Página principal
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Rutas de testing FCC
fccTestingRoutes(app);

// Middleware 404
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

// Servidor y tests
const portNum = process.env.PORT || 3000;
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// 🎮 Juego multijugador en tiempo real
const io = socket(server);

const players = {};
const collectibles = [
  new Collectible({ id: 'c1', value: 1, x: 100, y: 100 })
];

io.on('connection', socket => {
  players[socket.id] = new Player({ id: socket.id, x: 50, y: 50, score: 0 });

  socket.on('move', direction => {
    const player = players[socket.id];
    player.movePlayer(direction, 5);

    collectibles.forEach(item => {
      if (player.collision(item)) {
        player.score += item.value;
        item.x = Math.random() * 400;
        item.y = Math.random() * 400;
      }
    });

    io.emit('state', {
      players: Object.values(players).map(p => ({
        id: p.id,
        x: p.x,
        y: p.y,
        score: p.score,
        rank: p.calculateRank(Object.values(players))
      })),
      collectibles
    });
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('state', {
      players: Object.values(players),
      collectibles
    });
  });
});

module.exports = app;
