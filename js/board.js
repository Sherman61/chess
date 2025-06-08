function setup(flip = false) {
    const boardContainer = document.getElementById("board");
    boardContainer.innerHTML = ""; // Clear if already rendered
    boardSquares = [];
  
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 8; j++) {
        const row = flip ? 9 - i : i;
        const col = flip ? 9 - j : j;
  
        const squareElement = document.createElement("div");
        const color = (col + row) % 2 ? "dark" : "light";
        squareElement.setAttribute("data-x", col);
        squareElement.setAttribute("data-y", row);
        squareElement.addEventListener("click", squareClicked);
  
        const square = new SquareObject(col, row, color, false, squareElement, null);
        square.update();
        boardSquares.push(square);
        boardContainer.appendChild(squareElement);
      }
    }
  
    initializePieces();
  }
  window.setup = setup;
 function initializePieces() {
  white.king = new King(5, 8, "white");
  black.king = new King(5, 1, "black");
  pieces.push(white.king, black.king);

  const layout = [
    [Castle, Knight, Bishop, Queen, King, Bishop, Knight, Castle]
  ];

  for (let i = 0; i < 8; i++) {
    pieces.push(new layout[0][i](i + 1, 1, "black"));
    pieces.push(new Pawn(i + 1, 2, "black"));
    pieces.push(new Pawn(i + 1, 7, "white"));
    pieces.push(new layout[0][i](i + 1, 8, "white"));
  }

  for (let piece of pieces) {
    getSquare(piece.x, piece.y).setPiece(piece);
  }
}

window.initializePieces = initializePieces;

