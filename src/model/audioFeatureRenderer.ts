import p5 from 'p5';
import { MeydaFeaturesObject } from 'meyda';
import { 
  getFeature, 
  getNormFeature, 
  normalizeFeatures, 
  getNormalizedMFCCS } from './audioAnalysis';

export interface RenderOptions {
    ftX: string,
    ftY: string,
    ftHue: string,
    ftScale: string,
    maxNodes: number,
  }


export interface AudioFeatureNodeOptions {
    drag : number;
    movement : number;
    stroke : number; // aka lineThickness
    sizeMult : number;
    sizeDecy : number;
}

export class AudioFeatureNode {
    position : p5.Vector;
    color : p5.Color;
    size : number;
    dest : p5.Vector;
    velocity : p5.Vector;
    normFeatures : any;
    options : AudioFeatureNodeOptions;
    initialized : boolean = false;

    constructor(normFeatures : any, options : AudioFeatureNodeOptions)    
    {
      this.normFeatures = normFeatures;
      this.options = options;
    }

    setProperties(p : p5, renderOpts : RenderOptions) {
      this.position = p.createVector(
        getNormFeature(this.normFeatures, renderOpts.ftX, p.width/2),
        getNormFeature(this.normFeatures, renderOpts.ftY, p.height/2)
      );
      this.size = getNormFeature(this.normFeatures, renderOpts.ftScale, this.options.sizeMult);
      this.color = p.color(
        getNormFeature(this.normFeatures, renderOpts.ftHue, 100), 100, 30);
    }

    render(p : p5, renderOpts : RenderOptions) {
      if (!this.initialized) this.setProperties(p, renderOpts);
      p.colorMode(p.HSL, 100);
      // if (influencer) {
      //   this.position = this.position.lerp(
      //     influencer.position.x, influencer.position.y, 
      //     0, this.options.movement);
      // }
      p.noStroke();
      p.fill(this.color);
      p.circle(this.position.x, this.position.y, this.size);
    }
}

export interface RenderState {
    normFeatures : any;
    allNodes : AudioFeatureNode[];
    // prevNode : AudioFeatureNode;
}

/** Takes a p5 canvas, a list of features, and rendererState
 * and updates the state with a new node
 */
export function spawnNode(
    features : Partial<MeydaFeaturesObject>,
    renderState : RenderState,
    nodeOpts : AudioFeatureNodeOptions
) {
    renderState.normFeatures = normalizeFeatures(
      features, renderState.normFeatures
    );
    const newNode = new AudioFeatureNode(
      {...renderState.normFeatures}, nodeOpts)
    renderState.allNodes.push(newNode);
    return newNode;
}

// main sketch for visualizer
export function visualizerRender(
    p : p5 | any, 
    features: Partial<MeydaFeaturesObject> | any,
    renderOpts : RenderOptions,
    renderState : RenderState
  ) 
{

  renderState.normFeatures = normalizeFeatures(features, renderState.normFeatures);
    var { normFeatures } = renderState;

    const { ftX: featureX, ftY: featureY, ftHue: featureHue } = renderOpts; 
    const x = getNormFeature(normFeatures, featureX, p.width/2) + p.width/4;
    const y = getNormFeature(normFeatures, featureY, p.height/2) + p.height/4;
    const hue = getNormFeature(normFeatures, featureHue);

    const mfccs = getNormalizedMFCCS(normFeatures, Math.min(p.width, p.height));

    // console.log("x", x, "y", y, "hue", hue);

    p.background(0, 0, 0, 8);
    p.noStroke();
    // p.stroke(255, 102, 0);
    // p.line(x, y, mfccs[2], mfccs[3]);
    // p.line(y, x, mfccs[4], mfccs[5]);
    const color = [getNormFeature(normFeatures, "MFCC-0", 255), 
                    getNormFeature(normFeatures, "MFCC-1", 255), 
                    getNormFeature(normFeatures, "MFCC-2", 255)]
    p.fill(...color);
    p.circle(x, y, getNormFeature(normFeatures, "rms", 20));
    // p.line(x, y)
    // const x = p.int((features[renderOpts.featureX] * scaleX) + (window.innerWidth/2) + offsetX);
    // const y = p.int((featureY * scaleY) + (window.innerHeight/2) + offsetY);
    // const z = p.int(features.mfcc[2] * scaleZ  + offsetZ);
}




  // drawLines: boolean,
  // previewNodes: boolean,
  // drawNodes: boolean,
  // alphaFadePow: number,
  // drag: number,
  // movement: number,
  // lineThickness: number,
  // nodeSize: number,
  // scaleNodesRMS: boolean,
  // sizeDecay: number