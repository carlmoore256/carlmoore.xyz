import { useEffect, useRef } from "react";
import { CanvasDrawCallback } from "./ASCIIArtCanvas";
import { randomColor } from "../utils/color";

export interface TextStackTitleOptions {
    canvasDims  : {width: number, height: number};
    textLines   : string[];
    position    : {x: number, y: number};
    textOffset? : number;
    font?       : string;
    fontSize?   : number;
    repetitions?: number;
    maxSize?    : number;
}

/** Create a draw callback with a set of stacked text items */
export function textStackTitle(
    options : TextStackTitleOptions) : CanvasDrawCallback 
{
    if (!options.textOffset) options.textOffset = 160;
    if (!options.font) options.font = 'Arial Black';
    if (!options.fontSize) options.fontSize = 190;
    if (!options.repetitions) options.repetitions = 3;
    if (!options.maxSize) options.maxSize = 900;

    var {canvasDims, 
        textLines, 
        position, 
        textOffset, 
        font, 
        fontSize, 
        repetitions,
        maxSize } = options;

    if (canvasDims.width < maxSize) {
        fontSize *= (canvasDims.width/maxSize);
        textOffset *= (canvasDims.width/maxSize);
    }

    return (ctx : CanvasRenderingContext2D) => {
        ctx.font = `${fontSize}px '${font}'`;
        textLines.forEach((line : string, idx : number) => {
            for (let i = 0; i < repetitions; i++) {
                if (i == textLines.length - 1) ctx.fillStyle = "white";
                else ctx.fillStyle = randomColor();
                ctx.fillText(
                    line, 
                    position.x + (i*12), 
                    // position.x + (i*12) + (idx * textOffset), 
                    position.y + (i*12) + (idx * textOffset)
                );
            }
        })
    }
}


// var fontSize = 200;
// var textOffset = widget4;
// if (targetRef.current.clientWidth < 800) {
//     fontSize = (targetRef.current.clientWidth/700) * widget3;
//     textOffset *= (targetRef.current.clientWidth/800)
// }