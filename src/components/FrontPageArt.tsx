import { useRef, useState, useEffect, createContext, useLayoutEffect } from 'react';
import { ScalableImageCanvas, DecimationCanvasNew } from "../components/DecimationCanvas"
import { ControlPanel, Incrementor, ControlPanelProps, Toggle, TextInput, CTRL_PANL_RIGHT } from '../components/ControlPanel';
import { ASCIIPixels, getNonzeroPixels } from '../components/ASCIIPixels';
import { randomCharacter } from '../helpers';
import { debounce } from 'lodash';
import { Hexagon } from '../components/Canvas';

const TEST_IMG = "images/19.png"

const RESIZE_DEBOUNCE = 50;

const DEFAULT_TEXT = `"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."`

const CHARSET = ["*", "+", "&", "x", "#", "@"];

const GetGradient = (ctx : any) => {
    var gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    // gradient.addColorStop(0, "#ff8363");
    // gradient.addColorStop(0.75, "magenta");
    // gradient.addColorStop(0, "white");
    gradient.addColorStop(0, "black");
    // gradient.addColorStop(0, "yellow");
    // gradient.addColorStop(.50, "green");
    // gradient.addColorStop(.75, "blue");
    return gradient;
}

export function FrontPageArt() {

    const canvasRef = useRef(null);

    const targetRef = useRef(null);
    const [decimate, setDecimate] = useState<number>(8);
    // const [canvasDimX, setCanvasDimX] = useState<number>(500);
    // const [canvasDimY, setCanvasDimY] = useState<number>(400);
    const [showFull, setShowFull] = useState<boolean>(false);
    const [showDeci, setShowDeci] = useState<boolean>(false);

    const [widget1, setWidget1] = useState<number>(20);
    const [widget2, setWidget2] = useState<number>(150);
    const [widget3, setWidget3] = useState<number>(175);
    const [widget4, setWidget4] = useState<number>(170);
    
    const [asciiOffsetX, setAsciiScaleX] = useState<number>(0);
    const [asciiOffsetY, setAsciiScaleY] = useState<number>(0);

    const [textOffset, setTextOffset] = useState(0);
    const [mousePos, setMousePos] = useState<{x: number, y: number}>({x: 0, y: 0});

    const [text, setText] = useState(DEFAULT_TEXT);
    const [replaceChar, setReplaceChar] = useState(randomCharacter(CHARSET));

    const [drawCallbacks, setDrawCallbacks] = useState<any>([]);
    // document.documentElement.clientHeight
    const [canvasDims, setCanvasDims] = useState<{width: number, height: number}>(
        {width: window.innerWidth, height: window.innerWidth});
        
    const [pixels, setPixels] = useState([]);

    // document.body.style.backgroundColor = "black"


    useEffect(() => {
        setTimeout(() => {
            var newText = '';
            for (let i = 0; i < text.length; i++) {
                if (i % (textOffset % text.length) == 0) {
                    newText += replaceChar;
                } else {
                   newText += text[i];
                }
            }
            setText(newText)
            const newOffset = textOffset + 1;
            setTextOffset(newOffset);
            if (textOffset % 10 == 0) { 
                setReplaceChar(randomCharacter(CHARSET));
            }
            }, 10);
    }, [textOffset])
    
    useEffect(() => {
        // update canvas
        
    }, []);


    useEffect(() => {
        var fontSize = 200;
        var textOffset = widget4;
        if (targetRef.current.clientWidth < 800) {
            fontSize = (targetRef.current.clientWidth/700) * widget3;
            textOffset *= (targetRef.current.clientWidth/800)
        }
        
        setDrawCallbacks([
            (ctx : CanvasRenderingContext2D) => {
                ctx.font = `${fontSize}px 'Arial Black'`;
                ctx.fillStyle = GetGradient(ctx);
                ctx.fillText("carl", widget1, widget2);
                ctx.fillText("moore", widget1, widget2 + (textOffset*1));
                ctx.fillText(".xyz", widget1, widget2 + (textOffset*2));
            }
        ])    
    }, [widget1, widget2, widget3, widget4, canvasDims])

    useLayoutEffect(() => {
        const handleResize = () => {
            setCanvasDims({
                width: targetRef.current.clientWidth, 
                height: targetRef.current.clientHeight
            });
        }
        const debouncedHandleResize = debounce(handleResize, RESIZE_DEBOUNCE);
        window.addEventListener('resize', debouncedHandleResize);
        return () => {
            window.removeEventListener('resize', debouncedHandleResize);
        }
    }, []);
    
    return <>
        <div style={{width: "100%", height: "100%"}} ref={targetRef}>
            <ControlPanel
                panelComponents={[
                    <Toggle
                        key="panel-full"
                        label="Full"
                        state={showFull}
                        setState={setShowFull}/>,
                    <Toggle
                        key="panel-deci"
                        label="Decimated"
                        state={showDeci}
                        setState={setShowDeci}/>,
                    <Incrementor
                        key="panel-1-decimation"
                        label={`Decimation Factor`}
                        state={decimate} setState={setDecimate}
                        incSettings={{ changeBy: 1, min: 2, max: 100 }}/>,
                    <Incrementor
                        key="panel-4-w1"
                        label={`Widget 1`}
                        incSettings={{ changeBy: 5, min: 1, max: 999 }}
                        state={widget1} setState={setWidget1}/>,
                    <Incrementor
                        key="panel-5-w2"
                        label={`Widget 2`}
                        incSettings={{ changeBy: 5, min: 1, max: 999 }}
                        state={widget2} setState={setWidget2}/>,
                    <Incrementor
                        key="panel-6-w3"
                        label={`Widget 3`}
                        incSettings={{ changeBy: 5, min: 1, max: 999 }}
                        state={widget3} setState={setWidget3}/>,
                    <Incrementor
                        key="panel-7-w4"
                        label={`Widget 4`}
                        incSettings={{ changeBy: 5, min: 1, max: 999 }}
                        state={widget4} setState={setWidget4}/>,
                    <Incrementor
                        key="panel-8"
                        label={`ASCII Offset - X`}
                        state={asciiOffsetX} setState={setAsciiScaleX}
                        incSettings={{ changeBy: 0.1, min: -9999, max: 9999 }}/>,
                    <Incrementor
                        key="panel-9"
                        label={`ASCII Offset - Y`}
                        state={asciiOffsetY} setState={setAsciiScaleY}
                        incSettings={{ changeBy: 0.1, min: -9999, max: 9999 }}/>,
                    // <TextInput
                    //     key="panel-10"
                    //     label={`ASCII Text`}
                    //     state={text}
                    //     setState={setText}/>
                ]}
                style={CTRL_PANL_RIGHT}
                togglePanel={false}
            />

        
            <DecimationCanvasNew
                drawCallbacks={drawCallbacks}
                decimate={decimate}
                showFull={showFull}
                showDeci={showDeci}
                canvasDims={canvasDims}
                imageDataCB={data => {
                    setPixels(getNonzeroPixels(data));
                }}
            />

            <ASCIIPixels
                pixels={pixels}
                scaleFactor={{width: decimate + asciiOffsetX, height: decimate +  asciiOffsetY}}
                charSelector={(p) => {
                    // const t = text.slice((p.nzIdx + textOffset) % text.length)[0];
                    const t = text[p.nzIdx % text.length];
                    return t;
                    
                }}
                font={"20px, 'Lucida Console', Monospace"}
                fontWeight={'900'}
            />
        </div>
    </>
}

//   charSelector={p => "■"}/>