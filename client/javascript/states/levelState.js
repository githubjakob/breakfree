'use strict';

/**
 * Phaser State that is used for all Levels of the Game.
 *
 * - To start a Level, you need to pass the number of the Level to the State. It will load the respective Tilemap,
 * which was preloaded in the {@link LoadingState}.
 * - To start a SavedGame, you need to pass the number of the Level plus the full Tilemap, which contains the updated
 * data from a {@link SavedGame}, to the State.
 */
class LevelState extends Phaser.State {
    constructor() {
        super();
    }

    init(initParameter) {
        this.highscore = initParameter.highscore;
        this.playerLifepoints = initParameter.playerLifepoints;
        this.keyCount = initParameter.keyCount;
        this.timer = initParameter.timer;
        this.isSavegame = initParameter.isSavegame;
        this.currentLevel = initParameter.currentLevel;

        if (initParameter.isSavegame) {
            this.levelTilemap = initParameter.levelTilemap;
        }
    }

    preload() {
        if (this.isSavegame) {
            this.game.load.tilemap("savedlevel", null, this.levelTilemap, Phaser.Tilemap.TILED_JSON );
            this.levelname = "savedlevel";
        } else {
            /** Tilemap for a regular level has already been pre-loaded in the {@link LoadingState}. **/
            this.levelname = "level" + this.currentLevel;
        }
    }

    create() {
        this._setupLevel();

        this._addKeysToListener();

        this.keyDown = false;
        this.goToNextLevelTriggered = false;

        this._spawnPlayers();
        this._setEndzone();
        this._spawnLevelObjects();
        this._spawnProjectileGroup();

        this.camera = new Camera( this.game, this );
        this.camera.flash('#000000', 2000);
    }

    update() {
        this._handleCollision();
        this._handleInput();
        this._movePlayer();
        this._updateEnemies();
        this.camera.update();
        this._detected();
        this._freedomTwo();

        if (this._levelWinConditions()) {
            this._goToOverState("progress");
        } else if (this._playersAreInEndzone()) {
            this.camera.hud.keyStatus.notEnoughKeys();
        }
        this._bossDefeat();
    }

    _levelWinConditions() {
        this.numberOfKeys = this.map.objects["keys"].length;
        return this._playersAreInEndzone() && this.numberOfKeys <= this.keyCount;
    }

    _playersAreInEndzone() {
        return this._isInEndzone(this.player1) && this._isInEndzone(this.player2);
    }

    _isInEndzone(player) {
        return this.endzone.x0 < player.body.position.x
            && player.body.position.x < this.endzone.x1
            && this.endzone.y0 < player.body.position.y
            && player.body.position.y < this.endzone.y1;
    }

    _goToOverState(status) {
        if (!this.goToNextLevelTriggered) {
            this.goToNextLevelTriggered = true;
            this.camera.fade('#000000', 1000);
            //creates background
            //this.game.add.tileSprite(0,0,3840,1280, 'background' + (this.game.stateManager.currentLevel +1));
            this.game.time.events.add(1000, function() {
               this.game.stateManager.startGameState( LEVEL_OVER_STATE, { highscore: this.highscore, timer:this.timer, status: status} );

                }, this);
        }
    }

    _spawnLevelObjects() {
        this._spawnObjects("keys", Key);
        this._spawnObjects("enemies", Enemy);
        this._spawnObjects("levers", Lever);
    }

    /**
     * General Function to create Objects from a Tilemap Object Layer, e.g. Player, Enemy
     */
    _spawnObjects(layerName, clazz) {
        this[layerName]             = this.game.add.group();
        this[layerName].enableBody  = true;
        this.map.objects[layerName].forEach(object => {
            let createdObject       = new clazz(this.game, object);
            createdObject.visible   = object.visible;
            createdObject.type      = object.type;

            this[layerName].add(createdObject);
            
        });
        Logger.debug("Object created: " + layerName);
    }

