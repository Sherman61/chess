// backup/socket.js

const activeUsers = {};
const invites = {}; // { username: [list of incoming usernames] }
const ongoingGames = {}; // { room: { moves: [...], players: [white, black], turn } }

module.exports = function (io, log) {
  io.on("connection", (socket) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      socket.disconnect();
      return;
    }

    activeUsers[username] = socket.id;
    log(`[CONNECT] ${username} (${socket.id}) connected`);

    socket.on("disconnect", () => {
      log(`[DISCONNECT] ${username}`);
      delete activeUsers[username];
    });

    socket.on("invitePlayer", (target) => {
      if (!invites[target]) invites[target] = [];
      if (!invites[target].includes(username)) {
        invites[target].push(username);
      }
      io.to(activeUsers[target]).emit("inviteReceived", username);
      log(`[INVITE] ${username} invited ${target}`);
    });

    socket.on("acceptInvite", (opponent) => {
      const players = [opponent, username].sort(); // always alphabetic for room ID
      const room = `${players[0]}-${players[1]}`;

      log(`[ROOM] ${username} and ${opponent} joined room ${room}`);
      socket.join(room);
      io.to(activeUsers[opponent]).emit("inviteAccepted", {
        room,
        opponentUsername: username,
        opponentDisplayName: username, // later extend with actual name
      });
      socket.emit("inviteAccepted", {
        room,
        opponentUsername: opponent,
        opponentDisplayName: opponent,
      });

      if (!ongoingGames[room]) {
        ongoingGames[room] = {
          moves: [],
          players,
          turn: "white"
        };
      }

      // clean up invites
      if (invites[username]) invites[username] = invites[username].filter(i => i !== opponent);
      if (invites[opponent]) invites[opponent] = invites[opponent].filter(i => i !== username);
    });

    socket.on("getActiveInvites", () => {
      socket.emit("activeInvites", {
        incoming: invites[username] || [],
        outgoing: Object.entries(invites)
          .filter(([_, list]) => list.includes(username))
          .map(([user]) => user)
      });
    });

    socket.on("move", (moveData, room) => {
      log(`[MOVE] ${username} sent move in ${room}: ${JSON.stringify(moveData)}`);
      if (ongoingGames[room]) {
        ongoingGames[room].moves.push(moveData);
        ongoingGames[room].lastUpdated = new Date();
      }
      socket.to(room).emit("move", moveData);
    });
  });
};
