/* globals Meyda */

window.meydaAnalyzer = null;
var FeaturesNorm = null;
var SAMPLE_RATE = 44100;

var AUDIO_INITIALIZED = false;
var audioContext = null;
var mouseListener = null;

var bufferSize = 1024;
var hop = 16;
var hopSize = bufferSize/hop;

const innerPad = 0.4
const windowScalar = Math.min(window.innerHeight, window.innerWidth) / (2 + innerPad);
const scaleX = windowScalar;
const scaleY = windowScalar;

const offsetX = 0;
const offsetY = 0;

let hueMin = 1.0;
let hueMax = 0.0;


var lastNode;
var alphaFadePow = 0.09;
var scalePow = 1.2;

var drawPartnerLine = false;
var featureChoiceX = 'MFCC0';
var featureChoiceY = 'MFCC1';
var featureChoiceHue = 'rms';
var featureChoiceOpacity = 'rms';
var enableGlobalScale = false;
var featureChoiceGlobalScale = 'rms';
var globalScaleAmount = 0.8;


var toggleNodeColor = false;
var toggleStrokeColor = false;

//line characteristics
var drag = 0.3;
var lineThickness = 5;

//draw characteristics
var drawNodes = false;
var drawLines = true;
var previewNodes = false;
var nodeSize = 15;
var scaleNodesRMS = true;
// var movement = 0.5;
var sizeDecay = 0.5;

// decay normalization bounds
var normalizationDecy = 0.01;

function setAudioSRCFromFile(file) {
  const audioElem = document.getElementById("audio");
  const objURL = URL.createObjectURL(file);
  audioElem.src = objURL;
}

function audioContextHandler() {
  audioContext = new AudioContext();
  if (audioContext.state == "suspended") audioContext.resume();
  SAMPLE_RATE = audioContext.sampleRate;
  return audioContext;
}

function initializeAnalyzer(audioContext, source, bufferSize, hopSize, callback) {
  if (window.meydaAnalyzer != null) {
    window.meydaAnalyzer.stop()
    // delete window.meydaAnalyzer;
  };
  FeaturesNorm = initFeaturesNorm();
  console.log(`Initializing Meyda analyzer | Buffer size: ${bufferSize} | Hop size : ${hopSize} | Global Meyda ${window.meydaAnalyzer}`)
  window.meydaAnalyzer = Meyda.createMeydaAnalyzer({
    "audioContext": audioContext, "source": source, "bufferSize": Math.round(bufferSize), "hopSize": hopSize, "callback": callback,
    featureExtractors: [ "rms", "mfcc", "perceptualSpread", "loudness", "buffer" ],
    numberOfMFCCCoefficients: NUM_MFCC_COEFFS
  })
  window.meydaAnalyzer.start();

  if (!navigator.mediaDevices.selectAudioOutput) {
    console.log('selectAudioOutput() not supported.');
  }

  console.log("YPOOOA{SdKAJSHDKJLASHKSDHj")
  console.log("YOOO",)

  navigator.mediaDevices.enumerateDevices().then(r => {
    console.log(r);
  })

  // Display prompt and log selected device or error
  navigator.mediaDevices
  .selectAudioOutput()
  .then((device) => {
    console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
  })
  .catch((err) => {
    console.error(`${err.name}: ${err.message}`);
  });
}

function initializeAudio() {
  if (!AUDIO_INITIALIZED) {
    document.body.style.backgroundImage = 'none';
    setTimeout(() => {
      document.getElementById("page-title").style.opacity = 0;
    }, 1000);
    
    const audioContext = audioContextHandler();    
    const audioElem = document.getElementById("audio");
    const source = audioContext.createMediaElementSource(audioElem);
    window.audioContext = audioContext;
    window.source = source;

    source.connect(audioContext.destination);

    initializeAnalyzer(audioContext, source, bufferSize, hopSize, analyzerCallback);

    audioElem.addEventListener('onPause', () => {
      if (window.meydaAnalyzer !== null) window.meydaAnalyzer.stop();  
    })
    audioElem.addEventListener('onPlay', () => {
      if (window.meydaAnalyzer !== null) window.meydaAnalyzer.start();
    })
    audioElem.play().then(r => {
      console.log("Analyzer initialized, playing audio");
    }).catch(e => console.error);
    AUDIO_INITIALIZED = true;
  }
}

