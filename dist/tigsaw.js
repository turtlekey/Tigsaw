function banScrollRefresh() {
    document.body.addEventListener('touchmove', (e) => {
        e.preventDefault();
        }, {passive: false},
    );
}


function arrayRemove(arr, item) {
    return arr.filter((i) => {
        return i!== item;
    })
}

class Piece extends Konva.Rect {
    constructor({
        name = 'piece',
        rowCount,
        columnCount,
        rowIndex,
        columnIndex,
        width,
        height,
        fillPatternImage,
        stroke = 'gray',
        strokeWidth = 2,
        shadowColor = 'gray',
        scaleThreshold = 0.8,
        puzzle,
    }) {
        super();
        puzzle.add(this);
        this.cursorStyle = 'grab';
        this.relativePosition = [rowIndex + 1, columnIndex + 1];
        this.scaleRatio = Math.min(this.getStage().width() / fillPatternImage.width, this.getStage().height() / fillPatternImage.height) * scaleThreshold;
        this.shadowBlurThreshold = 0.05;
        this.shadowOffsetThreshold = 0.05;
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        
        this.setID(rowIndex, columnIndex, rowCount);
        this.name(name);
        this.width(width);
        this.height(height);
        this.fillPatternImage(fillPatternImage);
        this.fillPatternOffset({
            x: this.width() * rowIndex,
            y: this.height() * columnIndex,
        });
        this.stroke(stroke);
        this.strokeWidth(strokeWidth);
        this.strokeScaleEnabled(false);
        this.shadowColor(shadowColor);
        this.shadowBlur(Math.min(this.width(), this.height()) * this.shadowBlurThreshold);
        this.shadowOffset({
            x: this.width() * this.shadowBlurThreshold,
            y: this.height() * this.shadowBlurThreshold,
        });
        this.shadowEnabled(false);
        this.scale({
            x: this.scaleRatio,
            y: this.scaleRatio,
        });
        this.draggable(true);
        this.getScaledSize();
    }

    
    setID = () => {
        this.id((this.rowIndex + this.columnIndex * this.rowCount + 1).toString());
    }

                
    getScaledSize = () => {
        this.scaledWidth = this.width() * this.scaleX();
        this.scaledHeight = this.height() * this.scaleY();
    }

}

class Puzzle extends Konva.Layer {
    constructor({
        rowCount,
        columnCount,
        imageSrc,
        placeStyle,
        connectThreshold = 30,
        completeThreshold = 30,
    }) {
        super();
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.imageSrc = imageSrc;
        this.placeStyle = placeStyle;
        this.connectThreshold = 30;
        this.completeThreshold = 30;
        this.drawPieces();

    }


    drawPieces = () => {
        let img = new Image();
        img.src = this.imageSrc;
        img.onload = () => {
            let pieceWidth = img.width / this.rowCount;
            let pieceHeight = img.height / this.columnCount;
            for (let i=0; i<this.columnCount; i++) {
                for (let j=0; j<this.rowCount; j++) {
                    new Piece({
                        rowCount: this.rowCount,
                        columnCount: this.columnCount,
                        rowIndex: j,
                        columnIndex: i,
                        width: pieceWidth,
                        height: pieceHeight,
                        fillPatternImage: img,
                        puzzle: this,
                    });
                }
            }
            this.setCursor();
            this.setFocusStyle();
            this.setAdjustPosition();
            this.setPlaceStyle();
            this.connectListener();
            this.completeListener();
        };
    }


    setPlaceStyle = () => {
        if (this.placeStyle === 'scattered') {
            this.setScattered();
        } else if (this.placeStyle === 'gatheredCenter') {
            this.setGatheredCenter();
        } else if (this.placeStyle === 'gatheredTop') {
            this.setGatheredTop();
        } else if (this.placeStyle === 'gatheredBottom') {
            this.setGatheredBottom();
        } else if (this.placeStyle === 'gatheredLeft') {
            this.setGatheredLeft();
        } else if (this.placeStyle === 'gatheredRight') {
            this.setGatheredRight();
        }
    }



    getPieces = () => {
        let pieces = this.find('.piece');
        return pieces;
    }


    breakOrder = (pieces) => {
        let len = pieces.length;
        let index;
        for (let point=len - 1; point>=0; point--) {
            index = Math.floor(Math.random() * point);
            pieces[index] = [pieces[point], pieces[point] = pieces[index]][0];
        }
        return pieces
    }


    setCursor = () => {
        let pieces = this.getPieces();
        pieces.map((piece) => {
            piece.on('mouseenter', () => {
                document.body.style.cursor = piece.cursorStyle;
            });
            piece.on('mouseleave', () => {
                document.body.style.cursor = 'default';
            });
        });
    }


