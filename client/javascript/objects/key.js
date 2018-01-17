'use strict';

class Key extends Phaser.Sprite {
    constructor(game, keyObject) {
        super(game, keyObject.x, keyObject.y, "key");

        this.game.physics.arcade.enable(this);
        this.body.gravity.y = 700;
        
        this.visible = keyObject.visible;
    }
}