window.addEventListener('click', () => initializeAudio());

const NormValueItem = (value=0, min=Infinity, max=-Infinity) => { return { value, min, max} }

const initFeaturesNorm = () => {
  return {
    mfcc : [...Array(NUM_MFCC_COEFFS)].map(i => {return NormValueItem()}),
    rms : NormValueItem(),
    perceptualSpread : NormValueItem(),
    loudness : NormValueItem()
  }
}

function normalizeItem(value, normItem, centerAtZero=false) {
  normItem.min = Math.min(value, normItem.min);
  normItem.max = Math.max(value, normItem.max);
  var d = (normItem.max - normItem.min);
  if (d == 0) d = Number.MIN_VALUE;
  normItem.value = (value - normItem.min) / d;
  if (centerAtZero) {
    normItem.value *= 2;
    normItem.value -= 1;
  }
}

function normalizeFeatures(features) {
  features.mfcc.forEach((value, idx) => {
    normalizeItem(value, FeaturesNorm.mfcc[idx], true);
  })
  normalizeItem(features.rms, FeaturesNorm.rms);
  normalizeItem(features.rms, FeaturesNorm.perceptualSpread);
  normalizeItem(features.rms, FeaturesNorm.loudness);
  return {
    perceptualSpread  : FeaturesNorm.perceptualSpread.value,
    loudness          : FeaturesNorm.loudness.value,
    mfcc              : FeaturesNorm.mfcc.map(n => n.value),
    rms               : FeaturesNorm.rms.value,
    buffer            : features.buffer
  }
}

function analyzerCallback(features) {
  
  if (features.rms == 0) return;
  
  features = normalizeFeatures(features);
  const featureX = selectFeature(features, featureChoiceX);
  const featureY = selectFeature(features, featureChoiceY);
  
  //=== SET HUE ==========================
  const featureHue = selectFeature(features, featureChoiceHue);
  const featureOpactiy = selectFeature(features, featureChoiceOpacity);
  const initAlpha = pow(featureOpactiy, alphaFadePow);
  var initColor = generateColor(featureHue, initAlpha);
  
  let thisScale = nodeSize;
  if(scaleNodesRMS) thisScale *= Math.pow(features.rms + 1, scalePow);
  
  if (enableGlobalScale) {
    const featureGlobalScale = selectFeature(features, featureChoiceGlobalScale);
    const globalScale = ((globalScaleAmount * featureGlobalScale))
    const xOfs = (window.innerWidth/2);
    const yOfs = (window.innerHeight/2);
    x = int((featureX * scaleX * globalScale) + xOfs - (xOfs * (globalScale/4)));
    y = int((featureY * scaleY * globalScale) + yOfs - (yOfs * (globalScale/4)));
  } else {
    x = int((featureX * scaleX) + (window.innerWidth/2) + offsetX);
    y = int((featureY * scaleY) + (window.innerHeight/2) + offsetY);
  }

  var rndNode = null;
  if (nodes.length > 0) {
    rndNode = nodes[Math.round(Math.random() * nodes.length)];
  }
  
  const node = {
    position  : createVector(x,y),
    thisColor : initColor, //set init alpha here
    size      : thisScale, //features.rms * 100 + 3,
    decay     : sizeDecay,
    features  : features, //access features.buffer for audio
    partner   : rndNode,
    numLines  : 0,

    update : function(lineDest=null, fade=0) { //main update func
      const alpha = pow(featureOpactiy, alphaFadePow); //fix this eventually, and instantiation

      const position = this.position.lerp(lineDest, drag);

      var _color;
      if (!toggleNodeColor) {
        _color = color(hue(this.thisColor),
                        saturation(this.thisColor),
                        brightness(this.thisColor),
                        alpha);
      } else {
        _color = color(customNodeColorHSB.H, customNodeColorHSB.S, customNodeColorHSB.B);
      }

      var _strokeCol;
      if (!toggleStrokeColor) {
        _strokeCol = color(hue(this.thisColor),
                          saturation(this.thisColor),
                          brightness(this.thisColor),
                          alpha);
      } else {
        _strokeCol = color(customStrokeColorHSB.H, customStrokeColorHSB.S, customStrokeColorHSB.B);
      }

      var _numLines = 0;

      if(drawNodes){
        if(this.checkMouseOver()){ 
          strokeWeight(3);
          stroke(_strokeCol)
          fill(_color);
        } else {
          strokeWeight(1);
          stroke(_strokeCol)
          fill(_color);
        }
        ellipse(position.x, position.y, this.size, this.size);

      } else if(previewNodes && this.checkMouseOver()) {
        strokeWeight(3);
        stroke(_strokeCol)
        fill(_color);
        ellipse(position.x, position.y, this.size, this.size);
      }

      if(drawLines && lineDest !== null){
        strokeWeight(lineThickness);
        stroke(_strokeCol);
        // line(lineDest.x, lineDest.y, position.x, position.y);
        line(position.x, position.y, lineDest.x, lineDest.y);
        _numLines++;
      }

      if(drawNodes && this.size > (0 + this.decay)) {
        this.size -= this.decay
      } else if (drawNodes) { // remove node if it becomes too small
        idx = nodes.indexOf(node);
        nodes.splice(idx, 1); //deletes itself from array
        removeEventListener //removes listener to allow GC to destroy this
      }

      if(drawPartnerLine && this.partner && this.partner.size > 5) {
        line(position.x, position.y, this.partner.position.x, this.partner.position.y);
        _numLines++;
      }
      this.numLines = _numLines;
    },

    checkMouseOver : function() {
      var d = dist(mouseX, mouseY, this.position.x, this.position.y);
      if (d < this.size) return true;
      return false;
    },

    // onClickEvent : function() {
    //     console.log("I've been clicked!");
    //     console.log(this.thisColor.levels);
    // },
  };
  nodes.push(node); //add node to list
  lastNode = node;
}


