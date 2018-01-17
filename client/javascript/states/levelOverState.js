'use strict'
class LevelOverState extends Phaser.State {
    constructor() {
        super();
    }

    init(data){
        this.highscore = data.highscore;
        this.timer = data.timer;
        this.status = data.status;

        this.game.connectionHandler.sendHighscore( data.highscore, this.game.stateManager.currentLevel );
    }

    preload() {
    } 
   
    create() {
      this.levelOverText = this.game.add.text(200, 200, '',{fontSize: '50px', fill: 'white'} );
      this.gameOverText = this.game.add.text(120, 150, '', {fontSize: '50px', fill: 'red'});
      this.gameWinText = this.game.add.text(120, 150, '', {fontSize: '50px', fill: 'green'});

    } 

    update() {
        switch (this.status) {
            case "losing":
                this.gameOverText.setText('YOU LOST!\nTRY AGAIN!\nSCORE: ' + this.highscore + '\nYOUR TIME: ' + this.timer);
                this.game.time.events.add(4000, function () {
                    this.game.camera.fade('#000000', 1000);
                    this.game.stateManager.startGameState( MENU_STATE );
                }, this);
                break;

            case "winning":
                this.gameWinText.setText('YOU WIN!\nYOU ARE FREE!\nSCORE: ' + this.highscore + '\nYOUR TIME: ' + this.timer);
                this.game.time.events.add(4000, function () {
                    this.game.camera.fade('#000000', 1000);
                    this.game.stateManager.startGameState( MENU_STATE );
                }, this);
                break;

            default:
                this.levelOverText.setText('LEVEL CLEARED!\nSCORE: ' + this.highscore+'\nYOUR TIME: ' + this.timer);
                this.game.time.events.add(4000, function () {
                    this.game.camera.fade('#000000', 1000);
                    this.game.stateManager.startNextLevel();
                }, this);

        }

   }

}
