class Vector2 {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(vector) {
        let y = vector.x - this.x;
        let x = vector.y - this.y;
        return Math.sqrt(x * x + y * y);
    }

}

const DEFAULT_FREEZE_ARGS = {
    freezeColor:null, 
    flashColor:"#fff", 
    animationTime:500, 
    animationDelay:0
}


class Pixel {

    textLocked = false;
    connectedNeighbors = [];

    constructor(posX, posY, element, colIdx, rowIdx, width, height) {
        this.position = new Vector2(posX+(width/2), posY+(height/2));
        this.element = element;
        this.colIdx = colIdx;
        this.rowIdx = rowIdx;
        this.element.style.backgroundColor = "#000000";

        this.element.onclick = (() => {
            this.textLocked = !this.textLocked;
            if (!this.textLocked) {
                this.element.style.zIndex = 999;
            }
        })
    }

    connectNeighbor(neighbor, freezeArgs) {
        this.connectedNeighbors.push(neighbor);
        this.freezeText(freezeArgs);
    }

    freezeText(args=DEFAULT_FREEZE_ARGS) {
        var {freezeColor, flashColor, animationTime, animationDelay} = args;

        if (!freezeColor) {
            freezeColor = this.element.style.backgroundColor;
        }
        this.textLocked = true;
        
        setTimeout(() => {
            const z = this.element.style.zIndex;
            this.element.style.zIndex = 1;
            this.element.style.transform = 'scale(1.2,1.2)';
            this.element.style.backgroundColor = flashColor;

            setTimeout(() => {
                this.element.style.transform = 'scale(1.0, 1.0)';
                this.element.style.backgroundColor = freezeColor;
                this.element.style.zIndex = 0;
            }, animationTime)
        }, animationDelay)

    }
 
    updateText(pixelMatrix) {
        if (!this.textLocked) {
            this.setText(this.characters.charAt(Math.floor(Math.random() * numCharacters)))
        }
        //  else {
        //     const neighbors = this.getNeighbors(pixelMatrix);
        //     for (const n of neighbors) {
        //         if (n.element.textContent === this.element.textContent) {
        //             n.freezeText();
        //         }
        //     }
        // }
    }

    setCharacters(characters) {
        this.characters = characters;
    }

    setText(text) {
        this.element.textContent = text;
    }

    async setColor(color) {
        if (!this.textLocked)
           this.element.style.backgroundColor = color;
    }

    getColor() {
        return this.element.style.backgroundColor;
    }

    getNearbyPixel(x, y, matrix) {
        const row = matrix[Math.abs((this.rowIdx + x) % matrix.length)]
        // console.log("ROW", row, matrix.length, Math.abs((this.rowIdx + x) % matrix.length))
        return row[(this.colIdx + y) % row.length]
    }

    getNeighbors(matrix) {
        const neighbors = [];
        // neighbors.push(pixelMatrix.get((this.posX - 1) * (this.posY -1)))
        // neighbors.push(pixelMatrix.get(this.posX * (this.posY -1)))
        // console.log(pixelMatrix[this.posX - 1], this.posX-1)
        neighbors.push(this.getNearbyPixel(1, 1, matrix))
        neighbors.push(this.getNearbyPixel(0, 1, matrix))
        neighbors.push(this.getNearbyPixel(1, 0, matrix))
        neighbors.push(this.getNearbyPixel(1, -1, matrix))
        // neighbors.push(this.getNearbyPixel(-1, 1, matrix))
        // neighbors.push(this.getNearbyPixel(-1, -1, matrix))
        // neighbors.push(this.getNearbyPixel(0, -1, matrix))
        // neighbors.push(this.getNearbyPixel(-1, 0, matrix))

        // neighbors = neighbors.filter(n => !n.textLocked)
        return neighbors;
    }
}