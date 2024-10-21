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
renderer.shadowMap.enabled = true;
//get DOM element by ID or canvas rendering
const canvas = document.querySelector('#scene-container');
canvas.appendChild(renderer.domElement);

/////////////CREATING CLASSES///////////////////

//create new box class that inherits all properties from THREE.Mesh
class Box extends THREE.Mesh{
    constructor({width, height, depth, color = '#00ff00', velocity = {x: 0, y: 0, z: 0}, pos = {x: 0, y: 0, z: 0}})
    {
        //calls THREE.Mesh constructor, creating default green box
        super(
            new THREE.BoxGeometry(width, height, depth), 
            new THREE.MeshStandardMaterial({color:color})
        ); 

        this.width = width;
        this.height = height; //define height of box
        this.depth = depth;

        this.position.set(pos.x, pos.y, pos.z);

        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;

        this.velocity = velocity;
        this.gravity = -0.002;
        
    }

    update(ground)
    {
        //get top and bottom position so can check for collisions
        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;

        //apply movement
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;
        this.applyGravity();
        
        
    }
    applyGravity(){
        this.velocity.y += this.gravity; //add gravity
        //check for collsion with floor (1 frame ahead)
        if (this.bottomPosition + this.velocity.y <= ground.topPosition){
            //hitting floor
            this.velocity.y *= 0.8; //reduce velocity to create friciton between bounces, reduce bounce height
            this.velocity.y = -this.velocity.y; //reverse velocity for bounce effect
        }
        else{
            //if not hitting floor
            this.position.y += this.velocity.y
        }
    }
}

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
    //set meshes to case shadow
    trunk.castShadow = true;
    leaves.castShadow = true;
    leaves2.castShadow = true;
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

   //movement code
   player.velocity.x = 0 //stop player at start of frame
   player.velocity.z = 0 //stop player at start of frame
   if (keys.a.pressed){
    player.velocity.x = -0.01; //move left
   }
   else if (keys.d.pressed){
    player.velocity.x = 0.01; //move right
   }
   else if (keys.w.pressed){
    player.velocity.z = -0.01; //move right
   }
   else if (keys.s.pressed){
    player.velocity.z = 0.01; //move right
   }
   //check position of player for collisions
   player.update(ground);

   //adding gravity to player


   //player.position.y += -0.01;
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
camera.position.y = 3;
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
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.castShadow = true;
scene.add( directionalLight );

//create ground
const ground = new Box({
    width: 20,
    height: 0.5,
    depth: 20,
    color: 0xF0E8DC,
    pos: {x: 0, y: -3, z: 0}
});

ground.receiveShadow = true;
console.log(ground.height);

scene.add(ground);

//create player
const player = new Box({
    width: 1, 
    height: 2,
    depth: 1,
    color: 0xff00ff,
    velocity: {x: 0, y: -0.01, z:0},
    pos: {x: 0, y: 3, z: 0}
});

player.castShadow = true;
scene.add(player);

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    s: {
        pressed: false
    }
    
}
window.addEventListener('keydown', (event) => {
    switch(event.code){
        case 'KeyW':
            keys.w.pressed = true;
            break;
        case 'KeyA':
            keys.a.pressed = true;
            break;
        case 'KeyS':
            keys.s.pressed = true;
            break;
        case 'KeyD':
            keys.d.pressed = true;
            break;
    }
})
window.addEventListener('keyup', (event) => {
    switch(event.code){
        case 'KeyW':
            keys.w.pressed = false;
            break;
        case 'KeyA':
            keys.a.pressed = false;
            break;
        case 'KeyS':
            keys.s.pressed = false;
            bwreak;
        case 'KeyD':
            keys.d.pressed = false;
            break;
    }
})
