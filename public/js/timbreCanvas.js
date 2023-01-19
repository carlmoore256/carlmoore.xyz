const NUM_MFCC_COEFFS = 5;
const DEFAULT_AUDIO_SRC = "../audio/PharaohsDance.mp3";

var bgFade = true;
var bgFadeTransparency = 1.0;
let nodes = [];
var maxNodes = 300;
var gui, gui2;
let parent = document.body;
const statsUpdateFreq = 8;
const avgFPS = [];
const audioElem = document.getElementById("audio");
document.getElementById("audio").src = DEFAULT_AUDIO_SRC;

const colorSettings = {
  hueRange : 0.5,
  hueOffset : 0.5,
  saturation : 0.5,
  brightness : 0.8
}

document.addEventListener('keydown', (e) => {
  if (e.code == "Space") {
    audioElem.paused ? audioElem.play() : audioElem.pause();
    const audioPlayerElem = document.getElementById("audio-player");
    audioPlayerElem.style.opacity = 1;
    setTimeout(() => {
      audioPlayerElem.style.opacity = 0.2;
    }, 1000)
  }
})

function toggleStats(value) {
  const stats = document.getElementById("render-stats");
  if (value) {
    stats.style.display = "flex";
  } else {
    stats.style.display = "none";
  }
}

const renderStats = {
  numNodes : document.getElementById("s-num-nodes").getElementsByTagName("p")[0],
  numLines : document.getElementById("s-num-lines").getElementsByTagName("p")[0],
  fps : document.getElementById("s-fps").getElementsByTagName("p")[0]
}

const createOscillator = (freq=0, phase=0, val=0) => { return {freq, phase, val} }

// CREATE GUI ======================================
const mfccOptions = [...Array(NUM_MFCC_COEFFS).keys()].map(n => { return `MFCC${n}` });
var customValue1 = 0;
var customValue2 = 0;
var customValue3 = 0;
const sinOsc = createOscillator(1);
const cosOsc = createOscillator(1);
const customOptions = ['custom-1', 'custom-2', 'custom-3', 'sinOsc', 'cosOsc'];
const customNodeColorHSB = {H: 0, S: 0.5, B: 1};
const customStrokeColorHSB = {H: 0, S: 0, B: 0};

