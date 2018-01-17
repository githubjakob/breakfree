'use strict';

class Bullet extends Phaser.Sprite {
    constructor(game) {
        super(game);

      game.physics.arcade.enable(this);
    }
}/**
 * Created by schorsch on 19.06.2017.
 */
