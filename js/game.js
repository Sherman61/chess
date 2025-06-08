//game.js
let socket;
let room = getRoomFromURL(); // ✅ Extract room from URL on load
let currentUser;

let connectedOpponent = null;

// Fetch session info from PHP
fetch('check_session.php')
  .then(res => res.json())
  .then(data => {
    if (!data.username) {
      alert("Not logged in. Redirecting to login.");
      window.location.href = "login.html";
      return;
    }

    currentUser = data.username;
    document.getElementById('status').innerText = `Logged in as: ${currentUser}`;

    // Connect to secure Socket.IO server
    socket = io("https://shiyaswebsite.com:3001", { 
      auth: { username: currentUser }
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected:", socket.id);
      tryRejoinRoom(); // 🔁 Now safe to call
      // ✅ Auto-start game if room is defined from URL
      if (room && room.includes("-")) {
        const [player1, player2] = room.split("-");
        const isWhite = currentUser === player1;
        startGame(isWhite ? "white" : "black");
        document.getElementById('statusText').innerText = `Connected to: ${connectedOpponent}`;

        document.getElementById('inviteSection').style.display = "none";
        document.getElementById('status').innerText = `Game started in room: ${room}`;
      }
    });

    socket.on("disconnect", () => {
        document.getElementById('statusText').innerText = "Disconnected";
    });

    // Receive invite
    socket.on("inviteReceived", from => {
      const accept = confirm(`${from} has invited you to a game. Accept?`);
      if (accept) {
        socket.emit("acceptInvite", from);
      }
    });

  // Room joined (invite accepted)
socket.on("inviteAccepted", data => {
  const roomName = typeof data === "string" ? data : data.room;

  // Update the room if not already set
  if (!room) {
    room = roomName;
    window.history.replaceState({}, '', `?room=${encodeURIComponent(roomName)}`);
  }

  const [player1, player2] = roomName.split("-");
  const isWhite = currentUser === player1;
  myPlayerColor = isWhite ? "white" : "black";

  // Determine opponent identity with proper fallbacks
  connectedOpponent = data?.opponentDisplayName || data?.opponentUsername || (isWhite ? player2 : player1);

  // UI updates
  const statusText = connectedOpponent ? `Connected to: ${connectedOpponent}` : "Connected";
  const statusEl = document.getElementById("status");
  const statusTextEl = document.getElementById("statusText");

  if (statusEl) statusEl.innerText = statusText;
  if (statusTextEl) statusTextEl.innerText = statusText;

  const inviteSection = document.getElementById("inviteSection");
  if (inviteSection) inviteSection.style.display = "none";

  // Start the game with color
  startGame(myPlayerColor);
});

      
      
      
      
      
    // Receive move
    socket.on("move", moveData => {
      console.log("[Move] Received:", moveData);
      applyMove(moveData);
    });
  });

// Send an invite to another player
window.sendInvite = function () {
    const target = document.getElementById('inviteUsername').value.trim();
    if (target && socket) {
      console.log(`[Invite] Sending invite to ${target}`);
      socket.emit("invitePlayer", target);
      alert(`Invite sent to ${target}`);
    } else {
      console.warn("[Invite] Failed: target or socket missing");
    }
  };
  
 
// Emit a move to opponent
function emitMove(moveData) {
    if (room && socket) {
      socket.emit("move", moveData, room);
      console.log("[Move] Sent:", moveData);
    }
  }
  

// Read room from URL
function getRoomFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

// Start the game with assigned color

 
  function startGame(color) {
    myPlayerColor = color;
    multiplayerMode = true;
  
    // Flip board if user is black
    setup(color === "black");
  
    setTimeout(() => {
      document.getElementById('turnInfo').innerHTML = `Your move (${color})`;
      console.log(`Multiplayer game started. You are ${color}.`);
    }, 50);
  }
  
  //game.js
// Apply opponent's move
// function applyMove(data) {
//   const fromSquare = getSquare(data.from[0], data.from[1]);
//   const toSquare = getSquare(data.to[0], data.to[1]);

//   selectedSquare = fromSquare;
//   move(fromSquare, toSquare); // Defined in scripts.js
// }
function applyMove(data) {
    handleMultiplayerMove(data); // now handled by a clean helper
  }
  