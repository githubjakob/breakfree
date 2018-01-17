'use strict';

/**
 * Holds all the dynamic data we need when saving a game
 *
 * - Saving: we send this Object to backend and stored in the Database
 * - Loading: we receive this Object from the Backend and merge it into the respective Tilemap of the level. This
 * creates a Tilemap which contains all the updated information of the savedGame, see {@link StateManager.loadSavedGame}.
 */
class SavedGame {
    // Konstruktor extrahiert die Koordinaten der Objekte aus dem aktuellen State
    constructor(levelState, currentLevel) {
        this.keys               = this._getPositionsFromAll(levelState.keys);
        this.players            = this._getPositionsFromAll(levelState.players);
        this.enemies            = this._getPositionsFromAll(levelState.enemies);
        this.highscore          = levelState.highscore;
        this.keyCount           = levelState.keyCount;
        this.timer              = levelState.timer;
        this.playerLifepoints   = levelState.playerLifepoints;
        this.currentLevel       = currentLevel || levelState.currentLevel;
        this.timestamp          = new Date();
        Logger.debug("SavedGame.constructor: SavedGame created with " + JSON.stringify(this));
    }

    /**
     * Constructs a full Tilemap for starting a Level by merging the properties of the SavedGame (i.e. this object)
     * into the respective level.JSON
     * @param tilemap, the tilemap of the level we merge the SavedGame into
     * @returns a tilemap, with the updated positions of the SavedGame
     */
    mergeWith( tilemap ) {
        // Filter all layers from the Tilemap that are saved
        let savedLayers = tilemap.layers.filter(this._isLayerSaved.bind(this));
        savedLayers.forEach(layer => {
           let layerName = layer.name.toLowerCase();
           this[layerName].forEach((savedObject, index) => {
               let object     = layer.objects[index];
               object.x       = savedObject.x;
               object.y       = savedObject.y;
               object.visible = savedObject.visible;
           });
        });
        Logger.debug("SavedGame.mergeWith(): SavedGame for level " + this.currentLevel + " successfully merged into Tilemap.");
        return tilemap;
    }

    _isLayerSaved(layer) {
        // Class Variables of SavedGame, e.g. "keys", "players"
        let keys = Object.keys(this);
        return keys.includes(layer.name.toLowerCase());
    }

    _getPositionsFromAll(objects) {
        let positions = [];

        objects.forEach(object => {
            positions.push({x: object.x, y: object.y, type: object.type, visible: object.visible, name: object.name});
        });
        return positions;
    }
}