    setFocusStyle = () => {
        let pieces = this.getPieces();
        pieces.map((piece) => {
            piece.on('mousedown touchstart', () => {
                piece.shadowEnabled(true);
                piece.zIndex(pieces.length - 1);
            });
            piece.on('mouseup touchend', () => {
                piece.shadowEnabled(false);
            });
        });
    }

        
    setScattered = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces.map((piece) => {
            let x = Math.random() * (stage.width() - piece.scaledWidth);
            let y = Math.random() * (stage.height() - piece.scaledHeight);
            piece.x(x);
            piece.y(y);
        });
    }


    setGatheredCenter = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces = this.breakOrder(pieces);
        let startX = (stage.width() - pieces[0].scaledWidth * this.rowCount) / 2;
        let startY = (stage.height() - pieces[0].scaledHeight * this.columnCount) / 2;
        pieces.map((piece, index, array) => {
            piece.x(startX + index % this.rowCount * piece.scaledWidth);
            piece.y(startY + Math.floor(index / this.rowCount) * piece.scaledHeight);
        });
    }


    setGatheredTop = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces = this.breakOrder(pieces);
        let endX = Math.floor(stage.width() / pieces[0].scaledWidth) * pieces[0].scaledWidth;
        pieces.map((piece, index, array) => {
            let x = index * piece.scaledWidth % endX;
            let y = Math.floor(index * piece.scaledWidth / endX) * piece.scaledHeight;
            piece.x(x);
            piece.y(y);
        });
    }


    setGatheredBottom = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces = this.breakOrder(pieces);
        let endX = Math.floor(stage.width() / pieces[0].scaledWidth) * pieces[0].scaledWidth;
        pieces.map((piece, index, array) => {
            let x = index * piece.scaledWidth % endX;
            let y = stage.height() - (Math.floor(index * piece.scaledWidth / endX) + 1) * piece.scaledHeight;
            piece.x(x);
            piece.y(y);
        });
    }


    setGatheredLeft = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces = this.breakOrder(pieces);
        let endY = Math.floor(stage.height() / pieces[0].scaledHeight) * pieces[0].scaledHeight;
        pieces.map((piece, index, array) => {
            let x = Math.floor(index * piece.scaledHeight / endY) * piece.scaledWidth;
            let y = index * piece.scaledHeight % endY;
            piece.x(x);
            piece.y(y);
        });
    }
    
        
    setGatheredRight = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces = this.breakOrder(pieces);
        let endY = Math.floor(stage.height() / pieces[0].scaledHeight) * pieces[0].scaledHeight;
        pieces.map((piece, index, array) => {
            let x = stage.width() - (Math.floor(index * piece.scaledHeight / endY) + 1) * piece.scaledWidth;
            let y = index * piece.scaledHeight % endY;
            piece.x(x);
            piece.y(y);
        });
    }


    
    setAdjustPosition = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        stage.on('dragmove', () => {
            pieces.map((piece) => {
                let pieceX = piece.absolutePosition().x;
                let pieceY = piece.absolutePosition().y;
                let maxX = stage.width() - piece.scaledWidth;
                let maxY = stage.height() - piece.scaledHeight;
                if (pieceX < 0) {
                    piece.absolutePosition({
                        x: 0,
                        y: pieceY,
                    });
                } else if (pieceX > maxX) {
                    piece.absolutePosition({
                        x: maxX,
                        y: pieceY,
                    });
                }
                if (pieceY < 0) {
                    piece.absolutePosition({
                        x: pieceX,
                        y: 0,
                    });
                } else if (pieceY > maxY) {
                    piece.absolutePosition({
                        x: pieceX,
                        y: maxY,
                    });
                }
            });
        });
    }



    completeListener = () => {
        let pieces = this.getPieces();
        pieces.map((piece) => {
            piece.on('dragend', () => {
                let piecesCount = pieces.length;
                let prePiece = null;
                let i;
                for (i=1; i<piecesCount+1; i++) {
                    let piece = this.findOne(`#${i}`);
                    if (i === 1) {
                        prePiece = piece;
                    }
                    if (i > 1) {
                        if ((piece.relativePosition[0] > prePiece.relativePosition[0] && 
                            Math.abs(piece.x() -  prePiece.x() - piece.scaledWidth) < this.completeThreshold || 
                            piece.relativePosition[0] < prePiece.relativePosition[0] && piece.x() < prePiece.x()) && 
                            (piece.relativePosition[1] === prePiece.relativePosition[1] && 
                            Math.abs(piece.y() - prePiece.y()) < this.completeThreshold || 
                            piece.relativePosition[1] > prePiece.relativePosition[1] && 
                            Math.abs(piece.y() - prePiece.y() - piece.scaledHeight) < this.completeThreshold)) {
                            prePiece = piece;
                            continue;
                        } else {
                            break;
                        }
                    }
                }
                if (i === piecesCount + 1) {
                    document.querySelector('#successSound').play();
                    pieces.map((piece) => {
                        piece.hide();
                    });
                    this.showPhoto();
                }
                 
            });
        });
    }


    showPhoto = () => {
        let img = new Image();
        img.src = this.imageSrc;
        
        let firstPiece = this.findOne('#1');
        let scaleRatio = firstPiece.scaleRatio;
        img.onload = () => {
            let photo = new Konva.Image({
                x: firstPiece.x(),
                y: firstPiece.y(),
                width: img.width,
                height: img.height,
                image: img,
                scale: {
                    x: scaleRatio,
                    y: scaleRatio,
                },
                draggable: true,
                stroke: 'white',
                strokeWidth: 20,
                strokeScaleEnabled: false,
            });
            this.add(photo);
            shakePhoto(photo, scaleRatio);
        };

        function shakePhoto(photo, scaleRatio) {
            photo.offset({
                x: photo.width() / 2,
                y: 0,
            });
            photo.move({
                x: photo.width() * scaleRatio / 2,
                y: 0,
            });
            let angle = 15;
            let speed = 0.4;
            let clockwise = true;
            let anim = new Konva.Animation((frame) => {
                if (clockwise) {
                    photo.rotate(speed);
                } else {
                    photo.rotate(speed * -1);
                }
                if (photo.rotation() > angle) {
                    clockwise = false;
                } else if (photo.rotation() < -angle) {
                    clockwise = true;
                }
            }, this);

            anim.start();

            photo.on('mouseenter touchstart', () => anim.stop());
            photo.on('mouseleave touchend', () => anim.start());
        }

    }


    connectListener = () => {
        let eleConnectSound = document.querySelector('#connectSound');
        let pieces = this.getPieces();
        pieces.map((piece) => {
            piece.on('dragend', () => {
                let _pieces = arrayRemove(pieces, piece);
                for (let i=0;i<_pieces.length;i++) {
                    let negativePiece = _pieces[i];
                    if (this.connectionLR(piece, negativePiece)) {
                        piece.x(negativePiece.x() - piece.scaledWidth);
                        piece.y(negativePiece.y());
                        eleConnectSound.play();
                    } else if (this.connectionRL(piece, negativePiece)) {
                        piece.x(negativePiece.x() + piece.scaledWidth);
                        piece.y(negativePiece.y());
                        eleConnectSound.play();
                    } else if (this.connectionTB(piece, negativePiece)) {
                        piece.x(negativePiece.x());
                        piece.y(negativePiece.y() - piece.scaledHeight);
                        eleConnectSound.play();
                    } else if (this.connectionBT(piece, negativePiece)) {
                        piece.x(negativePiece.x());
                        piece.y(negativePiece.y() + piece.scaledHeight);
                        eleConnectSound.play();
                    }
                }
            });
        });
    }


    connectionLR = (positivePiece, negativePiece) => {
        if (Math.abs(positivePiece.y() - negativePiece.y()) < this.connectThreshold && 
            negativePiece.x() - positivePiece.x() > positivePiece.scaledWidth - this.connectThreshold &&
            negativePiece.x() - positivePiece.x() < positivePiece.scaledWidth + this.connectThreshold) {
            return true;
        } else {
            return false;
        }
    }

    connectionRL = (positivePiece, negativePiece) => {
        if (Math.abs(positivePiece.y() - negativePiece.y()) < this.connectThreshold && 
            positivePiece.x() - negativePiece.x() > positivePiece.scaledWidth - this.connectThreshold &&
            positivePiece.x() - negativePiece.x() < positivePiece.scaledWidth + this.connectThreshold) {
            return true;
        } else {
            return false;
        }
    }
            
    connectionTB = (positivePiece, negativePiece) => {
        if (Math.abs(positivePiece.x() - negativePiece.x()) < this.connectThreshold && 
            negativePiece.y() - positivePiece.y() > positivePiece.scaledHeight - this.connectThreshold &&
            negativePiece.y() - positivePiece.y() < positivePiece.scaledHeight + this.connectThreshold) {
            return true;
        } else {
            return false;
        }
    }

    connectionBT = (positivePiece, negativePiece) => {
        if (Math.abs(positivePiece.x() - negativePiece.x()) < this.connectThreshold && 
            positivePiece.y() - negativePiece.y() > positivePiece.scaledHeight - this.connectThreshold &&
            positivePiece.y() - negativePiece.y() < positivePiece.scaledHeight + this.connectThreshold) {
            return true;
        } else {
            return false;
        }
    }
        
}

function insertConnectSound(soundSrc) {
    let eleSound = document.createElement('audio');
    eleSound.id = 'connectSound';
    eleSound.src = soundSrc;
    eleSound.style.display = 'none';
    document.body.appendChild(eleSound);
}

function insertSuccessSound(soundSrc) {
    let eleSound = document.createElement('audio');
    eleSound.id = 'successSound';
    eleSound.src = soundSrc;
    eleSound.style.display = 'none';
    document.body.appendChild(eleSound);
}

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
        });
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
