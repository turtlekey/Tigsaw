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
        this.getScaledSize()
    }

    
    setID = () => {
        this.id((this.rowIndex + this.columnIndex * this.rowCount + 1).toString());
    }

                
    getScaledSize = () => {
        this.scaledWidth = this.width() * this.scaleX();
        this.scaledHeight = this.height() * this.scaleY();
    }

}

export {Piece};
