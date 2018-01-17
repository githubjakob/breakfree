"use strict";

class Game extends Phaser.Game {
    constructor() {
        // create the Phaser.Game
        super(800, 600, Phaser.CANVAS, 'phaserCanvas');

        this.stateManager = new StateManager(this);
        this.connectionHandler = new ConnectionHandler(this, socketio);
    }

    start() {
        this.connectionHandler.sendConnectionRequest();
        this.stateManager.startGameState(LOADING_STATE);
    }
}

/** Set up Logger */
Logger.useDefaults();
Logger.setLevel(Logger.INFO);

/** SocketIo needs to be declared as a global variable because we use it also for the chat in the {@link Chat} */
let socketio = io();

/** Main Entrypoint for the Game */
let game = new Game();
game.start();