"use strict";

class AI {
    constructor(game) {
        this.game = game;
    }

    /** Bestimmt das Verhalten der Gegner, sobald ein Spieler in Sicht ist.
     *
     * @param enemy
     * @param player
     * @param ray
     * @param projectiles
     * @param enemies
     */

    triggered(enemy, player, ray, projectiles, enemies) {
        if (!enemy.visible) {
            return; // ausgeschaltete Gegner werden nur invisible gestellt und sollen dann nicht mehr getriggered werden
        }

        switch (enemy.type) {
            case "flashlight":
                //detectionCounter wird  im levelstate unter _detected abgefragt. Verlassen die Spieler das Sichtfeld, wird die Variable sofort auf 0 gesetzt.
                if (Math.sign(enemy.body.velocity.x) === Math.sign(enemy.AI.AIdist(player, enemy))) {
                    enemy.detectionCounter++;
                }
                else if (enemy.body.velocity.x === 0) {
                    enemy.detectionCounter++;
                }
                else {
                    enemy.detectionCounter = 0;
                }
                enemy.AI.patrolBehaviour(enemy);
                break;

            case "dog":
                //Der Gegner wird schnelle je näher er dem Spieler ist. Befindet sich der Spieler direkt unter ihm, so läuft er schnell hin und her.
                if (ray.length < enemy.range/2) {
                    enemy.body.velocity.x = Math.sign(enemy.body.velocity.x) * (enemy.velocity.attackX + 50);
                    if (Math.abs(player.body.position.x - enemy.body.position.x) > 35) {
                        enemy.body.velocity.x = Math.sign(player.body.position.x - enemy.body.position.x) * (enemy.velocity.attackX + 50);
                    }
                }
                else {
                    enemy.body.velocity.x = Math.sign(enemy.AI.AIdist(player, enemy)) * enemy.velocity.attackX;
                }
                break;

            case "shooter":
                enemy.AI.shoot(enemy, projectiles, ray, 1000);
                break;

            case "chopper":
                //Es gibt drei Phasen im Bossfight, die sich duch Frequenz der Projektile, Art der Projektile und Bewegunggeschwindigkeit des Bosses unterscheiden.
                if (enemy.inBossfight) {
                    switch (String(enemy.lives)) {
                        case "3":
                            enemy.AI.bossBehaviour(enemy, enemy.velocity.defaultX);
                            enemy.AI.spawnGuard(enemy, enemies, 3500);
                            enemy.AI.spawnRocketPack(enemy, projectiles, 10500);
                            break;

                        case "2":
                            enemy.AI.bossBehaviour(enemy, enemy.velocity.defaultX);
                            enemy.AI.spawnGuard(enemy, enemies, 2900);
                            enemy.AI.shoot(enemy, projectiles, ray, 4460);
                            enemy.AI.spawnRocketPack(enemy, projectiles, 10500);
                            break;

                        case "1":
                            enemy.AI.bossBehaviour(enemy, enemy.velocity.attackX);
                            enemy.AI.spawnGuard(enemy, enemies, 2700);
                            enemy.AI.shoot(enemy, projectiles, ray, 3700);
                            enemy.AI.spawnRocketPack(enemy, projectiles, 10500);
                            break;

                        default:
                    }
                }
                else {
                    enemy.body.velocity.x = 0;
                }
                break;

            default:
                //Alle nicht explizit genannten Gegner bewegen sich auf den Spieler zu.
                enemy.body.velocity.x = Math.sign(enemy.AI.AIdist(player, enemy)) * enemy.velocity.attackX;

        }
    }

    /** Bestimmt das Verhalten der Gegner, wenn kein Spieler in Sicht ist.
     *
      * @param enemy
     */

    idle (enemy) {

        switch (enemy.behaviour) {

            case "stay":
                enemy.AI.stayBehaviour(enemy);
                break;

            case "patrol":
                enemy.AI.patrolBehaviour(enemy);
                break;

            default:
                enemy.body.velocity.x = 0;

        }

        if (enemy.type === "flashlight") {
            enemy.detectionCounter = 0;
        }
    }

    /** Gegner bleiben auf eine bestimmten Position und kehren immer wieder dorthin zurück.
     *
     * @param enemy
     */

    stayBehaviour (enemy) {
        enemy.body.velocity.x = Math.floor(enemy.startPosition.x - enemy.body.position.x);
    }

    /** Gegner patrouillieren um eine Punkt herum. Dabei bleiben Sie manchmal stehen und sehen sich um (Chance etwa 1/2000 pro Frame).
     *
     * @param enemy
     */

