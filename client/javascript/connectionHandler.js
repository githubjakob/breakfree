'use strict';

/**
 * The ConnectionHandler uses SocketIo to
 * - establish a connection with the backend and create a Session
 * - send/get savedGames
 * - send/get playerNames
 * - send/get highscores
 *
 * We use the unique connection Id from SocketIo to identify the session. The socketId is stored in a Cookie.
 *
 * If the backend has no MongoDb available, we store/get everything with local variables.
 *
 */
class ConnectionHandler {
    constructor(game, socketIO) {
    	this.game = game;
    	this.socket = socketIO;
		this.isMongoDBavailable = false;
		this.socketId = undefined;
    }

    /**
     * Establishes the first connection to the backend.
     *
     * We use the unique connection Id from SocketIo to identify the session. The socketId is stored in a Cookie.
     *
     * The backend creates a new Session Entry in the Database, or updates a previous Session.
     *
     * If the backend can't connect to the MongoDb, we set isMongoDbAvailable to false and later store/load saved Games locally.
     *
     */
    sendConnectionRequest() {
    	this.socket.emit('getDBStatus', function(data) {
	        Logger.info('Client ID: ' + data.socketid + ', MongoDB Status: ' + data.mongodbstatus);
	        this.isMongoDBavailable = data.mongodbstatus;
	        this.socketId = data.socketid;

	        if (this.isMongoDBavailable) {
	            let myCookie = document.cookie;
	            if (myCookie !== '' ) {
	                Logger.info('Welcome back. ' + myCookie);
	                this.socket.emit( 'updateSessionId', [myCookie, this.socketId]);
	                document.cookie = this.socketId;
	            } else {
	                document.cookie = this.socketId;
	            }
	        }
	    }.bind(this));
    }

    /**
     * Stores a savedGame.
     *
     * Stores a savedGame by sending it to the backend, or - if isMongoDbAvailable is false - stores it in a
     * local Array in the StateManager.
     *
     * @param savedGame - the savedGame we want to store.
     */
    sendSavegame(savedGame) {
	    if (this.isMongoDBavailable) {
	        this.socket.emit('SaveGame', savedGame);
	    } else {
	        this.game.stateManager.savedGame.push( savedGame );
	    }
	    Logger.debug("Game saved: " + JSON.stringify( savedGame ));
    }

    /**
     * Gets the latest savedGame and loads it.
     *
     * Gets the latest savedGame and loads it either from the Backend, or - if isMongoDbAvailable is false - from a local Array
     * in the StateManager.
     */
    requestLastSavegame() {
        if (!this.isMongoDBavailable) {
            this._loadLocalSavedGame();
            return;
        }

        this.socket.emit('getLatestSavedGame', function (response) {
            if (response !== null) {
                this.game.stateManager.loadSavedGame(response);
            } else {
                Logger.debug('No Savegame.');
            }
        }.bind(this));
    }

    _loadLocalSavedGame() {
        let localSavedGames = this.game.stateManager.savedGame;
        if ( localSavedGames === undefined || localSavedGames.length === 0 ) {
            Logger.info("No Game saved locally.");
            return;
        }
        let lastLocalSavedGame = localSavedGames[localSavedGames.length-1];
        Logger.debug( "Loading local Saved Game " + JSON.stringify(lastLocalSavedGame ));
        this.game.stateManager.loadSavedGame(lastLocalSavedGame);
    }

    /**
     * Gets the an Array of all savedGame and starts the ListSavedGames State.
     *
     * Gets an Array of all savedGame either from the Backend, or - if isMongoDbAvailable is false - from a local Array
     * in the StateManager.
     */
    requestAllSavegame() {
        if (this.isMongoDBavailable) {
            this.socket.emit('getAllSaveGames', function( data ) {
        		this.game.stateManager.startGameState( LISTSAVEGAMES_STATE, data );  
        	}.bind(this)); 
        } else {
            this.game.stateManager.startGameState( LISTSAVEGAMES_STATE, this.game.stateManager.savedGame );
        }
    }

    /**
     * Sends the playerNames to the backend and stores it there.
     *
     * @param player1Name to be stored in the backend
     * @param player2Name to be stored in the backend
     */
    sendPlayerNames( player1Name, player2Name ) {
        if ( this.isMongoDBavailable  ) {
    		this.socket.emit( 'PlayerNames', { 'Player1': player1Name, 'Player2': player2Name });
    	}
    }

    /**
     * Gets the playerNames from the backend.
     */
    requestPlayerNames() {
    	if ( this.isMongoDBavailable ) {
            this.socket.emit( 'getPlayerNames', function(data) {
                this.game.gameSettings.playerDefaultNames["player" + 0] = data.name1;
                this.game.gameSettings.playerDefaultNames["player" + 1] = data.name2;
            }.bind(this));
        }
        this.game.stateManager.startGameState( NAMEINPUT_STATE );
    }

    /**
     * Gets the Highscore from the backend.
     */
    requestHighscore() {
        if ( this.isMongoDBavailable ) {
            this.socket.emit( 'getHighscore', function(data) {
                this.game.stateManager.startGameState( HIGHSCORE_STATE, data );
            }.bind(this));
        }
    }

    /**
     * Stores the highscore for the level in the backend.
     *
     * @param highscore to be stored
     * @param level the respective level
     */
    sendHighscore( highscore, level ) {
        this.socket.emit( 'newHighscore', { 'highscore': highscore, 'level': level } );
    }
}
