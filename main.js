import * as THREE from 'three'; //import three.js
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader
 

//import Box from './box.js';

////////////SETTING UP SCENE/////////////
const scene = new THREE.Scene(); //create scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //create scene camera
const loader = new THREE.TextureLoader();
//setting up renderer
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); //create renderer

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
        this.leftPosition = this.position.x - this.width / 2;
        this.rightPosition = this.position.x + this.width / 2;
        this.frontPosition = this.position.z + this.depth / 2;
        this.backPosition = this.position.z - this.depth / 2;

        this.velocity = velocity;
        this.gravity = -0.002;
        
    }

    updateSides(){
        //set edge positions so can check for collisions
        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;
        this.leftPosition = this.position.x - this.width / 2;
        this.rightPosition = this.position.x + this.width / 2;
        this.frontPosition = this.position.z + this.depth / 2;
        this.backPosition = this.position.z - this.depth / 2;
    }

    update(ground)
    {
        this.updateSides();
        

        //apply movement
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        this.applyGravity(ground);
        
        
    }
    applyGravity(ground){
        this.velocity.y += this.gravity; //add gravity

        //check for collsion with floor (1 frame ahead)
        if (boxCollision({box1: this, box2: ground})){
            //hitting floor
            this.velocity.y *= 0.5; //reduce velocity to create friciton between bounces, reduce bounce height
            this.velocity.y = -this.velocity.y; //reverse velocity for bounce effect
        }
        else{
            //if not hitting floor
            this.position.y += this.velocity.y
        }
    }
}

//////////////DEFINING FUNCTIONS///////////////////


const boxCollision=({box1, box2})=>{
    const xCollision = ( (box1.rightPosition >= box2.leftPosition) && (box1.leftPosition <= box2.rightPosition) );
    //frame ahead for y collision, gravity
    const yCollision = ( (box1.bottomPosition + box1.velocity.y <= box2.topPosition) && (box1.topPosition >= box2.bottomPosition) );
    const zCollision = ( (box1.frontPosition >= box2.backPosition) && (box1.backPosition <= box2.frontPosition) );
    
    return (xCollision && yCollision && zCollision)
}

const movePlayer=()=>{
    //movement code
    player.velocity.x = 0 //stop player at start of frame
    player.velocity.z = 0 //stop player at start of frame

    if (keys.a.pressed){player.velocity.x = -speed;} //move left
    else if (keys.d.pressed){player.velocity.x = speed; } //move right

    //separate if for axis allows them to be true at same time
    if (keys.w.pressed){player.velocity.z = -speed;} //move forward
    else if (keys.s.pressed){player.velocity.z =speed; } //move backward
}

const createEnemy=()=>{
    const newEnemy = new Box({
        width: 1, 
        height: 1,
        depth: 1,
        color: 0xffff00,
        velocity: {x: 0, y: -0.01, z:0.005},
        //Math.random() generates random value 0-1
        pos: {x: Math.random() - 0.5 * 20, y: 3, z: -10}
    });
    newEnemy.castShadow = true;
    scene.add(newEnemy); //add to scene
    enemies.push(newEnemy); //add to enemy array
}
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
let frames = 0;
let spawnRate = 500;
let speed = 0.05;
function animate() {

    /////////////WEEK 5 LAB//////////////////////
    
    cubeGroup.rotation.y += 0.01;
    combineGroup.rotation.y += 0.005;

    ///////////////////////////////////////////////////

    //const animationId = requestAnimationFrame(animate);

    movePlayer(); //check if player moves this frame

    //check position of player for collisions
    player.update(ground);
    //update enemy
    enemies.forEach((enemy) => {
    enemy.update(ground);

    //check for collision between player and enemy
    if (boxCollision({box1: player, box2: enemy})){
        console.log("boom");
        //cancelAnimationFrame(animationId);
    }
    })

    //if enough frames passed since last spawn
    if (frames % spawnRate == 0){
        createEnemy();
    }
    renderer.render(scene, camera); //render scene
    frames++; //increment frame number
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


// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.castShadow = true;
scene.add( directionalLight );


scene.add(new THREE.AmbientLight(0xffffff, 0.5));

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

const enemies = []; //create array to store enemies




/////////////////////WEEK 5 LAB///////////////////////



////////////CREATING GROUPS AND SUBGROUPS///////////////////
//create capsule
const capsule = new THREE.Mesh(new THREE.CapsuleGeometry( 1, 1, 4, 8 ), new THREE.MeshBasicMaterial({color: 0x0000ff}));

//creating cube group
const gCube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0x00ff00}));
const rCube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xff0000}));
gCube.position.x = 3;

