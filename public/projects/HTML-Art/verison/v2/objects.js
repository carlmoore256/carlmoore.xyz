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


class Pixel {

    textLocked = false;

    constructor(posX, posY, element, colIdx, rowIdx, width, height) {
        this.position = new Vector2(posX+(width/2), posY+(height/2));
        this.element = element;
        this.colIdx = colIdx;
        this.rowIdx = rowIdx;
        this.element.style.backgroundColor = "#000000";

        this.element.onclick = (() => {
            this.textLocked = !this.textLocked
        })
    }

    freezeText() {
        this.textLocked = true;
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

    setColor(color) {
        if (!this.textLocked)
           this.element.style.backgroundColor = color;
    }

    getNeighbors(pixelMatrix) {
        const neighbors = [];
        neighbors.push(pixelMatrix.get((this.posX - 1) * (this.posY -1)))
        neighbors.push(pixelMatrix.get(this.posX * (this.posY -1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX - 1, this.posY   )))

        // neighbors.push(pixelMatrix.get(new Vector2(this.posX + 1, this.posY +1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX,     this.posY +1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX + 1, this.posY   )))

        // neighbors.push(pixelMatrix.get(new Vector2(this.posX + 1, this.posY -1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX - 1, this.posY +1)))

        // neighbors.push(pixelMatrix.get(new Vector2(this.posX - 1, this.posY -1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX,     this.posY -1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX - 1, this.posY   )))

        // neighbors.push(pixelMatrix.get(new Vector2(this.posX + 1, this.posY +1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX,     this.posY +1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX + 1, this.posY   )))

        // neighbors.push(pixelMatrix.get(new Vector2(this.posX + 1, this.posY -1)))
        // neighbors.push(pixelMatrix.get(new Vector2(this.posX - 1, this.posY +1)))

        return neighbors;
    }
}