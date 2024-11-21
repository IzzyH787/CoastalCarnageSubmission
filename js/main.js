////////////////IMPORTS///////////////////////////
import * as THREE from 'three'; //import three.js

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader
import { FBXLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"
import { Timer } from 'https://unpkg.com/three@0.169.0/examples/jsm/misc/Timer.js';

import Stats from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

import { createTree, addPlane, createSkybox, createPointGeometry, waterPlane, waterGeometry, waterVertexCount, waterTexture } from './assetCreator.js';
import { Box, boxCollision } from './box.js';
import { createEnemy } from './enemy.js';
import { CharacterController } from './characterController.js';


///////////CREATING LOADING SCREEN///////////

//create loading manager 
const loadingManager = new THREE.LoadingManager();
//get progress bar elemENt from index.html
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');
//called for each item loaded by loader
loadingManager.onProgress=(url, loaded, total)=>{
    console.log('Started loading: ' + url);
    progressBar.value = (loaded / total) * 100;
}

//called after all files are loaded
loadingManager.onLoad=()=>{
    progressBarContainer.style.display = 'none';
}

////////////SETTING UP SCENE/////////////

const scene = new THREE.Scene(); //create scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //create scene camera
const loader = new THREE.TextureLoader(loadingManager);

//setting up renderer

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); //create renderer

renderer.setSize( window.innerWidth, window.innerHeight ); //set size of renderer to window' size
renderer.setAnimationLoop( animate ); //creates loop so renderer draws scene every time the screen refreshes
renderer.shadowMap.enabled = true; //allows objects to cast shadows
//get DOM element by ID or canvas rendering
const canvas = document.querySelector('#scene-container');
canvas.appendChild(renderer.domElement);
//setting up camera
camera.position.set(0, 15, 20);
camera.rotation.set(-Math.PI /4, 0, 0);
//create orbit controls

let controls;
const createOrbitControls=()=>{
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
}
//createOrbitControls();

//tracking stats for game
let stats;
stats = new Stats();
document.body.appendChild(stats.dom);

//////////////DECLARING VARIABLES///////////////
let frames = 0; //stores amount of frames that have passed
let spawnRate = 500; //how many frames until another enemy will spawn
let speed = 0.05;
const enemies = []; //create array to store enemies

let playerDrowned = false; 
let waterParticles; //variable for particle effects

let playerIsDead = false;
let playerHealth = 10;
const playerMaxHealth = 10;
//initial UI display of player health
let healthText = "Health: ";
healthText = healthText.concat(playerHealth, "/", playerMaxHealth, "HP");
document.getElementById("health-display").innerHTML = healthText;


//initialise timers
const clock = new THREE.Clock();
const timer = new Timer();
const startTime = Date.now();


//////////////DEFINING FUNCTIONS///////////////////
const animateWaterPlane = (geometry, count) => {
    //iterate through verties of water plane
    for (let i = 0; i < count; i++){
        const x = geometry.attributes.position.getX(i); //get x position of vertex
        const y = geometry.attributes.position.getY(i); //get x position of vertex

        const xsin = Math.sin (x + frames/120); //find sin value of vertice's x pos and frames/60
        const ycos = Math.cos(y + frames/120);
        
        geometry.attributes.position.setZ(i, xsin + ycos); //set z pos of vertex
    }
    geometry.computeVertexNormals(); //recalculate vertex normals so shadows look correct
    geometry.attributes.position.needsUpdate = true; //update position of vertices
    waterTexture.offset.y += 0.0005; //offset texture to give appearance of moving water
}


const movePlayer=()=>{
    // //movement code
    // player.velocity.x = 0 //stop player at start of frame
    // player.velocity.z = 0 //stop player at start of frame

    // //check if player walks into wall
    // if (boxCollision({box1: player, box2: wallLeft})){
    //     player.velocity.x = 0;
    //     player.position.x += speed;
    //     player.velocity.z = 0;
    // }

    // if (boxCollision({box1: player, box2: wallRight})){
    //     player.velocity.x = 0;
    //     player.position.x -= speed;
    //     player.velocity.z = 0;
    // }

    // if (boxCollision({box1: player, box2: wallBack})){
    //     player.velocity.x = 0;
    //     player.position.z += speed;
    //     player.velocity.z = 0;
    // }


    //check if player falls in water
    if (player.position.y < ground.position.y && !playerDrowned){
        //create water partucle effect
        waterParticles = createPointGeometry(scene, player.position.x, player.position.y, player.position.z, 2);
        console.log('drowned');
        playerDrowned = true; //set player has now drowned
        playerIsDead = true; //player is now dead
        playerHealth = 0; //zero player health
        //update health on UI
        healthText = "Health: "
        document.getElementById("health-display").innerHTML = healthText.concat(playerHealth, "/", playerMaxHealth, "HP");
    }
}

const updateCamera=()=>{
    //initial position 0, 3, 20
    camera.position.set(0 + zombie.position.x, camera.position.y, 20 + zombie.position.z); //offset camera so doesn't spawn in model
}


//function to animate geometry


