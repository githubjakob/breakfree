'use strict';

class TutorialState extends Phaser.State {
    constructor() {
        super();
    }

    init(page) {
        this.page = page
    }

    /** Creates images and descriptions base on given page. Gives you buttons to switch between pages and to go back to the main menu.
     *
     */

    create() {
        this.game.stage.backgroundColor = '#666';
        this.buttonsound    = this.game.add.audio( 'buttonsound', 0.1, false );
        let button;

        button = this.game.add.button(100, 100, 'button', this._backToMainMenu, this, 7, 6);
        button.onInputOver.add(this._playSound.bind(this));

        switch(this.page) {
            case 2:
                button = this.game.add.button( 400, 500, 'button', this._nextPage, this, 17, 16 );
                button.onInputOver.add(this._playSound.bind(this));
                button = this.game.add.button( 100, 500, 'button', this._previousPage, this, 19, 18 );
                button.onInputOver.add(this._playSound.bind(this));

                this.game.add.sprite(150, 210, 'lever');
                this.game.add.text(200, 200, "Lever", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 200, "Use the levers to activate the various ladders\nacross the prison. But be careful: once you\nleave the lever, the ladder will disappear.",  { font: "22px Arial", fill: "#000000", align: "left" })

                this.game.add.sprite(150, 310, 'heart', 1);
                this.game.add.text(200, 305, "Heart", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 305, "The hearts in the top right of the screen\ndisplay the number of tries you have\nin each level. If you lose all your lives,\nyou have to replay the whole game!",  { font: "22px Arial", fill: "#000000", align: "left" })

                break;

            case 3:
                button = this.game.add.button( 400, 500, 'button', this._nextPage, this, 17, 16 );
                button.onInputOver.add(this._playSound.bind(this));
                button = this.game.add.button( 100, 500, 'button', this._previousPage, this, 19, 18 );
                button.onInputOver.add(this._playSound.bind(this));


                this.game.add.sprite(150, 195, 'enemy2');
                this.game.add.text(200, 200, "Guard", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 200, "An ordinary prison guard. Tries to beat you\nup when you get close to him.",  { font: "22px Arial", fill: "#000000", align: "left" })

                this.game.add.sprite(150, 270, 'enemy1');
                this.game.add.text(200, 270, "Dog", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 270, "A lovely prison dog. Usually stays at his\nfavourite place, but will charge at and bite\nyou when you get in sight.",  { font: "22px Arial", fill: "#000000", align: "left" })


                this.game.add.sprite(150, 375, 'enemy3');
                this.game.add.text(200, 375, "Guard\n(with lamp)", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 375, "Only deployed in the gloomy areas of the\nprison. They take a while to spot you,\nbut once they do, there is no escape!\nTry to sneak up on them from behind.",  { font: "22px Arial", fill: "#000000", align: "left" })
                this.game.add.illuminated.lamp(158, 387,
                    {distance: 70,
                     diffuse: 1,
                     color: 'rgba(250,220,150,0.5)',
                     radius: 1,
                     samples: 1,
                     angle: 2,
                     roughness: 0
                    });
                break;

            case 4:
                button = this.game.add.button( 400, 500, 'button', this._nextPage, this, 17, 16 );
                button.onInputOver.add(this._playSound.bind(this));
                button = this.game.add.button( 100, 500, 'button', this._previousPage, this, 19, 18 );
                button.onInputOver.add(this._playSound.bind(this));

                this.game.add.sprite(150, 200, 'enemy3');
                this.game.add.text(200, 200, "Guard\n(with taser)", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 200, "These guys are no fun.\nThey'll shoot you on sight!",  { font: "22px Arial", fill: "#000000", align: "left" })

                this.game.add.sprite(100, 360, 'boss');
                this.game.add.text(200, 280, "Chopper\n(Boss)", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 280, "The chopper of the prison chief. It spawns\nlots of guards, who are trying to catch you.\nLater, it shoots nets that hold you down for\nsome time. Call your buddy to free you.\nOccasionally drops a pack of rockets, which\ncan be used against him.\nOnce you bring him down, you are free!",  { font: "22px Arial", fill: "#000000", align: "left" })


                break;

            case 5:
                button = this.game.add.button( 100, 500, 'button', this._previousPage, this, 19, 18 );
                button.onInputOver.add(this._playSound.bind(this));

                this.game.add.sprite(150, 200, 'keyk');
                this.game.add.text(200, 200, "Save", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 200, "Press the 'K' Key\nto save a Game",  { font: "22px Arial", fill: "#000000", align: "left" });

                this.game.add.sprite(150, 280, 'keyl');
                this.game.add.text(200, 280, "Load", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 280, "Press the 'L' Key to load\nthe latest SavedGame",  { font: "22px Arial", fill: "#000000", align: "left" });
                break;

            default:
                button = this.game.add.button( 400, 500, 'button', this._nextPage, this, 17, 16 );
                button.onInputOver.add(this._playSound.bind(this));

                this.game.add.sprite(150, 200, 'player0');
                this.game.add.text(200, 200, "Player 1", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 200, "The big player will do a higher jump\nwhen jumping off the small player",  { font: "22px Arial", fill: "#000000", align: "left" })

                this.game.add.sprite(150, 275, 'player1');
                this.game.add.text(200, 270, "Player 2", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 270, "The small player can fit through vents\nand other tight areas",  { font: "22px Arial", fill: "#000000", align: "left" })


                this.game.add.sprite(150, 345, 'key');
                this.game.add.text(200, 340, "Key", { font: "22px Arial", fill: "#000000", align: "left" });
                this.game.add.text(350, 340, "You need the keys to open the prison doors.\nWhen reaching the endzone without the\nproper amount of keys, the indicator on\nthe HUD will turn red",  { font: "22px Arial", fill: "#000000", align: "left" })

        }
    }

    /** Starts the menustate.
     *
     * @private
     */

    _backToMainMenu() {
        this.game.stateManager.startGameState(MENU_STATE);
    }

    /** Opens the next page in the tutorial.
     *
     * @private
     */

    _nextPage() {
        this.game.stateManager.startGameState( TUTORIAL_STATE, this.page + 1);
    }

    /** Opens the previous page in the turotial.
     *
     * @private
     */

    _previousPage() {
        this.game.stateManager.startGameState( TUTORIAL_STATE, this.page - 1);
    }


    _playSound() {
        this.buttonsound.play();
    }

}