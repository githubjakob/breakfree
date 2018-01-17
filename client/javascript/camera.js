//Camera Proxy
class Camera {
	constructor (game, levelState) {
		this.game 		= game;
		//this.game.camera;
		this.levelState = levelState;
        this.hud 		= new HUD(game, levelState);             

		this.scoreText = this.game.add.text(20, 20,'Score : ' + levelState.highscore , { fontSize: '18px', fill: 'white'});
		this.scoreText.fixedToCamera = true;

        this.timerText = this.game.add.text(20, 50, 'Time: ' + levelState.timer, {fontSize: '18px', fill: 'white'});
		this.timerText.fixedToCamera = true;

	}

	update() {
		this._moveCamera();
		this.hud.update();
	}

	/**
	 *   Berechnet den Mittelpunkt zwischen den Spielern und zentriert die Kamera entsprechend.
	 */
	_moveCamera() {
        let cameraX = (this.levelState.player1.body.x + this.levelState.player2.body.x + this.levelState.player1.body.width + this.levelState.player2.body.width) / 2;
        let cameraY = (this.levelState.player1.body.y + this.levelState.player2.body.y + this.levelState.player1.body.height + this.levelState.player2.body.height) / 2;

        this.game.camera.x = cameraX - this.game.width / 2 - this.levelState.player2.body.width / 2;
        this.game.camera.y = cameraY - this.game.height / 2 - this.levelState.player2.body.height / 2;
    }

    fade(color, miliseks) {
        this.game.camera.fade(color, miliseks);
    }

    flash(color, miliseks) {
        this.game.camera.flash(color, miliseks, true);
    }
}

// Anonyme Klasse, da nur in Camera verwendet.
class HUD {
	constructor (game, levelState) {
		this.playerNames 		= new PlayerNames(game, levelState);
		this.LifeStatus			= new LifeStatus(game.width - 35, 20, levelState);
		this.saveInformation 	= new SaveInformation(game, levelState);
		this.keyStatus          = new KeyStatus( levelState );
	}

	update() {
		this.playerNames.update();
		this.saveInformation.update();
	}
}

class KeyStatus {
    constructor( levelState ) {
        this.keyStatusGroup = game.add.group();
        this.collectedKeys = [];
        this.keyStatusFlashing = false;

        for (let i = 0; i < levelState.keyCount; i++) {
        	this.updateCollectedKeyStatus();
        }
    }

    updateCollectedKeyStatus() {
        let defaultX = game.width - 35;
        let defaultY = game.height - 40;
        let keyHud = new KeyHud(game, defaultX - this.collectedKeys.length * 20 , defaultY);
        this.collectedKeys.push(keyHud);
        this.keyStatusGroup.add(keyHud);
    }

    notEnoughKeys() {
        if (!this.keyStatusFlashing) {
            this.keyStatusFlashing = true;
            this.keyStatusGroup.forEach(sprite => {
                sprite.tint = 0xff0000;
                game.time.events.add(1000, function() {
                    sprite.tint = 0xffd52d;
                }, this);
            });
        }
        this.keyStatusFlashing = false;
    }
}

class LifeStatus {
	constructor(x, y, levelState) {
		this.liveStatusGroup             = game.add.group();
		this.liveStatus = [];
		for (let i = 0; i < levelState.playerLifepoints; i++) {	
			this.liveStatus.push( new Heart(game, x - i * 20, y) );
			this.liveStatusGroup.add( this.liveStatus[i] );
			if ( levelState.playerLifepoints-1 < i ) {
				this.liveStatus[i].update( 0 );	
			}
		}
	}

	/**
	 *     Füllt ein Herz wieder auf.
	 */
	lifepointUp( lifepoints ) {
		if (lifepoints < 3) {
			this._changeFrame(lifepoints-1, 1);
		}
		
	}

