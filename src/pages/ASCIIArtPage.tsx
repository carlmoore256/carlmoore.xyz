import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { ASCIIArtCanvas, CanvasDrawCallback, ASCIIArtFontOptions } from "../components/ASCIIArtCanvas";
import { ControlPanel, Incrementor, Toggle, TextInput, CTRL_PANL_RIGHT } from "../components/ControlPanel";
import { debounce } from 'lodash';
import { randomColor } from "../utils/color";

const IMG_SRC = "images/coolalien.png"
const RESIZE_DEBOUNCE = 50;

export function ASCIIArtPage() {
    const targetRef = useRef(null);
    const imgRef = useRef(null);
    
    const [drawCallbacks, setDrawCallbacks] = useState<CanvasDrawCallback[]>([]);
    const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
    const [scrollSpeed, setScrollSpeed] = useState<number>(20);
    const [decimate, setDecimate] = useState<number>(8);
    const [font, setFont] = useState<string>("monospace");
    const [fontSize, setFontSize] = useState<number>(10);

    const [widget1, setWidget1] = useState<number>(20);
    const [widget2, setWidget2] = useState<number>(150);
    const [widget3, setWidget3] = useState<number>(170);
    const [canvasDims, setCanvasDims] = useState<{width: number, height: number}>({
        width: window.innerWidth, 
        height: window.innerHeight
    });

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
    
    useEffect(() => {
        setDrawCallbacks([
            (ctx : CanvasRenderingContext2D) => {
                // ctx.fillStyle = "white";
                for (let i = 0; i < 3; i++) {
                    if (i == 2) ctx.fillStyle = "white";
                    else ctx.fillStyle = randomColor();
                    ctx.font = `${widget3}px 'Arial black'`;
                    ctx.fillText("cool", widget1+(i*10), widget2+(i*10));
                    ctx.fillText("ascii", widget1+(i*10), widget2+(i*10) + (widget3*1));
                    ctx.fillText("stuff", widget1+(i*10), widget2+(i*10) + (widget3*2));
                }
            }
        ])    
    }, [widget1, widget2, widget3, widget3]);

    return <>
        <div style={{width: "100%", height: "100%"}} ref={targetRef}>
            <img src={IMG_SRC} style={{display: 'none'}} ref={imgRef} onLoad={(e) => {
                console.log(imgRef.current.width)
                const width = imgRef.current.width;
                setDrawCallbacks(prev => [(ctx) => ctx.drawImage(imgRef.current, window.innerWidth-width, 100), ...prev])
            }}/>
            <ControlPanel
                panelComponents={[
                    <Toggle
                        key="panel-scroll-enab"
                        label="Text Scroll"
                        state={scrollEnabled}
                        setState={setScrollEnabled}/>,
                    <Incrementor
                        key="panel-scroll"
                        label={`Scroll Speed`}
                        incSettings={{ changeBy: 5, min: 1, max: 999 }}
                        state={scrollSpeed} setState={setScrollSpeed}/>,
                    <Incrementor
                        key="panel-1-decimation"
                        label={`Decimation Factor`}
                        state={decimate} setState={setDecimate}
                        incSettings={{ changeBy: 1, min: 2, max: 100 }}/>,
                        <Incrementor
                        key="panel-font-size"
                        label={`Font Size`}
                        incSettings={{ changeBy: 1, min: 1, max: 300 }}
                        state={fontSize} setState={setFontSize}/>,
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
                    <TextInput
                        key="panel-font"
                        label="Font"
                        state={font}
                        setState={setFont}
                        />,
                ]}
                style={CTRL_PANL_RIGHT}
                togglePanel={false}
            />
            <ASCIIArtCanvas
                drawCallbacks={drawCallbacks}
                fontOptions={{font: font, size: fontSize}}
                decimate={decimate}
                canvasDims={canvasDims}
                scrollEffect={{enabled: scrollEnabled, speed: scrollSpeed}}
            />
        </div>
    </>
}