    _setupLevel() {
        this.map = this.game.add.tilemap( this.levelname );

        this.timerEvent = this.game.time.events.loop( Phaser.Timer.SECOND, this._updateTimer, this );

        this.keySound   = this.game.add.audio('keyHit', 1, false);
        this.enemySound = this.game.add.audio('enemyHit', 1, false);
        this.music      = this.game.add.audio( 'background_music', 0.2, true);
        this.music.play();
        this.game.input.onDown.add(this._changeVolume, this );

        this.game.physics.startSystem( Phaser.Physics.ARCADE );
        this.game.add.tileSprite(0,0,3840,1280,'background' + this.game.stateManager.currentLevel);

        this.map.addTilesetImage( 'sheet', 'sheet' );

        //REIHENFOLGE DER EBENEN IST WICHTIG! Werden von oben nach unten, von hinten nach vorne gerendert.
        this.layer = {
            "background":       this.map.createLayer( 'Background' ),
            "platforms":        this.map.createLayer( 'Platforms' ),
            "water":            this.map.createLayer( 'Water' ),
            "invisiblewall":    this.map.createLayer( 'Invisiblewall' )
        };

        this.layer.platforms.resizeWorld();
        this.layer.water.resizeWorld();
        this.layer.invisiblewall.resizeWorld();

        //Legt fest, mit welchen Tiles der Spieler kollidiert.
        this.map.setCollisionBetween(1, 300, true, this.layer.platforms);
        this.map.setCollisionBetween(1, 300, true, this.layer.water);
        this.map.setCollisionBetween(1, 300, true, this.layer.invisiblewall);
        this.game.stage.backgroundColor = '#3c6778';
    }

    _spawnPlayers() {
        this._spawnObjects("players", Player);
        // get the players from the Phaser group
        this.player1 = this.players.getAt(0);
        this.player2 = this.players.getAt(1);

        // overwrite the group with a simple Array
        this.players = [this.player1, this.player2];
        this.game.add.existing(this.player1);
        this.game.add.existing(this.player2);
    }


    _spawnProjectileGroup() {
        this.projectileGroup = this.game.add.group();
        this.projectileGroup.enableBody = true;
        this.projectileGroup.physicsBodyType = Phaser.Physics.ARCADE;

        this._addProjectile("bullets");
        this._addProjectile("nets");
        this._addProjectile("rocketPacks");
        this._addProjectile("rockets");
    }

    _addProjectile (projectileName) {
        this[projectileName]                 = this.game.add.group();
        this[projectileName].name            = projectileName;
        this[projectileName].velocity        = this.game.gameSettings.projectileTypes[projectileName].velocity;
        this[projectileName].enableBody      = true;
        this[projectileName].physicsBodyType = Phaser.Physics.ARCADE;
        this[projectileName].createMultiple(40, projectileName);
        this[projectileName].callAll("anchor.setTo", "anchor", 0.5, -3,16);
        this[projectileName].setAll("checkWorldBounds", true);
        this.projectileGroup.add(this[projectileName]);
    }

    _handleInput() {
        //player1 is large and player2 is small
        this.player1.goLeft     = this.player1Input.left.isDown;
        this.player1.goRight    = this.player1Input.right.isDown;
        this.player1.goUp       = this.player1Input.up.isDown;
        this.player1.goDown     = this.player1Input.down.isDown;
        this.player1.highJump   = this.player2.body.touching.up;
        this.player2.goLeft     = this.player2Input.left.isDown;
        this.player2.goRight    = this.player2Input.right.isDown;
        this.player2.goUp       = this.player2Input.up.isDown;
        this.player2.goDown     = this.player2Input.down.isDown;

        if (this._keyWasPressedOnce(this.keyInput.save)) {
            this.camera.hud.saveInformation.showSaveInfo = 1;
            this.game.stateManager.saveGame();
        }

        if (this.keyInput.load.isDown) {
             this.game.connectionHandler.requestLastSavegame();
        }

        if (this.keyInput.nextLevel.isDown) {
            this._goToOverState("progress");
        }

        if (this.keyInput.menu.isDown) {
            this.game.stateManager.tmpSavegame = new SavedGame( this, this.game.stateManager.currentLevel );
            this._removeKeysFromListener();
            this.game.stateManager.background = this.game.canvas.toDataURL("image/png");
            this.game.stateManager.startGameState(MENU_STATE);
        }
    }

