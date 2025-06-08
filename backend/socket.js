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

// Ask for info about the current game room
socket.on("getRoomInfo", (roomName, callback) => {
  const game = ongoingGames[roomName];

  if (!game || !game.players.includes(socket.username)) {
    return callback({ error: "Room not found or you're not in this game." });
  }

  const opponent = game.players.find(p => p !== socket.username);
  const displayName = userDisplayNames[opponent] || opponent;

  callback({
    opponentUsername: opponent,
    opponentDisplayName: displayName
  });
});socket.on("rejoinRoom", async (roomName) => {
  const user = socket.username;

  if (!roomName) return;

  // Try to fetch the game from memory
  let game = ongoingGames[roomName];

  if (!game) {
    // Try to rebuild from database
    try {
      const [rows] = await db.query("SELECT * FROM ongoing_games WHERE room_name = ?", [roomName]);
      if (rows.length === 0) {
        socket.emit("roomRejoinError", "Room not found");
        return;
      }

      const row = rows[0];
      game = {
        players: [row.white_player, row.black_player],
        moves: typeof row.move_history === 'string' && row.move_history.trim() ? JSON.parse(row.move_history) : [],


        turn: "white"
      }; 

      ongoingGames[roomName] = game;
    } catch (err) {
      console.error("[DB ERROR] rejoinRoom", err);
      socket.emit("roomRejoinError", "Database error");
      return;
    }
  }

  // Check if user is one of the players
  if (!game.players.includes(user)) {
    socket.emit("roomRejoinError", "You're not in this game.");
    return;
  }

  socket.join(roomName);
  const opponent = game.players.find(p => p !== user);

  socket.emit("roomInfo", {
    room: roomName,
    opponentUsername: opponent,
    opponentDisplayName: userDisplayNames[opponent] || opponent
  });

  console.log(`[REJOIN] ${user} rejoined room ${roomName}`);
});


    // Handle move made by player
    socket.on("move", async (moveData, room) => {
      log(`[MOVE] ${username} sent move in ${room}: ${JSON.stringify(moveData)}`);
    
      if (ongoingGames[room]) {
        ongoingGames[room].moves.push(moveData);
        ongoingGames[room].lastUpdated = new Date();
    
        try {
          await db.query(
            `UPDATE ongoing_games SET move_history = ? WHERE room_name = ?`,
            [JSON.stringify(ongoingGames[room].moves), room]
          );
        } catch (err) {
          console.error("[DB ERROR] Failed to update move_history:", err);
        }
      }
    
      socket.to(room).emit("move", moveData);
    });
    
  });
};
