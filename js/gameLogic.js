// // gameLogic.js


let move = function(start, end){
	let piece = start.piece;
    const fromX = start.x;
const fromY = start.y;
const toX = end.x;
const toY = end.y;
// console.log(`[DEBUG] moveResult.valid = ${moveResult.valid}`);
console.log(`[DEBUG] From: (${start.x}, ${start.y}), To: (${end.x}, ${end.y})`);
console.log(`[DEBUG] Piece:`, piece);
console.log(`[DEBUG] Current player:`, currentPlayer.color);
console.log(`[DEBUG] Piece color:`, piece.color);
console.log(`[DEBUG] Turn:`, turn);

currentPlayer.moved = piece;
	let moveResult = piece.isValidMove(end);
    console.log("[DEBUG] moveResult:", moveResult);
    // console.log("some error got triggerd");
    if(currentPlayer==white) {
        black.checked=false;
        black.king.checkedBy=null;
    }
    else {
        white.checked=false;
        white.king.checkedBy=null;
    }
	if(moveResult.valid)
    {
      
        capturedPiece = null;
        if(moveResult.capture !== null){
            moveResult.capture.piece.capture();
            capturedPiece = moveResult.capture.piece;
            moveResult.capture.unsetPiece();
        }
        piece.x = end.x;
        piece.y = end.y;
        end.setPiece(piece);
        start.unsetPiece();
        if(kingExposed(currentPlayer.king)){
            //if(!(piece instanceof King)){
                console.log("exposed");
                showError("That is an invalid move!");
                end.unsetPiece();
                piece.x = start.x;
                piece.y = start.y;
                start.setPiece(piece);
                if(moveResult.capture !== null){
                    capturedPiece.captured = false;
                    moveResult.capture.setPiece(capturedPiece);
                }
                return;
            //}
            //else console.log("not");
        }
        else console.log(currentPlayer.king.color + " not exposed");
        end.piece.lastmoved = turn;
        start.unsetPiece();
        start.deselect();
        selectedSquare = null;

       
        if(moveResult.promote==true){
            currentPlayer.promote=end.piece;
            showPromotion(currentPlayer);
            return;
            //console.log(end);
            /*end.unsetPiece();
            let newPiece = new Queen(end.x, end.y, currentPlayer.color);
            pieces.push(newPiece);
            end.setPiece(newPiece);
            showError("promoted!");*/
        }

      
          
        if(currentPlayer==white)
        {
            if(end.piece.isValidMove(getSquare(black.king.x, black.king.y),2).valid){
                showError("Check")
                black.checked=true;
                black.king.checkedBy = end.piece;
            }
            if(kingExposed(black.king)){
                black.checked=true;
                if(isCheckmate(black.king)){
                    showError("Checkmate");
                    return;
                }
                showError("Check")
                
            } 
            
        }
        else
        {
            if(end.piece.isValidMove(getSquare(white.king.x, white.king.y),2).valid){
                showError("Check")
                white.checked=true;
                white.king.checkedBy = end.piece;
            }
            if(kingExposed(white.king)){
                white.checked=true;
                if(isCheckmate(white.king)){
                    showError("Checkmate");
                    return;
                }
                showError("Check")
                
            }
            
        }
        nextTurn();
	}else{
		showError("That is an invalid move!");
        piece.x = start.x;
        piece.y = start.y;
        start.setPiece(start.piece);
	}
}