    _movePlayer() {
        this.players.forEach(player => player.move(player, this));
    }

    _catchPlayer(player) {
        player.body.velocity.x = 0;
        player.animations.stop();
        player.frame = 5;
        player.controlsActivated = false;
        this._freedom(player);
    }

    _packDespawn(pack, layer) {
        pack.body.velocity.x = 0;
        pack.body.velocity.y = 0;
        window.setTimeout(function () {
            pack.destroy();
        }, 8000);
    }

    _freedom(player) {
        window.setTimeout(function () {
            player.controlsActivated = true
        }, 4000);
    }

    _freedomTwo() {
        this.players.forEach(player => {
            if((player.body.touching.left || player.body.touching.right) && this.game.stateManager.game.physics.arcade.collide(this.player1, this.player2)){
                player.controlsActivated = true;
            }
        })
    }

    _handleCollision() {
        let platformLayer = this.layer.platforms;
        let invisiblewallLayer = this.layer.invisiblewall;
        let waterLayer = this.layer.water;

        this.game.physics.arcade.collide(this.keys, platformLayer);
        this.game.physics.arcade.collide(this.enemies, platformLayer);
        this.game.physics.arcade.collide(this.enemies, invisiblewallLayer);
        this.game.physics.arcade.collide(this.levers, platformLayer);
        this.game.physics.arcade.collide(this.player1, this.player2);

        this.players.forEach(player => {
            this.game.physics.arcade.collide(player, platformLayer);
            this.game.physics.arcade.collide(player, waterLayer, this._respawn.bind(this));
            this.game.physics.arcade.collide(player, this.enemies, this._killEnemy.bind(this));
            this.game.physics.arcade.collide(player, this.platforms);
            this.game.physics.arcade.overlap(player, this.keys, this._collectKey.bind(this));
        });
           
        this._ladderCreator();
        this._projectileCollision();
    }

    _ladderCreator() {
        let CountPlayerOnLever = 0;
        let leverType;

        // Prueft, ob Spieler auf Schalter steht, wenn ja, dann wird der CountPlayerOnLever um 1 inkrementiert
        // Zusaetzlich wird der Typ/Index gespeichert, um die zugehoerige Leiter zu identifizieren.
        this.players.forEach(player => {
            this.levers.forEach(lever => {
                if(this.game.physics.arcade.collide(lever, player) ){
                    CountPlayerOnLever++;
                    leverType = lever.type;
                }
            });
        });


        if (CountPlayerOnLever > 0) {
            this.players.forEach(player => {
                this.levers.forEach(lever => {
                    if(this.game.physics.arcade.collide(lever, player) ){
                        lever.frame = 0;
                    }
                });
            });
            // Steht min. ein Spieler auf der Leiter, so werden alle Leitern erzeugt und die Leitern, die nicht gleich dem Type/Index
            // des Schalters sind, wieder gelöscht. 
            // Grund, Codereduktion: Andere Moeglichkeit waere gewesen, den Code zu erweitern und bei der Erzeugung den Typ abzugleichen
            if ( !this.ladderSpawned ) {
                this._spawnObjects("ladders", Ladder);

                this.ladders.forEach(ladder => {
                    if (leverType !== ladder.type) {
                        ladder.kill();
                    }
                });
                this.ladderSpawned = true;
            }
            // Testet, ob einer der Spieler auf der Leiter steht. 
            // Wenn ja, wird dessen Boolean Wert auf true gesetzt und die Schleife durch eine Exception verlassen.
            // Wenn nein, dann wird der Boolean Wert auf false gesetzt.
            try {
                this.players.forEach(player =>{
                    this.ladders.forEach(ladder => {
                        if(this.game.physics.arcade.collide(player, ladder)){
                            player.onLadder = true;
                            throw BreakException;
                        }else {
                            player.onLadder = false;
                        }
                    });
                });
            } catch (e) {
            }
        }else {
            //Sollte der Spieler vom Schalter runter gehen, so werden alle Leitern aus der Group entfernt.
            // Vorrausgesetzt, dass vorher Leitern gespawnt wurden, dies hat den Nutzen, dass nicht bei jedem update() aufruft 
            // das PhaserJS nicht unnötigerweise den Code ausfuehrt. 
            if (this.ladderSpawned) {
                this.ladders.removeAll();
                this.ladderSpawned = false;
                this.players.forEach(player =>{ 
                    player.onLadder = false;
                this.levers.forEach(lever => {
                    lever.frame = 1;
                });
                });
            }                    
        }
    }

