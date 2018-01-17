'use strict'

const winston = require("winston");

const logger = new (winston.Logger)({
                  	transports: [
                	    new (winston.transports.Console)({ 
                	    	level: 'debug',
                	        handleExceptions: true,
                	        json: false,
                	        colorize: true 
                	    })
                  	]
                });

class ConnectionHandlerServer {
	constructor( server, mongoose, mongodburl, collection ) {

		//Datenbankstatus fuer den Client.
	    this.mongoDBStatus = true;
        this.defaultUsernames = ['Tim', 'Tom'];

	    //mongoose verbindet sich mit der Datenbank
	    mongoose.connect( mongodburl, function ( err, res ) {
	          if (err) {
	            logger.error ('ERROR connecting to: ' + mongodburl + '. ' + err);
	            this.mongoDBStatus = false;
	          } else {
	            logger.debug ('Succeeded connected to: ' + mongodburl);
	          }
	    }.bind( this ));

	    // Definiert das Collection-Eintrag(Objekt)-Schema fuer den Datenbank Objekt Handler.
	    let sessionObject = new mongoose.Schema({
	        gameID: String,
	        player1Name: String,
	        player2Name: String,
	        savedGames: [],
	        highscore_list: []
	    });

	    /**
	     *   Mongoose Datenbank Objekt Handler.
	     */
	    this.Session = mongoose.model( collection , sessionObject);

	    // Socket.IO interface
	    let io = require('socket.io')(server,{});

	    this.ClientCounter = 0;
	    /**
	     *    Socket.IO Datenaustausch zwischen Client und Server.
	     */
	    io.sockets.on('connection', function( socket ) {
	        
	        this.ClientCounter++;

	        if ( this.mongoDBStatus === true ) {
	            this._createSessionEntry(socket, this.defaultUsernames[0], this.defaultUsernames[1]);
	        }

	        socket.on('getNumberConnectedClients', function( callback ) {
	            callback( this.ClientCounter );
	        }.bind(this)); 

	        socket.broadcast.emit('updateClientNumber', this.ClientCounter);

	        socket.on('getDBStatus', function( callback ) {
	            callback( {'socketid': socket.id, 'mongodbstatus': this.mongoDBStatus} );
	        }.bind(this)); 

	        socket.on('updateSessionId', function( data ) {
	            this._setNewClientId( data );
	        }.bind(this));           

	        socket.on('PlayerNames', function( data ) {
	            this._updatePlayerNames( socket, data.Player1, data.Player2 );
	        }.bind(this));

	        socket.on('setPassword', function( data ) {
	            this._updatePlayerNames( socket, data );
	        }.bind(this));

	        socket.on('SaveGame', function( data ) {
	            this._saveGameState( socket, data );
	        }.bind(this));

	        socket.on('getLatestSavedGame', function(callback ) {
                this._getSession( socket, this._getLastSavegame , callback );
	        }.bind(this));

	        socket.on('getAllSaveGames', function( callback ) {
	            this._getSession( socket, this._getAllSavegame, callback );
	        }.bind(this));

	        socket.on('getPlayerNames', function( callback) {
                this._getSession( socket, this._getNames, callback );
	        }.bind(this));

            socket.on('getHighscore', function( callback ) {
                this._getSession( socket, this._getHighScore, callback, this._getGlobalHighscore.bind( this ) );
            }.bind(this));

	        socket.on('distributeText', function( text ) {
	            socket.broadcast.emit('displayText', text);
	        }.bind(this));

            socket.on('newHighscore', function( data ) {
                this._updateHighscore( socket, data.highscore, data.level );
            }.bind(this));

	        socket.on('disconnect', function() {
	            this.ClientCounter--;
	            socket.broadcast.emit('updateClientNumber', this.ClientCounter);
	            logger.info( 'Client disconnected            => ' + socket.id );
	        }.bind(this));
	    }.bind(this));
	}

	/**
     *   updates the old session instance id to the new instance id of socket.io 
     */
    _setNewClientId(data) {
        this.Session.findOneAndUpdate( { 'gameID': data[0] }, { $set:{'gameID': data[1]} }, {safe: true, upsert: true, new : true}, function(err, doc) {
            if(err){
                logger.debug ( 'error while updating socket id' );
                logger.debug ( err );
            } else {
                logger.info ( 'Client reconnected             => ' + data[0] + '; new ID: ' + data[1] );
            }
        });
    }