function animate() {

    //update animation mixer
    var delta = clock.getDelta();

    //update zombie animation mixer
    zombie.Update(ground, delta, wallLeft, wallRight, wallBack); //update zombie object

    updateCamera();
    
    //update stats (fps) display
    stats.update();

    //animating water plane
    animateWaterPlane(waterGeometry, waterVertexCount);

    //const animationId = requestAnimationFrame(animate);


    /////////////WILL BE REDONE//////////////////
    movePlayer(); //check if player (cube) moves this frame
    //check position of player for collisions
    player.update(ground);


    //update enemy
    enemies.forEach((enemy) => {
    enemy.update(ground);

    //check for collision between player (cube) and enemy
    if (boxCollision({box1: zombie, box2: enemy})){
        console.log("boom");
        playerHealth--;
        if (playerHealth < 0){playerHealth = 0;}
        let healthText = "Health: ";
        document.getElementById("health-display").innerHTML = healthText.concat(playerHealth, "/", playerMaxHealth, "HP");
        //cancelAnimationFrame(animationId);
    }
    })

    //if enough frames passed since last spawn
    if (frames % spawnRate == 0){
        createEnemy(scene, enemies); //spawn another enemy
    }


    renderer.render(scene, camera); //render scene
    frames++; //increment frame number

    let timerText = "Timer: "; //reset time UI text

    //if player is not dead
    if (!playerIsDead){
        //update timer
        document.getElementById("timer-display").innerHTML = timerText.concat((Date.now() - startTime) /1000);
    }
    
}


//redraw renderer when window is rescaled
const onWindowResize=()=>{
    camera.aspect = window.innerWidth / window.innerHeight; //update camera aspect ratio
    camera.updateProjectionMatrix(); //update camera frustum
    renderer.setSize(window.innerWidth, window.innerHeight);
}


////////////////MAIN LOGIC//////////////////////

//set up scene
window.addEventListener('resize', onWindowResize); //add event listener ofr when widnow resized to call method
scene.add(new THREE.AmbientLight(0xffffff, 0.5)); //add ambient light to scene

//create ground
const ground = new Box({width: 200, height: 0.5, depth: 150, color: 0xF0E8DC, pos: {x: 0, y: -3, z: -30} });
ground.receiveShadow = true;
scene.add(ground);

//create skybox
createSkybox(scene);

//load sand texture from external file
const sandTexture = new THREE.TextureLoader(loadingManager).load('resources/images/sand.jpg');
//ensure texture repeats if offset
sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set( 2, 2 ); //how many times texture repeats across plane
//initialise properties for sand material
const sandPlaneMaterialProperties = {map: sandTexture, side: THREE.DoubleSide, transparent: true, repeat: 10};
//add sand plane to scene
const sandPlane = addPlane(0,ground.topPosition + 0.01, 200, 150, sandPlaneMaterialProperties, scene);
//position so appears above ground
sandPlane.position.z = -30;


//add water plane
scene.add(waterPlane);

//create boundary walls
const wallLeft = new Box({width: 10, height: 10, depth: 120, color: 0xccccc, pos: {x: -80, y: 0, z:-10}});
const wallRight = new Box({width: 10, height: 10, depth: 120, color: 0xccccc, pos: {x: 80, y: 0, z:-10}});
const wallBack = new Box({width: 200, height: 10, depth: 10, color: 0xccccc, pos: {x: 0, y: 0, z:-70}});
let walls = new THREE.Group(); //group all walls together
walls.add(wallLeft);
walls.add(wallRight);
walls.add(wallBack);
scene.add(walls);

//add trees to scene in random places NEEDS EDITTING
for (let i = 0; i < Math.random() * (20 - 10) + 10; i++){
    const xPos = Math.random() * (80 - -80) - 80;
    const zPos = Math.random() * (30 - -60) + (-60);
    createTree(scene, xPos, 0, zPos);
}


//create player cube
const player = new Box({width: 1, height: 2, depth: 1, color: 0xff00ff, velocity: {x: 0, y: -0.01, z:0}, pos: {x: 0, y: 3, z: 0}});
player.castShadow = true;
scene.add(player);


//create player zombie
const zombie = new CharacterController({width: 5, height: 4, depth: 5, velocity: {x: 0, y:-0.01, z:0}, pos: {x: 0, y: -3, z: 0}, speed: 0.01, manager: loadingManager});
zombie.loadModel(scene);


///////////////INPUT STUFF///////////////////

const keysPressed = { };


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
});
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
});

//////////////////UI INPUT/////////////////

//movement form UI buttons
const moveUp =()=>{
    zombie.move.forward = true;
}
const moveDown=()=>{
    zombie.move.backward = true;
}
const moveLeft =()=>{
    zombie.move.left = true;
}
const moveRight=()=>{
    zombie.move.right = true;
}


const stopMoveUp =()=>{
    zombie.move.forward = false;
}
const stopMoveDown=()=>{
    zombie.move.backward = false;
}
const stopMoveLeft =()=>{
    zombie.move.left = false;
}
const stopMoveRight=()=>{
    zombie.move.right = false;
}


//get buttons by ID
document.getElementById("up-button").addEventListener("mousedown", moveUp);
document.getElementById("down-button").addEventListener("mousedown", moveDown);
document.getElementById("left-button").addEventListener("mousedown", moveLeft);
document.getElementById("right-button").addEventListener("mousedown", moveRight);

document.getElementById("up-button").addEventListener("mouseup", stopMoveUp);
document.getElementById("down-button").addEventListener("mouseup", stopMoveDown);
document.getElementById("left-button").addEventListener("mouseup", stopMoveLeft);
document.getElementById("right-button").addEventListener("mouseup", stopMoveRight);

document.getElementById("up-button").addEventListener("touchstart", moveUp);
document.getElementById("down-button").addEventListener("touchstart", moveDown);
document.getElementById("left-button").addEventListener("touchstart", moveLeft);
document.getElementById("right-button").addEventListener("touchstart", moveRight);

document.getElementById("up-button").addEventListener("touchend", stopMoveUp);
document.getElementById("down-button").addEventListener("touchend", stopMoveDown);
document.getElementById("left-button").addEventListener("touchend", stopMoveLeft);
document.getElementById("right-button").addEventListener("touchend", stopMoveRight);