	/**
	 *     Löscht ein volles Herz und ersetzt es durch ein leeres.
	 */
	lifepointDown( lifepoints ) {
        if (lifepoints > 0) {
            this._changeFrame(lifepoints - 1, 0);
        }
            
	}


	/**
	 *  Hilfsfunktion: Verändert, welches Frame von der Herztexture, angezeigt wird.
	 */
	_changeFrame(index, frame) {
		this.liveStatus[index].update(frame);
	}
}

class KeyHud extends Phaser.Sprite{
    constructor(game, x, y) {

        super(game, x, y, 'key');
        this.fixedToCamera = true;
        this.frame = 1;
    }

    update( frame ) {
        this.frame = frame;
    }
}

// Anonyme Hilfklasse für die Leben-Anzeige
class Heart extends Phaser.Sprite{
	constructor(game, x, y) {

        super(game, x, y, 'heart');
        this.fixedToCamera = true;
        this.frame = 1;
	}

	update( frame ) {
		this.frame = frame;
	}
}

//Anonyme Klasse für die Anzeige der Spielernamen, über den Spielern
class PlayerNames {
	constructor (game, levelState) {
		this.levelState 	= levelState;
		this.playerNamesHUD = [game.add.text(this.levelState.players[0].body.x, this.levelState.players[0].body.y, this.levelState.players[0].name, { font: "12px Arial", fill: "#ffffff", align: "center" }),
							   game.add.text(this.levelState.players[1].body.x, this.levelState.players[1].body.y, this.levelState.players[1].name, { font: "12px Arial", fill: "#ffffff", align: "center" })]
    }

    /**
     *   Aktualiersiert die Position der Spielernamen über den sich bewegenden Spielern.
     */
    update() {
    	for (let i = 0; i < this.playerNamesHUD.length; i++) {		    	
    			this.playerNamesHUD[i].x = this.levelState.players[i].body.x + this.levelState.players[i].body.width / 2 - this.playerNamesHUD[i].width / 2;
				this.playerNamesHUD[i].y = this.levelState.players[i].body.y - 20;
    	}
    }
}

//Anonyme Klasse, Zur visuellen Benachrichtigung des Spielers, dass ein Spielstand gespeicht wurde.
class SaveInformation {

	constructor (game, levelState) {
		this.game 			= game;
		this.showSaveInfo 	= 0;
		this.position = {x: 480, y: -40, fadeInPosition: 40};

        this.saveInfo 		= {	'background': this.game.add.sprite(this.game.width - 320, levelState.camera.y, 'downupload', 3), 
        						'text': this.game.add.text(this.game.width - 300, levelState.camera.y + 10, 'Game saved.', { font: "15px Arial", fill: "#000000", align: "left" }) 
        					  };
    }

    /**
     *    Aktualisiert die Position der Speicherbenachrichtigung, auf die der Kamera.
     */
    update() {
		if ( this.showSaveInfo === 0 ) {
			this.saveInfo.background.x 	= this.game.camera.x + this.position.x;
			this.saveInfo.background.y 	= this.game.camera.y + this.position.y;
			this.saveInfo.text.x 		= this.game.camera.x + this.position.x + 10;
			this.saveInfo.text.y 		= this.game.camera.y + this.position.y + 10;
		} else {
			this._slideSaveInfo();
		}
    }

    /**
     *   Slidet die Benachrichtigung nach unten und anschließend, wieder nach oben.
     */
	_slideSaveInfo() {
		if ( this.showSaveInfo === 1 && this.saveInfo.text.y < this.game.camera.y + this.position.fadeInPosition) {
			this.saveInfo.text.y += 1;
			this.saveInfo.background.position.y += 1;
		} else {
			this.showSaveInfo = 2;
			if ( this.showSaveInfo === 2 && this.saveInfo.text.y > this.game.camera.y + this.position.y ) {
				this.saveInfo.text.y -= 1;
				this.saveInfo.background.position.y -= 1;
			} else {
				this.showSaveInfo = 0;
			}
		}
	}
}