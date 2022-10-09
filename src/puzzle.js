import {arrayRemove} from './utils.js';
import {Piece} from './piece.js';

class Puzzle extends Konva.Layer {
    constructor({
        rowCount,
        columnCount,
        imageSrc,
        placeStyle,
        stage,
        connectThreshold = 30,
        completeThreshold = 30,
    }) {
        super();
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.imageSrc = imageSrc;
        this.placeStyle = placeStyle;
        this.stage = stage;
        this.connectThreshold = 30;
        this.completeThreshold = 30;
        this.destroyOther();
        this.addToStage();
        this.drawPieces();

    }


    addToStage = () => {
        this.stage.add(this);
    }


    destroyOther = () => {
        this.stage.destroyChildren();    
    }


    drawPieces = () => {
        let img = new Image();
        img.src = this.imageSrc;
        img.onload = () => {
            let pieceWidth = img.width / this.rowCount;
            let pieceHeight = img.height / this.columnCount;
            for (let i=0; i<this.columnCount; i++) {
                for (let j=0; j<this.rowCount; j++) {
                    let piece = new Piece({
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
            this.completeListener();
        }
    }


    setPlaceStyle = () => {
        if (this.placeStyle === 'scattered') {
            this.setScattered();
            this.connectListener();
        } else if (this.placeStyle === 'gatheredCenter') {
            this.setGatheredCenter();
            this.exchangeListener();
            this.removeAdjustPosition();
        } else if (this.placeStyle === 'gatheredTop') {
            this.setGatheredTop();
            this.connectListener();
        } else if (this.placeStyle === 'gatheredBottom') {
            this.setGatheredBottom();
            this.connectListener();
        } else if (this.placeStyle === 'gatheredLeft') {
            this.setGatheredLeft();
            this.connectListener();
        } else if (this.placeStyle === 'gatheredRight') {
            this.setGatheredRight();
            this.connectListener();
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
            })
        })
    }


    setFocusStyle = () => {
        let pieces = this.getPieces();
        pieces.map((piece) => {
            piece.on('mousedown touchstart', () => {
                piece.shadowEnabled(true);
                piece.zIndex(pieces.length - 1);
            })
            piece.on('mouseup touchend', () => {
                piece.shadowEnabled(false);
            })
        })
    }

        
    setScattered = () => {
        let stage = this.getStage();
        let pieces = this.getPieces();
        pieces.map((piece) => {
            let x = Math.random() * (stage.width() - piece.scaledWidth);
            let y = Math.random() * (stage.height() - piece.scaledHeight);
            piece.x(x);
            piece.y(y);
        })
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
        })
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
        })
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
        })
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
        })
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
        })
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
            })
        })
    }


    removeAdjustPosition = () => {
        let stage = this.getStage();
        stage.off('dragmove');
        stage.draggable(false);
    }



    completeListener = () => {
        let pieces = this.getPieces();
        pieces.map((piece) => {
            piece.on('dragend', () => {
                let piecesCount = pieces.length;
                let prePiece = null
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
                    })
                    this.showPhoto();
                }
                 
            })
        })
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
            })
            this.add(photo);
            shakePhoto(photo, scaleRatio);
        }

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
            })
        })
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
        

    exchangeListener = () => {
        let eleConnectSound = document.querySelector('#connectSound');
        let pieces = this.getPieces();
        let positivePieceX, positivePieceY, negativePieceX, negativePieceY;
        pieces.map((piece) => {
            piece.on('dragstart', () => {
                positivePieceX = piece.x();
                positivePieceY = piece.y();
            })
            piece.on('dragend', () => {
                let _pieces = arrayRemove(pieces, piece);
                let maxArea = 0;
                let targetPiece = null;
                for (let i=0;i<_pieces.length;i++) {
                    let negativePiece = _pieces[i];
                    let diffX = piece.scaledWidth - (Math.abs(piece.x() - negativePiece.x()));
                    let diffY = piece.scaledHeight - (Math.abs(piece.y() - negativePiece.y()));
                    diffX = diffX < 0 ? 0 : diffX;
                    diffY = diffY < 0 ? 0 : diffY;
                    let area = diffX * diffY;
                    if (area > maxArea) {
                        maxArea = area;
                        targetPiece = negativePiece;
                    }
                }
                let diffX = piece.scaledWidth - (Math.abs(piece.x() - positivePieceX));
                let diffY = piece.scaledHeight - (Math.abs(piece.y() - positivePieceY));
                diffX = diffX < 0 ? 0 : diffX;
                diffY = diffY < 0 ? 0 : diffY;
                let area = diffX * diffY;
                    
                if (area > maxArea || targetPiece === null) {
                    piece.x(positivePieceX);
                    piece.y(positivePieceY);
                } else {
                    piece.x(targetPiece.x());
                    piece.y(targetPiece.y());
                    targetPiece.x(positivePieceX);
                    targetPiece.y(positivePieceY);
                }
                eleConnectSound.play();
            })
        })
    }
}


export {Puzzle}
