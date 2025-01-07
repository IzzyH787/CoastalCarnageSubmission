////////////////IMPORTS///////////////////////////
import * as THREE from 'three'; //import three.js

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader
import { FBXLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"
import { Timer } from 'https://unpkg.com/three@0.169.0/examples/jsm/misc/Timer.js';
import  Stats  from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

import { renderer } from './rendererManager.js';
import { stats } from './statsManager.js';

import { isPaused, frames, setIsPaused, setFrames, clock, startTime} from './gameManager.js';
import { addPlane, createSkybox, createPointGeometry, waterPlane, waterGeometry, waterVertexCount, waterTexture, createSand } from './assetCreator.js';
import { spawnTrees, Tree, trees } from './tree.js';
import { Box, boxCollision } from './box.js';
import { loadingManager } from './loadingScreen.js';
import { Enemy, spawnEnemy, spawnRate, enemyHealth, speed, enemies, setEnemyHealth, setSpawnRate } from './enemy.js';
import { CharacterController } from './characterController.js';
import {healthText, timerText, dataText, setHealthText, setTimeText, setDataText, setSurvivalText} from './uiManager.js'
import { playDeathSound } from './audioManager.js';
import { camera, updateCamera } from './cameraManager.js';
import { saveData, readData } from './gameData.js';


////////////SETTING UP SCENE/////////////
//////////////DECLARING VARIABLES///////////////

const scene = new THREE.Scene(); //create scene
const loader = new THREE.TextureLoader(loadingManager);

//create player: zombie
const zombie = new CharacterController({width: 5, height: 4, depth: 5, velocity: {x: 0, y:-0.01, z:0}, pos: {x: 0, y: -3, z: 0}, speed: 0.01, manager: loadingManager});
zombie.loadModel(scene);

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

const checkIfDrowned=()=>{
    //check if underwater
    if (zombie.position.y < ground.position.y - 3 && !zombie.isDrowned){
        //create water particle effect
        const waterParticles = createPointGeometry(scene, zombie.position.x, zombie.position.y, zombie.position.z, 2);
        console.log('drowned');
        zombie.isDrowned = true; //set player has now drowned
        //playerIsDead = true; //player is now dead
        zombie.currentHealth = 0; //zero player health
        //update health on UI
        setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP"));
        
    }
}


const updateDifficulty=()=>{
    //skip check if game just started
    if((Date.now() - startTime) / 1000 == 0){
        return;
    }
    //every 30s enemies gain health
    if (((Date.now() - startTime) / 1000) % 30 == 0){
        setEnemyHealth(enemyHealth + 5);
        console.log("Upping diificulty");
    }
    //every 60s enemies spawn faster
    if (((Date.now() - startTime) /1000) % 60 == 0){
        setSpawnRate(spawnRate*0.85); //spawn faster
        console.log("Upping diificulty");
    }
}


//animate function acts as update

const animate=()=> {
    if(!isPaused){
        //const animationId = requestAnimationFrame(animate);
        //update animation mixer
        var delta = clock.getDelta(); 
        //control camera 
        updateCamera(zombie);
        //animating water plane
        animateWaterPlane(waterGeometry, waterVertexCount);
        //update zombie animation mixer
        zombie.Update(ground, delta, wallLeft, wallRight, wallBack, trees); //update zombie object  
        //see if difficulty needs scaling
        updateDifficulty();
        //update stats (fps) display
        stats.update();
        //check if enemy needs spawning this frame
        spawnEnemy(scene, frames);       
        //update enemies
        enemies.forEach((enemy) => {
        enemy.Update(ground, delta, wallLeft, wallRight, wallBack, zombie, trees);
        //check for collision between player and enemy
        if (boxCollision({box1: zombie, box2: enemy})){
            console.log("boom");
            zombie.currentHealth--; //decrement player health
            
            setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP"));
            //cancelAnimationFrame(animationId);
        }
        })
        //check if player has drowned this frame
        checkIfDrowned();

        renderer.render(scene, camera); //render scene
        setFrames(frames+1); //increment frame number

        //check if player has died this frame, not dead but has health < 0
        if (zombie.currentHealth <= 0 && !zombie.isDead){
            zombie.currentHealth = 0; //make sure health cant go below 0      
            let survivalTime = (Date.now() - startTime) /1000; //calculate time right now
            zombie.isDead = true; //pplayer now dead
            setSurvivalText("You survived for ".concat(survivalTime, "s")); //stop timer
            playDeathSound(); //play death sound        
            saveData(survivalTime); //save data to data base- check highscore and increment games played
            readData(); //update UI   
            
            
        } 
        //if player is not dead
        else if (!zombie.isDead){
            setTimeText("Timer: ".concat((Date.now() - startTime) /1000)); //update timer
        }
        //if player is already dead
        else{
            zombie.currentHealth = 0; //make sure health cant go below 0
            setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP")); //make health display           
            //display death screen
            document.getElementById("death-text").display = "You died";
            var deathScreen = document.getElementById("death-screen");
            deathScreen.style.display = "block";
            setIsPaused(true); //pause game so stop updating
        }
        
    }
    
}


//redraw renderer when window is rescaled
const onWindowResize=()=>{
    camera.aspect = window.innerWidth / window.innerHeight; //update camera aspect ratio
    camera.updateProjectionMatrix(); //update camera frustum
    renderer.setSize(window.innerWidth, window.innerHeight);
}


////////////////MAIN LOGIC//////////////////////
renderer.setAnimationLoop( animate ); //creates loop so renderer draws scene every time the screen refreshes
window.addEventListener('resize', onWindowResize); //add event listener ofr when widnow resized to call method
//initial UI display of player health
setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP"));
////////////SETTING UP SCENE/////////////
scene.add(new THREE.AmbientLight(0xffffff, 3)); //add ambient light to scene
//create ground
const ground = new Box({width: 200, height: 0.5, depth: 150, color: 0xF0E8DC, pos: {x: 0, y: -3, z: -30} });
ground.receiveShadow = true;
scene.add(ground);
createSand(scene, ground, loadingManager); //add sand plane above ground
scene.add(waterPlane); //add water to scene
createSkybox(scene); //create skybox
spawnTrees(scene); //spawn in trees

//create boundary walls
const wallLeft = new Box({width: 10, height: 10, depth: 120, color: 0xccccc, pos: {x: -80, y: 0, z:-10}});
const wallRight = new Box({width: 10, height: 10, depth: 120, color: 0xccccc, pos: {x: 80, y: 0, z:-10}});
const wallBack = new Box({width: 200, height: 10, depth: 10, color: 0xccccc, pos: {x: 0, y: 0, z:-70}});
let walls = new THREE.Group(); //group all walls together
walls.add(wallLeft, wallRight, wallBack);
scene.add(walls);

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
        default:         
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
        default:
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
document.getElementById("replay-btn").addEventListener("mousedown", ()=>{
    saveData(0);
});

document.getElementById("up-button").addEventListener("mouseup", stopMoveUp);
document.getElementById("down-button").addEventListener("mouseup", stopMoveDown);
document.getElementById("left-button").addEventListener("mouseup", stopMoveLeft);
document.getElementById("right-button").addEventListener("mouseup", stopMoveRight);


document.getElementById("up-button").addEventListener("touchstart", moveUp);
document.getElementById("down-button").addEventListener("touchstart", moveDown);
document.getElementById("left-button").addEventListener("touchstart", moveLeft);
document.getElementById("right-button").addEventListener("touchstart", moveRight);
document.getElementById("replay-btn").addEventListener("touchstart", ()=>{
    saveData(0);
    readData();
});

document.getElementById("up-button").addEventListener("touchend", stopMoveUp);
document.getElementById("down-button").addEventListener("touchend", stopMoveDown);
document.getElementById("left-button").addEventListener("touchend", stopMoveLeft);
document.getElementById("right-button").addEventListener("touchend", stopMoveRight);