//group cubes
let cubeGroup = new THREE.Group();
cubeGroup.add(gCube);
cubeGroup.add(rCube)
//scene.add(cubeGroup);
cubeGroup.position.x = 5;

//group capsule to cube group
let combineGroup = new THREE.Group();
combineGroup.add(capsule);
combineGroup.add(cubeGroup);
combineGroup.position.y = 10;
scene.add(combineGroup);

//function add plane

const addPlane=(x, y, w, h, material)=>{
    //initialise plane
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 2), new THREE.MeshBasicMaterial(material));
    plane.position.x = x;
    plane.position.y = y;
    plane.rotation.x = -Math.PI/2;
    scene.add(plane)
}
const waterTexture = new THREE.TextureLoader().load('resources/images/water.jpg');
const waterPlaneMaterialProperties = {map: waterTexture, side: THREE.DoubleSide, transparent: true};
addPlane(0,-3.6, 100, 100, waterPlaneMaterialProperties);


const sandTexture = new THREE.TextureLoader().load('resources/images/sand.jpg');
const sandPlaneMaterialProperties = {map: sandTexture, side: THREE.DoubleSide, transparent: true};
addPlane(0,ground.topPosition + 0.001, 20, 20, sandPlaneMaterialProperties);


//create skybox

const createSkybox=()=>{
    let backgroundMesh; //variable for sphere mesh
    
    const loader = new THREE.TextureLoader();
    //load texture from file
    loader.load('resources/images/cartoon-sky.jpg', function(texture){
        const sphere = new THREE.SphereGeometry(100, 60, 40); //sphere geometry for skydome
        const sphereMaterial = new THREE.MeshBasicMaterial({map:texture, side: THREE.DoubleSide});
        backgroundMesh = new THREE.Mesh(sphere, sphereMaterial);
        scene.add(backgroundMesh);
    }); 
    
}
createSkybox();


//create orbit controls

let controls;
const createOrbitControls=()=>{
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
}


createOrbitControls();


//movement form UI buttons
const moveUp =()=>{
    player.position.z -= 3;
}
const moveDown=()=>{
    player.position.z += 3;
}
const moveLeft =()=>{
    player.position.x -= 3;
}
const moveRight=()=>{
    player.position.x += 3;
}
//get buttons by ID
document.getElementById("up-button").addEventListener("click", moveUp);
document.getElementById("down-button").addEventListener("click", moveDown);
document.getElementById("left-button").addEventListener("click", moveLeft);
document.getElementById("right-button").addEventListener("click", moveRight);


let change = false;
//change colour

if (player.position.y > 1 && !change){
    player.material.color.setHex(0xEC6E18);
    change = true;
}

//GLTF

const gltfloader  = new GLTFLoader().setPath("resources/3dmodels/");
///////GLTF loader
// Load a glTF resource
let helicopter;
gltfloader.load(
    'low_poly_helicopter.glb',  // called when the resource is loaded
 
    (gltf) => {
        helicopter = gltf.scene;
        helicopter.scale.set(0.3, 0.3, 0.3);
        scene.add(helicopter); //add GLTF to the scene
 
    },
    // called when loading is in progresses
 
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
 
    },
    // called when loading has errors
 
    (error) => {
        console.log('An error happened' + error);
    }
);

///////////////INPUT STUFF///////////////////
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
        case 'Space':
            console.log (player.velocity.y);
            if (player.velocity.y < 0.01 && player.velocity.y > -0.01){
                console.log("jump");
                player.velocity.y = 0.1;
            }
            
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
            break;
        case 'KeyD':
            keys.d.pressed = false;
            break;
    }
})
