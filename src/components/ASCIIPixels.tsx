import React, { 
    useState, 
    forwardRef, 
    createRef, 
    useEffect, 
    useMemo, 
    useRef, 
    Component } from 'react';

import { rgbToHex } from '../utils/color';

export interface ImageDataPixel {
    idx : number;
    nzIdx : number; // non-zero index in an array of pixels
    x : number;
    y : number;
    R : number;
    G : number;
    B : number;
    A : number;
}

export interface ASCIICanvasState {
    sourcePixels: ImageDataPixel[];
    charset: string;
    // initial random variation in symbols calculated when source changes
    symbolMap : Map<string, number>;
    animationOffset: number;
}

const ASCII_CHARSET = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`;


// https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
const pixelLuminance = (R : number, G : number, B : number, A? : number) => {
    return (0.2126 * R + 0.7152 * G + 0.0722 * B)
}

export interface Pixel2ASCIIOptions {
    charset : string;
    reverse? : boolean;
    offset? : number; 
}

export const DEFAULT_P2A_OPTIONS = {
    charset : ASCII_CHARSET,
    reverse : false,
    offset : 0
}

/** Provide an ascii pixel, return an ASCII character with given brightness */
export function Pixel2ASCII(
        pixel : ImageDataPixel,
        options : Pixel2ASCIIOptions = DEFAULT_P2A_OPTIONS,
        brightnessFn : (R : number, G : number, B : number, A? : number) => number = pixelLuminance
    ) : string {

    const { R, G, B, A } = pixel;
    var brightness = brightnessFn(R, G, B, A);
    if (options.reverse) brightness = 1-brightness;
    brightness *= options.charset.length;
    brightness = Math.round(brightness);
    return options.charset[brightness];
}

export function Pixel2Brightness(
    pixel : ImageDataPixel,
    brightnessFn : (R : number, G : number, B : number, A? : number) => number = pixelLuminance
) : number {
    const { R, G, B, A } = pixel;
    return brightnessFn(R, G, B, A);
}

export function getCoordinateKey(x: number, y: number) { return `${x}_${y}` }

export function getSymbolAtPosition(state: ASCIICanvasState, x: number, y: number) {
    const key = getCoordinateKey(x, y);
    const offset = state.symbolMap.get(key);
    return state.charset[(state.animationOffset + offset) % state.charset.length];
}

// make something to prevent duplicate pixel values

/** Returns an array of nonzero pixels from an ImageData object */
export function getNonzeroPixels(imageData : ImageData, normalize : boolean = false) : ImageDataPixel[] {
    const {data, height, width} = imageData;
    var yPos = 0;
    const pixels = [];
    var nzIdx = 0;
    for(let i = 0; i < height*width; i++) {                
        const xPos = i % width;
        var _xPos = xPos;
        var _yPos = yPos;
        if (normalize) {
            _xPos /= width;
            _yPos /= height;
        }
        const pixel = {
            idx : i,
            nzIdx : nzIdx,
            x: _xPos, y : _yPos,
            R : data[i*4],
            G : data[(i*4) + 1],
            B : data[(i*4) + 2],
            A : data[(i*4) + 3]
        }
        // console.log("YO GOT PIXEL", pixel.A);
        if (pixel.A > 0 || pixel.R > 0 || pixel.G > 0 || pixel.B > 0) {
            // console.log("PIXEL!", pixel);
            pixels.push(pixel);
            nzIdx++;
        }
        if (i % height == height - 1) 
            yPos++;
    }
    return pixels;
}

const ASCIIPixel = (props : {
    character: string, 
    position : {x : number, y : number},
    color : string,
    font : string | null,
    fontWeight : string | null
}) => {
    return <div className='ascii-pixel' 
        style={{
            transform: `translateX(${props.position.x}px) translateY(${props.position.y}px)`,
            color: props.color,
            fontFamily: props.font,
            fontWeight: props.fontWeight
            // backgroundColor: props.color
        }}>
        <p>{props.character}</p>
    </div>
}

export function ASCIIPixels(props: {
    pixels : ImageDataPixel[],
    scaleFactor : {width: number, height: number},
    charSelector : (p : ImageDataPixel) => string,
    font : string,
    fontWeight : string
}) {

    const [asciiPixels, setAsciiPixels] = useState(null);

    function generateASCIIPixels(pixels : ImageDataPixel[],
        charSelector : (p : ImageDataPixel) => string) 
    {
        const _asciiPixels = [];
        var id = 0;
        for (const p of pixels) {
            const position = {
                x : p.x * props.scaleFactor.width,
                y : p.y * props.scaleFactor.height
            }
            _asciiPixels.push(<ASCIIPixel
                character={charSelector(p)}
                position={position}
                color={rgbToHex(p.R, p.G, p.B)}
                font={props.font}
                fontWeight={props.fontWeight}
                key={`px-${p.idx}`}/>)
            id++;
        }
        return _asciiPixels;
    }

    useEffect(() => {
        setAsciiPixels(generateASCIIPixels(
            props.pixels, props.charSelector))
    }, [props.pixels, props.charSelector])

    return <div className='ascii-pixel-container prevent-select'>
        {asciiPixels}
    </div>
}



// function generateASCIIPixels(pixels : ImageDataPixel[],
//     charSelector : (p : ImageDataPixel) => string) 
// {
//     const _asciiPixels = [];
//     var id = 0;
//     for (const p of pixels) {
//         const position = {
//             x : p.x * props.scaleFactor,
//             y : p.y * props.scaleFactor
//         }
//         _asciiPixels.push(<ASCIIPixel
//             character={charSelector(p)}
//             position={position}
//             color={rgbToHex(p.R, p.G, p.B)}
//             key={`px-${p.idx}`}/>)
//         id++;
//     }
//     return _asciiPixels;
// }