function generateColor(hueFeature, a) {
  if(hueFeature > hueMax)
    hueMax = hueFeature;

  if(hueFeature < hueMin)
    hueMin = hueFeature;

  hueFeature = (hueFeature - hueMin) / (hueMax - hueMin);

  // hueFeature = map(hueFeature, 0.0, 1.0, 0.5, 1.0); //consider adding interface to change vals
  hueFeature =  (colorSettings.hueOffset + (hueFeature * colorSettings.hueRange)) % 1.0;
  // hueFeature = map(hueFeature, 0.0, 1.0, 0.5, 1.0); //consider adding interface to change vals
  
  h = hueFeature;
  s = colorSettings.saturation; //think about using rms here - 0.5
  b = colorSettings.brightness; // 0.8

  return color(h,s,b,a)
}

function resetColorRange() { //call when changing color
  hueMin = 1.0;
  hueMax = 0.0;
}


function stepOscillator(osc, buffSize) {
  osc.phase += ((1/SAMPLE_RATE) * osc.freq) * buffSize;
}


function selectFeature(features, featureChoice) {
  // 'MFCC0', 'MFCC1', 'MFCC2', 'MFCC3', 'MFCC4', 'MFCC5', 'rms', 'perceptualSpread'

  switch(featureChoice){
    case 'MFCC0':
      return features.mfcc[0];
    case 'MFCC1':
      return features.mfcc[1];
    case 'MFCC2':
      return features.mfcc[2];
    case 'MFCC3':
      return features.mfcc[3];
    case 'MFCC4':
      return features.mfcc[4];
    case 'MFCC5':
      return features.mfcc[5];
    case 'rms':
      return features.rms;
    case 'perceptualSpread':
      return features.perceptualSpread;
    case 'loudness':
      return features.loudness.total;
    case 'custom-1':
      return customValue1;
    case 'custom-2':
      return customValue2;
    case 'custom-3':
      return customValue3;
    case 'sinOsc':
      stepOscillator(sinOsc, features.buffer.length);
      sinOsc.val = Math.sin(sinOsc.phase);
      return sinOsc.val;
    case 'cosOsc':
      stepOscillator(cosOsc, features.buffer.length);
      cosOsc.val = Math.cos(cosOsc.phase);
      return cosOsc.val;
    default:
      return features.mfcc[1];
  }

  // sinOsc.phase += (1/fps) * sinOsc.freq;
  // sinOsc.val = Math.sin(sinOsc.phase);
  // cosOsc.phase += (1/fps) * cosOsc.freq;
  // cosOsc.val = Math.cos(cosOsc.phase);
}

