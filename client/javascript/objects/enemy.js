"use strict";



class Enemy extends Phaser.Sprite {
    constructor(game, JSONdata) {
        Logger.debug("Creating Enemy of Type " + JSONdata.type);
        let sprite = game.gameSettings.enemyTypes[JSONdata.type].sprite;
        super(game, JSONdata.x, JSONdata.y, sprite);

        game.physics.arcade.enable(this);

        this.type       = JSONdata.type;
        this.property   = game.gameSettings.enemyTypes[JSONdata.type];
        this.range      = this.property.range;
        this.vision     = this.property.vision;

        this.body.gravity.y             = this.property.gravity;
        this.body.collideWorldBounds    = true;
        this.behaviour                  = this.property.behaviour;

        this.frame              = this.property.frame;
        this.body.velocity.x    = this.property.velocityX;

        this.startPosition      = {x: JSONdata.x, y: JSONdata.y};
        this.velocity = {defaultX: this.property.velocityX, attackX: this.property.attackVelocityX};

        this.animations.add('left', [1, 2, 3, 4, 5, 6, 7, 8], 5, true);
        this.animations.add('right', [10, 11, 12, 13, 14, 15, 16, 17], 5, true);
        if (this.type === 'dog' || this.type === 'chopper') {
            this.animations.add('idle', [0], 1, false);
        }
        else {
            this.animations.add('idle', [0, 1, 11, 0, 0, 0, 0], 1, true);
        }

        this.visible = JSONdata.visible;
        this.anchor.setTo(0.5, 0.5);
        this.shootTime = 0;

        this.detectionCounter = 0;

        this.AI = new AI(this.game);

        switch (this.type) {
            case "chopper":
                this.inBossfight = false;
                this.projectile = this.property.projectile;
                this.lives = 3;
                this.spawnTime = 0;
                this.rocketTime = 5000;
                break;

            case "flashlight":
                //Lampe aus Illuminated.js.
                this.lamp = game.add.illuminated.lamp(this.body.position.x + 8, this.body.position.y + 12, {
                    distance: 70,
                    diffuse: 1,
                    color: 'rgba(250,220,150,0.5)',
                    radius: 1,
                    samples: 1,
                    angle: 2,
                    roughness: 0
                });
                break;

            case "shooter":
                this.projectile = this.property.projectile;
                break;

            default:
        }
    }

    /** Updatet die Gegneranimationen und das Verhalten.
     *
     * @param players
     * @param enemy
     * @param layer
     * @param bullet
     */

    updateEnemy(players, enemy, layer, projectiles, enemies) {

        this._enemyAnimations(enemy);
        this._updateLamp(enemy);

        //Es werden Verbindungsinien zwischen den Gegnern und den Spielern erstellt, die Kollision dieser Linien mit Tiles des PlatformLayer wird ueberprueft.
        let ray1 = new Phaser.Line(enemy.body.position.x, enemy.body.position.y + 2, players[0].body.position.x, players[0].body.position.y);
        let ray2 = new Phaser.Line(enemy.body.position.x, enemy.body.position.y +2, players[1].body.position.x, players[1].body.position.y);

        //Der dem Gegner nächste sichtbare Spieler wird ermittelt und als String gespeichert.
        let closest = this._getClosestPlayer(ray1, ray2, layer, enemy, players[0], players[1]);

        this._inBossfight(enemy, players);

        //Je nach Typ wird das Verhalten der Gegner berechnet, wenn Sie einen Spieler sehen.
        switch (closest) {

            case "player1":
                enemy.AI.triggered(enemy, players[0], ray1, projectiles, enemies);
                break;

            case "player2":
                enemy.AI.triggered(enemy, players[1], ray2, projectiles, enemies);
                break;

        //Ist kein Spieler in Sicht, so verhalten sich die Gegner entsprechend ihres vorgegebenn Patterns.
            default:
                enemy.AI.idle(enemy);
        }

    }

    /** Für die gegebene Linie wird überprüft, ob sie ein Tile des gegebenen Layers schneidet.
     *
     * @param ray
     * @param layer
     * @returns {boolean}
     * @private
     */

