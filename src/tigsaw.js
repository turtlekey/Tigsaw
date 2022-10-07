import {banScrollRefresh} from './utils.js';
import {Piece} from './piece.js';
import {Puzzle} from './puzzle.js';
import {insertConnectSound, insertSuccessSound} from './sound.js';


class Tigsaw {
    constructor({
        container,
        rowCount,
        columnCount,
        type,
        placeStyle = 'gatheredCenter',
        imageSrc = null,
        imageScaleThreshold = 0.8,
        stageWidth = document.querySelector(container).offsetWidth,
        stageHeight = document.querySelector(container).offsetHeight,
        connectSoundSrc = 'https://turtlekey.github.io/demo/tigsaw/static/audio/connect.wav',
        successSoundSrc = 'https://turtlekey.github.io/demo/tigsaw/static/audio/success.mp3',
        
    }) {
        banScrollRefresh();
        insertConnectSound(connectSoundSrc);
        insertSuccessSound(successSoundSrc);
        this.container = document.querySelector(container);
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.type = type;
        this.placeStyle = placeStyle;
        this.imageSrc = imageSrc;
        this.drawStage();
        this.drawPuzzle();
        this.stage.add(this.puzzle);
    }


    drawStage = () => {
        this.stage = new Konva.Stage({
            container: this.container,
            width: this.stageWidth,
            height: this.stageHeight,
            draggable: true,
        })
    }


    drawPuzzle = () => {
        this.puzzle = new Puzzle({
            rowCount: this.rowCount,
            columnCount: this.columnCount,
            imageSrc: this.imageSrc,
            placeStyle: this.placeStyle,
        });
    }
}


export {Tigsaw};
