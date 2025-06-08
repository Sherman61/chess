
// scripts.js
// Only used to bridge and initialize. No logic stays here.

window.addEventListener("DOMContentLoaded", () => {
    // Expose global functions to the rest of the app
    window.getSquare = getSquare;
    window.squareClicked = squareClicked;
    window.move = move;
    window.nextTurn = nextTurn;
    window.kingExposed = kingExposed;
    window.isCheckmate = isCheckmate;
    window.showError = showError;
    window.closeError = closeError;
    window.logMove = logMove;
    window.showPromotion = showPromotion;
    window.promote = promote;
  });
  