    /**
     *   saves session instance
     *   Erzeugt Datenbankeintrag für neue Clientverbindung. 
     */
    _createSessionEntry( socket, player1_name, player2_name ) {
        let highscoreToken = [  {'highscore': 0, 'timestamp': new Date, 'level': 1},
                                {'highscore': 0, 'timestamp': new Date, 'level': 2},
                                {'highscore': 0, 'timestamp': new Date, 'level': 3},
                                {'highscore': 0, 'timestamp': new Date, 'level': 4}
                            ]; 

        let newSession = new this.Session ({
          'gameID': socket.id,
          'player1Name': player1_name,
          'player2Name': player2_name,
          'savedGames': [],
          'highscore_list': highscoreToken
        });

        newSession.save(function ( err ) {
            if ( err ) {
                logger.error ( 'Error on save!' );
            } else {
                logger.info ( 'Client connected               => ' + socket.id );
            }
        });
    }

    /**
     *   updates playernames 
     *   aktualisiert die gespeicherten Namen auf die, die vom Client neu bearbeiteten.
     */
    _updatePlayerNames( socket, player1_name, player2_name ) {
        this.Session.findOneAndUpdate( 
            { 'gameID': socket.id }, 
            { $set: { 'player1Name': player1_name, 'player2Name': player2_name } }, 
            function(err, doc) {
                if( err ){
                    logger.error ( "Something wrong when updating data!" );
                }
                    logger.info ( 'Client saved playernames       => ' + socket.id + ', Player1: ' + player1_name + '; Player2: ' + player2_name );
                }
        );
    }

    /*
     *  Queries the saved session instance.
     *  Ruft den, zum Client passenden, Sessioneintrag der Datenbank ab.
     */
    _getSession( socket, callback, ClientCallback, callbackGlobal = null ) {
        let query = this.Session.find({ 'gameID': socket.id }); 

        query.exec(function(err, result) {
            if ( !err ) {
                if (result.length > 0 && result[0].savedGames !== undefined) {                  
                    if (callbackGlobal === null)
                        callback( result[0], ClientCallback );
                    else
                        callback( result[0], ClientCallback, callbackGlobal );
                } else {
                    logger.error ( 'no savegame' );
                }
            } else {
                logger.error ( 'error while request last savegame: ' + err );
            }
        });
    }

    /*
     *  Frage Lokale Highscores ab und ruft anschließend den Callback zur Berechnung der globalen Highscores auf
     *  
     */
    _getHighScore( result, callback, callbackGlobal ) {  
        let localhighscores = result.highscore_list;

        for( let i = 0; i < localhighscores.length; i++) {
            localhighscores[i].player1Name = result.player1Name;
            localhighscores[i].player2Name = result.player2Name;
        }
        callbackGlobal( { 'localhighscores': localhighscores }, callback );
    }

    /**
     *    Berechnet globale Highscores und schickt diese und die zuvor abgefragten lokalen Highscores zum Client
     */
    _getGlobalHighscore(localhighscores, callback) {
        let query = this.Session.find(); 

        query.exec(function(err, result) {
            if ( !err ) {

                let globalhighscores = [    {'highscore': 0, 'timestamp': new Date, 'level': 1, 'player1Name': this.defaultUsernames[0], 'player2Name': this.defaultUsernames[1]},
                                            {'highscore': 0, 'timestamp': new Date, 'level': 2, 'player1Name': this.defaultUsernames[0], 'player2Name': this.defaultUsernames[1]},
                                            {'highscore': 0, 'timestamp': new Date, 'level': 3, 'player1Name': this.defaultUsernames[0], 'player2Name': this.defaultUsernames[1]},
                                            {'highscore': 0, 'timestamp': new Date, 'level': 4, 'player1Name': this.defaultUsernames[0], 'player2Name': this.defaultUsernames[1]}
                            ]; 

               try {
                   for ( let i = 0; i < result.length; i++) {
                        for (let z = 0; z < result[i].highscore_list.length; z++) {
                            if (globalhighscores[z].highscore < result[i].highscore_list[z].highscore) {

                                globalhighscores[z].highscore = result[i].highscore_list[z].highscore;
                                globalhighscores[z].player1Name = result[i].player1Name;
                                globalhighscores[z].player2Name = result[i].player2Name;
                                globalhighscores[z].timestamp = result[i].highscore_list[z].timestamp;

                            }
                        }
                   }
                }
                catch(e) {
                    logger.debug(e);
                }

               localhighscores.globalhighscores = globalhighscores;



               callback(localhighscores);
               logger.info ( 'Client requested highscores');
            } else {
                logger.error ( 'error while request last savegame: ' + err );
            }
        }.bind( this ));

    }

