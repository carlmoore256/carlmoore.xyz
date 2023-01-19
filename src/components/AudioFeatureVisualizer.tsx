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

import DatGui, { 
    DatBoolean, 
    DatColor, 
    DatNumber, 
    DatString, 
    DatButton,
    DatSelect } from 'react-dat-gui';

import { 
    visualizerRender, 
    RenderOptions, 
    RenderState, 
    AudioFeatureNode, 
    AudioFeatureNodeOptions,
    spawnNode } from '../model/audioFeatureRenderer';

import { normalizeFeatures } from '../model/audioAnalysis';

import P5Sketch from "react-p5";
// import { sketch } from '../model/audioFeatureSketch';
import Meyda, { MeydaAudioFeature, MeydaFeaturesObject } from 'meyda';
import p5 from 'p5';
import { render } from 'react-dom';

export type AnalysisBufferSize = 256 | 512 | 1024 | 2048 | 4096 | 8192; 
export type AnalysishopRatio = 1 | 2 | 4 | 8 | 16;

interface AnalysisOptions {
    bufferSize: AnalysisBufferSize | string,
    hopRatio: AnalysishopRatio
}

export function DatGUIPanel(props: {
    children: Element[] | any,
    data : any,
    setData : any
}) {
    return <>
        <DatGui data={props.data} onUpdate={(d) => {props.setData(d)}}>
            {props.children}
        </DatGui>
    </>
}


function hopRatioToSamples(
    hopRatio : string | number, 
    bufferSize : string | number) : number {
    const _hopRatio = (typeof hopRatio == "string" ? parseInt(hopRatio) : hopRatio) as number;
    const _bufferSize = (typeof bufferSize == "string" ? parseInt(bufferSize) : bufferSize) as number;
    return Math.round(_bufferSize / _hopRatio);
}