    patrolBehaviour(enemy) {
        if (Math.abs(enemy.startPosition.x - enemy.body.position.x) > enemy.range) {
            enemy.body.velocity.x = Math.sign(enemy.startPosition.x - enemy.body.position.x) * enemy.velocity.defaultX;
        }
        let rand1 = Math.random();
        let rand2 = Math.random();
        if (rand1 > 0.99 && rand2 < 0.05) {
            let tempV = enemy.body.velocity.x;
            enemy.body.velocity.x = 0;
            if (tempV === 0) {
                tempV = enemy.velocity.defaultX;
            }
            this.game.time.events.add(3000, function () {
                if (enemy.visible === true) {
                    enemy.body.velocity.x = tempV;
                }
            }, this);
        };
    }

    /** BEstimmt das Verhalten des Bosses in x- und y-Richtung.
     *
      * @param enemy
     */

    bossBehaviour (enemy, givenVelocity) {
        if (Math.abs(enemy.startPosition.x - enemy.body.position.x) > enemy.range) {
            enemy.body.velocity.x = Math.sign(enemy.startPosition.x - enemy.body.position.x) * givenVelocity;
        }
        else if (Math.abs(enemy.body.velocity.x) >= 0) {
            enemy.body.velocity.x = Math.sign(enemy.body.velocity.x) * givenVelocity + 0.1;
        }
        if (Math.abs(enemy.startPosition.y - enemy.body.position.y) > 30) {
            enemy.body.velocity.y = Math.sign(enemy.startPosition.y - enemy.body.position.y) * 40/(1+(Math.abs(enemy.startPosition.y - enemy.body.position.y)));
        }
        else {
            enemy.body.velocity.y = Math.sign(enemy.body.velocity.y) * Math.log(1.1+(Math.abs(30 - (Math.abs(enemy.startPosition.y - enemy.body.position.y)))))* 15;
        }
    }

    /** Lässt den Gegner ein gegebenes Projektil abschießen.
     *
     * @param enemy
     * @param projectiles
     * @param ray
     * @param frequency
     */

    shoot(enemy, projectiles, ray, frequency) {
        if(this.game.time.now > enemy.shootTime){
            projectiles.forEach(child => {
                if (child.name === enemy.projectile) {
                    let projectile =
                        child.getFirstExists(false);
                    if (projectile) {
                        projectile.reset(enemy.x, enemy.y - 10);
                        let directionX = (ray.end.x - (ray.start.x + enemy.width / 2)) / (ray.length);
                        let directionY = (ray.end.y - (ray.start.y + enemy.height / 2)) / (ray.length);
                        projectile.angle = ray.angle;
                        projectile.body.velocity.x = directionX * child.velocity;
                        projectile.body.velocity.y = directionY * child.velocity;
                        projectile.body.gravity.y = this.game.gameSettings.projectileTypes[child.name].gravity;
                        enemy.shootTime = this.game.time.now + frequency;
                    }
                }
            });
        }
    }

    /** Erschafft einen Guard an der Position des gegebenen Gegners.
     *
     * @param enemy
     * @param enemies
     * @param frequency
     */

    spawnGuard(enemy, enemies, frequency) {
        if (this.game.time.now > enemy.spawnTime) {
            let spawnedGuard = new Enemy(this.game, {x: enemy.x, y: enemy.y, type: "chopperGuard"});
            spawnedGuard.visible = true;
            enemies.add(spawnedGuard);
            enemy.spawnTime = this.game.time.now + frequency;
        }
    }

    /** Erschafft ein RocketPack an der Position des gegebenen Gegners. Grundsätzlich ähnlich zur 'shoot'-Funktion, verwendet aber keine Phaser.line zur Richtungsberechnung.
     *
     * @param enemy
     * @param projectiles
     * @param frequency
     */

    spawnRocketPack(enemy, projectiles, frequency) {
        if (this.game.time.now > enemy.rocketTime) {
            projectiles.forEach(child => {
                if (child.name === "rocketPacks") {
                    let projectile =
                        child.getFirstExists(false);
                    if (projectile) {
                        projectile.reset(enemy.x, enemy.y - 10);
                        projectile.body.velocity.x = child.velocity;
                        projectile.body.velocity.y = child.velocity;
                        projectile.body.gravity.y = this.game.gameSettings.projectileTypes[child.name].gravity;
                        enemy.rocketTime = this.game.time.now + frequency;
                    }
                }
            });
        }
    }

    /** Distanzberechnung.
     *
     * @param obj1
     * @param obj2
     * @returns {number}
     * @constructor
     */

    AIdist(obj1, obj2) {
        return (obj1.body.position.x - obj2.body.position.x);
    }


}