    /**
     *   Sends Playernames to Client and calls callback function on client side.
     *   Schickt die Spielernamen zum Client.
     */
    _getNames( result, callback ) {
        callback( { 'name1': result.player1Name, 'name2': result.player2Name } );
        logger.info ( 'Client requested playernames');
    }

    /**
     *   Sends last savegame to Client and calls callback function on client side.
     *   Schickt den letzten gespeicherten Spielstand zum Client.
     */
    _getLastSavegame( result, callback ) {               
        callback( result.savedGames[ result.savedGames.length-1 ] );
        logger.info ( 'Client requested last savegames ');
    }

    /**
     *   Sends all savegames to Client and calls callback function on client side.
     *   Sendet das gesamte Array mit allen enthaltenen Spielstaenden zu Client.
     */
    _getAllSavegame( result, callback ) {      
        callback( result.savedGames );        
        logger.info ( 'Client requested all savegames ');
    }

    /**
     *   saves savestate and timestamp of saveoperation
     *   Speichert den Spielstand ans Ende des Array ( savedGames )
     *   
     */
    _saveGameState( socket, savegame ) {
        //_printEntries();
        this.Session.findOneAndUpdate( 
            { 'gameID': socket.id }, 
            { $push:{'savedGames': savegame } }, 
            {safe: true, upsert: true, new : true}, 
            function(err, doc) {
                if( err ){
                    logger.error ( "error while updating data!" );
                    logger.error ( err );
                } else {
                    logger.info ( 'Client saved a score            => ' + socket.id + '; savegame counter #' + doc.savedGames.length +  ', Level: ' + doc.savedGames[doc.savedGames.length-1].currentLevel );
                }
            }
        );
        this._checkHighscore( socket, savegame.highscore, savegame.currentLevel );
    }

    /*
     *  queries the highscore for the corresponding and calls _updateHighscore, if the new Highscore is higher than the old
     *  Prueft ob der neue Highscore groesser ist als der aktuell in der db gespeicherte.
     */
    _checkHighscore( socket, newHighscore, level ) {
        let query = this.Session.find({ 'gameID': socket.id }); 
        query.exec(function( err, result ) {
            if ( !err ) {
                if (result.length > 0) {   
                    let oldHighscore = result[0].highscore_list[ level-1 ].highscore;
                    if ( oldHighscore < newHighscore ) {
                        logger.debug('Old Hightscore: ' + oldHighscore);
                        logger.debug('new Hightscore: ' + newHighscore);
                        this._updateHighscore( socket, newHighscore, level );
                    }
                }else {
                    logger.info ( 'no savegames saved' );
                }
                } else {
                    logger.error ( 'Error: ' + err );
            }
        }.bind(this)); 
    }

    /*
     *  Updates the Highscore for the corresponding level
     *  Aktualisiert den Highscore fuer das ensprechende Level
     */
    _updateHighscore(socket, newHighscore, levelid) {
        this.Session.update(
            {"gameID": socket.id, "highscore_list.level": levelid}, 
            {$set: {"highscore_list.$.highscore": newHighscore,
                    "highscore_list.$.timestamp": new Date,
                    "highscore_list.$.level": levelid
                   } 
            },
            function(err, doc) {
                if( err ){
                    logger.error ( "Something wrong when updating data!" );
                }
                    logger.info ( 'Client saved new Hightscore       => ' + socket.id );
            }
        );
    }
}

module.exports = ConnectionHandlerServer;