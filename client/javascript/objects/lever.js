'use strict';

let jo = 0;
class Lever extends Phaser.Sprite {
    constructor(game, leverposition){
        super(game,leverposition.x, leverposition.y, "lever");

        game.physics.arcade.enable(this);
        this.enableBody = true;
        this.body.immovable = true;
        this.body.gravity.y = 300;
        this.body.collideWorldBounds = true;

        this.isOn = false;
        this.frame = 1;

        jo = ++jo;

    }


}