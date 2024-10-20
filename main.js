import * as THREE from 'three'; //import three.js
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

////////////SETTING UP SCENE/////////////
const scene = new THREE.Scene(); //create scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //create scene camera
const loader = new THREE.TextureLoader();
//setting up renderer
const renderer = new THREE.WebGLRenderer(); //create renderer

renderer.setSize( window.innerWidth, window.innerHeight ); //set size of renderer to window' size
renderer.setAnimationLoop( animate ); //creates loop so renderer draws scene every time the screen refreshes

//get DOM element by ID or canvas rendering
const canvas = document.querySelector('#scene-container');
canvas.appendChild(renderer.domElement);

//////////////DEFINING FUNCTIONS///////////////////

//create a tree
const createTree=()=>{
    //create trunk
    const trunkGeometry = new THREE.CylinderGeometry( 2, 2, 5, 32 ); 
    const trunkTexture = loader.load('resources/textures/trunkTexture.jpg'); //load texture from external file
    const trunkMaterial = new THREE.MeshBasicMaterial({map: trunkTexture, }); //create maerial from loaded texture
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial); //create trunk mesh
    //create leaves
    const leavesGeometry = new THREE.ConeGeometry( 5, 10, 32 );
    const greenMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00, emissive: 0x55dd33, specular: 0x61c975, shininess: 81 } ); //create green material
    const leaves = new THREE.Mesh(leavesGeometry, greenMaterial);
    const leaves2Geometry = new THREE.ConeGeometry( 4.5, 8, 32 );
    const leaves2 = new THREE.Mesh(leaves2Geometry, greenMaterial);
    //make leaves relevant to trunk
    leaves.position.y = trunk.position.y + 5;
    leaves2.position.y = trunk.position.y + 8;
    //group meshes together
    let treeGroup = new THREE.Group();
    treeGroup.add(trunk);
    treeGroup.add(leaves);
    treeGroup.add(leaves2);
    //add tree to scene
    scene.add(treeGroup);
}
//function to animate geometry
function animate() {
   renderer.render(scene, camera);
}


//redraw renderer when window is rescaled
const onWindowResize=()=>{
    camera.aspect = window.innerWidth / window.innerHeight; //update camera aspect ratio
    camera.updateProjectionMatrix(); //update camera frustum
    renderer.setSize(window.innerWidth, window.innerHeight);
}

////////////////MAIN LOGIC//////////////////////

//set up scene
window.addEventListener('resize', onWindowResize);
camera.position.z = 20; //move to position (0,0,10 so torus is in view)

//set up controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

// const skyboxTexture = loader.load('resources/images/skydome.hdr', () => {
//       texture.mapping = THREE.EquirectangularReflectionMapping;
//       texture.colorSpace = THREE.SRGBColorSpace;
//       scene.background = skyboxTexture;
//     });



// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

createTree();

