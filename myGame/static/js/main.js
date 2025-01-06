////////////////IMPORTS///////////////////////////
import * as THREE from 'three'; //import three.js

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader
import { FBXLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"
import { Timer } from 'https://unpkg.com/three@0.169.0/examples/jsm/misc/Timer.js';

import Stats from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

import { renderer } from './rendererManager.js';
import { stats } from './statsManager.js';

import { isPaused, frames, setIsPaused, setFrames, clock, startTime} from './gameManager.js';
import { addPlane, createSkybox, createPointGeometry, waterPlane, waterGeometry, waterVertexCount, waterTexture } from './assetCreator.js';

import { Tree, trees } from './tree.js';
import { Ship, ships } from './ship.js';
import { Box, boxCollision } from './box.js';
import { loadingManager } from './loadingScreen.js';
import { Enemy, spawnEnemy, spawnRate, enemyHealth, speed, enemies, setEnemyHealth, setSpawnRate } from './enemy.js';
import { CharacterController } from './characterController.js';
import { animatePlane } from './waterManager.js';
import {healthText, timerText, dataText, setHealthText, setTimeText, setDataText} from './uiManager.js'

import { playDeathSound } from './audioManager.js';
import { camera, updateCamera } from './cameraManager.js';

import { saveData, readData } from './gameData.js';



////////////SETTING UP SCENE/////////////

const scene = new THREE.Scene(); //create scene
//const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //create scene camera
const loader = new THREE.TextureLoader(loadingManager);

//////////////DECLARING VARIABLES///////////////

//create player: zombie
const zombie = new CharacterController({width: 5, height: 4, depth: 5, velocity: {x: 0, y:-0.01, z:0}, pos: {x: 0, y: -3, z: 0}, speed: 0.01, manager: loadingManager});
zombie.loadModel(scene);
//add water to scene
console.log(waterPlane);
scene.add(waterPlane);
//initial UI display of player health
setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP"));

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
    if ((Date.now() - startTime) / 1000 % 30){
        setEnemyHealth(enemyHealth + 5);
        console.log("Upping diificulty");
    }
    //every 60s enemies spawn faster
    if ((Date.now() - startTime) /1000 % 60){
        setSpawnRate(spawnRate*0.85); //spawn faster
        console.log("Upping diificulty");
    }
}


//function to animate geometry


const animate=()=> {
    if(!isPaused){
        //update animation mixer
        var delta = clock.getDelta();
        
        //update zombie animation mixer
        zombie.Update(ground, delta, wallLeft, wallRight, wallBack); //update zombie object

        trees.forEach(tree => {
            console.log("Tree position:");
            console.log(tree.position);
            zombie.checkForTree(tree);
        });
        //control camera 
        updateCamera(zombie);
        
        //see if difficulty needs scaling
        updateDifficulty();
        //update stats (fps) display
        stats.update();

        //animating water plane
        animateWaterPlane(waterGeometry, waterVertexCount);
        //animatePlane(waterGeometry, waterVertexCount);
        //const animationId = requestAnimationFrame(animate);


        /////////////WILL BE REDONE//////////////////
        



        //update enemy
        enemies.forEach((enemy) => {
        enemy.Update(ground, delta, wallLeft, wallRight, wallBack, zombie);

        //check for collision between player and enemy
        if (boxCollision({box1: zombie, box2: enemy})){
            console.log("boom");
            zombie.currentHealth--; //decrement player health
            
            setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP"));
            //cancelAnimationFrame(animationId);
        }


        })

        //if enough frames passed since last spawn
        if (frames % spawnRate == 0){
            enemies.push(spawnEnemy(scene));
        }


        renderer.render(scene, camera); //render scene
        setFrames(frames+1); //increment frame number

        checkIfDrowned();

        let timerText = "Timer: "; //reset time UI text

        //check if player has died this frame
        if (zombie.currentHealth <= 0 && !zombie.isDead){
            zombie.currentHealth = 0; //make sure health cant go below 0
        
            let survivalTime = (Date.now() - startTime) /1000;
            zombie.isDead = true;
            //stop timer
            timerText = "You survived: "; //reset time UI text
            document.getElementById("timer-display").innerHTML = timerText.concat(survivalTime).concat("s");
            //play death sound
            playDeathSound();

            console.log("Player died");

            //save data to data base- check highscore and increment games played
            saveData(survivalTime);
            //need fixing for guest players
            readData(); //update UI
            
        } 
        //if player is not dead
        if (!zombie.isDead){
            //update timer
            document.getElementById("timer-display").innerHTML = timerText.concat((Date.now() - startTime) /1000);
        }
        //if player is dead
        else{
            zombie.currentHealth = 0; //make sure health cant go below 0
            //make health display
            setHealthText("Health: ".concat(zombie.currentHealth, "/", zombie.maxHealth, "HP"));
            //THREE.AnimationAction.timeScale = 0;
            
            //display death screen
            document.getElementById("death-text").display = "You died";
            var deathScreen = document.getElementById("death-screen");
            deathScreen.style.display = "block";
            
            

            setIsPaused(true);
        }
    }
    
}
renderer.setAnimationLoop( animate ); //creates loop so renderer draws scene every time the screen refreshes

//redraw renderer when window is rescaled
const onWindowResize=()=>{
    camera.aspect = window.innerWidth / window.innerHeight; //update camera aspect ratio
    camera.updateProjectionMatrix(); //update camera frustum
    renderer.setSize(window.innerWidth, window.innerHeight);
}


////////////////MAIN LOGIC//////////////////////

//set up scene
window.addEventListener('resize', onWindowResize); //add event listener ofr when widnow resized to call method
scene.add(new THREE.AmbientLight(0xffffff, 3)); //add ambient light to scene

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
    const xPos = Math.random() * (70 - -70) - 70;
    const zPos = Math.random() * (30 - -40) + (-40);
    //createTree(scene, xPos, 0, zPos);
    trees.push(new Tree(scene, xPos, 0, zPos));
    //ships.push(new Ship(scene, xPos, 0, zPos));
    
}










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
            // console.log (player.velocity.y);
            // if (player.velocity.y < 0.01 && player.velocity.y > -0.01){
            //     console.log("jump");
            //     player.velocity.y = 0.1;
            // }
            
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





