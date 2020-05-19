
export const CELL_VALUE = Object.freeze({
    BOMB: "bomb",
    EMPTY: "empty",
});

export const CELL_STATE = Object.freeze({
    COVERED: "covered", 
    FLAGGED: "flagged", 
    REVEALED: "revealed", 
    EXPLODED: "exploded",
});

export const GAME_STATE = Object.freeze({
    PLAYING: "playing", 
    LOSS: "loss", 
    WIN: "win",
});

export const DIFFICULTY = Object.freeze({
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    EXPERT: "Expert",
    CUSTOM: "Custom",
})

class Cell {
    constructor(value=CELL_VALUE.EMPTY, state=CELL_STATE.COVERED) {
        this.value = value; // Value should be a value of CELL_VALUE or a number 1-8
        this.state = state; // State should be a value of CELL_STATE
    }
}
export class MinesweeperGameState {
    constructor(rows=9, cols=9, bombCount=10, isCopy=false) {
        this.rows = rows;
        this.cols = cols;
        this.bombCount = bombCount;
        this.gameState = GAME_STATE.PLAYING; 
        this.bombField = [];
        this.bombs = [];
        for(let i = 0; i < rows; i++) {
            let row = [];
            for(let j = 0; j < cols; j++) {
                row.push(new Cell());
            }
            this.bombField.push(row);
        }
        if(!isCopy) {
            while(this.bombs.length < this.bombCount) {
                let i = Math.floor(Math.random() * this.rows);
                let j = Math.floor(Math.random() * this.cols);
                if(this.bombField[i][j].value !== CELL_VALUE.BOMB) {
                    this.bombField[i][j].value = CELL_VALUE.BOMB;
                    this.bombs.push([i, j]);
                    let adjacentCells = this.getAdjacentCells(i, j);
                    adjacentCells.forEach(elem => {
                        let cell = this.bombField[elem[0]][elem[1]];
                        if(cell.value === CELL_VALUE.EMPTY) {
                            cell.value = 1;
                        } else if (cell.value !== CELL_VALUE.BOMB) { // value is a number
                            cell.value++;
                        }
                    });
                }
            }
        }
    }

    validRow(row) {
        return row >= 0 && row < this.rows;
    }

    validCol(col) {
        return col >= 0 && col < this.cols;
    }

    getAdjacentCells(row, col) {
        if(!this.validRow(row) || !this.validCol(col)) {
            return -1;
        }
        let adjacentCells = [];
        let row1 = row - 1;
        let row2 = row + 1;
        let col1 = col - 1;
        let col2 = col + 1;
        if(this.validRow(row1)) {
            if(this.validCol(col1)) {
                adjacentCells.push([row1, col1]); // Top Left
            }
            if(this.validCol(col2)) {
                adjacentCells.push([row1, col2]); // Top Right
            }
            adjacentCells.push([row1, col]); // Top Middle
        }
        if(this.validRow(row2)) {
            if(this.validCol(col1)) {
                adjacentCells.push([row2, col1]); // Bottom Left
            }
            if(this.validCol(col2)) {
                adjacentCells.push([row2, col2]); // Bottom Right
            }
            adjacentCells.push([row2, col]); // Bottom Middle
        }
        if(this.validCol(col1)) {
            adjacentCells.push([row, col1]); // Middle Left
        }
        if(this.validCol(col2)) {
            adjacentCells.push([row, col2]); // Middle Right
        }

        return adjacentCells;
    }
    
