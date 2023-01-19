var colorLowRange = 0.6;
var colorHiRange = 1;
var highlightName = true;
let points;
let points2;
let txt;
let txt2;
let txt3;
let font;
let fontSize = 130;
let name_x = 150;
let name_y = 200;

function preload(){
    font = loadFont('../fonts/OpenSans-Bold.ttf');
}
  
function setup(){
    createCanvas(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", resizecanvas);
    colorMode(HSB,1);
  
    // Title
    txt = "CARL";
    txt2 = "MOORE";
    txt3 = "VR DEVELOPER - AUDIO ENGINEER - VISUAL ARTIST"
    textFont = font;
  
    points = font.textToPoints(txt, name_x, name_y, fontSize, {
      sampleFactor: 2,
      simplifyThreshold: 0
    });
  
    points2 = font.textToPoints(txt2, name_x, name_y + fontSize, fontSize, {
      sampleFactor: 2,
      simplifyThreshold: 0
    });
  
    c1 = color(0, 0, 0.9);
    c2 = color(0, 0, 1.0);
    setGradient(c1, c2);
  
  }


function nameElement(){ // display interactive name title
    var mousePos = createVector(mouseX,mouseY);
    noStroke();
  
    if(highlightName){
      var count = (mouseX  * 0.5) + (frameCount * 3);
      var numPoints = 300;
      var numLines = 6;
      var p1 = points.length;
      var p2 = points2.length;
      var p1div = points.length / numLines;
      var p2div = points2.length / numLines;
      for(let j = 0; j < numLines; j++){
        for(let i = 0; i < numPoints; i++){
          let hue = color((((cos(frameCount * 0.02) + 1) / 2) * (colorHiRange - colorLowRange)) + colorLowRange, 0.4, (i / numPoints) * 0.5 + 0.5,(i / numPoints));
          fill(hue);
          ellipse(points[(int)(count + i + (p1div) * j) % p1].x,points[(int)(count + i + ((p1 / numLines) * j)) % p1].y,2,2);
          ellipse(points2[(int)(count + i + (p2div) * j) % p2].x,points2[(int)(count + i + (p2 / numLines) * j) % p2].y,2,2);
        }
      }
    }
}


function setGradient(c1, c2) {
    // noprotect
    noFill();
    for (var y = 0; y < height; y++) {
      var inter = map(y, 0, height, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(0, y, width, y);
    }
  }

function draw() {
// Name Text ============================================
  // noStroke();
  // textSize(fontSize * 0.13);
  // text(txt3, name_x, name_y + (fontSize * 1.5));
  // Draw Name ===========================================
  nameElement(); // display interactive name title
}

function resizecanvas(){
    dim_x = window.innerWidth; dim_y = window.innerHeight;
    canvas = createCanvas(dim_x, dim_y);
}
  