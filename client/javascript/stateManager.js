'use strict';

const LEVEL_STATE       = "level-state", // generic state for all the levels
    MENU_STATE          = "menu-state",
    TUTORIAL_STATE      = "tut-state",
    LISTSAVEGAMES_STATE = "listsavegames-state",  
    NAMEINPUT_STATE     = "nameinput-state", 
    LOADING_STATE       = "loading-state", // state that preloads common assets
    LEVEL_OVER_STATE  = "level_over_state",
    HIGHSCORE_STATE  = "highscore_state";

/**
 * Handles starting a new Game, switching to the next Level as well as Loading a Game
 * @author {Jakob}
 */
class StateManager {
    constructor( game ) {
        this.game = game;
        this.game.state.add( MENU_STATE,        new MenuState() );
        this.game.state.add( TUTORIAL_STATE,    new TutorialState() );
        this.game.state.add( NAMEINPUT_STATE,   new NameInputState() );
        this.game.state.add( LISTSAVEGAMES_STATE, new ListSavegamesState() );
        this.game.state.add( LOADING_STATE,     new LoadingState() );
        this.game.state.add( LEVEL_STATE,       new LevelState() );
        this.game.state.add( LEVEL_OVER_STATE,  new LevelOverState() );
        this.game.state.add( HIGHSCORE_STATE,   new HighscoreState() );

        // Tilemaps of Levels are loaded in LevelState
        this.levels = {};

        // Stores the number of the current level, gets set to 1 when a new game is started
        this.currentLevel = 0;

        //Saves temporary the game state for resume from Menu.
        this.tmpSavegame = null;

        //Used, if no mongodb is available
        this.savedGame = [];

        //used for saving gamestate as img as menu background
        this.background;
    }

    startNewGame() {
        this.currentLevel = 1;
        this.startLevel();
    }

    /**
     * Starts a Phaser State.
     * @param state the State that is started
     * @param initParameter data that is passed to the init(data) function
     */
    startGameState(state, initParameter = null) {
        Logger.info("StateManager.startGameState() with: " + state);
        this.game.state.start(state, true, false, initParameter);
    }

    startNextLevel() {
        this.currentLevel++;
        this.startLevel();
    }

    startLevel() {
        let initParameter = {'highscore': 0,
            'playerLifepoints': 3,
            'keyCount': 0,
            'timer': 0,
            'currentLevel': this.currentLevel,
            'isSavegame': false
        };
        this.startGameState(LEVEL_STATE, initParameter);
    }

    loadSavedGame(savedGameJson) {
        Logger.debug('stateManager: Loading saved Game.');
        this.currentLevel = savedGameJson.currentLevel;
        let savedGame = new SavedGame(savedGameJson);
        let originalLevel = this.levels["level" + savedGame.currentLevel];
        let levelTilemap = savedGame.mergeWith(originalLevel);
        let initParameter = {'highscore': savedGame.highscore,
            'playerLifepoints': savedGame.playerLifepoints,
            'keyCount': savedGame.keyCount,
            'timer': savedGame.timer,
            'isSavegame': true,
            'currentLevel': this.currentLevel,
            'levelTilemap': levelTilemap
        };
        this.startGameState(LEVEL_STATE, initParameter);
    }

    /**
     * Speichert die aktuellen Positionen von Spieler, Keys, etc.
     */
    saveGame() {
        let currentState = this.game.state.states[this.game.state.current];
        let savedGame = new SavedGame(currentState, this.currentLevel);

        this.game.connectionHandler.sendSavegame( savedGame );
    };
}