function changeHopSize(value) {
  hopSize = bufferSize/value;
  initializeAnalyzer(window.audioContext, window.source, bufferSize, hopSize, analyzerCallback);
}

function changeBuffSize(value) {
  bufferSize = value;
  initializeAnalyzer(window.audioContext, window.source, bufferSize, hopSize, analyzerCallback);
}


// class RTAudioFeatureAnalyzer {

//   analyzer; audioContext; source;

//   constructor(audioContext, source, options) {
//     if (typeof Meyda === "undefined") {
//       throw new Error("Audio analysis library Meyda not initialized!")
//     }
//     this.audioContext = audioContext;
//     this.source = source;

//     this.analyzer = Meyda.createMeydaAnalyzer({
//       "audioContext": audioContext,
//       "source": source,
//       "bufferSize": options.bufferSize,
//       "hopSize": options.hopSize,
//       "featureExtractors": [ "rms", "mfcc", "perceptualSpread", "loudness", "buffer" ], //buffer returns raw audio
//       "numberOfMFCCCoefficients": NUM_MFCC_COEFFS, //specify max mfcc coeffs
//       "callback" : analyzerCallback
//     })

//     // this.analyzer.start();
//   }
// }
  // const analyzer = Meyda.createMeydaAnalyzer({
  //   "audioContext": audioContext,
  //   "source": source,
  //   "bufferSize": buffSize,
  //   "hopSize": hopSize,
  //   "featureExtractors": [ "rms", "mfcc", "perceptualSpread", "loudness", "buffer" ], //buffer returns raw audio
  //   "numberOfMFCCCoefficients": 5, //specify max mfcc coeffs
  //   "callback": features => {}
  // });
  // analyzer.start();
  // for (i=0; i<5; i++)
  // {
  //   if(features.mfcc[i] > maxMfcc)
  //     maxMfcc = features.mfcc[i];

  //   if(features.mfcc[i] < minMfcc)
  //     minMfcc = features.mfcc[i];

  //   features.mfcc[i] = (features.mfcc[i] - minMfcc) / (maxMfcc - minMfcc); // normalize range
  //   if(i <= 2){   // set range to -1 to 1
  //     features.mfcc[i] *= 2;
  //     features.mfcc[i] -= 1;
  //   }
  // }

// if(hue_feature > hue_max)
//   hue_max = hue_feature;
//
// if(hue_feature < hue_min)
//   hue_min = hue_feature;
//
// hue_feature = (hue_feature - hue_min) / (hue_max - hue_min);
//
// hue_feature = map(hue_feature, 0.0, 1.0, 0.5, 1.0); //consider adding interface to change vals
//
// h = hue_feature;
// s = 0.5; //think about using rms here
// b = 0.8;



    // MeydaAnalyzer = new RTAudioFeatureAnalyzer(audioContext, source, { bufferSize, hopSize });
    // MeydaAnalyzer = Meyda.createMeydaAnalyzer({
    //   audioContext,
    //   source,
    //   bufferSize,
    //   hopSize,
    //   featureExtractors: [ "rms", "mfcc", "perceptualSpread", "loudness", "buffer" ], //buffer returns raw audio
    //   "numberOfMFCCCoefficients": NUM_MFCC_COEFFS, //specify max mfcc coeffs
    //   "callback" : analysisCallback
    // })
