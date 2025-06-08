// eventHandlers.js

let getSquare = function(x, y) {
  return boardSquares[y * 8 + x - 9];
};

let squareClicked = function(e) {
  let x = Number(this.getAttribute("data-x"));
  let y = Number(this.getAttribute("data-y"));
  let square = getSquare(x, y);
  console.log("Clicked square:", x, y);

  if (selectedSquare === null) {
    if (square.piece === null) {
      showError("There is no piece here!");
    } else if (square.piece.color != currentPlayer.color) {
      showError("This is not your piece!");
    } else {
      selectedSquare = getSquare(x, y);
      selectedSquare.select();
    }
  } else {
    if (selectedSquare.x == x && selectedSquare.y == y) {
      selectedSquare.deselect();
      selectedSquare = null;
    } else {
      if (square.piece != null && square.piece.color == currentPlayer.color) {
        selectedSquare.deselect();
        selectedSquare = getSquare(x, y);
        selectedSquare.select();
      } else {
        move(selectedSquare, square);
      }
    }
  }
};
window.squareClicked = squareClicked;
