import * as THREE from 'three'; //import three.js

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader
import {FBXLoader} from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"
import {Timer } from 'https://unpkg.com/three@0.169.0/examples/jsm/misc/Timer.js';
//import { Timer } from 'three/addons/misc/Timer.js';

import Stats from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

import { createTree, addPlane, createSkybox, createPointGeometry, waterPlane, waterGeometry, waterVertexCount, waterTexture } from './assetCreator.js';
import { Box, boxCollision} from './box.js';

///////////CREATING LOADING SCREEN///////////

//create loading manager 
const loadingManager = new THREE.LoadingManager();
//get progress bar elemt from index.html
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
    waterTexture.offset.y += 0.0005;
}

const checkInput=()=>{
    //move left
    if (keys.a.pressed){
        player.velocity.x = -speed;
        zombie.characterModel.position.x -= speed;
    } 
    //move right
    else if (keys.d.pressed){
        player.velocity.x = speed; 
        zombie.characterModel.position.x += speed;
    } 

    //separate if for axis allows them to be true at same time

    //move forward
    if (keys.w.pressed){
        player.velocity.z = speed;
        zombie.characterModel.position.z += speed;
    } 
    //move backward
    else if (keys.s.pressed){
        player.velocity.z = -speed; 
        zombie.characterModel.position.z -= speed;
    } 
}

const movePlayer=()=>{
    //movement code
    player.velocity.x = 0 //stop player at start of frame
    player.velocity.z = 0 //stop player at start of frame

    checkInput();

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
    if (zombie.characterMixer) zombie.characterMixer.update(delta);
    zombie.Update(delta);



    //if (playerMixer)playerMixer.update(delta);

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

const sandTexture = new THREE.TextureLoader(loadingManager).load('resources/images/sand.jpg');

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




let change = false;
//change colour

if (player.position.y > 1 && !change){
    player.material.color.setHex(0xEC6E18);
    change = true;
}

//GLTF


const addModel=(fileName, scale, model, animationsArray)=>{
    const gltfloader  = new GLTFLoader(loadingManager).setPath("resources/3dmodels/");
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



class CharacterController{
    constructor(params){
        this.Init(params);
    }

    Init = (params) => {
        this.params = params;
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        this. decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this.velocity = new THREE.Vector3(0,0,0);
        this.pos = new THREE.Vector3(0,0,0);

        //input stuffs
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);

        //Animation stuffs
        this.fbxLoader = new FBXLoader();
        this.characterModel;

        this.characterMixer = new THREE.AnimationMixer;
        this.characterActions = {};


        // this.fbxLoader.load('resources/3dmodels/zombie.fbx', (fbx)=>{
        //     fbx.scale.setScalar(0.04);
        //     scene.add(fbx);
        //     this.characterModel = fbx;

        //     loadCharacterAnimation('idle', 'resources/animations/zombie-idle.fbx');
        //     loadCharacterAnimation('walk', 'resources/animations/zombie-run.fbx');

        // });
        
    }

    onKeyDown = (event) =>{
        switch(event.keyCode){
            case 87: //w
                this.move.forward = true;             
                break;
            case 65: //a
                this.move.left = true;;
                break;
            case 83: //s
                this.move.backward = true;
                break;
            case 68: //d
                this.move.right = true;
                break;
            case 38: //up
            case 37: //left
            case 40: //down
            case 39: //right
                break;
        }
    }

    onKeyUp = (event) =>{
        switch(event.keyCode){
            case 87: //w
                this.move.forward = false;
                 break;
            case 65: //a
                this.move.left = false;
                break;
            case 83: //s
                this.move.backward = false;
                break;
            case 68: //d
                this.move.right = false;
                break;
            case 38: //up
            case 37: //left
            case 40: //down
            case 39: //right
                break;
        }
    }

    
    // loadCharacterAnimation=(name, path)=>{
    //     this.fbxLoader.load(path, (animObject)=>{
    //         const clip = animObject.animations[0];
    //         const action = this.characterMixer.clipAction(clip, this.characterModel);
    //         this.characterActions[name] = action;
    //     });
    // }

    loadModel=()=>{
        this.fbxLoader.load('resources/3dmodels/zombie.fbx', (fbx)=>{
            fbx.scale.setScalar(0.04);
            fbx.position.set(0, -3, 0);
            scene.add(fbx);
            this.characterModel = fbx;


            //load idle animation
            this.fbxLoader.load('resources/animations/zombie-idle.fbx', (animObject)=>{
                const clip = animObject.animations[0];
                const action = this.characterMixer.clipAction(clip, this.characterModel);
                this.characterActions['idle'] = action;
            });

            //load idle animation
            this.fbxLoader.load('resources/animations/zombie-run.fbx', (animObject)=>{
                const clip = animObject.animations[0];
                const action = this.characterMixer.clipAction(clip, this.characterModel);
                this.characterActions['walk'] = action;
            });
        });
    }


    Update(timeInSeconds){
        // const velocity = this.velocity;
        // const frameDecceleration = new THREE.Vector3(
        //     velocity.x * this.decceleration.x,
        //     velocity.y * this.decceleration.y,
        //     velocity.z * this.decceleration.z
        // );
        // frameDecceleration.multiplyScalar(timeInSeconds);
        // frameDecceleration.z = Math.sign(frameDecceleration) * Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));
        // velocity.add(frameDecceleration);

        // const controlObject = this.params.target;
        // const Q = new THREE.Quaternion();
        // const A = new THREE.Vector3();
        //const R = controlObject.Quaternion.clone();


        //handling inputs
        if (this.move.forward){

            ///////////////velocity calculation doesn't work/////////////////
            //this.velocity.z += this.acceleration.z * timeInSeconds;
            //console.log (velocity.z);

            this.characterModel.position.z += speed;

            if (this.characterActions['walk']){
                console.log('anim maybe');
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation
            }

            //rotate player model
            this.characterModel.rotation.y = 0;
        }


        else if (this.move.backward){
            //velocity.z -= this.acceleration.z * timeInSeconds;
            this.characterModel.position.z -= speed;

            if (this.characterActions['walk']){
                console.log('anim maybe');
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation 
            }

            //rotate player model
            this.characterModel.rotation.y = Math.PI;

        }


        else if (this.move.right){
            //velocity.x += this.acceleration.x * timeInSeconds;
            this.characterModel.position.x += speed;
            if (this.characterActions['walk']){
                console.log('anim maybe');
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation 
            }

            //rotate player model
            this.characterModel.rotation.y = Math.PI / 2;

        }



        else if (this.move.left){
            //velocity.x -= this.acceleration.x * timeInSeconds;
            this.characterModel.position.x -= speed;
            if (this.characterActions['walk']){
                console.log('anim maybe');
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation 
            }

            //rotate player model
            this.characterModel.rotation.y = -Math.PI / 2;

        }

        else{
            //swap back to idle animation
            if (this.characterActions['idle']){
                this.characterActions['walk']?.stop(); //stop other animation
                this.characterActions['idle'].play(); //play idle animation 
            }
        }
    }


}


const zombie = new CharacterController(0);
zombie.loadModel();


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
    player.position.z -= speed;
    zombie.move.forward = true;
}
const moveDown=()=>{
    player.position.z += speed;
    zombie.move.backward = true;
}
const moveLeft =()=>{
    player.position.x -= speed;
    zombie.move.left = true;
}
const moveRight=()=>{
    player.position.x += speed;
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