    checkForWin() {
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                let cell = this.bombField[i][j];
                if(cell.value !== CELL_VALUE.BOMB && cell.state !== CELL_STATE.REVEALED) {
                    return false;
                }
            }
        }
        return true;
    }

    copy() {
        let copy = new MinesweeperGameState(this.rows, this.cols, this.bombCount, true);
        copy.gameState = this.gameState;
        copy.bombs = [];
        for(let i = 0; i < this.bombs.length; i++) {
            copy.bombs.push([...this.bombs[i]]);
        }
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                copy.bombField[i][j].value = this.bombField[i][j].value;
                copy.bombField[i][j].state = this.bombField[i][j].state;
            }
        }
        return copy;
    }

    static safeConstructor(difficulty=DIFFICULTY.BEGINNER, row=9, col=9, bombCount=10) {
        if(difficulty === DIFFICULTY.BEGINNER) {
            row = 9;
            col = 9;
            bombCount = 10;
        } else if(difficulty === DIFFICULTY.INTERMEDIATE) {
            row = 16;
            col = 16;
            bombCount = 40;
        } else if(difficulty === DIFFICULTY.EXPERT) {
            row = 16;
            col = 30;
            bombCount = 99;
        } else if(difficulty === DIFFICULTY.CUSTOM) {
            if(row <= 0 || col <= 0 || bombCount <= 0 || (row * col) <= bombCount) {
                return -1;
            }
        } else {
            return 0;
        }

        return new MinesweeperGameState(row, col, bombCount);
    }

    static validInput(gameState, row, col) {
        return gameState instanceof MinesweeperGameState && gameState.validRow(row) && gameState.validCol(col);
    }

    static sweep(gameState, row, col) {
        if(!this.validInput(gameState, row, col)) {
            return 0;
        }
        if(gameState.gameState !== GAME_STATE.PLAYING || 
            gameState.bombField[row][col].state === CELL_STATE.REVEALED || 
            gameState.bombField[row][col].state === CELL_STATE.FLAGGED) {
            return -1;
        }
        let newGameState = gameState.copy();
        let cell = newGameState.bombField[row][col];
        if(cell.value === CELL_VALUE.BOMB) {
            cell.state = CELL_STATE.EXPLODED;
            newGameState.gameState = GAME_STATE.LOSS;
            // Reveal Bomb
            let bombs = newGameState.bombs;
            bombs.forEach(elem => {
                let bomb = newGameState.bombField[elem[0]][elem[1]];
                if(bomb.state === CELL_STATE.COVERED) {
                    bomb.state = CELL_STATE.REVEALED;
                }
            });
        } else {
            cell.state = CELL_STATE.REVEALED;
            if(cell.value === CELL_VALUE.EMPTY) {
                // Recursive sweep
                let cellsToCheck1 = newGameState.getAdjacentCells(row, col);
                for(let i = 0; i < cellsToCheck1.length; i++) {
                    let r1 = cellsToCheck1[i][0];
                    let c1 = cellsToCheck1[i][1];
                    let checkCell = newGameState.bombField[r1][c1];
                    if(checkCell.value !== CELL_VALUE.BOMB) {
                        checkCell.state = CELL_STATE.REVEALED;
                        if(checkCell.value === CELL_VALUE.EMPTY) {
                            let cellsToCheck2 = newGameState.getAdjacentCells(r1, c1);
                            for(let j = 0; j < cellsToCheck2.length; j++) {
                                let r2 = cellsToCheck2[j][0];
                                let c2 = cellsToCheck2[j][1];
                                let checkCell2 = newGameState.bombField[r2][c2];
                                if(checkCell2.state === CELL_STATE.REVEALED || 
                                    checkCell2.state === CELL_STATE.FLAGGED || 
                                    checkCell2.value === CELL_VALUE.BOMB) {
                                    cellsToCheck2.splice(j, 1);
                                    j--;
                                } else {
                                    cellsToCheck1.push([r2, c2]);
                                }
                            }
                        }
                    }
                }
            }
            if(newGameState.checkForWin()) {
                newGameState.gameState = GAME_STATE.WIN;
            }
        }

        return newGameState;
    }

    static flag(gameState, row, col) {
        if(!this.validInput(gameState, row, col)) {
            return 0;
        }
        if(gameState.gameState !== GAME_STATE.PLAYING || 
            gameState.bombField[row][col].state === CELL_STATE.REVEALED) {
            return -1;
        }
        let newGameState = gameState.copy();

        let cell = newGameState.bombField[row][col];
        if(cell.state === CELL_STATE.COVERED) {
            cell.state = CELL_STATE.FLAGGED;
        } else if(cell.state === CELL_STATE.FLAGGED) {
            cell.state = CELL_STATE.COVERED;
        }

        return newGameState;
    }
}

export default {MinesweeperGameState, CELL_STATE, CELL_VALUE, GAME_STATE, DIFFICULTY};