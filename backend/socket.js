// backup/socket.js

const { generateRoomName } = require('./../js/gameUtils');
const db = require('./db'); // ✅ Database connection

// Track active connections and metadata
const activeUsers = {}; // Maps usernames to socket IDs
const invites = {};     // { username: [list of incoming usernames] }
const ongoingGames = {}; // { room: { moves: [...], players: [white, black], turn } }
const userDisplayNames = {}; // Maps usernames to display names (optional)

module.exports = function (io, log) {
  io.on("connection", (socket) => {
    const username = socket.handshake.auth.username;

    if (!username) {
      socket.disconnect();
      return;
    }

    socket.username = username; // Save to socket instance
    activeUsers[username] = socket.id;

    log(`[CONNECT] ${username} (${socket.id}) connected`);

    socket.on("disconnect", () => {
      log(`[DISCONNECT] ${username}`);
      delete activeUsers[username];
    });

    // Invite a player to a match
    socket.on("invitePlayer", (target) => {
      if (!invites[target]) invites[target] = [];
      if (!invites[target].includes(username)) {
        invites[target].push(username);
      }

      if (activeUsers[target]) {
        io.to(activeUsers[target]).emit("inviteReceived", username);
      }

      log(`[INVITE] ${username} invited ${target}`);
    });

    // Accept an invite and start the game
    socket.on("acceptInvite", async (opponent) => {
      const room = generateRoomName(socket.username, opponent);
      socket.join(room);

      const white = [socket.username, opponent].sort()[0];
      const black = [socket.username, opponent].sort()[1];

      // Notify both players
      if (activeUsers[opponent]) {
        io.to(activeUsers[opponent]).emit("inviteAccepted", {
          room,
          opponentUsername: socket.username,
          opponentDisplayName: userDisplayNames[socket.username] || socket.username
        });
      }

      socket.emit("inviteAccepted", {
        room,
        opponentUsername: opponent,
        opponentDisplayName: userDisplayNames[opponent] || opponent
      });

      // Track in memory
      if (!ongoingGames[room]) {
        ongoingGames[room] = {
          moves: [],
          players: [white, black],
          turn: "white"
        };
      }

      // Store in database
      try {
        await db.query(
          `INSERT INTO ongoing_games (room_name, white_player, black_player, move_history) VALUES (?, ?, ?, JSON_ARRAY())`,
          [room, white, black]
        );
        log(`[DB] New game added to DB: ${room}`);
      } catch (err) {
        console.error("[DB ERROR] Could not insert ongoing game:", err);
      }

      // Clean up invite lists
      if (invites[socket.username]) {
        invites[socket.username] = invites[socket.username].filter(i => i !== opponent);
      }
      if (invites[opponent]) {
        invites[opponent] = invites[opponent].filter(i => i !== socket.username);
      }
    });

    // Return current list of invites
    socket.on("getActiveInvites", () => {
      socket.emit("activeInvites", {
        incoming: invites[username] || [],
        outgoing: Object.entries(invites)
          .filter(([_, list]) => list.includes(username))
          .map(([user]) => user)
      });
    });

    // Handle move made by player
    socket.on("move", (moveData, room) => {
      log(`[MOVE] ${username} sent move in ${room}: ${JSON.stringify(moveData)}`);

      // Save move in memory
      if (ongoingGames[room]) {
        ongoingGames[room].moves.push(moveData);
        ongoingGames[room].lastUpdated = new Date();
      }

      // Forward move to other player
      socket.to(room).emit("move", moveData);
    });
  });
};
