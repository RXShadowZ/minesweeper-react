import React from 'react';
import './css-reset.css';
import './ms-styles.css';
import {MinesweeperGameState, CELL_STATE, CELL_VALUE, GAME_STATE, DIFFICULTY} from './minesweeper-logic';

class Tile extends React.Component {
    render() {
        return (
            <button 
                className={this.props.tileClass} 
                onClick={this.props.onClick}
                onContextMenu={this.props.onClick}
                disabled={this.props.disabled}
            >
                <div className={this.props.innerTile}>
                    {this.props.value}
                </div>
            </button>
        );
    }
}

class Board extends React.Component {
    renderTile(row, col) {
        let cell = this.props.bombField[row][col];
        let value = "";
        let tileClass = "tile";
        let innerTile = "";
        let disabled = false;
        if(this.props.gameState !== GAME_STATE.PLAYING) {
            disabled = true;
        }
        if(cell.state === CELL_STATE.FLAGGED) {
            innerTile = "flag";
            tileClass += " covered";
        } else if(cell.state === CELL_STATE.EXPLODED) {
            tileClass += " exploded";
            innerTile = "bomb";
            disabled = true;
        } else if(cell.state === CELL_STATE.COVERED) {
            tileClass += " covered";
        } else { // cell.state === CELL_STATE.REVEALED
            tileClass += " revealed";
            disabled = true;
            innerTile = "number"
            value = cell.value;
            switch(cell.value) {
                case CELL_VALUE.EMPTY:
                    innerTile = "";
                    value = "";
                    break;
                case CELL_VALUE.BOMB:
                    innerTile = "bomb";
                    value = "";
                    break;
                case 1:
                    innerTile += " one";
                    break;
                case 2:
                    innerTile += " two";
                    break;
                case 3:
                    innerTile += " three";
                    break;
                case 4:
                    innerTile += " four";
                    break;
                case 5:
                    innerTile += " five";
                    break;
                case 6:
                    innerTile += " six";
                    break;
                case 7:
                    innerTile += " seven";
                    break;
                case 8:
                    innerTile += " eight";
                    break;
                default:
                    console.log();
            }
        }
        
        return (
            <Tile 
                tileClass={tileClass} 
                innerTile={innerTile} 
                value={value} 
                onClick={(e) => this.props.onClick(e, row, col)}
                disabled={disabled}
            />
        );
    }

    render() {
        const boardRows = [];
        for(let i = 0; i < this.props.rows; i++) {
            let row = [];
            for(let j = 0; j < this.props.cols; j++) {
                row.push(<div key={j} className="cell">{this.renderTile(i, j)}</div>);
            }
            boardRows.push(
                <div key={i} className="board-row">
                    {row}
                </div>
            );
        }

        return (
            <div className="board">
                {boardRows}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: MinesweeperGameState.safeConstructor(),
            rowInput: 9,
            colInput: 9,
            bombInput: 10,
            difficulty: DIFFICULTY.BEGINNER,
            sidePanelOpen: false,
        }
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.handleDifficultyButton = this.handleDifficultyButton.bind(this);
        this.handleNewGameButton = this.handleNewGameButton.bind(this);
        this.toggleSidePanel = this.toggleSidePanel.bind(this);
    }

    handleSliderChange(event) {
        let slider = event.target
        if(slider.id === "rowInput") {
            this.setState({
                rowInput: slider.value,
            });
        } else if(slider.id === "colInput") {
            this.setState({
                colInput: slider.value,
            });
        } else if(slider.id === "bombInput") {
            this.setState({
                bombInput: slider.value,
            });
        } else {
            console.log("Unintended event!");
        }
        this.setState({
            difficulty: DIFFICULTY.CUSTOM,
        });
    }

    handleDifficultyButton(event) {
        let difficulty = event.target.value;
        if(difficulty === DIFFICULTY.BEGINNER) {
            this.setState({
                rowInput: 9,
                colInput: 9,
                bombInput: 10,
                difficulty: DIFFICULTY.BEGINNER,
            });
        } else if(difficulty === DIFFICULTY.INTERMEDIATE) {
            this.setState({
                rowInput: 16,
                colInput: 16,
                bombInput: 40,
                difficulty: DIFFICULTY.INTERMEDIATE,
            });
        } else if(difficulty === DIFFICULTY.EXPERT) {
            this.setState({
                rowInput: 16,
                colInput: 30,
                bombInput: 99,
                difficulty: DIFFICULTY.EXPERT,
            });
        } else {
            console.log("Unintended event for difficulty selector!");
        }
    }