export function AudioFeatureVisualizer(props: {
    mountRef: any,
    audioSrc: string,
    dimensions: {width: number, height: number}
}) {

    const [analysisOpts, setAnalysisOpts] = useState<AnalysisOptions>({
        bufferSize: 1024,
        hopRatio: 4
    });

    const [renderOpts, setRenderOpts] = useState<RenderOptions>({
        maxNodes: 1000,
        ftX: 'MFCC-0',
        ftY: 'MFCC-1',
        ftHue: 'MFCC-2',
        ftScale: 'rms'
    });

    const [nodeOpts, setNodeOpts] = useState<AudioFeatureNodeOptions>({
        sizeDecy : 0.1,
        movement: 0.1,
        sizeMult : 40,
        stroke : 1,
        drag: 1,
    });

    const audioRef = useRef<HTMLMediaElement>(null);
    const buttonStartRef = useRef<HTMLButtonElement>(null);

    var analyzerBuffer = useRef([]);
    var renderState = useRef<RenderState>({
        normFeatures : null,
        // prevNode : null,
        allNodes : []
    })

    const [audioSrc, setAudioSrc] = useState<string>(props.audioSrc);
    const [audioSource, setAudioSource] = useState<any | null>();
    const [audioContext, setAudioContext] = useState<AudioContext>();
    const [featureAnalyzer, setFeatureAnalyzer] = useState<any>(null);

    useEffect(() => {
        if (audioContext == null) return;
        console.log(`Audio Context State: ${audioContext.state}`);
        if (audioContext.state == "suspended") {
            audioContext.resume();
            console.log("Audio Context Resumed");
        }

        audioRef.current.play();
        // @ts-ignore
        if (!window.source) {
            //@ts-ignore
            window.source = audioContext.createMediaElementSource(audioRef.current);
            //@ts-ignore
            setAudioSource(window.source);
            try {
                //@ts-ignore
                window.source.connect(audioContext.destination);
            } catch {}
        }
    }, [audioContext])

    useEffect(() => {
        if (audioSource == null) return;
        if (featureAnalyzer !== null) featureAnalyzer.stop();
        // reset normalization
        renderState.current.normFeatures = null;
        const { bufferSize, hopRatio } = analysisOpts;
        console.log(`Setting hop size to ${hopRatioToSamples(hopRatio, bufferSize)}`)
        const analyzer = Meyda.createMeydaAnalyzer({
            audioContext: audioSource.context,
            source: audioSource,
            bufferSize: typeof bufferSize == "string" ? parseInt(bufferSize) : bufferSize,
            hopSize: hopRatioToSamples(hopRatio, bufferSize), 
            featureExtractors: [ "rms", "mfcc", "perceptualSpread", "loudness", "buffer" ],
            numberOfMFCCCoefficients: 8,
            windowingFunction: "blackman",
            callback: (features : Partial<MeydaFeaturesObject>) => {
                if (features.rms > 0) {
                    analyzerBuffer.current.push(features);
                }
            }
        })
        analyzer.start();
        setFeatureAnalyzer(analyzer)
    }, [audioSource, analysisOpts])

    useEffect(() => {
        console.log("Feature analyzer reset", featureAnalyzer);
    }, [featureAnalyzer])

    return <div ref={props.mountRef}>
        <button ref={buttonStartRef} onClick={() => {
            setAudioContext(new AudioContext());
            buttonStartRef.current.style.display = 'none';
        }}>Start Analyzer</button>
        
        <audio controls loop crossOrigin="anonymous" 
            ref={audioRef} src={audioSrc}            
            onPause={() => {
                console.log("Stopping feature analyzer");
                featureAnalyzer.stop()
            }} 
            onPlay={() => {if (featureAnalyzer) featureAnalyzer.start();}}/>
        
        <P5Sketch
            setup={(p, canvasParentRef: Element) => {
                const { width, height } = props.dimensions;
                p.createCanvas(width, height).parent(canvasParentRef)
            }}
            draw={(p) => {
                // const _renderState = renderState.current;
                while(analyzerBuffer.current.length > 0) {
                    const features = analyzerBuffer.current.pop();
                    const newNode = spawnNode(features, renderState.current, nodeOpts);
                    // @ts-ignore
                    newNode.setProperties(p, renderOpts);
                }

                // cull extra nodes
                while(renderState.current.allNodes.length > renderOpts.maxNodes) {
                    renderState.current.allNodes.shift();
                }

                for (let i = 0; i < renderState.current.allNodes.length; i++) {
                    const node = renderState.current.allNodes[i];
                    var targetPos = null;
                    if (i > 0) {
                        targetPos = renderState.current.allNodes[i-1].position;
                    }
                    // @ts-ignore
                    node.render(p, renderOpts)
                }
            }}
        />

        <DatGUIPanel data={analysisOpts} setData={setAnalysisOpts}>
            <DatSelect path='bufferSize' label='Buffer Size' options={[256, 512, 1024, 2048, 4096, 8192]} />
            <DatSelect path='hopRatio' label='Hop Size' options={[1,2,4,8,16]}/>
        </DatGUIPanel>
        {/* <DatGUIPanel data={analysisOpts} setData={setAnalysisOpts}>
            <DatNumber path='maxNodes' label='Max Nodes'  min={1} max={5000} step={1}/>
            <DatBoolean path='drawLines' label='Draw Lines'/>
            <DatBoolean path='previewNodes' label='Preview Nodes'/>
            <DatBoolean path='drawNodes' label='Draw Nodes'/>
            <DatNumber path='alphaFadePow' label='Alpha Fade Power'  min={0.01} max={4} step={0.01}/>
            <DatSelect path='featureChoiceX' label='Feature X' options={['MFCC0', 'MFCC1', 'MFCC2', 'MFCC3', 'MFCC4', 'MFCC5', 'rms', 'perceptualSpread', 'loudness']} />
            <DatSelect path='featureChoiceY' label='Feature Y' options={['MFCC0', 'MFCC1', 'MFCC2', 'MFCC3', 'MFCC4', 'MFCC5', 'rms', 'perceptualSpread', 'loudness']} />
            <DatNumber path='drag' label='Drag' min={0.01} max={4} step={0.01}/>
            <DatNumber path='movement' label='Movement' min={0.01} max={4} step={0.01}/>
            <DatNumber path='lineThickness' label='Line Thickness' min={0.01} max={4} step={0.01}/>
            <DatNumber path='nodeSize' label='Node Size' min={0.01} max={4} step={0.01}/>
            <DatBoolean path='scaleNodesRMS' label='scaleNodesRMS'/>
            <DatNumber path='sizeDecay' label='Size Decay' min={0.01} max={4} step={0.01}/>
        </DatGUIPanel> */}
    </div>
}


// visualizerRender(p, 
//     renderState.current.normFeatures, 
//     renderOpts, renderState.current);
// const features = analyzerBuffer.current.pop();
// renderState.current.normFeatures = normalizeFeatures(
//     features, renderState.current.normFeatures)
// renderState


// useEffect(() => {

//     if (featureAnalyzer == null) return;

//     const interval = setInterval(() => {
//         if (analyzerBuffer.current.length > 0) {
//             const features = analyzerBuffer.current.shift();
//             if (features == null) return;
//             const {rms, mfcc, perceptualSpread, loudness, buffer} = features;
//             const avg = (arr : number[]) => arr.reduce((a,b) => a + b, 0) / arr.length;
//             const avgRMS = avg(rms);
//             const avgMFCC = avg(mfcc);
//             const avgPerceptualSpread = avg(perceptualSpread);
//             const avgLoudness = avg(loudness);
//             const avgBuffer = avg(buffer);
//             const avgFeatures = {
//                 rms: avgRMS,
//                 mfcc: avgMFCC,
//                 perceptualSpread: avgPerceptualSpread,
//                 loudness: avgLoudness,
//                 buffer: avgBuffer
//             }
//             // console.log(avgFeatures);
//             // console.log(runningAvgs);
//         }
//     }, 1000);
// }, [featureAnalyzer])