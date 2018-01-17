'use strict';

class MenuState extends Phaser.State {
    constructor() {
        super();
        this.esc;
    }

    preload() {
        if ( this.game.stateManager.background !== undefined) {
            this.game.load.image('backgroundMenu', this.game.stateManager.background);
        }
    }

    create() {
        let button;
        this.buttonsound    = this.game.add.audio( 'buttonsound', 0.1, false );
        let buttonrowY = 50;

        if ( this.game.stateManager.tmpSavegame !== null ) {
            this.game.add.image(0, 0, 'backgroundMenu');
            
            button = this.game.add.button( this.game.width/2 - 112, buttonrowY, 'button', this._resume, this, 11, 10 );
            button.onInputOver.add(this._playSound.bind(this));
            this.esc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

        } else {
            this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        }

        button = this.game.add.button( this.game.width/2 - 112, buttonrowY+80, 'button', this._startNewGame, this, 3, 2 );
        button.onInputOver.add(this._playSound.bind(this));
        button = this.game.add.button( this.game.width/2 - 112, buttonrowY+160, 'button', this._nameInput, this, 9, 8 );
        button.onInputOver.add(this._playSound.bind(this));
        button = this.game.add.button( this.game.width/2 - 112, buttonrowY+240, 'button', this._listSavegames, this, 1, 0 );
        button.onInputOver.add(this._playSound.bind(this));
        button = this.game.add.button( this.game.width/2 - 112, buttonrowY+320, 'button', this._tutorial, this, 5, 4 );
        button.onInputOver.add(this._playSound.bind(this));
        button = this.game.add.button( this.game.width/2 - 112, buttonrowY+400, 'button', this._highScore, this, 15, 14 );
        button.onInputOver.add(this._playSound.bind(this));
    }

    update() {
        if (this.esc !== undefined && this.esc.isDown) {
            this.game.input.keyboard.removeKey( Phaser.Keyboard.ESC );
            this._resume();
        }
        
    }

    _playSound() {
        this.buttonsound.play();
    }

    _startNewGame() {
        this.game.stateManager.startNewGame();
    }

    _resume() {
        this.game.stateManager.loadSavedGame(this.game.stateManager.tmpSavegame);
    }

    _tutorial() {
        this.game.stateManager.startGameState( TUTORIAL_STATE, 1 );
    }

    _listSavegames() {
        this.game.connectionHandler.requestAllSavegame(); 
    }

    _nameInput() {
        this.game.connectionHandler.requestPlayerNames();
    }


    _highScore() {
        this.game.connectionHandler.requestHighscore();
    }
}