    //#? warum für eine Zeile, eine extra Methode.
    _updateEnemies() {
        this.enemies.forEach(enemy => enemy.updateEnemy(this.players, enemy, this.layer, this.projectileGroup, this.enemies));
    }

    _changeVolume(pointer){
       if(pointer.y < 200){
           this.music.pause();
       }
       else{
           this.music.resume();
       }
    }

    _collectKey(player, key) {
        if ( key.visible === true ) {
            key.visible = false;
            this.keyCount ++;
            this._updateHighscore();
            this.keySound.play();
            this.camera.hud.keyStatus.updateCollectedKeyStatus();
        }
    }

    //#? warum für eine Zeile, eine extra Methode.
    _killBullet(bullet) {
        bullet.kill();
    }


    _detected() {
        this.enemies.forEach(enemy => {
            if (enemy.type === "flashlight") {
                if (enemy.detectionCounter >= 100) {
                    this._respawn();
                }
            }
        });
    }

    _respawn() {
        this.players.forEach(player => {
            player.controlsActivated = true;
        });

        this.player1.body.x = this.player1.property.x;
        this.player1.body.y = this.player1.property.y;

        this.player2.body.x = this.player2.property.x;
        this.player2.body.y = this.player2.property.y;

        this.camera.hud.LifeStatus.lifepointDown(this.playerLifepoints--);

        if (this.playerLifepoints === 0) {
            this._goToOverState("losing");

        }
    }


    /**
     * Überprüft wo der Spieler einen Gegner berührt
     * Bei Berührung ontop wird der Gegner getötet und Scores incrementiert
     * In allen anderen Fällen wird der Spieler zurückgesetzt
     */
    _killEnemy(){
        this.enemies.forEach(enemy => {
            if (enemy.visible === true) {
                if (enemy.body.touching.up) {
                    enemy.body.velocity.x = 0;
                    enemy.visible = false;
                    this.enemySound.play();
                    if(enemy.type === 'flashlight'){
                        enemy.lamp.destroy();
                    }
                    this._updateHighscore();
                }  else if (enemy.body.touching.left) {
                    this._respawn();
                } else if (enemy.body.touching.right) {
                    this._respawn();
                } else if (enemy.body.touching.down){
                    this._respawn();
                }
            }
        })
    }

    _updateHighscore(){
        this.highscore += 10;
        this.camera.scoreText.setText('Score: ' + this.highscore);
    }

    _updateTimer() {
        this.timer++;
        this.camera.timerText.setText('Time: ' + this.timer);
    }

    _bulletHit(bullet) {
        this._respawn();
        this._killBullet(bullet);
    }

