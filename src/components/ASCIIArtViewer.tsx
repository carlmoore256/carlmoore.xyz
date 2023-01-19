import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { DecimationCanvas } from './DecimationCanvas';
import { getNonzeroPixels, ASCIIPixels, ImageDataPixel } from './ASCIIPixels';
import { SOURCE_TEXT } from '../text';
import { Incrementor, Toggle, TextInput } from './ControlPanel';
import { debounce } from 'lodash';

const TXT_SRC = 'data/source.txt'
const IMG_SRC = 'images/motif.svg'
// const IMG_SRC = '19.png'
// const IMG_SRC = 'monalisa.jpeg'
// const IMG_SRC = 'lena.png'

// add a textbox
const RESIZE_DEBOUNCE = 50;

export function ASCIIArtViewer() {
  const [decimate, setDecimate] = useState(8);
  const [showFull, setShowFull] = useState<boolean>(false);
  const [showDeci, setShowDeci] = useState<boolean>(true);

  const [imageSrc, setImageSrc] = useState(IMG_SRC);
  const [pixels, setPixels] = useState<ImageDataPixel[]>([]);
  
  const [text, setText] = useState(SOURCE_TEXT());
  const [textOffset, setTextOffset] = useState(0);
  const [textScrollSpd, setTextScrollSpd] = useState(40);
  const [toggleTextScroll, setToggleTextScroll] = useState<boolean>(false);
  
  const [imageScale, setImageScale] = useState<number>(1);
  const [enableASCII, setEnableASCII] = useState<boolean>(true);
  
  const [asciiOffsetX, setAsciiScaleX] = useState<number>(0);
  const [asciiOffsetY, setAsciiScaleY] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>();
  const [canvasDims, setCanvasDims] = useState<{width: number, height: number}>(
    {width: window.innerWidth, height: window.innerWidth});

  // document.getElementById("root").style.backgroundColor = "#000000"
  // document.body.style.backgroundColor = "#000000"

  // @ts-ignore
  window.canvasRef = canvasRef;

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

  useEffect(() => {
    if (toggleTextScroll) {
      setTimeout(() => {
          setTextOffset(textOffset+1);
        }, textScrollSpd);
    }
  }, [textScrollSpd, textOffset, toggleTextScroll])
  
  return (
    <div className="App">
      <div className='control-panel'>
        <Incrementor
          label={`Decimation Factor`}
          state={decimate} setState={setDecimate}
          incSettings={{ changeBy: 1, min: 1, max: 100 }}/>
        <Toggle
          label="Full"
          state={showFull}
          setState={setShowFull}/>
        <Toggle
          label="Decimated"
          state={showDeci}
          setState={setShowDeci}/>
        <Toggle
          label="ASCII"
          state={enableASCII}
          setState={setEnableASCII}/>
        <Toggle
          label="Text Scroll"
          state={toggleTextScroll}
          setState={setToggleTextScroll}/>
        <Incrementor
          label={`Image Scale`}
          state={imageScale} setState={setImageScale}
          incSettings={{ changeBy: 0.1, min: 0.1, max: 10.00 }}/>
        <TextInput
          label={`Image Src`}
          state={imageSrc}
          setState={setImageSrc}/>

        <Incrementor
          label={`Text Speed`}
          state={textScrollSpd} setState={setTextScrollSpd}
          incSettings={{ changeBy: 10, min: 0, max: 10000 }}/>
        <TextInput
          label={`ASCII Text`}
          state={text}
          setState={setText}/>

        <Incrementor
          label={`ASCII Offset - X`}
          state={asciiOffsetX} setState={setAsciiScaleX}
          incSettings={{ changeBy: 0.1, min: -9999, max: 9999 }}/>
        <Incrementor
          label={`ASCII Offset - Y`}
          state={asciiOffsetY} setState={setAsciiScaleY}
          incSettings={{ changeBy: 0.1, min: -9999, max: 9999 }}/>
      </div>
      
      <DecimationCanvas
        sourceCanvas={canvasRef}
        decimate={decimate}
        showFull={showFull}
        showDeci={showDeci}
        imageSrc={imageSrc}
        imageScale={imageScale}
        canvasDims={canvasDims}
        imageDataCB={(decimatedImageData) => {
          if (decimatedImageData == null) return;
          const nzPix = getNonzeroPixels(decimatedImageData);
          setPixels(nzPix);
        }}
      />

      {
        enableASCII && <ASCIIPixels
          pixels={pixels}
          scaleFactor={{width: decimate + asciiOffsetX, height: decimate +  asciiOffsetY}}
          charSelector={(p) => {
            const t = text.slice((p.nzIdx + textOffset) % text.length)[0];
            return t;
          }}
          font={"helvetica"}
          fontWeight={'bold'}
          />
      }
     
    </div>
  )
}
