const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));

const SIZE = 8;
const SHIPS = [
  { id: 1, name: 'Destroyer', len: 2 },
  { id: 2, name: 'Submarine', len: 3 },
  { id: 3, name: 'Cruiser', len: 3 },
  { id: 4, name: 'Battleship', len: 4 }
];

const rooms = new Map();

function makeCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function newPlayer(id, type = 'HUMAN') {
  return {
    id,
    type,
    ready: type === 'BOT',
    board: emptyGrid(),
    shots: emptyGrid(), // 0 unknown, 1 miss, 2 hit
    ships: Object.fromEntries(SHIPS.map(s => [s.id, { name: s.name, len: s.len, hits: 0, sunk: false }])),
    botMemory: { targets: [] }
  };
}

function placeRandomShips(board) {
  for (const ship of SHIPS) {
    let placed = false;
    while (!placed) {
      const dir = Math.random() < 0.5 ? 'H' : 'V';
      const x = Math.floor(Math.random() * SIZE);
      const y = Math.floor(Math.random() * SIZE);
      const cells = [];
      for (let i = 0; i < ship.len; i++) {
        const nx = dir === 'H' ? x + i : x;
        const ny = dir === 'V' ? y + i : y;
        if (nx >= SIZE || ny >= SIZE || board[ny][nx] !== 0) { cells.length = 0; break; }
        cells.push([nx, ny]);
      }
      if (cells.length === ship.len) {
        for (const [cx, cy] of cells) board[cy][cx] = ship.id;
        placed = true;
      }
    }
  }
}

function allSunk(player) {
  return Object.values(player.ships).every(s => s.sunk);
}

function roomStateFor(room, forId) {
  const pA = room.players[0];
  const pB = room.players[1];
  const me = pA && pA.id === forId ? pA : pB;
  const opp = me && pA && pA.id === forId ? pB : pA;

  const visibleBoard = me.board.map(r => r.map(v => (v < 0 ? -v : v)));
  const hiddenOppBoard = opp ? opp.board.map(r => r.map(v => (v < 0 ? 2 : 0))) : emptyGrid();

  return {
    code: room.code,
    mode: room.mode,
    phase: room.phase,
    turn: room.turn,
    winner: room.winner,
    status: room.status,
    lastEvent: room.lastEvent,
    bothPresent: room.players.length === 2,
    opponentReady: !!(opp && opp.ready),
    you: me ? {
      ready: me.ready,
      board: visibleBoard,
      shots: me.shots,
      shipStatus: me.ships
    } : null,
    opponentBoardHitsOnly: hiddenOppBoard
  };
}

function emitRoom(room) {
  for (const p of room.players) {
    if (p.type === 'HUMAN') io.to(p.id).emit('state', roomStateFor(room, p.id));
  }
}

function neighbors(x, y) {
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE);
}

function botChooseShot(bot) {
  while (bot.botMemory.targets.length) {
    const [x, y] = bot.botMemory.targets.shift();
    if (bot.shots[y][x] === 0) return [x, y];
  }

  const checker = [];
  const fallback = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (bot.shots[y][x] !== 0) continue;
      fallback.push([x, y]);
      if ((x + y) % 2 === 0) checker.push([x, y]);
    }
  }
  const pool = checker.length ? checker : fallback;
  return pool[Math.floor(Math.random() * pool.length)];
}

function applyShot(room, shooter, target, x, y) {
  if (shooter.shots[y][x] !== 0) return;

  const cell = target.board[y][x];
  if (cell > 0) {
    shooter.shots[y][x] = 2;
    target.board[y][x] = -cell;
    const ship = target.ships[cell];
    ship.hits += 1;

    let sunkName = null;
    if (ship.hits >= ship.len && !ship.sunk) {
      ship.sunk = true;
      sunkName = ship.name;
    }

    room.lastEvent = sunkName ? `${shooter.type === 'BOT' ? 'Computer' : 'You'} sank ${sunkName}!` : `${shooter.type === 'BOT' ? 'Computer' : 'You'} scored a hit.`;
    room.status = room.lastEvent;

    if (sunkName && allSunk(target)) {
      room.winner = shooter.id;
      room.status = `${shooter.type === 'BOT' ? 'Computer' : 'Player'} wins!`;
      room.lastEvent = room.status;
    }

    if (shooter.type === 'BOT' && !sunkName) {
      for (const c of neighbors(x, y)) shooter.botMemory.targets.push(c);
    }
  } else {
    shooter.shots[y][x] = 1;
    room.lastEvent = `${shooter.type === 'BOT' ? 'Computer' : 'You'} missed.`;
    room.status = room.lastEvent;
  }

  // Strict turn alternation: one shot each, then hand over turn
  if (!room.winner) room.turn = target.id;
}

