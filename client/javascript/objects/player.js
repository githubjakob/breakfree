'use strict';

const ANIMATION_LEFT = "animationLeft",
    ANIMATION_RIGHT = "animationRight";

let id = 0;
class Player extends Phaser.Sprite {
    constructor(game, property) {

        super(game, property.x, property.y, "player" + id );

        this.property = property;

        this.game.physics.arcade.enable(this);
        this.body.collideWorldBounds = true;
        this.body.checkCollision.down = true;
        this.body.immovable = true;

        this.animations.add(ANIMATION_LEFT, [7,8,9,10] , 10, true);
        this.animations.add(ANIMATION_RIGHT, [1,2,3,4] , 10, true);

        this.name = this.game.gameSettings.playerDefaultNames["player" + id];

        this.controlsActivated = true;
        this.goLeft = false;
        this.goRight = false;
        this.goUp = false;
        this.goDown = false;
        this.highJump = false;
        this.onLadder = false;

        id = (++id)%2;
    }

    move(player, levelstate) {
            if (this._playersAreOutOfCanvas(levelstate)) {
                if (levelstate.players[0].body.x > levelstate.players[1].body.x) {
                    levelstate.players[1].body.velocity.x = 45;
                    levelstate.players[0].body.velocity.x = -45;
                }
                if (levelstate.players[0].body.x < levelstate.players[1].body.x) {
                    levelstate.players[1].body.velocity.x = -45;
                    levelstate.players[0].body.velocity.x = 45;
                }
                return;
            }
            if (player.controlsActivated) {
                if (player.goLeft) {
                    player.body.velocity.x = -150;
                    player.animations.play(ANIMATION_LEFT);

                } else if (player.goRight) {
                    player.body.velocity.x = 150;
                    player.animations.play(ANIMATION_RIGHT);

                } else {
                    player.body.velocity.x = 0;
                    player.frame = 0;
                }

                if ((player.goUp  && this.body.onFloor()) || (player.onLadder && player.goUp)) {
                    player.body.velocity.y = -300;
                    player.goUp = false;
                }

                if (player.highJump && this.game.stateManager.game.physics.arcade.collide(player, levelstate.player2) && player != levelstate.player2) {
                    player.body.velocity.y = -375;
                }

            this._modGravity();
            }
    }

    _modGravity() {
        if(this.onLadder && !this.goDown) {
            this.body.gravity.y = 0;
            if (this.body.velocity.y > 0 && this.onLadder) {
                this.body.velocity.y = 0;
            }else {
                if (this.body.velocity.y < 0 && this.onLadder) {
                    this.body.velocity.y += 50;
                }
            }
        }else {
            this.body.gravity.y = 700;
        }
    }

    _playersAreOutOfCanvas(game) {
        let playersDistance = Math.abs(game.player1.body.x - game.player2.body.x + (game.player1.body.width + game.player2.body.width)/2 );
        return playersDistance > this.game.width;
    }

}
