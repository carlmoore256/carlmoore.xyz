import React, { 
    useState, 
    forwardRef, 
    createRef, 
    useEffect, 
    useMemo, 
    useRef,
    useCallback,
    Component,
    createContext, 
    useContext} from 'react';

export interface DecimatedImageData {
    imgDataRaw : ImageData;
    imgDataURL : string
}

export function DecimationCanvas(props : {
    sourceCanvas : React.MutableRefObject<HTMLCanvasElement>,
    decimate : number,
    showFull : boolean,
    showDeci : boolean,
    imageSrc : string,
    imageScale : number,
    canvasDims : {width: number, height: number},
    imageDataCB : (data : ImageData) => void,
}) {
    // const canvasFullRef = useRef<HTMLCanvasElement>(null);
    const canvasDeciRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [imageDims, setImageDims] = useState<{width: number, height: number} | null>();    
    const [canvasFull, setCanvasFull] = useState<any>(<canvas
        className="decimate-canvas" ref={props.sourceCanvas}
        width={props.canvasDims.width} height={props.canvasDims.height}/>);
    const [canvasDeci, setCanvasDeci] = useState<any>(<canvas className="decimate-canvas" ref={canvasDeciRef}
        width={props.canvasDims.width/props.decimate} 
        height={props.canvasDims.height/props.decimate}/>);

    useEffect(() => {
        setCanvasFull(<canvas
            className="decimate-canvas" ref={props.sourceCanvas}
            width={props.canvasDims.width} height={props.canvasDims.height}/>)
        setCanvasDeci(<canvas className="decimate-canvas" ref={canvasDeciRef}
            width={props.canvasDims.width/props.decimate} 
            height={props.canvasDims.height/props.decimate}/>)
        // renderFull();
    }, [props.canvasDims])


    const renderFull = () => {
        if (imageDims == null) return;
        const image = imageRef.current;
        var {width, height} = props.sourceCanvas.current;
        const ctx = props.sourceCanvas.current.getContext("2d", {"willReadFrequently": true});
        ctx.clearRect(0, 0, width, height);
        const dX = (width / 2) - (imageDims.width/2);
        const dY = (height / 2) - (imageDims.height/2);
        ctx.drawImage(
            image, 0, 0, 
            image.width, image.height, 
            dX, dY, imageDims.width, imageDims.height);
        renderDeci();
    };

    const renderDeci = () => {
        const ctx = canvasDeciRef.current.getContext("2d", {"willReadFrequently": true});
        const {width, height} = canvasDeciRef.current;
        canvasDeciRef.current.width = props.canvasDims.width/props.decimate;
        canvasDeciRef.current.height = props.canvasDims.height/props.decimate;
        ctx.clearRect(0, 0, width, height);
        ctx.scale(1/props.decimate, 1/props.decimate);
        ctx.drawImage(props.sourceCanvas.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height); 
        props.imageDataCB(imageData);
    };

    useEffect(() => {
        renderDeci();
    }, [props.decimate])

    useEffect(() => {
        if (imageRef.current == null) return;
        var {naturalWidth: width, naturalHeight: height} = imageRef.current;
        if (width == 0 || height == 0) return;
        width *= props.imageScale;
        height *= props.imageScale;
        setImageDims({width, height});
        // renderFull();
    }, [props.imageScale]);

    useEffect(() => {
        renderFull();
    }, [imageDims, canvasFull])

    return <div className='page-centered'>

        <div>
            <img src={props.imageSrc} ref={imageRef} style={{display: 'none'}} onLoad={(e) => {
                const {naturalWidth, naturalHeight} = e.target as HTMLImageElement;
                setImageDims({width : naturalWidth * props.imageScale, height: naturalHeight * props.imageScale});
                renderFull();
            }}/>
            <div className="centered-fixed">
                <p className='info-overlay'>Width: {imageDims?.width.toFixed(2)} Height: {imageDims?.height.toFixed(2)}</p>
            </div>
        </div>
        

        <div style={{opacity: props.showFull ? 1 : 0, transitionDuration: '200ms'}}>
            {canvasFull}
        </div> 
        <div style={{opacity: props.showDeci ? 1 : 0, transitionDuration: '200ms'}}>
            {canvasDeci}
        </div>
    </div>
}