function maybeRunBot(room) {
  if (room.phase !== 'battle' || room.winner) return;
  const bot = room.players.find(p => p.type === 'BOT');
  if (!bot || room.turn !== bot.id) return;

  const human = room.players.find(p => p.type === 'HUMAN');
  if (!human) return;

  if (room.botTimer) clearTimeout(room.botTimer);
  room.botTimer = setTimeout(() => {
    const [x, y] = botChooseShot(bot);
    applyShot(room, bot, human, x, y);
    emitRoom(room);
    maybeRunBot(room);
  }, 280);
}

io.on('connection', socket => {
  socket.on('createRoom', (payload = {}) => {
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();

    const mode = payload.mode === 'pvc' ? 'pvc' : 'pvp';
    const room = {
      code,
      mode,
      players: [newPlayer(socket.id, 'HUMAN')],
      phase: 'placement',
      turn: null,
      winner: null,
      status: 'Place ships and press Ready',
      lastEvent: 'Room created',
      botTimer: null
    };

    if (mode === 'pvc') {
      const bot = newPlayer(`BOT-${code}`, 'BOT');
      placeRandomShips(bot.board);
      room.players.push(bot);
      room.lastEvent = 'Computer joined. Place ships and press Ready.';
    }

    rooms.set(code, room);
    socket.join(code);
    socket.emit('roomCreated', { code, mode });
    emitRoom(room);
  });

  socket.on('joinRoom', codeRaw => {
    const code = (codeRaw || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return socket.emit('errorMsg', 'Room not found');
    if (room.mode !== 'pvp') return socket.emit('errorMsg', 'This room is single-player');
    if (room.players.length >= 2) return socket.emit('errorMsg', 'Room full');

    room.players.push(newPlayer(socket.id, 'HUMAN'));
    room.lastEvent = 'Opponent joined. Place ships and press Ready.';
    socket.join(code);
    socket.emit('roomJoined', { code, mode: room.mode });
    emitRoom(room);
  });

  socket.on('autoPlace', code => {
    const room = rooms.get(code); if (!room) return;
    const p = room.players.find(x => x.id === socket.id); if (!p || p.type !== 'HUMAN') return;
    p.board = emptyGrid();
    placeRandomShips(p.board);
    p.ready = false;
    room.lastEvent = 'Ships auto-placed.';
    emitRoom(room);
  });

  socket.on('ready', code => {
    const room = rooms.get(code); if (!room) return;
    const p = room.players.find(x => x.id === socket.id); if (!p || p.type !== 'HUMAN') return;

    const hasShips = p.board.flat().some(v => v > 0);
    if (!hasShips) return socket.emit('errorMsg', 'Place ships first (use Auto Place)');

    p.ready = true;
    room.lastEvent = 'You are ready.';

    if (room.players.length === 2 && room.players.every(x => x.ready)) {
      room.phase = 'battle';
      room.turn = room.players.find(x => x.type === 'HUMAN').id;
      room.status = 'Battle started';
      room.lastEvent = room.mode === 'pvc' ? 'Battle started vs Computer.' : 'Battle started.';
    }
    emitRoom(room);
    maybeRunBot(room);
  });

  socket.on('fire', ({ code, x, y }) => {
    const room = rooms.get(code); if (!room || room.phase !== 'battle' || room.winner) return;

    const me = room.players.find(p => p.id === socket.id);
    const opp = room.players.find(p => p.id !== socket.id);
    if (!me || !opp || me.type !== 'HUMAN') return;
    if (room.turn !== socket.id) return;
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;

    applyShot(room, me, opp, x, y);
    emitRoom(room);
    maybeRunBot(room);
  });

  socket.on('rematch', code => {
    const room = rooms.get(code); if (!room) return;
    room.phase = 'placement';
    room.turn = null;
    room.winner = null;
    room.status = 'Place ships and press Ready';
    room.lastEvent = 'Rematch started.';
    if (room.botTimer) clearTimeout(room.botTimer);

    for (const p of room.players) {
      p.ready = p.type === 'BOT';
      p.board = emptyGrid();
      p.shots = emptyGrid();
      p.ships = Object.fromEntries(SHIPS.map(s => [s.id, { name: s.name, len: s.len, hits: 0, sunk: false }]));
      p.botMemory = { targets: [] };
      if (p.type === 'BOT') placeRandomShips(p.board);
    }

    emitRoom(room);
  });

  socket.on('disconnect', () => {
    for (const [code, room] of rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx === -1) continue;

      room.players.splice(idx, 1);
      if (room.botTimer) clearTimeout(room.botTimer);

      if (room.players.length === 0 || (room.mode === 'pvp' && room.players.length < 2)) {
        rooms.delete(code);
      } else {
        room.phase = 'placement';
        room.turn = null;
        room.lastEvent = 'Player disconnected.';
        emitRoom(room);
      }
      break;
    }
  });
});

server.listen(process.env.PORT || 3000, () => console.log('battleships demo running'));
