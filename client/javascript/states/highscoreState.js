'use strict';

class HighscoreState extends Phaser.State {
    constructor() {
        super();
    }

    init(data) {
        this.highscore = data.localhighscores;
        this.gloablhighscore = data.globalhighscores;

    }
    
    create() {
        this.game.stage.backgroundColor = '#666';
        this.buttonsound    = this.game.add.audio( 'buttonsound', 0.1, false );
        let button;

        button = this.game.add.button( 50, 20, 'button', this._backToMainMenu, this, 7, 6 );
        button.onInputOver.add(this._playSound.bind(this));

        //this.game.add.sprite(40, 140, 'tableborder');

        let y = 200;
        this._createTable(y, this.highscore, 'Your Highscore');

        y += 200;
        this._createTable(y, this.gloablhighscore, 'Global Highscore');

    }

    _createTable(y, highscore_list, header) {
        let x = 60;
        let hightHeader = 30;

        let fontstyle_header = { font: "25px Arial", fill: "#47ecff", align: "left" };
        let fontstyle_tableheader = { font: "20px Arial", fill: "#0096ff", align: "left" };
        let fontstyle_tableitem = { font: "18px Arial", fill: "#fff", align: "left" };

        this.game.add.text(x, y -2*hightHeader, header, fontstyle_header);
        let text = 'Level';
        this.game.add.text(x, y-hightHeader, text, fontstyle_tableheader);

        text = 'Playernames';
        this.game.add.text(x+65, y-hightHeader, text, fontstyle_tableheader);

        text = 'Date';
        this.game.add.text(x+330, y-hightHeader, text, fontstyle_tableheader);

        text = 'Highscore';
        this.game.add.text(x+545, y-hightHeader, text, fontstyle_tableheader);
 
        for (let i = 0; i < highscore_list.length; i++) {
            if (highscore_list[i].highscore >= 0) {
                text = '#' + highscore_list[i].level;
                this.game.add.text(x, y+i*30, text, fontstyle_tableitem);
                
                text = highscore_list[i].player1Name + ' & ' + highscore_list[i].player2Name;
                this.game.add.text(x+65, y+i*30, text, fontstyle_tableitem);
                
                text = new Date( highscore_list[i].timestamp ).toLocaleString(); 
                this.game.add.text(x+330, y+i*30, text, fontstyle_tableitem);
                
                text = highscore_list[i].highscore;
                this.game.add.text(x+545, y+i*30, text, fontstyle_tableitem);
                
            }
        }
    }

    _backToMainMenu() {
        this.game.stateManager.startGameState(MENU_STATE);
    }

    _playSound() {
        this.buttonsound.play();
    }

}