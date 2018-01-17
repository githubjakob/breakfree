'use strict';

class NameInputState extends Phaser.State {
    constructor() {
        super();
    }

    create() {

        this.game.stage.backgroundColor = '#666';
        this.buttonsound    = this.game.add.audio( 'buttonsound', 0.1, false );
        let button;

        button = this.game.add.button( 100, 100, 'button', this._backToMainMenu, this, 7, 6 );
        button.onInputOver.add(this._playSound.bind(this));
        this.inputFields = new InputField( this.game );

    }

    update() {
        this.inputFields._keyListener( );  
    }

    /**
     *    Schickt die Spielernamen zum Server. Löscht KeyListener. Startet den MenuState.
     */
    _backToMainMenu() {
        this.game.connectionHandler.sendPlayerNames( this.game.gameSettings.playerDefaultNames["player" + 0],  this.game.gameSettings.playerDefaultNames["player" + 1]);
        this.game.input.keyboard.removeKey( Phaser.Keyboard.BACKSPACE );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.ENTER );
        this.game.stateManager.startGameState(MENU_STATE);
    }
    
    
    _playSound() {
        this.buttonsound.play();
    }

}

class InputField {
    constructor( game ) {
        this.game = game;
        this.inputFiledPosition = {x: 100, y: 250};

        this.game.add.button( this.inputFiledPosition.x, this.inputFiledPosition.y-45, 'inputborder', this._select1, this, 1, 0, 2 );        
        this.game.add.button( this.inputFiledPosition.x, this.inputFiledPosition.y-45+75, 'inputborder', this._select2, this, 1, 0, 2 );

        this.maxNameLength = 10;
        this.selectPlayer = 1;
        this.keypress = false;


        this.game.add.button( this.inputFiledPosition.x, this.inputFiledPosition.y-45, 'inputborder', this._select1, this, 1, 0, 2 );        
        this.game.add.button( this.inputFiledPosition.x, this.inputFiledPosition.y-45+75, 'inputborder', this._select2, this, 1, 0, 2 );

        this.game.add.sprite(this.inputFiledPosition.x+450, this.inputFiledPosition.y-25, 'player0');
        this.game.add.sprite(this.inputFiledPosition.x+450, this.inputFiledPosition.y-20+75, 'player1');
        
        //
        this.playerNamesInputfildes = [this._createInputField(this.inputFiledPosition.x+20, this.inputFiledPosition.y, "Player 1 Name: ", 33, '#00ff00'), 
                                       this._createInputField(this.inputFiledPosition.x+20, this.inputFiledPosition.y+75, "Player 2 Name: ", 33, '#000000')
                                      ];

        //KeyListener für alle Tasten
        this.game.input.keyboard.addCallbacks(this, null, null, this._keyPress);

        //gesonderte besondere Tasten, für Löschen des zu letzt eigegebenen Buchstabens und wechseln zwischen den Inputfeldern
        this.backspace = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
        this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    }


    _keyListener() {        
        if (this.backspace.isDown && this.keypress === false) {

            this.keypress = true;
            if(this.selectPlayer === 1) {
                this.game.gameSettings.playerDefaultNames["player" + 0] = this.game.gameSettings.playerDefaultNames["player" + 0].slice(0, this.game.gameSettings.playerDefaultNames["player" + 0].length-1);
            }else {
                this.game.gameSettings.playerDefaultNames["player" + 1] = this.game.gameSettings.playerDefaultNames["player" + 1].slice(0, this.game.gameSettings.playerDefaultNames["player" + 1].length-1);               
            }   

        } else if (this.enter.isDown && this.keypress === false) {

            this.keypress = true;
            this.selectPlayer = (this.selectPlayer + 1 ) % 2;
            

        } else if ( this.backspace.isUp && this.enter.isUp ){
            this.keypress = false;
        }
            this._updateInputField(this.selectPlayer);
    }

    /**
     * Macht Eingaben in die Inputfelder sichtbar
     */
    _updateInputField(activeFieled) {
        switch(activeFieled) {
            case 0:           
                this.playerNamesInputfildes[0].context.fillStyle = "#000000";
                this.playerNamesInputfildes[1].context.fillStyle = "#00ff00";           
                break;
            case 1:
                this.playerNamesInputfildes[0].context.fillStyle = "#00ff00";
                this.playerNamesInputfildes[1].context.fillStyle = "#000000";           
                break;
            default:
                console.log("Error InputField");        
        }
        //Löscht die Inputfelder von der "Canvas"
        this.playerNamesInputfildes[0].cls();
        this.playerNamesInputfildes[1].cls();
        //Zeichnet neue Inputfelder auf die Canvas
        this.playerNamesInputfildes[0].context.fillText("Player 1 Name: " + this.game.gameSettings.playerDefaultNames["player" + 0], 
                                                        this.inputFiledPosition.x+20, this.inputFiledPosition.y
                                                        );
        this.playerNamesInputfildes[1].context.fillText("Player 2 Name: " + this.game.gameSettings.playerDefaultNames["player" + 1], 
                                                        this.inputFiledPosition.x+20, this.inputFiledPosition.y+75
                                                        ); 
    }

    /**
     * Erzeugt Inputfelder
     * @param {number} positionX - horizontale Position des Inputfeldes
     * @param {number} positionY - vertikale Position des Inputfeldes
     * @param {String} text - Text der vor dem Inputfeld angezeigt werden soll
     * @param {number} size - Texttgroesse
     * @param {String} color - Farbe des Textes des Inputfeldes
    */
    _createInputField(positionX, positionY, text, fontsize, color) {
        let text_label = this.game.make.bitmapData(700, 800);
        text_label.context.font = fontsize + 'px Arial';
        text_label.context.fillStyle = color;
        text_label.context.fillText(text, positionX, positionY);
        text_label.addToWorld();

        return text_label;
    }

    //Aktiviert das erste Inputfeld
    _select1() {
        this.selectPlayer = 1;
    }

    //Aktiviert das zweite Inputfeld
    _select2() {
        this.selectPlayer = 0;
    }

    /**
     *  Speichert die eingebenen Buchstaben für die Spielernamen
     */
    _keyPress(char) {
            if (this.selectPlayer == 1 && this.game.gameSettings.playerDefaultNames["player" + 0].length < this.maxNameLength) {

                this.game.gameSettings.playerDefaultNames["player" + 0] += char;//.charCodeAt(0);
            } else if (this.selectPlayer == 0 && this.game.gameSettings.playerDefaultNames["player" + 1].length < this.maxNameLength) {
                this.game.gameSettings.playerDefaultNames["player" + 1] += char;         
            }
        
            this.selectPlayer = this.selectPlayer%2;            
            this._updateInputField(this.selectPlayer);
    }

}