window.onload = () => {
  const panelWidth = 200;
  const sideMargin = 40;

  var leftX = sideMargin;
  var leftY = 40;
  var yGap = 10;

  var rightX = window.innerWidth-panelWidth-40;
  var rightY = 100;

  var settingsPrefs = QuickSettings.create(leftX, leftY, "Preferences");
  settingsPrefs.addFileChooser("Audio File", DEFAULT_AUDIO_SRC.split("/").slice(-1)[0], [".mp3", ".wav"], setAudioSRCFromFile);
  settingsPrefs.addBoolean("Show Render Info", false, (v) => {toggleStats(v)});
  leftY += settingsPrefs._panel.clientHeight + yGap;

  var analysisSettings = QuickSettings.create(leftX, leftY, "Analysis");
  analysisSettings.bindRange("maxNodes", 0, 3000, 300, 1, this);
  analysisSettings.addDropDown("buffSize", [1024,256,512,2048], (v) => { changeBuffSize(v.value) });
  analysisSettings.addDropDown("hopSize", [2,1,4,8], (v) => { changeHopSize(v.value) });
  analysisSettings.bindRange("bgFadeTransparency", 0.0, 1.0, 1.0, 0.01, this);
  analysisSettings.setWidth(panelWidth);
  leftY += analysisSettings._panel.clientHeight + yGap;
  
  var settingsCustom = QuickSettings.create(leftX, leftY, "Custom Values");
  settingsCustom.addRange("Value -1 : 1", -1, 1, 0, 0.01, (v) => {customValue1=v});
  settingsCustom.addRange("Value -10 : 10", -10, 10, 0, 0.1, (v) => {customValue2=v});
  settingsCustom.addRange("Value -100 : 100", -100, 100, 0, 1, (v) => {customValue3=v});
  settingsCustom.addRange("Sin Oscillator (Hz)", 0, 50, 1, 0.1, (v) => {sinOsc.freq=v});
  settingsCustom.addRange("Cos Oscillator (Hz)", 0, 50, 1, 0.1, (v) => {cosOsc.freq=v});
  settingsCustom.setWidth(panelWidth);
  settingsCustom.collapse();
  leftY += settingsCustom._panel.clientHeight + yGap;

  var settingsColorRange = QuickSettings.create(leftX, leftY, "Color Range");

  settingsColorRange.addRange("Hue Range", 0, 1, 0.5, 0.01, (v) => {colorSettings.hueRange=v});
  settingsColorRange.addRange("Hue Offset", 0, 1, 0.5, 0.01, (v) => {colorSettings.hueOffset=v});
  settingsColorRange.addRange("Saturation", 0, 1, 0.5, 0.01, (v) => {colorSettings.saturation=v});
  settingsColorRange.addRange("Brightness", 0, 1, 0.8, 0.01, (v) => {colorSettings.brightness=v});
  settingsColorRange.setWidth(panelWidth);
  settingsColorRange.collapse();
  leftY += settingsColorRange._panel.clientHeight + yGap;
  
  var settingsNodeColor = QuickSettings.create(leftX, leftY, "Node Color");
  settingsNodeColor.addBoolean("Enable Custom Node Color", false, (v) => {toggleNodeColor = v});
  settingsNodeColor.addRange("H", 0, 1, 0, 0.01, (v) => {customNodeColorHSB.H=v});
  settingsNodeColor.addRange("S", 0, 1, 0.5, 0.01, (v) => {customNodeColorHSB.S=v});
  settingsNodeColor.addRange("B", 0, 1, 1, 0.01, (v) => {customNodeColorHSB.B=v});
  settingsNodeColor.setWidth(panelWidth);
  settingsNodeColor.collapse();
  leftY += settingsNodeColor._panel.clientHeight + yGap;
  
  var settingsStrokeColor = QuickSettings.create(leftX, leftY, "Stroke Color");
  settingsStrokeColor.addBoolean("Enable Custom Stroke Color", false, (v) => {toggleStrokeColor = v});
  settingsStrokeColor.addRange("H", 0, 1, 0, 0.01, (v) => {customStrokeColorHSB.H=v});
  settingsStrokeColor.addRange("S", 0, 1, 0, 0.01, (v) => {customStrokeColorHSB.S=v});
  settingsStrokeColor.addRange("B", 0, 1, 0, 0.01, (v) => {customStrokeColorHSB.B=v});
  settingsStrokeColor.setWidth(panelWidth);
  settingsStrokeColor.collapse();
  leftY += settingsStrokeColor._panel.clientHeight + yGap;

  var settingsVis = QuickSettings.create(rightX, rightY, "Visualization");
  settingsVis.bindBoolean("drawLines", true, this);
  // settings2.bindBoolean("previewNodes", false, this);
  settingsVis.bindBoolean("drawNodes", false, this);
  settingsVis.bindBoolean("drawPartnerLine", false, this);
  settingsVis.bindDropDown("featureChoiceX", [...mfccOptions, 'rms', 'perceptualSpread', 'loudness', ...customOptions], this);
  settingsVis.bindDropDown("featureChoiceY", [...mfccOptions, 'rms', 'perceptualSpread', 'loudness', ...customOptions], this);
  settingsVis.bindDropDown("featureChoiceHue", ['rms', ...mfccOptions, 'perceptualSpread', 'loudness', ...customOptions], this);
  settingsVis.bindDropDown("featureChoiceOpacity", ['rms', ...mfccOptions, 'perceptualSpread', 'loudness', ...customOptions], this);
  settingsVis.bindRange("drag", 0.0, 1.0, 0.3, 0.01, this);
  settingsVis.addRange("scalePow", 0.0, 5, 1.2, 0.01, (v) => { scalePow = v });
  settingsVis.bindRange("alphaFadePow", 0.0, 1.5, 0.09, 0.01, this);
  settingsVis.addBoolean("enableGlobalScale", false, (v) => { 
    enableGlobalScale = v; 
    if (v) {
      settingsVis.showControl("featureChoiceGlobalScale");
      settingsVis.showControl("globalScaleAmount");
    } else {
      settingsVis.hideControl("featureChoiceGlobalScale");
      settingsVis.hideControl("globalScaleAmount");
    } });
  settingsVis.bindDropDown("featureChoiceGlobalScale", ['rms', ...mfccOptions, 'perceptualSpread', 'loudness', ...customOptions], this);
  settingsVis.bindRange("globalScaleAmount", 0.0, 5.0, 0.8, 0.01, this);
  // settings2.bindRange("movement", 0.0, 1.0, 0.5, 0.01, this); //doesnt really do anything
  settingsVis.bindRange("lineThickness", 0, 10, 5, 1, this);
  settingsVis.bindRange("nodeSize", 1, 30, 15, 1, this);
  settingsVis.bindBoolean("scaleNodesRMS", true, this);
  settingsVis.bindRange("sizeDecay", 0.0, 3.0, 0.5, 0.01, this);
  settingsVis.hideControl("featureChoiceGlobalScale");
  settingsVis.hideControl("globalScaleAmount");
  settingsVis.setWidth(panelWidth);


  window.addEventListener("resize", () => {
    var rightX = window.innerWidth-panelWidth-40;
    settingsVis.setPosition(rightX, rightY);
  })
}

