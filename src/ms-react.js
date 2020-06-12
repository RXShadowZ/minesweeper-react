import React from 'react';

import flag_toggle from './images/flag_toggle.png';
import sweep_toggle from './images/sweep_toggle.png';

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

const SIDEBAR_PANEL = Object.freeze({
    DEVELOPMENT: "Development",
    HOW_TO_PLAY: "How to Play",
    NEW_GAME_SETTINGS: "New Game Settings",
});

const CLICK_STATE = Object.freeze({
    SWEEP: "sweep",
    FLAG: "flag",
});

const EMOJI_STATE = Object.freeze({
    NEUTRAL: "neutral",
    OPEN_MOUTH: "open mouth",
    SCREAM: "scream",
    SMILE: "smile",
    SMILE_SUNGLASSES: "smile with sunglasses",
});

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: MinesweeperGameState.safeConstructor(),
            rowInput: 9,
            colInput: 9,
            bombInput: 10,
            difficulty: DIFFICULTY.BEGINNER,
            sidebarOpen: false,
            sidebarPanel: SIDEBAR_PANEL.HOW_TO_PLAY,
            timer: 0,
            activeTimer: false,
            timerFunc: null,
            flagCounter: 10,
            clickState: CLICK_STATE.SWEEP,
            emojiState: EMOJI_STATE.NEUTRAL,
        }
        this.handleSliderChange = this.handleSliderChange.bind(this);
        this.handleDifficultyButton = this.handleDifficultyButton.bind(this);
        this.handleNewGameButton = this.handleNewGameButton.bind(this);
        this.handleEmojiButton = this.handleEmojiButton.bind(this);
        this.handleSidebarPanelSwitch = this.handleSidebarPanelSwitch.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.toggleClickState = this.toggleClickState.bind(this);
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
                alert("Could not create new game! Number of bombs exceeds number of possible spaces! Lower bomb count or increase the number of rows/columns.");
                return;
            } else if (newGameState === 0) {
                console.log("Invalid difficulty input!");
                return;
            } else { // Valid newGameState created
                clearInterval(this.state.timerFunc);
                this.setState({
                    gameState: newGameState,
                    timer: 0,
                    activeTimer: false,
                    timerFunc: null,
                    flagCounter: this.state.bombInput,
                    emojiState: EMOJI_STATE.NEUTRAL,
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
        let newEmojiState = EMOJI_STATE.SMILE;
        if(e.type === 'click' && this.state.clickState === CLICK_STATE.SWEEP) {
            newGameState = MinesweeperGameState.sweep(gameState, r, c);
            if(!this.state.activeTimer 
                && newGameState.gameState === GAME_STATE.PLAYING) {
                this.setState({
                    activeTimer: true,
                    timerFunc: setInterval(() => this.tick(), 1000),
                    flagCounter: this.state.gameState.bombCount,
                })
            }
        } else { // (e.type === 'contextmenu')
            newEmojiState = EMOJI_STATE.NEUTRAL;
            let flagCounter = this.state.flagCounter;
            if(gameState.bombField[r][c].state === CELL_STATE.COVERED) {
                if(this.state.flagCounter === 0) {
                    return;
                }
                flagCounter--;
            } else {
                flagCounter++;
            }
            newGameState = MinesweeperGameState.flag(gameState, r, c);
            this.setState({
                flagCounter: flagCounter,
            });
        }    
        if(newGameState === 0) {
            console.log("Invalid input!");
            return;
        }
        if(newGameState === -1) {
            console.log("Invalid move!");
            return;
        }
        if(newGameState.gameState === GAME_STATE.WIN) {
            newEmojiState = EMOJI_STATE.SMILE_SUNGLASSES;
        } else if(newGameState.gameState === GAME_STATE.LOSS) {
            newEmojiState = EMOJI_STATE.SCREAM;
        }
        this.setState({
            gameState: newGameState,
            emojiState: newEmojiState,
        });

        if(newGameState.gameState !== GAME_STATE.PLAYING) {
            clearInterval(this.state.timerFunc);
            this.setState({
                activeTimer: false,
                timerFunc: null,
            })
        }
    }

    handleSidebarPanelSwitch(event) {
        if(event.target.value === this.state.sidebarPanel) {
            return;
        }
        this.setState({
            sidebarPanel: event.target.value
        });
    }

    handleEmojiButton() {
        this.toggleSidebar();
        this.setState({
            sidebarPanel: SIDEBAR_PANEL.NEW_GAME_SETTINGS,
        });
        if(this.state.gameState.gameState === GAME_STATE.PLAYING) {
            this.setState({
                emojiState: EMOJI_STATE.OPEN_MOUTH,
            });
        }
    }

    toggleSidebar() {
        this.setState({
            sidebarOpen: !this.state.sidebarOpen,
        })
    }

    toggleClickState() {
        let newClickState;
        if(this.state.clickState === CLICK_STATE.SWEEP) {
            newClickState = CLICK_STATE.FLAG;
        } else {
            newClickState = CLICK_STATE.SWEEP;
        }
        this.setState({
            clickState: newClickState,
        });
    }

    tick() {
        this.setState({
            timer: this.state.timer + 1,
        });
    }

    renderSidebar() { 
        let sidebarStyle = {
            transform: "translateX(295px)",
        };
        if(this.state.sidebarOpen) {
            sidebarStyle = {
                transform: "translateX(0px)",
            };
        }

        let toggleText = "<<";
        if(this.state.sidebarOpen) {
            toggleText = ">>";
        }

        let sidebarPanel = this.renderHowToPlayPanel();
        let settingsStyle = "";
        let howToPlayStyle = "";
        let devStyle = "";
        switch(this.state.sidebarPanel) {
            case SIDEBAR_PANEL.NEW_GAME_SETTINGS:
                settingsStyle = "selected";
                sidebarPanel = this.renderSettingsPanel();
                break;
            case SIDEBAR_PANEL.DEVELOPMENT:
                devStyle = "selected";
                sidebarPanel = this.renderDevPanel();
                break;
            default: // SIDEBAR_PANEL.HOW_TO_PLAY
                howToPlayStyle = "selected";
                break;
        }

        return (
            <div className="sidebar" style={sidebarStyle}>
                <button 
                    className="sidebar-toggle"
                    onClick={this.toggleSidebar}
                >
                    {toggleText}
                </button>
                <div className="sidebar-nav">
                    <button 
                        className={howToPlayStyle}
                        onClick={this.handleSidebarPanelSwitch}
                        value={SIDEBAR_PANEL.HOW_TO_PLAY}
                    >
                        {SIDEBAR_PANEL.HOW_TO_PLAY}
                    </button>
                    <button 
                        className={settingsStyle}
                        onClick={this.handleSidebarPanelSwitch}
                        value={SIDEBAR_PANEL.NEW_GAME_SETTINGS}
                    >
                        {SIDEBAR_PANEL.NEW_GAME_SETTINGS}
                    </button>
                    <button
                        className={devStyle}
                        onClick={this.handleSidebarPanelSwitch}
                        value={SIDEBAR_PANEL.DEVELOPMENT}
                    >
                        {SIDEBAR_PANEL.DEVELOPMENT}
                    </button>
                </div>
                {sidebarPanel}
            </div>
        );
    }

    renderHowToPlayPanel() {
        return (
            <div className="sidebar-panel">
                <h1>Minesweeper</h1>
                <h2>Quickstart</h2>
                <p>
                    If you are familiar with how to play Minesweeper already, view these instructions to quickly start playing.
                    Otherwise, please read the <strong>how to play</strong> below.
                </p>
                <h3>For mouse users:</h3>
                <p>
                    <strong>Left Click</strong> to <strong>sweep</strong> the field.
                    <strong>Right Click</strong> to place a <strong>flag</strong>.
                </p>
                <h3>For touchscreen users:</h3>
                <img src={sweep_toggle} alt="toggle button in sweep mode" style={{"margin-top": "5px"}} />
                <p>
                    <strong>Tap</strong> to <strong>sweep</strong>.
                </p>
                <img src={flag_toggle} alt="toggle button in flag mode" style={{"margin-top": "5px"}} />
                <p>
                    <strong>Tap</strong> to place a <strong>flag</strong>.
                </p>
                <h2>How to Play</h2>
                <a href="https://en.wikipedia.org/wiki/Minesweeper_(video_game)#Gameplay">
                    Placeholder link for how to play
                </a>
            </div>
        );
    }

    renderDevPanel() {
        return (
            <div className="sidebar-panel">
                Placeholder text
            </div>
        );
    }

    renderSettingsPanel() {
        return (
            <div className="sidebar-panel sidebar-settings-panel">
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
                    min="9" 
                    max="30" 
                    id="rowInput"
                    value={this.state.rowInput} 
                    onChange={this.handleSliderChange}
                />
                <div>Columns: {this.state.colInput}</div>
                <input 
                    type="range" 
                    min="9"
                    max="30" 
                    id="colInput"
                    value={this.state.colInput}
                    onChange={this.handleSliderChange}
                />
                <div>Bombs: {this.state.bombInput}</div>
                <input
                    type="range" 
                    min="10" 
                    max="200" 
                    id="bombInput"
                    value={this.state.bombInput} 
                    onChange={this.handleSliderChange}
                />
                <button onClick={this.handleNewGameButton}>
                    Create New Game
                </button>
            </div>
        );
    }

    renderCounter(toRender) {
        let output = toRender;
        if(output < 10) {
            output = "00" + output.toString();
        } else if(output < 100) {
            output = "0" + output.toString();
        } else if(output > 999) {
            output = 999;
        }
        return output;
    }

    renderEmoji() {
        let emojiState = this.state.emojiState;
        let emoji = <span role="img" aria-label="neutral face">😐</span>;
        if(emojiState === EMOJI_STATE.SMILE_SUNGLASSES) {
            emoji = <span role="img" aria-label="smiling face with sunglasses">😎</span>
        } else if(emojiState === EMOJI_STATE.SCREAM) {
            emoji = <span role="img" aria-label="face screaming in fear">😱</span>
        } else if(emojiState === EMOJI_STATE.SMILE) {
            emoji = <span role="img" aria-label="slightly smiling face">🙂</span>
        } else if(emojiState === EMOJI_STATE.OPEN_MOUTH) {
            emoji = <span role="img" aria-label="face with mouth open">😮</span>
        }
        return emoji;
    }

    renderClickState() {
        let icon = <div className="bomb"></div>;
        if(this.state.clickState === CLICK_STATE.FLAG) {
            icon = <div className="flag"></div>;
        }
        return icon;
    }

    render() {
        return (
            <div className="game-container">
                <div className="banner">
                    For the best experience please use the Google Chrome browser on a desktop or laptop. 
                    Updates to optimize for all browsers and devices may come in the future.
                </div>
                <div className="game">
                    <div className="game-status">
                        <div className="counter-panel">
                            {this.renderCounter(this.state.flagCounter)}
                        </div>
                        <div className="center-panel">
                            <button 
                                className="panel-tile"
                                onClick={this.handleEmojiButton}
                            >
                                {this.renderEmoji()}
                                </button>
                            <button 
                                className="panel-tile"
                                onClick={this.toggleClickState}
                            >
                                {this.renderClickState()}
                            </button>
                        </div>
                        <div className="counter-panel">
                            {this.renderCounter(this.state.timer)}
                        </div>
                    </div>
                    <Board 
                        rows={this.state.gameState.rows} 
                        cols={this.state.gameState.cols}
                        bombField={this.state.gameState.bombField}
                        gameState={this.state.gameState.gameState}
                        onClick={(e, r, c) => this.handleBoardClick(e, r, c)}
                    />
                </div>
                {this.renderSidebar()}
            </div>
        );
    }
}

export default Game;