function showError(message) {
    const errorBox = document.getElementById("errorText");
    if (errorBox) errorBox.innerText = message;
    const overlay = document.getElementById("errorMessage");
    if (overlay) overlay.className = "overlay show";
  }
  
  function closeError() {
    const overlay = document.getElementById("errorMessage");
    if (overlay) overlay.className = "overlay";
  }
  
  let moveLog = [];
  
  function logMove(moveText) {
    const logContainer = document.getElementById("moveLog");
    if (!logContainer) return;
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
  
  window.showError = showError;
  window.closeError = closeError;
  window.logMove = logMove;
  