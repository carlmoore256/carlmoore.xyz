import * as THREE from './three/three.module.js';
import Stats from './three/stats.module.js';
import { OrbitControls } from './three/OrbitControls.js'
import { VRButton } from './three/VRButton.js';
import { Star } from './star.js'

// import { EffectComposer } from '/Volumes/RICO_III/MisnomerOfTouch/three.js/examples/js/postprocessing/EffectComposer.js';
// import { RenderPass } from '/Volumes/RICO_III/MisnomerOfTouch/three.js/examples/js/postprocessing/RenderPass.js';
// import { BloomPass } from '/Volumes/RICO_III/MisnomerOfTouch/three.js/examples/js/postprocessing/BloomPass.js'

const m_Pointer = new THREE.Vector2;
let INTERSECTED;
let m_Scene, m_Camera, m_Renderer, m_Raycaster, m_Composer, m_Stats;
let m_Stars = [];

let m_DistScale = 10;
let m_SizeScale = 0.3;

init();
animate();

function init() {
	// initialize scene
	m_Scene = new THREE.Scene();
	m_Scene.background = new THREE.Color( 0x000000 );

	// camera and renderer =========
	m_Camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
	m_Camera.position.set( 0, 0, 200 );

	m_Renderer = new THREE.WebGLRenderer( { antialias: true } );
	m_Renderer.setPixelRatio( window.devicePixelRatio );
	m_Renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( m_Renderer.domElement );

	// enable VR rendering ======
	document.body.appendChild( VRButton.createButton( m_Renderer ) );
	m_Renderer.xr.enabled = true;

	const orbitControls = new OrbitControls( m_Camera, m_Renderer.domElement );
	orbitControls.screenSpacePanning = true;

	// framerate stats =========
	m_Stats = new Stats();
  document.body.appendChild( m_Stats.dom );

	window.addEventListener( 'resize', onWindowResize );

	// raycasting ==============
	m_Raycaster = new THREE.Raycaster();
	document.addEventListener( 'mousemove', onPointerMove );

  spawnStars();

  createEarth();

  // let sprite = new THREE.TextSprite({
  //   text: 'Hello World!',
  //   fontFamily: 'Arial, Helvetica, sans-serif',
  //   fontSize: 12,
  //   color: '#ffbbff',
  // });
  // m_Scene.add(sprite);
}

function spawnStars(){
  $.getJSON("./data/starData.json", function(data) {

    let mags = [];

    // retrive max and min magnitudes first
    for (let i = 0; i < data.length-1; i++)
    {
      // let mag = parseFloat(data[i].G);
      let mag = data[i].mag;
      mags.push(mag);
    }
    var max_of_array = Math.max.apply(Math, mags);
    var min_of_array = Math.min.apply(Math, mags);
    console.log(`max: ${max_of_array} min: ${min_of_array}`);
    // max: 25.46
    // min: -1.49

    for (let i = 0; i < data.length-1; i++)
    {
      if (data[i].OBJ_CAT != "Planet")
      {
        let newStar = new Star(data[i], m_DistScale, m_SizeScale);
        m_Scene.add(newStar.object);
        m_Stars.push(newStar);


      }

    }



  });
}

function createEarth(){

    var loader = new THREE.TextureLoader();
  				loader.load( './images/land_ocean_ice_cloud_2048.jpeg', function ( texture ) {
					var geometry = new THREE.SphereGeometry( 0.1, 20, 20 );
					var material = new THREE.MeshBasicMaterial( { map: texture } );
					var mesh = new THREE.Mesh( geometry, material );
					m_Scene.add( mesh );

  	} );
}



function animate() {

	m_Renderer.setAnimationLoop( function () {
		raycastObjects();
		m_Renderer.render( m_Scene, m_Camera );
    // m_Composer.render();
    m_Stats.update();

	} );
}

function raycastObjects()
{
  m_Raycaster.setFromCamera( m_Pointer, m_Camera );

  const intersects = m_Raycaster.intersectObjects( m_Scene );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      INTERSECTED = intersects[ 0 ].object;
			if (INTERSECTED.userData.grain != null)
			{
        // INTERSECTED.userData.whateverClass.whateverFunc();
			}
    }
  } else {

    INTERSECTED = null;

  }
}

function onPointerMove( event ) {
  m_Pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  m_Pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
	m_Camera.aspect = window.innerWidth / window.innerHeight;
	m_Camera.updateProjectionMatrix();
	m_Renderer.setSize( window.innerWidth, window.innerHeight );
}
