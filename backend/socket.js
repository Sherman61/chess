// backup/socket.js

const { generateRoomName } = require('./../js/gameUtils');
const db = require('./db'); // ✅ Add this

const activeUsers = {};
const users = {}; // Maps usernames to socket IDs

const invites = {}; // { username: [list of incoming usernames] }
const ongoingGames = {}; // { room: { moves: [...], players: [white, black], turn } }
const userDisplayNames = {}; // Maps usernames to display names

module.exports = function (io, log) {
  io.on("connection", (socket) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      socket.disconnect();
      return;
    }
  
    socket.username = username; // ✅ this is critical
  
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


    socket.on("acceptInvite", async (opponent) => {
      const room = generateRoomName(socket.username, opponent); // unique room
      socket.join(room);
    
      const white = [socket.username, opponent].sort()[0];
      const black = [socket.username, opponent].sort()[1];
    
      // Notify both players
      io.to(users[opponent]).emit("inviteAccepted", {
        room,
        opponentUsername: socket.username,
        opponentDisplayName: userDisplayNames?.[socket.username] || socket.username
      });
    
      socket.emit("inviteAccepted", {
        room,
        opponentUsername: opponent,
        opponentDisplayName: userDisplayNames?.[opponent] || opponent
      });
    
      // ✅ Save game to memory (optional for fast access)
      if (!ongoingGames[room]) {
        ongoingGames[room] = {
          moves: [],
          players: [white, black],
          turn: "white"
        };
      }
    
      // ✅ Save to MySQL
      try {
        await db.query(
          `INSERT INTO ongoing_games (room_name, white_player, black_player, move_history) VALUES (?, ?, ?, JSON_ARRAY())`,
          [room, white, black]
        );
      } catch (err) {
        console.error("[DB ERROR] Could not insert ongoing game:", err);
      }
    
      // ✅ Clean up invites
      if (invites[socket.username]) {
        invites[socket.username] = invites[socket.username].filter(i => i !== opponent);
      }
      if (invites[opponent]) {
        invites[opponent] = invites[opponent].filter(i => i !== socket.username);
      }
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
