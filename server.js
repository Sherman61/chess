const io = require("socket.io")(3001, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

let users = {}; // username => socket.id
let activeInvites = {
  outgoing: {}, // username => [targets]
  incoming: {}, // username => [from users]
};
const fs = require("fs");
const LOG_FILE = __dirname + '/server.log';

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) return next(new Error("No username"));
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  users[socket.username] = socket.id;
  console.log(`[CONNECT] ${socket.username} connected (ID: ${socket.id})`);

  socket.on("invitePlayer", (target) => {
    console.log(`[INVITE] ${socket.username} invited ${target}`);
    log(`[INVITE] ${socket.username} invited ${target}`);
    const targetId = users[target];

    // Track outgoing & incoming
    activeInvites.outgoing[socket.username] =
      activeInvites.outgoing[socket.username] || [];
    activeInvites.outgoing[socket.username].push(target);

    activeInvites.incoming[target] = activeInvites.incoming[target] || [];
    activeInvites.incoming[target].push(socket.username);

    if (targetId) {
      io.to(targetId).emit("inviteReceived", socket.username);
    } else {
      log(`[INVITE FAIL] ${target} not online`);
    }
  });

  socket.on("acceptInvite", (opponent) => {
    const room = `${socket.username}-${opponent}`;
    socket.join(room);
    io.to(users[opponent]).emit("inviteAccepted", room);
    socket.emit("inviteAccepted", room);

    // Remove invite from lists
    activeInvites.outgoing[opponent] = (
      activeInvites.outgoing[opponent] || []
    ).filter((u) => u !== socket.username);
    activeInvites.incoming[socket.username] = (
      activeInvites.incoming[socket.username] || []
    ).filter((u) => u !== opponent);
  });

  socket.on("move", (moveData, room) => {
    console.log(`[MOVE] ${socket.username} moved in room ${room}`, moveData);
    socket.to(room).emit("move", moveData);
  });
  socket.on("getActiveInvites", () => {
    socket.emit("activeInvites", {
      outgoing: activeInvites.outgoing[socket.username] || [],
      incoming: activeInvites.incoming[socket.username] || [],
    });
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] ${socket.username} disconnected`);
    delete users[socket.username];
  });
});
