const board = document.querySelector("canvas.board");
const size = 300;
let gameover = false;
let time = document.getElementById("time");

class Piece {
    constructor(number, position, game) {
        this.number = number;
        this.position = position;
        this.game = game;
        this.pieceSize = size/Math.sqrt(game.size);
        this.fontSize = this.pieceSize - 5;

        this.draw();
    }

    draw() {
        let ctx = board.getContext("2d");
        ctx.beginPath();
        ctx.rect(this.position.x, this.position.y, this.pieceSize, this.pieceSize);
        ctx.fillStyle = "burlywood";
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fill();
        ctx.font = this.fontSize + "px mono";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.number, this.position.x + this.pieceSize/2, this.position.y+this.fontSize*0.9);
    }

    move(direction) {
        let thispiece = this;

        let target_position = {
            x: (thispiece.position.col+(direction==1?1:direction==3?-1:0))*thispiece.pieceSize,
            y: (thispiece.position.row+(direction==0?-1:direction==2?1:0))*thispiece.pieceSize
        }

        let interval = setInterval(function () {
            if (
                thispiece.position.x != target_position.x || 
                thispiece.position.y != target_position.y
                ) {
                let previous_position = {
                    x: thispiece.position.x,
                    y: thispiece.position.y
                }
                if (direction == 0) thispiece.position.y-=2;
                else if (direction == 1) thispiece.position.x+=2;
                else if (direction == 2) thispiece.position.y+=2;
                else thispiece.position.x-=2;

                let ctx = board.getContext("2d");
                ctx.clearRect(previous_position.x, previous_position.y, thispiece.pieceSize, thispiece.pieceSize);
                thispiece.draw();
            } else {
                if(direction == 0) thispiece.position.row--;
                else if(direction == 1) thispiece.position.col++;
                else if (direction == 2) thispiece.position.row++;
                else thispiece.position.col--;

                if (direction == 0) thispiece.position.y = thispiece.pieceSize*thispiece.position.row;
                else if (direction == 1) thispiece.position.x = thispiece.pieceSize*thispiece.position.col;
                else if (direction == 2) thispiece.position.y = thispiece.pieceSize*thispiece.position.row;
                else thispiece.position.x = thispiece.pieceSize*thispiece.position.col;

                clearInterval(interval);
                thispiece.draw();
                thispiece.game.checkWin()
            }
        }, 1);
    }
}

class Position {
    constructor(row, col, pieceSize) {
        this.row = row;
        this.col = col;
        this.x = this.col*pieceSize;
        this.y = this.row*pieceSize;
    }
}

class Game {
    constructor(x) {
        this.time = 0;
        this.pieces = [];
        this.size = x*x;
        this.empty_field = new Position(x-1, x-1, size/x);
        let index = 0;
        for (let i = 0; i < x; i++) {
            
            for (let j = 0; j < x; j++) {
                if (!(i == x-1 && j == x-1)) this.pieces.push(new Piece(index + 1, new Position(i, j, size/x), this));
                index++;
            }
        }
        this.randomize();
        this.pieces.forEach(p => {
            p.draw();
        });
    }

    getPiece(row, col) {
        let piece = null;
        this.pieces.forEach(p => {
            if (p.position.row == row && p.position.col == col) piece = p;
        });

        return piece;
    }

    movePieces(x, y) {
        let piece = this.pieces.find(p=> x > p.position.x && x < p.position.x+p.pieceSize && y > p.position.y && y < p.position.y+p.pieceSize)
        if (piece) {
            if (piece.position.row == this.empty_field.row || piece.position.col == this.empty_field.col) {
                let piece_array = [];
                let direction = 0;
                if (piece.position.row == this.empty_field.row) {
                    if (piece.position.col > this.empty_field.col) {
                        for (let i = piece.position.col; i > this.empty_field.col; i--) {
                            piece_array.push(this.getPiece(piece.position.row, i));
                        }
                        direction = 3;
                    } else if (piece.position.col < this.empty_field.col) {
                        for (let i = piece.position.col; i < this.empty_field.col; i++) {
                            piece_array.push(this.getPiece(piece.position.row, i));
                        }
                        direction = 1;
                    }
                }
                else if (piece.position.col == this.empty_field.col) {
                    if (piece.position.row > this.empty_field.row) {
                        for (let i = piece.position.row; i > this.empty_field.row; i--) {
                            piece_array.push(this.getPiece(i, piece.position.col));
                        }
                        direction = 0;
                    } else if (piece.position.row < this.empty_field.row) {
                        for (let i = piece.position.row; i < this.empty_field.row; i++) {
                            piece_array.push(this.getPiece(i, piece.position.col));
                        }
                        direction = 2;
                    }
                }

                piece_array.forEach(pa => {
                    pa.move(direction);
                });
                this.empty_field = new Position(piece.position.row, piece.position.col, piece.pieceSize);
                this.checkWin();
            }
        }
    }

    checkWin() {
        let side_length = Math.sqrt(this.size)

        let win_numbers = []
        let current_numbers = []
        for(let i = 1; i<this.size; i++){
            win_numbers.push(i)
            current_numbers.push(0)
        }


        this.pieces.forEach((piece)=>{
            let idx = piece.position.col + (piece.position.row * side_length)
            current_numbers[idx] = piece.number
        })

        let go = true
        for(let i = 0; i < win_numbers.length; i++){
            if(win_numbers[i] != current_numbers[i]){
                go = false
                break
            }
        }
        if (go) {
            board.className = "over";
            gameover = true;
        }
    }

    solve(){
        let side_length =this.size**.5
        this.pieces = this.pieces.map((piece, i)=>{
            piece.position.col = i%side_length
            piece.position.row = Math.floor(i/side_length)
            piece.position.x = piece.pieceSize*piece.position.row
            piece.position.y = piece.pieceSize*piece.position.col
            return piece
        })
        drawBoard()
        this.pieces.forEach(piece=>piece.draw())
        this.checkWin()
    }

    randomize() {
        let positions = [];
        this.pieces.forEach(piece => {
            positions.push(piece.position);
        });
        for (let i = 0; i < positions.length; i++) {
            let rand = Math.floor(Math.random()*this.pieces.length);
            let tempi = positions[i];
            let tempj = positions[rand];
            positions[i] = tempj;
            positions[rand] = tempi;
        }
        this.pieces.forEach((piece,i) => {
            piece.position = positions[i];
        });
    }
}

let game = null;
let factor = document.getElementById("size");
let timer;

function startGame() {
    game = null;
    clearInterval(timer);
    gameover = false;
    drawBoard();
    board.className = "";
    time.className = "";
    game = new Game(factor.value);
    startInterval();
}

function startInterval() {
    timer = setInterval(function () {
        if (!gameover) {
            game.time++;
            let seconds = (game.time % 60);
            let minutes = Math.floor(game.time/60);
            time.innerHTML = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        } else {
            clearInterval(timer);
            time.className = "finaltime";
        }
    }, 1000);
}

function drawBoard() {
    let ctx = board.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "brown";
    ctx.rect(0, 0, size, size);
    ctx.fill();
}

board.addEventListener("click", function (e) {
    let rect = board.getBoundingClientRect();
    if (!gameover) game.movePieces(e.clientX - rect.left, e.clientY - rect.top);
});


startGame();