// multiplayer.js
function handleMultiplayerMove(data) {
    console.log("[Multiplayer] Handling move:", data);
    multiplayerMode = false;
  
    const fromSquare = getSquare(data.from[0], data.from[1]);
    const toSquare = getSquare(data.to[0], data.to[1]);
  
    selectedSquare = fromSquare;
  
    // Set currentPlayer to the opponent
    currentPlayer = myPlayerColor === "white" ? black : white;
  
    move(fromSquare, toSquare);
  
    multiplayerMode = true;
  }
  

  function logMove(moveText) {
    const logContainer = document.getElementById("moveLog");
    moveLog.push(moveText);
    logContainer.innerHTML = formatMoveLog();
}

function formatMoveLog() {
    let output = "";
    for (let i = 0; i < moveLog.length; i += 2) {
        const whiteMove = moveLog[i] || "";
        const blackMove = moveLog[i + 1] || "";
        const turn = Math.floor(i / 2) + 1;
        output += `${turn}. ${whiteMove} ${blackMove}<br>`;
    }
    return output;
} 

