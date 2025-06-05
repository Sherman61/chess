let socket;
let room = getRoomFromURL(); // ✅ Extract room from URL on load
let currentUser;
// let myPlayerColor = null;
// let multiplayerMode = false;
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
        if (!room) {
          room = roomName;
          window.history.replaceState({}, '', `?room=${encodeURIComponent(roomName)}`);
        }
      
        const [player1, player2] = roomName.split("-");
        const isWhite = currentUser === player1;
        myPlayerColor = isWhite ? "white" : "black";
        
        connectedOpponent = data.opponentDisplayName || data.opponentUsername || (isWhite ? player2 : player1);
      
        document.getElementById("status").innerText = `Connected to: ${connectedOpponent}`;
        document.getElementById("statusText").innerText = `Connected to: ${connectedOpponent}`;
        document.getElementById("inviteSection").style.display = "none";
      
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
  
    // Delay to ensure DOM is fully loaded before calling setup()
    setTimeout(() => {
    //   setup();
      console.log(`Multiplayer game started. You are ${color}.`);
      document.getElementById('turnInfo').innerHTML = `Your move (${color})`;
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
  