    _projectileCollision() {
        this.bullets.forEach(bullet => {
            this.game.stateManager.game.physics.arcade.collide(bullet, this.layer.platforms, this._killBullet.bind(this));

            this.players.forEach(player => {
                this.game.stateManager.game.physics.arcade.collide(bullet, player,  this._bulletHit.bind(this), null, bullet);

            });

        });

        this.players.forEach(player => {
            this.game.stateManager.game.physics.arcade.overlap(this.nets, player, this._catchPlayer.bind(this));
           // this.game.stateManager.game.physics.arcade.overlap(this.rocketPacks, player, this._sendRocket.bind(this));
        });

        this.nets.forEach(net => {
            this.game.stateManager.game.physics.arcade.collide(net, this.layer.platforms, this._killBullet.bind(this));
            this.game.stateManager.game.physics.arcade.collide(net, this.players, this._killBullet.bind(this));
        });

        this.rocketPacks.forEach(pack => {
            this.game.stateManager.game.physics.arcade.collide(pack, this.layer.platforms, this._packDespawn.bind(this), null, this.layer.platforms, pack);
            this.game.stateManager.game.physics.arcade.overlap(this.players, pack, this._sendRocket.bind(this), null, this.players, pack);
        });

        this.rockets.forEach(rocket => {
            this.enemies.forEach(enemy => {
                if (enemy.type === "chopper") {
                    this.game.stateManager.game.physics.arcade.overlap(enemy, rocket, this._rocketHit.bind(this), null, enemy, rocket)
                }
            })
            this.game.stateManager.game.physics.arcade.overlap(this.enemies, rocket, )
        })
    }

    _sendRocket(players, pack) {
        pack.destroy();
        this.projectileGroup.forEach(child => {
            if (child.name === "rockets") {
                let projectile =
                    child.getFirstExists(false);
                if (projectile) {
                    projectile.reset(pack.x+8, pack.y - 8);
                    projectile.body.velocity.x = 0;
                    projectile.body.velocity.y = child.velocity;
                    projectile.body.gravity.y = this.game.gameSettings.projectileTypes[child.name].gravity;
                }
            }
        });
    }

    _rocketHit(enemy, rocket) {
        rocket.destroy();
        enemy.lives -= 1;
        enemy.roketTime = this.game.time.now + 10500;
    }

    _bossDefeat() {
        this.enemies.forEach(enemy => {
            if (enemy.type === "chopper") {
                if (enemy.lives === 0) {
                    enemy.destroy();
                    this.enemySound.play();
                    this._goToOverState("winning");
                }
            }
        })
    }

    _setEndzone() {
        let zone = this.map.objects["Endzone"][0];
        this.endzone = {x0: zone.x, x1: zone.x + zone.width, y0: zone.y, y1: zone.y + zone.height};
    }

    /**
     * Returns true, if the key was pressed once and then released again.
     */
    _keyWasPressedOnce(key) {
        if (key.isDown && !this.keyDown) {
            this.keyDown = true;
            return true;
        } else if (key.isUp) {
            this.keyDown = false;
            return false;
        }
    }

    _addKeysToListener() {        
        this.player1Input   = this.game.input.keyboard.createCursorKeys();

        this.player2Input =  {
            up:     this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            left:   this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            right:  this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            down:  this.game.input.keyboard.addKey(Phaser.Keyboard.S),
        };

        this.keyInput = {
            save:       this.game.input.keyboard.addKey(Phaser.Keyboard.K),
            load:       this.game.input.keyboard.addKey(Phaser.Keyboard.L),
            nextLevel:  this.game.input.keyboard.addKey(Phaser.Keyboard.N),
            menu:       this.game.input.keyboard.addKey(Phaser.Keyboard.ESC)
        };
    }

    _removeKeysFromListener() {
        this.game.input.keyboard.removeKey( Phaser.Keyboard.W );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.A );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.D );

        this.game.input.keyboard.removeKey( Phaser.Keyboard.K );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.L );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.N );
        this.game.input.keyboard.removeKey( Phaser.Keyboard.ESC );
    }
}