let isCheckmate = function(king){
    console.log("test");
    //let otherPlayer = currentPlayer==white?black:white;
    let myPlayer = currentPlayer;
    let otherPlayer = currentPlayer==white?black:white;
    currentPlayer=otherPlayer;
    if(currentPlayer.checked==false) {
        currentPlayer=myPlayer;
        return false;
    }
    console.log(currentPlayer)
    //check if there is any open squares next to the king
    for(let i=-1;i<2;i++){
        for(let j=-1;j<2;j++){
            if(king.x+i<=8&&king.x+i>=1){
                if(king.y+j<=8&&king.y+j>=1){
                    console.log(i,j);
                    if(i!=0||j!=0){
                        console.log(king.x+i,king.y+j);
                        //console.log(getSquare(king.x+i,king.y+j));
                        //console.log(getSquare(king.x+i,king.y+j).piece);
                        if(getSquare(king.x+i,king.y+j).piece!=null&&getSquare(king.x+i,king.y+j).piece.color==currentPlayer.color) {
                            console.log("full");
                            continue;
                        }
                        let square = getSquare(king.x+i,king.y+j);
                        if(king.isValidMove(square).valid&&!square.hasPiece()){
                            console.log("valid?");
                            //square.unsetPiece(king);
                            let oldsquare = getSquare(king.x, king.y);
                            oldsquare.unsetPiece(king);
                            square.setPiece(king);
                            let kingId = -1;
                            if(king.color=="white")
                                kingId = 0;
                            else kingId = 1;
                            pieces[kingId].x= king.x+i;
                            pieces[kingId].y= king.y+j;
                            if(!kingExposed(currentPlayer.king)){
                                console.log("open square at " + (king.x),(king.y))
                                square.unsetPiece(king);
                                oldsquare.setPiece(king);
                                pieces[kingId].x= oldsquare.x;
                                pieces[kingId].y= oldsquare.y;
                                currentPlayer=myPlayer;
                                return false;
                            }
                            else console.log(currentPlayer.king.color +" king exposed at " +(king.x+i)+(king.y+j));
                            square.unsetPiece(king);
                            oldsquare.setPiece(king);
                            pieces[kingId].x= oldsquare.x;
                            pieces[kingId].y= oldsquare.y;
                        }
                        else console.log("not valid at " + (king.x+i),(king.y+j)); 
                    }
                    else console.log("i==0,j==0");
                }
                else console.log("yy");
            }
            else console.log("xx");
        }
    }   
    console.log("fine");
    //check if you can kill the attacking piece
    for(let i=0;i<pieces.length;i++){
        if(currentPlayer.color== pieces[i].color){
            if(pieces[i].isValidMove(getSquare(king.checkedBy.x, king.checkedBy.y),2).valid){
                console.log(pieces[i]);
                console.log("can kill");
                console.log(king.checkedBy);
                currentPlayer=myPlayer;
                return false;
            }
        }
    }
    console.log("fine2");
    //check if you can block the attacking piece
    if(king.checkedBy.piece instanceof Knight) return true;
    for(let i=0;i<pieces.length;i++){
        if(pieces[i].captured==true) continue;
        if(currentPlayer.color==pieces[i].color){
            if(pieces[i] instanceof Pawn) {
                for(let dir=1;dir<=2;dir++){
                    let direction = currentPlayer.color == "white" ? -1 : 1;
                    let square = getSquare(pieces[i].x,pieces[i].y+direction*dir)
                    console.log(square);
                    if(pieces[i].isValidMove(square,2).valid){
                        console.log(pieces[i]);
                        console.log(" to " + pieces[i].x,pieces[i].y+direction*dir + " valid ");
                        console.log(getSquare(pieces[i].x,pieces[i].y+direction*dir));
                        square.setPiece(pieces[i]);
                    }
                    else continue;
                    console.log(pieces[i].x,pieces[i].y);
                    if(!kingExposed(currentPlayer.king)){
                        console.log("prevent checkmate with ");
                        console.log(pieces[i]);
                        square.unsetPiece(pieces[i]);
                        currentPlayer=myPlayer;
                        return false;
                    }
                    else console.log(currentPlayer.king.color + " king still exposed");
                    square.unsetPiece(pieces[i]);
                }
            }
            else if(pieces[i] instanceof Knight){
                for(let dir=1;dir<=2;dir++){
                    let square = getSquare(pieces[i].x+(3-dir),pieces[i].y+dir)
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                    square = getSquare(pieces[i].x+(3-dir),pieces[i].y-dir)
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                    square = getSquare(pieces[i].x-dir,pieces[i].y+(3-dir))
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                    square = getSquare(pieces[i].x-dir,pieces[i].y-(3-dir))
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                }
            }
            else if(pieces[i] instanceof Castle){
                for(let k=-8;k<=8;k++){
                    if(pieces[i].x+k>=1&&pieces[i].x+k<=8&&pieces[i].y+k>=1&&pieces[i].y+k<=8){
                        let square = getSquare(pieces[i].x+k,pieces[i].y);
                        if(pieces[i].isValidMove(square,2).valid){
                            square.setPiece(pieces[i]);
                            if(!kingExposed(currentPlayer.king)){
                                console.log("prevent checkmate with ");
                                console.log(pieces[i]);
                                currentPlayer=myPlayer;
                                square.unsetPiece(pieces[i]);
                                return false;
                            }
                            square.unsetPiece(pieces[i]);
                        }
                        square = getSquare(pieces[i].x,pieces[i].y+k);
                        if(pieces[i].isValidMove(square,2).valid){
                            square.setPiece(pieces[i]);
                            if(!kingExposed(currentPlayer.king)){
                                console.log("prevent checkmate with ");
                                console.log(pieces[i]);
                                currentPlayer=myPlayer;
                                square.unsetPiece(pieces[i]);
                                return false;
                            }
                            square.unsetPiece(pieces[i]);
                        }
                    }
                }
            }
            else if(pieces[i] instanceof Bishop){
                for(let k=-8;k<=8;k++){
                    let square = getSquare(pieces[i].x+k,pieces[i].y+k);
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                    square = getSquare(pieces[i].x+k,pieces[i].y-k);
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                }
            }
            else if(pieces[i] instanceof Queen){
                for(let k=-8;k<=8;k++){
                    let square = getSquare(pieces[i].x+k,pieces[i].y+k);
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                    square = getSquare(pieces[i].x+k,pieces[i].y-k);
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                }
                for(let k=-8;k<=8;k++){
                    let square = getSquare(pieces[i].x+k,pieces[i].y+k)
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                    square = getSquare(pieces[i].x+k,pieces[i].y-k)
                    if(square!=null&&pieces[i].isValidMove(square,2).valid){
                        square.setPiece(pieces[i]);
                        if(!kingExposed(currentPlayer.king)){
                            console.log("prevent checkmate with ");
                            console.log(pieces[i]);
                            currentPlayer=myPlayer;
                            square.unsetPiece(pieces[i]);
                            return false;
                        }
                        square.unsetPiece(pieces[i]);
                    }
                }       
            }
            else console.log(pieces[i]);
        }
    }
    console.log("fine3");
    console.log("---------");
    const algebraic = `${String.fromCharCode(96 + start.x)}${start.y}→${String.fromCharCode(96 + end.x)}${end.y}`;
logMove(algebraic); // this was added
    return true;
    

};



