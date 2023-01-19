import * as THREE from './three/three.module.js';

class Star {

  constructor (data, distScale, sizeScale)
  {

    this.data = data;
    this.name = data.OBJ_NAME;
    this.starClass = data.SP_TYPE[0];

    this.magnitude = data["mag"];
    this.norm_mag = data["norm_mag"];

    // rgb values provided by:
    // http://www.vendian.org/mncharity/dir3/starcolor/
    var starTemp = {
      "O" : [155, 176, 255],
      "B" : [170, 191, 255],
      "A" : [202, 215, 255],
      "F" : [248, 247, 255],
      "G" : [255, 244, 234],
      "K" : [255, 210, 161],
      "M" : [255, 204, 111]
    };

    let rgbColor = starTemp["O"];
    if (Object.keys(starTemp).includes(this.starClass))
    { rgbColor = starTemp[this.starClass]; }

    let color = new THREE.Color(`rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`);

    // let hsl = new THREE.Color();
    // color.getHSL(hsl);
    // hsl.l = this.norm_mag;
    // hsl.l = 1;
    const geometry = new THREE.SphereGeometry( this.norm_mag * sizeScale, 8, 8 );
    const material = new THREE.MeshBasicMaterial( {color: color } );
    this.object = new THREE.Mesh( geometry, material );
    // this.object.material.color.setHSL(hsl.h, hsl.s, hsl.l);

    this.object.userData.Star = this;

    this.object.position.set(data.x * distScale,
                              data.y * distScale,
                              data.z * distScale);

  }
}

export { Star };