export function ScalableImageCanvas(props : {
    canvasRef : any,
    imageSrc : string,
    imageScale : number,
    canvasDims : {width: number, height: number}
}) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageDims, setImageDims] = useState<{width: number, height: number} | null>();    

    const renderCanvas = () => {
        if (imageDims == null) return;
        const image = imageRef.current;
        var {width, height} = props.canvasRef.current;
        const ctx = props.canvasRef.current.getContext("2d", {"willReadFrequently": true});
        ctx.clearRect(0, 0, width, height);
        const dX = (width / 2) - (imageDims.width/2);
        const dY = (height / 2) - (imageDims.height/2);
        ctx.drawImage(
            image, 0, 0, 
            image.width, image.height, 
            dX, dY, imageDims.width, imageDims.height);
    };

    useEffect(() => {
        if (imageRef.current == null) return;
        var {naturalWidth: width, naturalHeight: height} = imageRef.current;
        if (width == 0 || height == 0) return;
        width *= props.imageScale;
        height *= props.imageScale;
        setImageDims({width, height});
        renderCanvas();
    }, [props.imageScale]);
    
    useEffect(() => {
        renderCanvas();
    }, [props.canvasDims])

    return <>
        <img src={props.imageSrc} ref={imageRef} style={{display: 'none'}} onLoad={(e) => {
            const {naturalWidth, naturalHeight} = e.target as HTMLImageElement;
            setImageDims({width : naturalWidth * props.imageScale, height: naturalHeight * props.imageScale});
            renderCanvas();
        }}/>
        <canvas ref={props.canvasRef}
            width={props.canvasDims.width} 
            height={props.canvasDims.height}
        />
    </>
}

export function ScalableImageContext(props: {
    
}) {

    // const imageRef = useRef<HTMLImageElement>(null);
    // const [imageDims, setImageDims] = useState<{width: number, height: number} | null>();    

    // const renderCanvas = () => {
    //     if (imageDims == null) return;
    //     const image = imageRef.current;
    //     var {width, height} = props.canvasRef.current;
    //     const ctx = props.canvasRef.current.getContext("2d", {"willReadFrequently": true});
    //     ctx.clearRect(0, 0, width, height);
    //     const dX = (width / 2) - (imageDims.width/2);
    //     const dY = (height / 2) - (imageDims.height/2);
    //     ctx.drawImage(
    //         image, 0, 0, 
    //         image.width, image.height, 
    //         dX, dY, imageDims.width, imageDims.height);
    // };

    // useEffect(() => {
    //     if (imageRef.current == null) return;
    //     var {naturalWidth: width, naturalHeight: height} = imageRef.current;
    //     if (width == 0 || height == 0) return;
    //     width *= props.imageScale;
    //     height *= props.imageScale;
    //     setImageDims({width, height});
    //     renderCanvas();
    // }, [props.imageScale]);
    
    // useEffect(() => {
    //     renderCanvas();
    // }, [props.canvasDims])


    // return <>
    //     <img src={props.imageSrc} ref={imageRef} style={{display: 'none'}} onLoad={(e) => {
    //         const {naturalWidth, naturalHeight} = e.target as HTMLImageElement;
    //         setImageDims({width : naturalWidth * props.imageScale, height: naturalHeight * props.imageScale});
    //         renderCanvas();
    //     }}/>
    // </>
}


// canvasContext : React.Context<any> | any,

export type DrawCallback = (ctx : CanvasRenderingContext2D) => void;

