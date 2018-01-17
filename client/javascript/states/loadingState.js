"use strict";

/**
 * State for PRELOADING the Images, Spritesheets etc. that are used by all the Levels.
 * Starts the Menu State when finished loading.
 */
class LoadingState extends Phaser.State {

    preload() {
        //Level-Tiles
        this.game.load.image('sheet', 'client/assets/sheet.png', 16, 16);

        //Background-Sprites
        let url = 'client/assets/backgroundimages/';
        this.game.load.image('background1', url + 'Background1.png');
        this.game.load.image('background2', url + 'Background2.png');
        this.game.load.image('background3', url + 'Background3.png');
        this.game.load.image('background4', url + 'Background4.png');
        this.game.load.image("background", url + 'background.png');

        //Object-Sprites
        url = 'client/assets/spritesheets/';
        this.game.load.image('key', url + 'key.png');
        this.game.load.image('ladder', url + 'ladder.png');
        this.game.load.image('bullets', url + 'bullet.png');
        this.game.load.image('nets', url + 'net.png');
        this.game.load.image('rockets', url + 'rockets.png');
        this.game.load.image('rocketPacks', url + 'rocketPacks.png');
        this.game.load.spritesheet('lever', url + 'lever.png', 12, 9);
        this.game.load.spritesheet('player0', url + 'Player1.png',16,  32);
        this.game.load.spritesheet('player1', url + 'Player2.png',16,  16);
        this.game.load.spritesheet('heart', url + 'heart.png', 15, 15);
        this.game.load.spritesheet('enemy1', url + 'dog.png', 32, 32);
        this.game.load.spritesheet('enemy2', url + 'guard.png', 16, 32);
        this.game.load.spritesheet('enemy3', url + 'guard2.png', 16, 32);
        this.game.load.spritesheet('keyk', url + 'keyk.png', 32, 30);
        this.game.load.spritesheet('keyl', url + 'keyl.png', 32, 30);
        this.game.load.spritesheet('boss', url + 'chopper.png',192,  70);
        this.game.load.spritesheet('button', url + 'buttonssheet.png', 224, 70);
        this.game.load.spritesheet('inputborder', url + 'inputfelder.png', 483, 73);
        this.game.load.spritesheet('downupload', url + 'downupload.png', 300, 40);

        //Sound-Files
        url = 'client/assets/sounds/';
        this.game.load.audio('background_music', url + 'background_music.ogg');
        this.game.load.audio('keyHit', url + 'getKey.ogg');
        this.game.load.audio('enemyHit', url + 'getEnemy.ogg');
        this.game.load.audio('buttonsound', url + 'buttonsound.wav');


        // Hols general game settings, like default player names, enemy Types definitions (speed etc.)
        $.getJSON("client/assets/gameSettings.json", function (gameSettings) {
            this.game.gameSettings = gameSettings;
        }.bind(this));

        // Tilemaps of our levels, which stored e.g. under /assets/level1.json.
        url = "client/assets/levels/";
        ["level1", "level2", "level3", "level4"].forEach(function (level) {
            $.getJSON(url + level + ".json", function (json) {
                this.game.stateManager.levels[level] = json;
                this.game.load.tilemap( level , url + level + '.json', null, Phaser.Tilemap.TILED_JSON );
            }.bind(this));
        }.bind(this));
    }

    create() {

        this.game.plugins.add(Phaser.Plugin.PhaserIlluminated);
        this.game.stateManager.startGameState(MENU_STATE);
    }
}