const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

const SIZE = 8;
const SHIPS = [2, 3, 3];
const rooms = new Map();

function code() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

function newPlayer(id) {
  return { id, ready: false, board: Array.from({ length: SIZE }, () => Array(SIZE).fill(0)), shots: Array.from({ length: SIZE }, () => Array(SIZE).fill(0)), shipCells: 0, hitCells: 0 };
}

function placeRandomShips(board) {
  for (const len of SHIPS) {
    let placed = false;
    while (!placed) {
      const dir = Math.random() < 0.5 ? 'H' : 'V';
      const x = Math.floor(Math.random() * SIZE);
      const y = Math.floor(Math.random() * SIZE);
      const cells = [];
      for (let i = 0; i < len; i++) {
        const nx = dir === 'H' ? x + i : x;
        const ny = dir === 'V' ? y + i : y;
        if (nx >= SIZE || ny >= SIZE || board[ny][nx] !== 0) { cells.length = 0; break; }
        cells.push([nx, ny]);
      }
      if (cells.length === len) {
        cells.forEach(([cx, cy]) => { board[cy][cx] = 1; });
        placed = true;
      }
    }
  }
}

function publicState(room, forId) {
  const pA = room.players[0];
  const pB = room.players[1];
  const me = pA && pA.id === forId ? pA : pB;
  const opp = me && pA && pA.id === forId ? pB : pA;
  return {
    code: room.code,
    phase: room.phase,
    turn: room.turn,
    winner: room.winner,
    you: me ? { ready: me.ready, board: me.board, shots: me.shots } : null,
    opponentReady: !!(opp && opp.ready),
    bothPresent: room.players.length === 2,
    status: room.status
  };
}

function emitRoom(room) {
  room.players.forEach(p => io.to(p.id).emit('state', publicState(room, p.id)));
}

io.on('connection', socket => {
  socket.on('createRoom', () => {
    let c = code();
    while (rooms.has(c)) c = code();
    const room = { code: c, players: [newPlayer(socket.id)], phase: 'placement', turn: null, winner: null, status: 'Waiting for opponent' };
    rooms.set(c, room);
    socket.join(c);
    socket.emit('roomCreated', { code: c });
    emitRoom(room);
  });

  socket.on('joinRoom', cRaw => {
    const c = (cRaw || '').toUpperCase().trim();
    const room = rooms.get(c);
    if (!room) return socket.emit('errorMsg', 'Room not found');
    if (room.players.length >= 2) return socket.emit('errorMsg', 'Room full');
    room.players.push(newPlayer(socket.id));
    room.status = 'Place ships and press Ready';
    socket.join(c);
    socket.emit('roomJoined', { code: c });
    emitRoom(room);
  });

  socket.on('autoPlace', c => {
    const room = rooms.get(c); if (!room) return;
    const p = room.players.find(x => x.id === socket.id); if (!p) return;
    p.board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    placeRandomShips(p.board);
    p.shipCells = p.board.flat().filter(v => v === 1).length;
    p.ready = false;
    emitRoom(room);
  });

  socket.on('ready', c => {
    const room = rooms.get(c); if (!room) return;
    const p = room.players.find(x => x.id === socket.id); if (!p) return;
    p.shipCells = p.board.flat().filter(v => v === 1).length;
    if (p.shipCells === 0) return socket.emit('errorMsg', 'Place ships first (use Auto Place)');
    p.ready = true;
    if (room.players.length === 2 && room.players.every(x => x.ready)) {
      room.phase = 'battle';
      room.turn = room.players[0].id;
      room.status = 'Battle started';
    }
    emitRoom(room);
  });

  socket.on('fire', ({ code: c, x, y }) => {
    const room = rooms.get(c); if (!room || room.phase !== 'battle' || room.winner) return;
    const me = room.players.find(p => p.id === socket.id);
    const opp = room.players.find(p => p.id !== socket.id);
    if (!me || !opp || room.turn !== socket.id) return;
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
    if (me.shots[y][x] !== 0) return;

    if (opp.board[y][x] === 1) {
      me.shots[y][x] = 2;
      opp.board[y][x] = 2;
      opp.hitCells += 1;
      room.status = 'Hit';
      if (opp.hitCells >= opp.shipCells) {
        room.winner = socket.id;
        room.status = 'Game over';
      }
    } else {
      me.shots[y][x] = 1;
      room.status = 'Miss';
      room.turn = opp.id;
    }
    emitRoom(room);
  });

  socket.on('rematch', c => {
    const room = rooms.get(c); if (!room) return;
    room.phase = 'placement';
    room.turn = null;
    room.winner = null;
    room.status = 'Place ships and press Ready';
    room.players.forEach(p => {
      p.ready = false;
      p.board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
      p.shots = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
      p.shipCells = 0;
      p.hitCells = 0;
    });
    emitRoom(room);
  });

  socket.on('disconnect', () => {
    for (const [c, room] of rooms.entries()) {
      const i = room.players.findIndex(p => p.id === socket.id);
      if (i !== -1) {
        room.players.splice(i, 1);
        if (room.players.length === 0) rooms.delete(c);
        else {
          room.phase = 'placement';
          room.turn = null;
          room.status = 'Opponent disconnected';
          emitRoom(room);
        }
        break;
      }
    }
  });
});

server.listen(process.env.PORT || 3000, () => console.log('battleships demo running'));
