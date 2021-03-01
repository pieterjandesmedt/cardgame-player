const { Server } = require('boardgame.io/server');
const { CardGame } = require('./game');

const server = Server({ games: [CardGame] });

server.run(8000);
