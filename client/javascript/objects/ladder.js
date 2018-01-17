'use strict';

class Ladder extends Phaser.Sprite {
    constructor(game, ladderposition){
        super(game, ladderposition.x, ladderposition.y, "ladder");

        game.physics.arcade.enable(this);
        this.enableBody = true;
        this.body.allowGravity = false;
        this.body.collideWorldBounds = true;
        this.body.immovable = true;
    }
}