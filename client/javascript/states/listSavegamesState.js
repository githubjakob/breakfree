'use strict';

class ListSavegamesState extends Phaser.State {
    constructor() {
        super();
        this.savegames = [];
    }

    init( data ) {
        this.savegames = data;
        this.buttons = [];
        this.labels = [];
        this.game = this.game;
    }

    create() {
        this.game.stage.backgroundColor = '#666';
        this.buttonsound    = this.game.add.audio( 'buttonsound', 0.1, false );
        let button;

        button = this.game.add.button( 50, 50, 'button', this._backToMainMenu, this, 7, 6 );
        button.onInputOver.add(this._playSound.bind(this));
        button = this.game.add.button( 550, 50, 'button', this._deleteSession, this, 13, 12 );
        button.onInputOver.add(this._playSound.bind(this));


        this.position = {'x': 80, 'y': 150};
        let tmp;

        /**
         *    Druckt die Buttons & Label nach einander auf die Canvas, und überdruckt diese, wenn die maximal 
         *    anzeigebare Anzahl an Speicherstaenden ueberschritten wird.
         */
        for (let i = 0; i < this.savegames.length; i++) {
            let timestamp = new Date( this.savegames[i].timestamp ).toLocaleString();
            let buttonText = 'Level ' + this.savegames[i].currentLevel + ' - ' + timestamp;
                tmp = i%16;
                //linke Buttonreihe
                if ( tmp < 8 ) {
                    this.buttons.push( 
                        this.game.add.button( this.position.x-10,
                            this.position.y + tmp * 55-10,
                            'downupload', this._loadgame, 
                            this, 
                            0, 
                            1 )
                    );
                    this.buttons[i].name = i;
                    this.labels.push ( 
                        this.game.add.text(
                            this.position.x, 
                            this.position.y + tmp*55,
                            buttonText,
                            { font: "15px Arial", fill: "#000000", align: "left" }
                        )
                    );
                //rechte Buttonreihe
                } else {
                    this.buttons.push( 
                        this.game.add.button( this.position.x + 340, 
                            this.position.y + tmp%8*55-10, 
                            'downupload', this._loadgame, 
                            this, 
                            0, 
                            1 ) 
                    );    
                    this.buttons[i].name = i;
                    this.labels.push ( 
                        this.game.add.text(
                            this.position.x + 350, 
                            this.position.y + tmp%8*55,
                            buttonText,
                            { font: "15px Arial", fill: "#000000", align: "left" }
                        ) 
                    );
            }
        }
    }

    _playSound() {
        this.buttonsound.play();
    }

    /**
     *   Bei Buttonklick aufgerufen
     */
    _loadgame(buttonObject) {
        switch (buttonObject.position.x) {
            case this.position.x-10:
                Logger.debug('1. column');
                this._selectButton(buttonObject, 0);
                break;
            case this.position.x+340:
                Logger.debug('2. column');
                this._selectButton(buttonObject, 1);
                break;
        }  
    }

    /**
     *  loescht den Cookie und somit wird dem Client beim reload eine neue Spieleintrag in die Datenbank geschreiben.
     */
    _deleteSession() {
        document.cookie = '';
        location.reload();
        Logger.info('Cookie deleted...');
    }

    _backToMainMenu() {
        this.game.stateManager.startGameState(MENU_STATE);
    }

    /**
     *   Berechnet den gewaehlten Speicherstand und laedt diesen.
     */
    _selectButton(buttonObject, column) {

            Logger.info('Game #' + buttonObject.name + ' loaded. ');

            switch(buttonObject.y) {
                case this.position.y-10:   
                    Logger.debug('1');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+45:   
                    Logger.debug('2');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+100:   
                    Logger.debug('3');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+155:   
                    Logger.debug('4');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+210:   
                    Logger.debug('5');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+265:   
                    Logger.debug('6');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+320:   
                    Logger.debug('7');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
                case this.position.y+375:   
                    Logger.debug('8');
                    this.game.stateManager.loadSavedGame(this.savegames[buttonObject.name]);
                    break;
            }
    }


}