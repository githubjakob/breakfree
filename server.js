'use strict';

const 
	express = require("express"),
    http = require("http"),	
    path = require("path"),
    mongoose = require("mongoose" ),
    winston = require("winston"),
 	ConnectionHandler = require('./connectionHandlerServer');

const
	DATABASE = 'freedomDb',
	COLLECTION  = 'jumpAndRunGame',
	mongoDbHostname	= process.env.MONGO || "localhost", 			//The process.env property returns an object containing the user environment.
	mongoDbUrl = 'mongodb://' + path.join(mongoDbHostname, DATABASE ),
	PORT = process.env.PORT || 8080,
	PUBLICPATH = path.join( __dirname, 'client' ),
	app = express(),
	server = http.Server( app ),
	logger = new ( winston.Logger )({
				transports: [
					new ( winston.transports.Console )({ 
						level: 'debug',
						handleExceptions: true,
						json: false,
						colorize: true 
					})
				]
			});

//Zeige Express, wo die Dateien fuer den Client liegen.
app.use( '/client', express.static( PUBLICPATH ) );

//Schickt die index.html auf anfrage des Client nach den Root.
app.get('/', function( req, res ) {
    res.sendFile( path.join( PUBLICPATH, 'index.html') );
});

//Fuer alle anderen Anfragen wird ein 404 geloggt und die index.html geschickt.
app.get('*', function( req, res ){
  	logger.info( '404 for your-domain.com' + req.url );
	res.sendFile( path.join( PUBLICPATH, 'index.html' ) );
});

//Starte Server
server.listen( PORT );
logger.debug( 'Server is running on Port: ' + PORT );

let connectionHandler = new ConnectionHandler( server, mongoose, mongoDbUrl, COLLECTION );