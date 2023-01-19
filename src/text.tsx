export const SOURCE_TEXT = () => {return `import React, { 
    useState, 
    forwardRef, 
    createRef, 
    useEffect, 
    useMemo, 
    useRef, 
    Component } from 'react';

export interface DecimatedImageData {
    imgDataRaw : ImageData;
    imgDataURL : string,
    imgDims : {
        width: number,
        height: number
    }
}

export function DecimationCanvas(props : {
    decimate : number,
    imageRef : React.MutableRefObject<any>, // an html image ref
    imageDataCB : (data : DecimatedImageData) => void,
    showFull : boolean,
    showDeci : boolean
}) {
    const canvasFullRef = useRef<HTMLCanvasElement>(null);
    const canvasDeciRef = useRef<HTMLCanvasElement>(null);

    const [canvasFull, setCanvasFull] = useState(<canvas
        className="decimate-canvas"
        height={window.innerHeight} 
        width={window.innerWidth} 
        ref={canvasFullRef}/>);

    const [canvasDeci, setCanvasDeci] = useState(<canvas
        className="decimate-canvas"
        height={window.innerHeight/props.decimate} 
        width={window.innerWidth/props.decimate} 
        ref={canvasDeciRef}/>);
    const [imageData, setImageData] = useState<DecimatedImageData | null>(null);

    useEffect(() => {
        if (canvasFullRef.current == null || props.imageRef == null) return;
        const image = props.imageRef.current;
        const {width, height} = canvasDeciRef.current;
        const ctx = canvasFullRef.current.getContext("2d");
        const dX = (width / 2) - (image.width/4);
        const dY = (height / 2) - (image.width/4);
        ctx.drawImage(
            image, 0, 0, 
            image.width*2, image.height*2, 
            dX, dY, image.width, image.height);
    }, [props.imageRef])

    useEffect(() => {
        setCanvasDeci(<canvas
            className="decimate-canvas"
            width={window.innerWidth/props.decimate} 
            height={window.innerHeight/props.decimate} 
            ref={canvasDeciRef}/>);
    }, [props.decimate])

    useEffect(() => {
        if (canvasDeciRef.current == null) return;
        const ctx = canvasDeciRef.current.getContext("2d");
        const {width, height} = canvasDeciRef.current;
        ctx.clearRect(0, 0, width, height);
        ctx.scale(1/props.decimate, 1/props.decimate);
        ctx.drawImage(canvasFullRef.current, 0, 0);
        //@ts-ignore
        setImageData({
            imgDataRaw: ctx.getImageData(0, 0, width, height),
            imgDataURL: canvasDeciRef.current.toDataURL(),
            imgDims: {width, height}
        });
    }, [canvasDeci])

    useEffect(() => {
        props.imageDataCB(imageData);
    }, [imageData])

    return <div className='page-centered'>
        <div style={{opacity: props.showFull ? 1 : 0, transitionDuration: '200ms'}}>
            {canvasFull}
        </div> 
        <div style={{opacity: props.showDeci ? 1 : 0, transitionDuration: '200ms'}}>
            {canvasDeci}
        </div>
    </div>
}`.replaceAll("\n", "").replaceAll(" ", "")}