    handleNewGameButton(event) {
        let confirmation = true;
        if(this.state.gameState.gameState === GAME_STATE.PLAYING) {
            confirmation = window.confirm("Currently playing a game! Are you sure you want to create a new game?");
        }
        if(confirmation) {
            let newGameState = MinesweeperGameState.safeConstructor(this.state.difficulty, this.state.rowInput, this.state.colInput, this.state.bombInput);
            if(newGameState === -1) {
                console.log("Invalid input for either rows, columns, or bombs!");
                return;
            } else if (newGameState === 0) {
                console.log("Invalid difficulty input!");
                return;
            } else { // Valid newGameState created
                this.setState({
                    gameState: newGameState,
                });
            }
        }
    }

    handleBoardClick(e, r, c) {
        e.preventDefault();
        let gameState = this.state.gameState;
        if(gameState.gameState !== GAME_STATE.PLAYING) {
            return;
        }
        let newGameState;
        if(e.type === 'click')
            newGameState = MinesweeperGameState.sweep(gameState, r, c);
        else // (e.type === 'contextmenu')
            newGameState = MinesweeperGameState.flag(gameState, r, c);
            
        if(newGameState === 0) {
            console.log("Invalid input!");
            return;
        }
        if(newGameState === -1) {
            console.log("Invalid move!");
            return;
        }
        this.setState({
            gameState: newGameState,
        });
    }

    toggleSidePanel() {
        this.setState({
            sidePanelOpen: !this.state.sidePanelOpen,
        })
    }

    render() {
        let sidePanelStyle = {
            width: "0px",
            padding: "0px",
        };
        let sidePanelButtonText = "<";
        let sidePanelButtonRightPos = "0px";
        if(this.state.sidePanelOpen) {
            sidePanelStyle = {
                width: "225px",
                padding: "10px",
            };
            sidePanelButtonText = ">";
            sidePanelButtonRightPos = "225px";
        }
        return (
            <div className="game">
                <div>{this.state.gameState.gameState}</div>
                <Board 
                    rows={this.state.gameState.rows} 
                    cols={this.state.gameState.cols}
                    bombField={this.state.gameState.bombField}
                    gameState={this.state.gameState.gameState}
                    onClick={(e, r, c) => this.handleBoardClick(e, r, c)}
                />
                <button 
                    className="sidePanelToggle" 
                    onClick={this.toggleSidePanel}
                    style={{right: sidePanelButtonRightPos}}
                >
                    {sidePanelButtonText}
                </button>
                <div className="sidePanel" style={sidePanelStyle}>
                    <div>Set Difficulty: {this.state.difficulty}</div>
                    <button 
                        onClick={this.handleDifficultyButton}
                        value={DIFFICULTY.BEGINNER}
                    >
                            {DIFFICULTY.BEGINNER}
                    </button>
                    <button 
                        onClick={this.handleDifficultyButton}
                        value={DIFFICULTY.INTERMEDIATE}
                    >
                        {DIFFICULTY.INTERMEDIATE}
                    </button>
                    <button 
                        onClick={this.handleDifficultyButton}
                        value={DIFFICULTY.EXPERT}
                    >
                        {DIFFICULTY.EXPERT}
                    </button>
                    <div>Rows: {this.state.rowInput}</div>
                    <input 
                        type="range" 
                        min="5" 
                        max="30" 
                        id="rowInput"
                        value={this.state.rowInput} 
                        onChange={this.handleSliderChange}
                    />
                    <div>Columns: {this.state.colInput}</div>
                    <input 
                        type="range" 
                        min="5"
                        max="30" 
                        id="colInput"
                        value={this.state.colInput}
                        onChange={this.handleSliderChange}
                    />
                    <div>Bombs: {this.state.bombInput}</div>
                    <input 
                        type="range" 
                        min="5" 
                        max="100" 
                        id="bombInput"
                        value={this.state.bombInput} 
                        onChange={this.handleSliderChange}
                    />
                    <button onClick={this.handleNewGameButton}>
                        Create New Game
                    </button>
                </div>
            </div>
        );
    }
}

export default Game;