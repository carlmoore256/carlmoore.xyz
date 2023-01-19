let nodes = 50;
let layers = 3;
let nodeScale = [];
let colors = [];
let coords = [];
let sizes = [];
let width;
let height;
let widthPad = 50;
let heightPad = 50; //percent vals
let movementRange = 1;
let sizeRange = 0.1;

let x_pad = 50;
let y_pad = 50;
let z_pad = 50;

let growthLimit = 100;
let growthLimitDecay = 0.9;

let seedVec;

function setup(){
  frameRate(30);
  // seedVec = createVector(random(-x_pad, x_pad),random(-y_pad, y_pad), random(-z_pad,z_pad))
  width = window.innerWidth;
  height = window.innerHeight;
  createCanvas(width, height, WEBGL); //MAKE INTO 3D
  colorMode(HSB, 255);
  window.addEventListener("resize", resizecanvas);
  let w_pad = (widthPad * 0.01) * window.innerWidth;
  let h_pad = (heightPad * 0.01) * window.innerHeight;



  let inc = 0;
  for(let i = 0; i < layers; i++){
    for(let j = 0; j < nodes; j++){
      coords[inc] = createVector(random(-x_pad, x_pad),random(-y_pad, y_pad), random(-z_pad,z_pad));
      nodeScale[inc] = (width * 0.01) * random(0.05,0.1);
      // nodeScale[inc] = 0.0001;
      colors[inc] = color((float)( nodes / j), 150, (float)((nodes / inc) * 255));

      // if(coords[inc].x < width - growthLimit){
      //   sizes[inc] -= growthLimit;
      // }
      // if(coords[inc].y < height - growthLimit){
      //   sizes[inc] *= growthLimitDecay;
      // }

      inc++;
    }
  }
}

function draw(){
  camera(0, 0, 2000, 0, 0, 0, 0, 1, 0);
  background(200);
  //ambientLight(100);
  pointLight(255, 255, 200, width, 0, 500);
  //clear();
  let inc = 0;
  let lastLine;
  let firstLineFlg = true;
  let furthestVec = 0;
  let lastFurthest = 0;
  let nodesFlag = false;

  if(frameCount < 5000){
    for(let i = 0; i < layers; i++){
      push();
      for(let j = 0; j < nodes; j++){
        fill(colors[inc]);
        // fill(frameCount * 0.01, 255)
        noStroke();
        sphere(40);

        translate(coords[inc].x, coords[inc].y, coords[inc].z);
        sphere(nodeScale[inc]);

        // coords[i] += createVector(random(-1,1,0));
        coords[inc].x += constrain(random(-movementRange, movementRange), -width, width);
        coords[inc].y += constrain(random(-movementRange, movementRange), -height, height);
        coords[inc].z += constrain(random(-movementRange, movementRange), -height, height);
        nodeScale[inc] += random(-sizeRange, sizeRange);

        lastFurthest = coords[inc].dist(createVector(0,0,0));
        if(lastFurthest > furthestVec){
          furthestVec = lastFurthest;
        }


        // if(frameCount % 30 == 0){
        //   coords[nodes +1] = createVector(furthestVec);
        //   colors[nodes + 1] = color(255,255,255);
        //   // nodes++;
        //   nodesFlag = true;
        // }
        inc++;
      }
      pop();
    }
  }
  if(nodesFlag){
    nodes++;
  }
  // fill(255, 5);
  // rect(0, 0, width, height);
}


function resizecanvas(){
  dim_x = window.innerWidth; dim_y = window.innerHeight;
  canvas = createCanvas(dim_x, dim_y);
  setup();
}
