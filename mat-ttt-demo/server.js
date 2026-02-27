const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = new Map();

function makeCode(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function freshGame() {
  return {
    board: Array(9).fill(null),
    turn: 'X',
    winner: null,
    players: [],
    status: 'waiting'
  };
}

function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

io.on('connection', (socket) => {
  socket.on('createRoom', () => {
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();

    const game = freshGame();
    game.players.push({ id: socket.id, symbol: 'X' });
    rooms.set(code, game);

    socket.join(code);
    socket.emit('roomCreated', { code, symbol: 'X', game });
  });

  socket.on('joinRoom', (codeRaw) => {
    const code = (codeRaw || '').toUpperCase().trim();
    const game = rooms.get(code);
    if (!game) return socket.emit('joinError', 'Room not found.');
    if (game.players.length >= 2) return socket.emit('joinError', 'Room is full.');

    game.players.push({ id: socket.id, symbol: 'O' });
    game.status = 'playing';
    socket.join(code);

    socket.emit('roomJoined', { code, symbol: 'O', game });
    io.to(code).emit('state', game);
  });

  socket.on('move', ({ code, index }) => {
    const game = rooms.get(code);
    if (!game || game.winner || game.status !== 'playing') return;

    const player = game.players.find((p) => p.id === socket.id);
    if (!player || player.symbol !== game.turn) return;
    if (typeof index !== 'number' || index < 0 || index > 8 || game.board[index]) return;

    game.board[index] = player.symbol;
    const result = checkWinner(game.board);
    if (result) {
      game.winner = result;
      game.status = 'finished';
    } else {
      game.turn = game.turn === 'X' ? 'O' : 'X';
    }

    io.to(code).emit('state', game);
  });

  socket.on('reset', (code) => {
    const game = rooms.get(code);
    if (!game) return;
    game.board = Array(9).fill(null);
    game.turn = 'X';
    game.winner = null;
    game.status = game.players.length === 2 ? 'playing' : 'waiting';
    io.to(code).emit('state', game);
  });

  socket.on('disconnect', () => {
    for (const [code, game] of rooms.entries()) {
      const idx = game.players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        game.players.splice(idx, 1);
        if (game.players.length === 0) {
          rooms.delete(code);
        } else {
          game.status = 'waiting';
          io.to(code).emit('state', game);
        }
        break;
      }
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`mat-ttt-demo listening on ${port}`);
});