/**********************************************************/
function setup(){
  const canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.id("timbre-canvas");
  window.addEventListener("resize", resizecanvas);
  colorMode(HSB,1);
}

function draw() {

  if (audioElem.paused) {
    return;
  }
  // Draw Background ======================================
  if(bgFade){
    background(0, 0, 0.9, bgFadeTransparency); //transparent
  } else {
    background(0, 0, 0.9);
  }

  // Draw Nodes ===========================================
  push();
  var totalLines = 0;
  if(nodes.length>0){
    for(i=0; i<nodes.length; i++)
      if(i > 0){
        nodes[i].update(nodes[i-1].position, pow(i/nodes.length, alphaFadePow));
        try {
          totalLines += nodes[i].numLines;
        } catch {}
      } else {
        nodes[i].update();
        try {
          totalLines += nodes[i].numLines;
        } catch {}
      }
  }

  while(nodes.length > maxNodes) {
    node = nodes.shift(); //remove oldest element
    node.size = 0;
    setTimeout(() => {
      node = null;
    }, 1000)
  }
  pop();

  var fps = frameRate();

  if (frameCount % statsUpdateFreq == 0) {
    // const fps = frameRate().toFixed(0);
    avgFPS.push(fps);
    while(avgFPS.length > 10) {
      avgFPS.shift();
    }
    const currFPS = avgFPS.reduce((partialSum, a) => partialSum + a, 0) / avgFPS.length;
    renderStats.numNodes.textContent = nodes.length;
    renderStats.numLines.textContent = totalLines;
    renderStats.fps.textContent = Math.round(currFPS);

  }

  // fill(0,0,0);
  // circle(0,0,30)
  // circle(width,height,30)
}

/**********************************************************/

function mousePressed(){
  //check if mouse is pressed
  for(let i=0; i<nodes.length; i++)
  {
    if(nodes[i].checkMouseOver() == true){
      //if moused over and pressed, create click event
      nodes[i].onClickEvent();
    }
  }
}

function resizecanvas(){
  dim_x = window.innerWidth; dim_y = window.innerHeight;
  canvas = createCanvas(dim_x, dim_y);
}
