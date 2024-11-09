import * as THREE from 'three'; //import three.js

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader
import { Timer } from 'three/addons/misc/Timer.js';

import Stats from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

import { createTree, addPlane, createSkybox, createPointGeometry, waterPlane, waterGeometry, waterVertexCount, waterTexture } from './assetCreator.js';
import { Box, boxCollision} from './box.js';


////////////SETTING UP SCENE/////////////

const scene = new THREE.Scene(); //create scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //create scene camera
const loader = new THREE.TextureLoader();

//setting up renderer

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); //create renderer

renderer.setSize( window.innerWidth, window.innerHeight ); //set size of renderer to window' size
renderer.setAnimationLoop( animate ); //creates loop so renderer draws scene every time the screen refreshes
renderer.shadowMap.enabled = true; //allows objects to cast shadows
//get DOM element by ID or canvas rendering
const canvas = document.querySelector('#scene-container');
canvas.appendChild(renderer.domElement);

//create orbit controls

let controls;
const createOrbitControls=()=>{
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
}
createOrbitControls();

//tracking stats for game
let stats;
stats = new Stats();
document.body.appendChild(stats.dom);

//////////////DECLARING VARIABLES///////////////


let playerDrowned = false;
let waterParticles;

let playerIsDead = false;
let playerHealth = 10;
const playerMaxHealth = 10;
let healthText = "Health: ";
healthText = healthText.concat(playerHealth, "/", playerMaxHealth, "HP");
document.getElementById("health-display").innerHTML = healthText;

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
    waterTexture.offset.y += 0.0005;
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

    //check if player walks into wall
    if (boxCollision({box1: player, box2: wallLeft})){
        player.velocity.x = 0;
        player.position.x += speed;
        player.velocity.z = 0;
    }

    if (boxCollision({box1: player, box2: wallRight})){
        player.velocity.x = 0;
        player.position.x -= speed;
        player.velocity.z = 0;
    }

    if (boxCollision({box1: player, box2: wallBack})){
        player.velocity.x = 0;
        player.position.z += speed;
        player.velocity.z = 0;
    }
    //check if player falls in water
    if (player.position.y < ground.position.y && !playerDrowned){
        waterParticles = createPointGeometry(scene, player.position.x, player.position.y, player.position.z, 2);
        console.log('drowned');
        playerDrowned = true;
        playerIsDead = true;
        playerHealth = 0;
        healthText = "Health: "
        document.getElementById("health-display").innerHTML = healthText.concat(playerHealth, "/", playerMaxHealth, "HP");
    }
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

//function to animate geometry
let frames = 0;
let spawnRate = 500;
let speed = 0.05;



function animate() {

    //update animation mixer
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    //update stats (fps) display
    stats.update();

    //animating water plane
    animateWaterPlane(waterGeometry, waterVertexCount);

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
        playerHealth--;
        if (playerHealth < 0){playerHealth = 0;}
        let healthText = "Health: ";
        document.getElementById("health-display").innerHTML = healthText.concat(playerHealth, "/", playerMaxHealth, "HP");
        //cancelAnimationFrame(animationId);
    }
    })

    //if enough frames passed since last spawn
    if (frames % spawnRate == 0){
        createEnemy();
    }


    renderer.render(scene, camera); //render scene
    frames++; //increment frame number

    let timerText = "Timer: ";

    if (!playerIsDead){
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
camera.position.set(0,3,20); //offset camera so doesn't spawn in model
scene.add(new THREE.AmbientLight(0xffffff, 0.5)); //add ambient light to scene

//create ground
const ground = new Box({width: 200, height: 0.5, depth: 150, color: 0xF0E8DC, pos: {x: 0, y: -3, z: -30} });
ground.receiveShadow = true;
scene.add(ground);

const sandTexture = new THREE.TextureLoader().load('resources/images/sand.jpg');

sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set( 2, 2 );

const sandPlaneMaterialProperties = {map: sandTexture, side: THREE.DoubleSide, transparent: true, repeat: 10};
const sandPlane = addPlane(0,ground.topPosition + 0.01, 200, 150, sandPlaneMaterialProperties, scene);
sandPlane.position.z = -30;


//add water plane
scene.add(waterPlane);

//create boundary walls
const wallLeft = new Box({width: 10, height: 10, depth: 120, color: 0xccccc, pos: {x: -80, y: 0, z:-10}});
const wallRight = new Box({width: 10, height: 10, depth: 120, color: 0xccccc, pos: {x: 80, y: 0, z:-10}});
const wallBack = new Box({width: 200, height: 10, depth: 10, color: 0xccccc, pos: {x: 0, y: 0, z:-70}});
let walls = new THREE.Group();
walls.add(wallLeft);
walls.add(wallRight);
walls.add(wallBack);
scene.add(walls);

//add trees to scene
for (let i = 0; i < Math.random() * (20 - 10) + 10; i++){
    const xPos = Math.random() * (80 - -80) - 80;
    const zPos = Math.random() * (30 - -60) + (-60);
    createTree(scene, xPos, 0, zPos);
}







//create player
const player = new Box({width: 1, height: 2, depth: 1, color: 0xff00f, velocity: {x: 0, y: -0.01, z:0}, pos: {x: 0, y: 3, z: 0}});
player.castShadow = true;
scene.add(player);

const enemies = []; //create array to store enemies

//create skybox
createSkybox(scene);



//movement form UI buttons
const moveUp =()=>{
    player.position.z -= 3;
    chicken.position.z -= 3;
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


const addModel=(fileName, scale, model, animationsArray)=>{
    const gltfloader  = new GLTFLoader().setPath("resources/3dmodels/");
    // Load a glTF resource
    gltfloader.load(
        fileName,  // called when the resource is loaded
    
        (gltf) => {
            model = gltf.scene;
            model.scale.set(scale, scale, scale);
            scene.add(model); //add GLTF to the scene

            /////////////////WEEK 6////////////////
            //play animation
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                //mixer.clipAction(clip).play();
                animationsArray.push(mixer.clipAction(clip));
                //console.log(clip);
        });
            //////////////////////////////////////
    
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
    //model.position.set(0,4,0);

}


////////////////WEEK 6//////////////////////////////
let chicken; //store gltf model
let mixer;
let chickenAnimations = []; //store chicken model's animations
let chickenState;
const clock = new THREE.Clock();
addModel('chicken.gltf', 0.5, chicken, chickenAnimations);

const displayPeck=()=>{
    console.log("Animation 0");
    //chickenState = 0;
    playAction(0);
    //chickenMixer.clipAction(chickenAnimations[0]).play;
}
const displayWalk=()=>{
    console.log("Animation 1");
    //chickenState = 1;
    playAction(1);
}
const displayTwerk=()=>{
    console.log("Animation 2");
    //chickenState = 2;
    playAction(2);
}


document.getElementById("action1").addEventListener("click", displayPeck);
document.getElementById("action2").addEventListener("click", displayWalk);
document.getElementById("action3").addEventListener("click", displayTwerk);

const playAction=(index)=>{
    const action = chickenAnimations[index];
    console.log('play action');
    if (mixer != null){
        console.log('mixer exists');
        mixer.stopAllAction();

        action.reset();
        action.fadeIn(0.5);
        action.play();
    }
}








///////////////INPUT STUFF///////////////////

const keysPressed = { };
// document.addEventListener('keydown', (event) => {
//     (keysPressed as any)[event.key.toLowerCase()] = true
// }, false);

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