let showPromotion = function(player){
	document.getElementById("promotionMessage").className = "overlay show";
	document.getElementById("promotionList").className = player.color;
};

let closePromotion = function(){
	document.getElementById("promotionMessage").className = "overlay";
};

let promote = function(type){
	let newPiece;
	let oldPiece = currentPlayer.promote;
	//console.log(currentPlayer);
	let index = pieces.indexOf(oldPiece);
	switch(type){
		case "queen":
			newPiece = new Queen(oldPiece.x, oldPiece.y, oldPiece.color);
			break;
		case "castle":
			newPiece = new Castle(oldPiece.x, oldPiece.y, oldPiece.color);
			break;
		case "bishop":
			newPiece = new Bishop(oldPiece.x, oldPiece.y, oldPiece.color);
			break;
		case "knight":
			newPiece = new Knight(oldPiece.x, oldPiece.y, oldPiece.color);
			break;
	}
	if(index != -1){
        getSquare(oldPiece.x, oldPiece.y).unsetPiece();
		pieces[index] = newPiece;
		getSquare(oldPiece.x, oldPiece.y).setPiece(newPiece);
        //console.log(getSquare(oldPiece.x, oldPiece.y));
		currentPlayer.promote = null;
		closePromotion();
		if(currentPlayer==white)
        {
            /*if(isCheckmate(black.king)){
                showError("Checkmate");
                return;
            }*/
            if(newPiece.isValidMove(getSquare(black.king.x, black.king.y),2).valid){
                showError("Check")
                black.checked=true;
                white.king.checkedBy = newPiece;
            }
            if(kingExposed(black.king)){
                showError("Check")
                black.checked=true;
                black.king.checkedBy = newPiece;
            } 
        }
        else
        {
            /*if(isCheckmate(white.king)){
                showError("Checkmate");
                return;
            }*/
            if(newPiece.isValidMove(getSquare(white.king.x, white.king.y),2).valid){
                showError("Check")
                white.checked=true;
            }
            if(kingExposed(white.king)){
                showError("Check")
                white.checked=true;
            }
        }
        nextTurn();
	}
};

let kingExposed = function(at)
{
    for(let i=0;i<pieces.length;i++)
    {
        let square = getSquare(pieces[i].x, pieces[i].y);
        if(pieces[i].color != at.color && pieces[i].captured==false)
        {
            if(pieces[i] instanceof Pawn)
            {
                let direction = pieces[i].color == "white" ? -1 : 1;
                let movementY = (at.y-pieces[i].y);
                let movementX = (at.x-pieces[i].x);
                if(movementY == direction)
                {
                    if(Math.abs(movementX) == 1)
                    {
                        at.checkedBy = pieces[i];
                        return true;
                    }
                }
            }
            else
            {
                if(square.piece.isValidMove(getSquare(at.x, at.y)).valid){
                    at.checkedBy = pieces[i];
                    console.log(getSquare(at.x, at.y));
                    console.log(pieces[i]);
                    return true;
                }
            }
        }
    } 
    return false;
};

let nextTurn = function(){
    turn++;
	if(currentPlayer.color == "white"){
		currentPlayer = black;
        document.getElementById("turnInfo").innerHTML = "Player's turn: <b>Black</b>";
	}else{
		currentPlayer = white;
        document.getElementById("turnInfo").innerHTML = "Player's turn: <b>White</b>";
	}
}