export function DecimationCanvasNew(props : {
    drawCallbacks : DrawCallback[],
    decimate : number,
    showFull : boolean,
    showDeci : boolean,
    canvasDims : {width: number, height: number},
    imageDataCB : (data : ImageData) => void
}) {

    const canvasFullRef = useRef<HTMLCanvasElement>(null);
    const canvasDeciRef = useRef<HTMLCanvasElement>(null);

    const [canvasFull, setCanvasFull] = useState<any>(<canvas
        className="decimate-canvas" ref={canvasFullRef}
        width={props.canvasDims.width} height={props.canvasDims.height}/>);

    const [canvasDeci, setCanvasDeci] = useState<any>(<canvas 
        className="decimate-canvas" ref={canvasDeciRef}
        width={props.canvasDims.width/props.decimate} 
        height={props.canvasDims.height/props.decimate}/>);

    const [fullCanvasCtx, setFullCanvasCtx] = useState(null);

    // console.log("NEW RENDER")

    useEffect(() => {
        const ctx = canvasFullRef.current.getContext("2d");
        setFullCanvasCtx(ctx);
    }, [canvasFull])

    useEffect(() => {
        setCanvasFull(<canvas
            className="decimate-canvas" ref={canvasFullRef}
            width={props.canvasDims.width} height={props.canvasDims.height}/>)
        setCanvasDeci(<canvas 
            className="decimate-canvas" ref={canvasDeciRef}
            width={props.canvasDims.width/props.decimate} 
            height={props.canvasDims.height/props.decimate}/>)
            // height={props.canvasDims.width/props.decimate
        // renderFull();
    }, [props.canvasDims])

    const renderFull = (drawCallbacks : any[]) => {
        var {width, height} = canvasFullRef.current;
        fullCanvasCtx.clearRect(0, 0, width, height);
        for (const callback of drawCallbacks) {
            // console.log("CALLING CALLBACK")
            callback(fullCanvasCtx);
        }
        renderDeci();
    };

    const renderDeci = () => {
        const ctx = canvasDeciRef.current.getContext("2d", {"willReadFrequently": true});
        canvasDeciRef.current.width = props.canvasDims.width/props.decimate;
        canvasDeciRef.current.height = props.canvasDims.height/props.decimate;
        // canvasDeciRef.current.height = props.canvasDims.width/props.decimate;
        const {width, height} = canvasDeciRef.current;
        ctx.clearRect(0, 0, width, height);
        ctx.scale(1/props.decimate, 1/props.decimate);
        ctx.drawImage(canvasFullRef.current, 0, 0);
        const imageData = ctx.getImageData(0, 0, props.canvasDims.width, props.canvasDims.width); 
        props.imageDataCB(imageData);
    };

    useEffect(() => {
        renderDeci();
    }, [props.decimate])

    useEffect(() => {
        // console.log("CALLING CANVAS FULL CB")
        if (!fullCanvasCtx) return;
        renderFull(props.drawCallbacks);
    }, [canvasFull, props.drawCallbacks])

    return <>
        <div style={{opacity: props.showFull ? 1 : 0, transitionDuration: '200ms'}}>
            {canvasFull}
        </div> 
        <div style={{opacity: props.showDeci ? 1 : 0, transitionDuration: '200ms'}}>
            {canvasDeci}
        </div>
    </>
}
    // const canvasFullRef = useRef<HTMLCanvasElement>(null);
    // const canvasDeciRef = useRef<HTMLCanvasElement>(null);
    // const imageRef = useRef<HTMLImageElement>(null);

    // const [imageDims, setImageDims] = useState<{width: number, height: number} | null>();    

    // const [canvasDeci, setCanvasDeci] = useState<any>(<canvas className="decimate-canvas" ref={canvasDeciRef}
    //     width={props.canvasDims.width/props.decimate} 
    //     height={props.canvasDims.height/props.decimate}/>);

    // useEffect(() => {
    //     setCanvasFull(<canvas
    //         className="decimate-canvas" ref={props.sourceCanvas}
    //         width={props.canvasDims.width} height={props.canvasDims.height}/>)
    //     setCanvasDeci(<canvas className="decimate-canvas" ref={canvasDeciRef}
    //         width={props.canvasDims.width/props.decimate} 
    //         height={props.canvasDims.height/props.decimate}/>)
    //     // renderFull();
    // }, [props.canvasDims])


    // const renderDeci = () => {
    //     const ctx = canvasDeciRef.current.getContext("2d", {"willReadFrequently": true});
    //     const {width, height} = canvasDeciRef.current;
    //     canvasDeciRef.current.width = props.canvasDims.width/props.decimate;
    //     canvasDeciRef.current.height = props.canvasDims.height/props.decimate;
    //     ctx.clearRect(0, 0, width, height);
    //     ctx.scale(1/props.decimate, 1/props.decimate);
    //     ctx.drawImage(props.sourceCanvas.current, 0, 0);
    //     const imageData = ctx.getImageData(0, 0, width, height); 
    //     props.imageDataCB(imageData);
    // };

    // useEffect(() => {
    //     renderDeci();
    // }, [props.decimate])

    // useEffect(() => {
    //     if (imageRef.current == null) return;
    //     var {naturalWidth: width, naturalHeight: height} = imageRef.current;
    //     if (width == 0 || height == 0) return;
    //     width *= props.imageScale;
    //     height *= props.imageScale;
    //     setImageDims({width, height});
    //     // renderFull();
    // }, [props.imageScale]);

    // useEffect(() => {
    //     renderFull();
    // }, [imageDims, canvasFull])

    // return <div className='page-centered'>

    //     <div>
    //         <img src={props.imageSrc} ref={imageRef} style={{display: 'none'}} onLoad={(e) => {
    //             const {naturalWidth, naturalHeight} = e.target as HTMLImageElement;
    //             setImageDims({width : naturalWidth * props.imageScale, height: naturalHeight * props.imageScale});
    //             renderFull();
    //         }}/>
    //         <div className="centered-fixed">
    //             <p className='info-overlay'>Width: {imageDims?.width.toFixed(2)} Height: {imageDims?.height.toFixed(2)}</p>
    //         </div>
    //     </div>
        

    //     <div style={{opacity: props.showFull ? 1 : 0, transitionDuration: '200ms'}}>
    //         {canvasFull}
    //     </div> 
    //     <div style={{opacity: props.showDeci ? 1 : 0, transitionDuration: '200ms'}}>
    //         {canvasDeci}
    //     </div>
    // </div>