import { useRef, useState, useEffect, createContext, useLayoutEffect } from 'react';
import { ScalableImageCanvas, DecimationCanvasNew } from "../components/DecimationCanvas"
import { ControlPanel, Incrementor, ControlPanelProps, Toggle, TextInput } from '../components/ControlPanel';
import { ASCIIPixels, getNonzeroPixels } from '../components/ASCIIPixels';
import { randomCharacter } from '../helpers';
import { debounce } from 'lodash';
import { Hexagon } from '../components/Canvas';

const TEST_IMG = "images/19.png"

const RESIZE_DEBOUNCE = 50;


const GetGradient = (ctx : any) => {
    var gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(.25, "yellow");
    gradient.addColorStop(.50, "green");
    gradient.addColorStop(.75, "blue");
    gradient.addColorStop(1.0, "magenta");
    return gradient;
}

export function Test() {

    const canvasRef = useRef(null);

    const [imageScale, setImageScale] = useState<number>(1);
    const [decimate, setDecimate] = useState<number>(9);
    const [canvasDimX, setCanvasDimX] = useState<number>(500);
    const [canvasDimY, setCanvasDimY] = useState<number>(400);
    const [showFull, setShowFull] = useState<boolean>(false);
    const [showDeci, setShowDeci] = useState<boolean>(false);

    const [widget1, setWidget1] = useState<number>(70);
    const [widget2, setWidget2] = useState<number>(150);
    const [widget3, setWidget3] = useState<number>(200);
    const [widget4, setWidget4] = useState<number>(170);
    
    const [asciiOffsetX, setAsciiScaleX] = useState<number>(0);
    const [asciiOffsetY, setAsciiScaleY] = useState<number>(0);

    const [textOffset, setTextOffset] = useState(0);
    const [mousePos, setMousePos] = useState<{x: number, y: number}>({x: 0, y: 0});

    const [text, setText] = useState("sample text");

    const [drawCallbacks, setDrawCallbacks] = useState<any>([
        (ctx : CanvasRenderingContext2D) => {
            ctx.fillStyle = "black";
            ctx.fillRect(0,500,10,500)
        },
        (ctx : CanvasRenderingContext2D) => {
            ctx.font = `${widget3}px Helvetica`;
            ctx.fillStyle = GetGradient(ctx);
            ctx.fillText("carl", widget1, widget2);
            ctx.fillText("moore", widget1, widget2 + (widget4*1));
            ctx.fillText(".xyz", widget1, widget2 + (widget4*2));
        }
    ])
    
    const [canvasDims, setCanvasDims] = useState<{width: number, height: number}>(
        {width: window.innerWidth, height: document.documentElement.clientHeight});
        
    const [pixels, setPixels] = useState([]);



    // useEffect(() => {
    //     setTimeout(() => {
    //         setTextOffset(textOffset+1);
    //         }, 200);
    // }, [textOffset])
    


    useEffect(() => {
        setDrawCallbacks([
            (ctx : CanvasRenderingContext2D) => {
                ctx.fillStyle = "black";
                ctx.fillRect(0,500,10,500)
            },
            (ctx : CanvasRenderingContext2D) => {
                ctx.font = `${widget3}px Helvetica`;
                ctx.fillStyle = GetGradient(ctx);
                ctx.fillText("carl", widget1, widget2);
                ctx.fillText("moore", widget1, widget2 + (widget4*1));
                ctx.fillText(".xyz", widget1, widget2 + (widget4*2));
            }
        ])    
    }, [widget1, widget2, widget3, widget4, text])

    useLayoutEffect(() => {
        const handleResize = () => {
            setCanvasDims({
            width: window.innerWidth, 
            height: window.innerHeight
            });
        }
        const debouncedHandleResize = debounce(handleResize, RESIZE_DEBOUNCE);
        window.addEventListener('resize', debouncedHandleResize);
        return () => {
        window.removeEventListener('resize', debouncedHandleResize);
        }
    }, []);

    window.addEventListener("mousemove", (e) => {
        setWidget2(e.clientY);
        setWidget1(e.clientX);
    })

    
    return <div className="content" ref={canvasRef}>
        <h1>Test</h1>
        {/* <ControlPanel
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
                    key="panel-0-image-scale"
                    label={`Image Scale`}
                    state={imageScale} setState={setImageScale}
                    incSettings={{ changeBy: 0.1, min: 0.1, max: 10.00 }}/>,
                <Incrementor
                    key="panel-1-decimation"
                    label={`Decimation Factor`}
                    state={decimate} setState={setDecimate}
                    incSettings={{ changeBy: 1, min: 2, max: 100 }}/>,
                <Incrementor
                    key="panel-2-dim-x"
                    label={`Canvas Width`}
                    state={canvasDimX} setState={setCanvasDimX}
                    incSettings={{ changeBy: 5, min: 1, max: window.innerWidth }}/>,
                <Incrementor
                    key="panel-3-dim-y"
                    label={`Canvas Width`}
                    state={canvasDimY} setState={setCanvasDimY}
                    incSettings={{ changeBy: 5, min: 1, max: window.innerHeight }}/>,
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
                <TextInput
                    key="panel-10"
                    label={`ASCII Text`}
                    state={text}
                    setState={setText}/>
            ]}
        /> */}

    
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

        {/* <ASCIIPixels
          pixels={pixels}
          scaleFactor={{width: decimate + asciiOffsetX, height: decimate +  asciiOffsetY}}
        //   charSelector={p => "■"}/>
          charSelector={(p) => {
            const t = text.slice((p.nzIdx + textOffset) % text.length)[0];
            return t;
          }}/> */}
    </div>
}