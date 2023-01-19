import { useState, useEffect, useRef, createContext, useContext } from 'react';


const SharingContext = createContext(null);

export function Canvas(props: {
    children : any,
    size: {width: number, height: number}
}) {
    const canvasRef = useRef(null);
    const [canvasCtx, setCanvasCtx] = useState(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        setCanvasCtx(ctx);
    }, [])

    return <>
        <SharingContext.Provider value={canvasCtx}>
            <canvas ref={canvasRef} 
                width={props.size.width} 
                height={props.size.height}/>
            {props.children}
        </SharingContext.Provider>
    </>
}

export function Hexagon(props :{
    foo: string,
    draws: any[]
}) {
    const canvasCtx = useContext(SharingContext);

    console.log("CANVAS CTX", canvasCtx);

    if (canvasCtx !== null) {
        for (const callback of props.draws) {
           callback(canvasCtx); 
        }
        console.log("did some things to canvas")
    }
    return <div>
        <p>test</p>
    </div>
}