    _getWallIntersection(ray, layer) {
        this.tileHits = layer.platforms.getRayCastTiles(ray, 4, true, false);
        if (this.tileHits.length > 0) {
            return true;
        }
        return false;
    }

    /** Berechnet die Distanz zweier Objekte in X-Richtung.
     *
     * @param obj1
     * @param obj2
     * @returns {number}
     * @private
     */

    _dist(obj1, obj2) {
        return (obj1.body.position.x - obj2.body.position.x);
    }

    /** Gibt aus, ob ein Spieler von einem Gegner gesehen wird.
     *
     * @param ray
     * @param layer
     * @returns {boolean}
     * @private
     */

    _isInSight (ray, layer, enemy) {
        return ray.length < enemy.vision && !(this._getWallIntersection(ray, layer));
    }

    /** Gibt true aus, wenn Objekt2 naeher am Objekt1 ist als Objekt3. Gibt auch true aus, wenn Objekt3 von Objekt1 gar nicht gesehen wird.
     *
     * @param ray
     * @param layer
     * @param obj1
     * @param obj2
     * @param obj3
     * @returns {boolean}
     * @private
     */

    _isCloser(ray, layer, obj1, obj2, obj3) {
        if (this._getWallIntersection(ray, layer) || ray.length >= obj1.vision) {
            return true;
        }
        else {
        return Math.abs(this._dist(obj2, obj1)) < Math.abs(this._dist(obj3, obj1));
    }}

    /** Ermittelt den zum Gegner nächsten Spieler, der gesehen wird. Gibt einen String mit diesem Spieler zurück.
     *
     * @param ray1
     * @param ray2
     * @param layer
     * @param obj1
     * @param obj2
     * @param obj3
     * @returns {*}
     * @private
     */

    _getClosestPlayer(ray1, ray2, layer, obj1, obj2, obj3) {
        if (this._isInSight(ray1, layer, obj1) && this._isCloser(ray2, layer, obj1, obj2, obj3)) {
            return "player1";
        }
        else if (this._isInSight(ray2, layer, obj1) && this._isCloser(ray1, layer, obj1, obj3, obj2)) {
            return "player2";
        }
        else {
            return "nis";
        }
    }

    /** Kontrolliert die Animationen der Gegner.
     *
     * @param enemy
     * @private
     */

    _enemyAnimations (enemy) {
        if(enemy.type === "chopper" && enemy.body.velocity.x > 0){
            enemy.frame = 1;
        }
        else if(enemy.type === "chopper" && enemy.body.velocity.x < 0){
            enemy.frame = 0;
        }
        // Animationen für Gegner
        else if (enemy.body.velocity.x > 0 ){
            enemy.animations.play('right');
        } else if(enemy.body.velocity.x < 0 ){
            enemy.animations.play('left');
        } else {
            enemy.animations.play('idle');
        }
    }

    /** Bewegt die Taschenlampe des Gegners mit ihm.
     *
     * @param enemy
     * @private
     */

    _updateLamp(enemy) {
        if (enemy.type === "flashlight") {
            enemy.lamp.position.x = enemy.body.position.x;
            enemy.lamp.getLamp().color = 'rgba(250,' + String(220 - enemy.detectionCounter * 2,2) + ',' + String(150- 1,5*enemy.detectionCounter) + ',0.5)';
            enemy.lamp.refresh();
        }

    }

    /** Stellt fest, ob die Spieler sich im Bosskampf befinden.
     *
     * @param enemy
     * @param players
     * @returns {boolean}
     * @private
     */

    _inBossfight(enemy, players) {
        if (enemy.type === "chopper") {
            if (enemy.inBossfight) {
                return enemy.inBossfight;
            }
            else if (enemy.startPosition.x <= players[0].body.position.x || enemy.startPosition.x <= players[1].body.position.x) {
                enemy.inBossfight = true;
                enemy.body.velocity.x = 100;
                enemy.body.velocity.y = 50;
                return true;
            }
            else {
                enemy.rocketTime = this.game.time.now + 15000;
                return false;
            }
        }
    }
}

