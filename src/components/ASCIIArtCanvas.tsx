import { useRef, useState, useEffect } from 'react';
import { DecimationCanvasNew } from "./DecimationCanvas"
import { ASCIICanvasState, getNonzeroPixels, getSymbolAtPosition, ImageDataPixel, getCoordinateKey, Pixel2ASCII, Pixel2Brightness } from './ASCIIPixels';

const CHARSET = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`

/** Callback with previous canvas state and incoming image data from decimation canvas */
function updateASCIICanvasState(prev : ASCIICanvasState, data : ImageData) {
    const sourcePixels = getNonzeroPixels(data, false);
    const symbolMap : Map<string, number> = new Map();
    for (let i = 0; i < sourcePixels.length; i++) {
        const px = sourcePixels[i];
        const brightness = Pixel2Brightness(px, (R,G,B,A) => {return 1-((R+G+B)/(255*3))});
        const key = getCoordinateKey(px.x, px.y);
        symbolMap.set(key, Math.round(brightness * prev.charset.length));
    }
    return Object.assign({}, prev, { sourcePixels, symbolMap });
}

export type CanvasDrawCallback = (ctx : CanvasRenderingContext2D) => void;

export interface ASCIIArtFontOptions {
    font : string;
    size : number;
    color? : string;
}

export interface ASCIIArtCanvasProps {
    drawCallbacks : CanvasDrawCallback[],
    fontOptions   : ASCIIArtFontOptions,
    decimate      : number,
    canvasDims    : {width: number, height: number},
    scrollEffect  : { enabled: boolean; speed: number;}
}

export const DEFAULT_PROPS : ASCIIArtCanvasProps = {
    drawCallbacks : [(ctx : CanvasRenderingContext2D) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(10,10,100,100);
    }],
    fontOptions    : {font: "monospace", size: 10},
    decimate       : 8,
    canvasDims     : {width: window.innerWidth, height: window.innerHeight},
    scrollEffect   : {enabled: false, speed: 20}
}

export function ASCIIArtCanvas(props : ASCIIArtCanvasProps) {
    const { 
        drawCallbacks, 
        fontOptions,
        decimate, 
        canvasDims, 
        scrollEffect } = props;

    const outputCanvas = useRef(null);

    const [asciiCanvasState, setAsciiCanvasState] = useState<ASCIICanvasState>({
        sourcePixels: [],
        symbolMap: new Map(),
        charset: CHARSET,
        animationOffset: 0,
    });
    
    /** Render the ascii pixels */
    useEffect(() => {
        const canvas = outputCanvas.current!;
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontOptions.size}px '${fontOptions.font}'`;
        // two different loops for performance purposes
        if (fontOptions.color) {
            ctx.fillStyle = fontOptions.color;
            for(var {x, y} of asciiCanvasState.sourcePixels) {
                const symbol = getSymbolAtPosition(asciiCanvasState, x, y);
                ctx.fillText(symbol, x * decimate, y * decimate);
            }    
        } else {
            for(var {x, y, R, G, B, A} of asciiCanvasState.sourcePixels) {
                const symbol = getSymbolAtPosition(asciiCanvasState, x, y);
                ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${A})`;
                ctx.fillText(symbol, x * decimate, y * decimate);
            }
        }
    }, [asciiCanvasState, fontOptions, decimate]);

    // ======= Animation ============================

    const animationRef = useRef<number>();
    const lastFrameTimeRef = useRef<number>(0);
  
    const animate = (time : number) => {
        const deltaTime = time - lastFrameTimeRef.current;
        if (deltaTime > scrollEffect.speed) {
            setAsciiCanvasState(prev => {
                const animationOffset = prev.animationOffset + 1;
                return Object.assign({}, prev, {animationOffset});
            });
            lastFrameTimeRef.current = time;
        }
        animationRef.current = requestAnimationFrame(animate);
    }

    useEffect(() => {
        if (!scrollEffect.enabled) return;
        // https://stackoverflow.com/questions/38709923/why-is-requestanimationframe-better-than-setinterval-or-settimeout
        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [scrollEffect]);
    
    return <>
        <canvas 
            width={canvasDims.width} 
            height={canvasDims.height} 
            ref={outputCanvas}/>
        <DecimationCanvasNew
            drawCallbacks={drawCallbacks}
            decimate={decimate}
            showFull={false}
            showDeci={false}
            canvasDims={canvasDims}
            imageDataCB={data => {
                setAsciiCanvasState(prev => updateASCIICanvasState(prev, data)) 
            }}
        />
    </>
}






// const intervalId = setInterval(() => {
//     setAsciiCanvasState(prev => {
//         const animationOffset = prev.animationOffset + 1;
//         return Object.assign({}, prev, {animationOffset});
//     });
// }, scrollSpd);
// return () => clearInterval(intervalId);

// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// const rect = canvas.getBoundingClientRect();
// const dpr = window.devicePixelRatio;
// canvas.width = rect.width * dpr;
// canvas.height = rect.height * dpr;
// ctx.scale(dpr, dpr);
// // Set the "drawn" size of the canvas
// canvas.style.width = `${rect.width}px`;
// canvas.style.height = `${rect.height}px`;

// setAsciiCanvasState(prev => {
//     const sourcePixels = getNonzeroPixels(data, false);
//     const symbolMap: Record<string, number> = {};

//     for (let i = 0; i < sourcePixels.length; i++) {
//         const px = sourcePixels[i];
//         const brightness = Pixel2Brightness(px);
//         const key = getCoordinateKey(px.x, px.y);
//         symbolMap[key] = Math.round(brightness * prev.charset.length);
//     }

//     // for (let i = 0; i < sourcePixels.length; i++) {
//     //     const { x, y, R, G, B, A } = sourcePixels[i];
//     //     const brightness = Math.round((1 - ((R+G+B)/(255*3))) * prev.charset.length) + 1;
//     //     const key = getCoordinateKey(x, y);
//     //     // symbolOffsets[key] = i;
//     //     symbolMap[key] = brightness;
//     // }

//     return Object.assign({}, prev, { sourcePixels, symbolMap });
// });