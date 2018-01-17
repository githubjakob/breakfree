class Chat {
	constructor(io) {
    	this.socket            = io;	
        this.connectedClients  = 0;
    	this.chatText          = '';
    	this.username          = 'Default Username'

    	document.getElementById('chat_name').value         = this.username;  
    	document.getElementById('chat_history').value      = this.chatText;
        document.getElementById('text_input').value      = '';

        this._getNumberClients();

        /**
         *   Fügt den Text, welcher von anderen Client kommt dem Attribut chatText hinzu und aktuallisiert anschließend das Textarea.
         *   Sollte der Text ausserhalb des Anzeigebreichs liegen, wird das Textarea automatisch nach unten gescrollt.
         */
        this.socket.on('displayText', function( text ) {
                this.chatText += text + '\n';
                document.getElementById('chat_history').value = this.chatText ;
                document.getElementById('chat_history').scrollTo(0, document.getElementById('chat_history').scrollHeight);
        }.bind(this)); 

        /**
         *     Aktualisiert den Zähler, welcher anzeigt, wieviel Clients mit dem Server vebunden sind.
         */
        this.socket.on('updateClientNumber', function( response ) {
            this.connectedClients = response;
            document.getElementById('CCounter').innerHTML = 'Clients online: ' + this.connectedClients;
        }.bind(this)); 
	}

    /**
     *   Ergänzt den Input des Inputfeldes, dem Objektattribut chatText. Anschließend wird das Textarea auf den neuesten Stand von chatText akutllieiert. 
     *   Zum Schluss wird der Text der Eingabe zum Servergeschickt, wo er an die anderen Clients geschickt wird.
     *   Sollte der Text ausserhalb des Anzeigebreichs liegen, wird das Textarea automatisch nach unten gescrollt.
     */
    sendText( event ) {
        if ( event.keyCode === 13 || event.button === 0 ) {
            let textInput  = document.getElementById('text_input').value;
            if (textInput !== '') {
                textInput      = this.username + ':  ' + textInput;
                this.chatText  += textInput + '\n';

                document.getElementById('chat_history').value = this.chatText;
                document.getElementById('chat_history').scrollTo(0, document.getElementById('chat_history').scrollHeight);

                document.getElementById('text_input').value = '';
                this.socket.emit( 'distributeText', textInput );
                document.getElementById('text_input').focus(); 
            }
        }
    }

    updateUsername() {
    	this.username = document.getElementById('chat_name').value;
    }

    /**
     *   Fragt den Server nach der aktuellen Anzahl verbundener Clients.
     */
    _getNumberClients() {
        this.socket.emit( 'getNumberConnectedClients', function( response ) {
            this.connectedClients = response;
            document.getElementById('CCounter').innerHTML = 'Clients online: ' + this.connectedClients;
        }.bind( this ) );
    }
}

let chat = new Chat(socketio);