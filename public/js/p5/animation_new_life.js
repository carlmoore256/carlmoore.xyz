let numcircles = 100;
let coords = [];
let colors = [];
let angles = [];
let radii = [];
let hue_shift;
let angle = 0;
let radius = 10;
let ellipses = [];

var dim_x;
var dim_y;

let inc = 0;
let walk_x = 1;
let walk_y = 1;

let ax = [];
let ay = [];
let range = 10;

function setup(){
  dim_x = window.innerWidth;
  dim_y = window.innerHeight;
  window.addEventListener("resize", resizecanvas);
  createCanvas(dim_x, dim_y);
  range = dim_x*dim_y*0.00001;
  print(range);
  hue_shift = 50;

  for ( let i = 0; i < numcircles; i++ ) {
    ax[i] = width / 2;
    ay[i] = height / 2;
  }

  for(let i = 0; i < numcircles; i++){ //sets the radius within bounds of screen size
    colors[i] = hue_shift; //adds hue shift to colors
    hue_shift += 360/numcircles; //color shift always related to numcircles
    if(dim_x < dim_y){
      size[i] = dim_x/40; //size is a ratio of screensize
    } else {
      size[i] = dim_y/40; //size is a ratio of screensize
    }
    coords[i] = createVector((radius) * cos(angle) + dim_x/2,(radius) * sin(angle) + dim_y/2); //generates coordinates around a circle
    angle += 1;
    radius += 1;
    angles[i] = angle;
    radii[i] = radius;
  }
  frameRate(30);
}

function draw(){
  noStroke();
  translate(cos(frameCount), sin(frameCount));
  //translate(walk_x,walk_y);

  for(let i = 1; i < numcircles; i++){
    ax[i - 1] = ax[i];
    ay[i - 1] = ay[i];

    angles[i] = random(260);
    radius += random(100);
    size[i] = cos(frameCount) * 10;
    //fill(colors[i],random(255),200,val);
    noStroke();

    // fill(255,255,255,val);
    //ellipse(ax[i],ay[i],size[i]);
  }

  ax[numcircles - 1] += random(-range, range);
  ay[numcircles - 1] += random(-range, range);

  ax[numcircles - 1] = constrain(ax[numcircles - 1], 0, width);
  ay[numcircles - 1] = constrain(ay[numcircles - 1], 0, height);

  for ( let j = 1; j < numcircles; j++ ) {
    let val = ((j / numcircles)) * 255;
    let val2 = (j / numcircles);
    if(j==numcircles-1){
      val = 0;
    }
    //let val = 255;
    fill(random(255)*val2,random(255)*val2,200*val2, val);
    ellipse(ax[j],ay[j],size[j]);
  }

  range += random(-1,1);



}

function resizecanvas(){
  dim_x = window.innerWidth; dim_y = window.innerHeight;
  canvas = createCanvas(dim_x, dim_y);
}
