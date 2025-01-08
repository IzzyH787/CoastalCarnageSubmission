import * as THREE from 'three'; //import three.js
import {FBXLoader} from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"; //import fbx loader

export let spawnRate = 1000; //how many frames until another enemy will spawn
export let enemyHealth = 10;
export let speed = 0.05;
export const enemies = []; //create array to store enemies

//get set methods

export const setEnemyHealth=(value)=>{enemyHealth = value;}
export const setSpawnRate=(value)=>{spawnRate = value;}

//funnction for spawning enemies

export const spawnEnemy=(scene, currentFrame)=>{
    if (currentFrame % spawnRate == 0){
        const randomX = Math.random() * (70 - -70) + (-70); //spawn in random x position
        const spawnPosition = new THREE.Vector3(randomX, -3, 30); //spawn along water edge
        //create new enemy object       
        let newEnemy = new Enemy({width: 5, height: 4, depth: 5, velocity: {x: 0, y:-0.01, z:0}, pos: {x: spawnPosition.x, y: spawnPosition.y, z: spawnPosition.z}, health: 10});
        newEnemy.loadModel(scene); //load models for enemy
        //console.log("Spawn enemy!"); //write message to console
        enemies.push(newEnemy);
        return newEnemy;
    }
    
}

export class Enemy{


    ////////////////CONSTRUCTOR/////////////////


    constructor({width, height, depth, velocity = {x: 0, y: 0, z: 0}, pos, health}){
        this.ready = false; //stored if everything about object is loaded
        this.Init(width, height, depth, velocity, pos, health); //initalise values
    }


    //////////////////////INITIALISING ALL ATTRIBUTES/////////////////////


    Init = (width, height, depth, velocity, pos, health) => {
        //define bounds of model
        this.width = width;
        this.height = height;
        this.depth = depth;

        //initial position
        this.position = new THREE.Vector3(pos.x, pos.y, pos.z);

        //define sides of model for collison
        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;
        this.leftPosition = this.position.x - this.width / 2;
        this.rightPosition = this.position.x + this.width / 2;
        this.frontPosition = this.position.z + this.depth / 2;
        this.backPosition = this.position.z - this.depth / 2;
        
        //set movement of model
        this.velocity = new THREE.Vector3( velocity.x, velocity.y, velocity.z);
        this.speed = 0.04; //slower than player
        this.gravity = -0.002;


        //Animation stuff
        this.fbxLoader = new FBXLoader();
        this.characterModel; //variable to store fbx mesh
        this.swordModel;

        this.characterMixer = new THREE.AnimationMixer; //animation mixel for model
        this.characterActions = {}; //array of all animation actions
        this.activeAction;

        //set properties
        this.health = health;



        
    }


    //////////////////GENERAL METHODS///////////////////////


    //when player moves upate sizes of model so collsion is correct
    updateSides=()=>{
        //set edge positions so can check for collisions
        this.bottomPosition = this.position.y - this.height / 2;
        this.topPosition = this.position.y + this.height / 2;
        this.leftPosition = this.position.x - this.width / 2;
        this.rightPosition = this.position.x + this.width / 2;
        this.frontPosition = this.position.z + this.depth / 2;
        this.backPosition = this.position.z - this.depth / 2;
    }

    //check if 2 boxes overlap
    hasBoxCollision=({box1, box2})=>{
        const xCollision = ( (box1.rightPosition >= box2.leftPosition) && (box1.leftPosition <= box2.rightPosition) );
        //frame ahead for y collision, gravity
        const yCollision = ( (box1.bottomPosition + box1.velocity.y <= box2.topPosition) && (box1.topPosition >= box2.bottomPosition) );
        const zCollision = ( (box1.frontPosition >= box2.backPosition) && (box1.backPosition <= box2.frontPosition) );
        
        return (xCollision && yCollision && zCollision);
    }

    applyGravity=(ground)=>{
        this.velocity.y += this.gravity; //add gravity

        //check for collsion with floor (1 frame ahead)
        if (this.hasBoxCollision({box1: this, box2: ground})){
            //hitting floor
            this.velocity.y *= 0.5; //reduce velocity to create friciton between bounces, reduce bounce height
            this.velocity.y = -this.velocity.y; //reverse velocity for bounce effect
        }
        else{
            //if not hitting floor
            this.position.y += this.velocity.y
        }
    }

    checkForWalls=({wallLeft, wallRight, wallBack})=>{
            //check if player walks into wall
        if (this.hasBoxCollision({box1: this, box2: wallLeft})){
            this.velocity.x = 0;
            this.position.x += this.speed;
            this.velocity.z = 0;
        }

        if (this.hasBoxCollision({box1: this, box2: wallRight})){
            this.velocity.x = 0;
            this.position.x -= this.speed;
            this.velocity.z = 0;
        }

        if (this.hasBoxCollision({box1: this, box2: wallBack})){
            this.velocity.x = 0;
            this.position.z += this.speed;
            this.velocity.z = 0;
        }
    }


    ////////////////LOADING MODEL AND ANIMATIONS///////////


    loadModel=(scene)=>{
        //load fbx
        this.fbxLoader.load('resources/3dmodels/zombie.fbx', (fbx)=>{
            fbx.scale.setScalar(0.04); //scale model down ot reasonavle size
            fbx.position.copy(this.position); //match position of model to obejct
            scene.add(fbx); //add to scene
            this.characterModel = fbx; //assign model attribute to fbx model


            //load idle animation
            this.fbxLoader.load('resources/animations/zombie-idle.fbx', (animObject)=>{
                const clip = animObject.animations[0]; //get clip
                const action = this.characterMixer.clipAction(clip, this.characterModel); //get action
                this.characterActions['idle'] = action; //add to actions array
                //this.activeAction = action; //active action is initially idle
                action.play(); //start playing idle animation
            });

            //load walk animation
            this.fbxLoader.load('resources/animations/zombie-run.fbx', (animObject)=>{
                const clip = animObject.animations[0]; //get clip
                const action = this.characterMixer.clipAction(clip, this.characterModel); //get animation
                this.characterActions['walk'] = action; //add action to array
            });
        });


        this.ready = true; //all animations now loaded
    }

    updateAnimation=(name)=>{
        //exits if the animations have not been loaded fully
        if(!this.ready){
            return;
        }
        const action = this.characterActions[name]; //get mathing action from array by name
        //check if action is not already playing
        if (action && action != this.activeAction){
            this.activeAction?.fadeOut(0.2); //fade out playing animtaion
            action.reset().fadeIn(0.2).play(); //fade into to playing new animation from the start
            this.activeAction = action; //updat eactive action to new animation
        }
    }

    checkForCollisionOnPlayer=(player)=>{
        if (this.hasBoxCollision({box1: this, box2: player})){
            this.velocity.x = 0;
            this.position.z += this.speed;
            this.velocity.z = 0;
        }
    }
    checkForTree=(trees)=>{
        
        trees.forEach(tree => {
            //console.log("checking for trees:", tree.position);
            //console.log("enemy position:", this.position);
            if (this.hasBoxCollision({box1: this, box2: tree})){
                //console.log("hit tree");
                this.position.x -= this.velocity.x; //undo players move
                this.position.z -= this.velocity.z; //undo players move
                this.velocity.x = 0; //stop player moving
                this.velocity.z = 0; //stop player moving
            }
        });
        
    }
    checkForBullet=(bullets, scene)=>{
        bullets.forEach(bullet => {
            //console.log(bullet.position, this.position);
            //console.log("checking for trees:", tree.position);
            //console.log("enemy position:", this.position);
            if (this.hasBoxCollision({box1: this, box2: bullet})){
                //console.log("enemy shot");
                scene.remove(bullet); //hide bullet, will be removed once out of bounds
                const enemyIndex = enemies.indexOf(this); //find position of this enemy in enemy array
                //check index is in array
                if (enemyIndex > -1) {
                    //remove from parent if has one
                    if (this.parent) {
                        this.parent.remove(this);
                    }
                    //make transclucent
                    if (this.characterModel.material) {
                        this.characterModel.material.transparent = true; // Enable transparency
                        this.characterModel.material.opacity = 0.3;     // Set opacity (0 = fully transparent, 1 = fully opaque)
                    } 
                    enemies.splice(enemyIndex, 1); // remove enemy from the enemies array
                }
            }
        });
    }

    trackPlayer=(_player)=>{
        //get direction enemy needs to go towards player
        let direction = new THREE.Vector3(_player.position.x - this.position.x, _player.position.y - this.position.y, _player.position.z - this.position.z); 
        direction = direction.normalize(); //get unit vector 
        this.velocity.x = direction.x * this.speed; //set velocity in x axis
        this.velocity.z = direction.z * this.speed; //set velocity in x axis
        //update rotation
        //initially facing (0, 0, 1)
        const angle = Math.atan2(this.velocity.x, this.velocity.z); //finds angle between vectors
        this.characterModel.rotation.y = angle;
    }
    


    /////////////////UPDATE CALLED EVERY FRAME////////////////////////////


    Update(scene, ground, deltaTime, _wallLeft, _wallRight, _wallBack, _player, trees, bullets){
        //quit method if object not fully loaded
        if (!this.ready || !this.characterModel){
            return;
        }
        //reset velocity 
        this.velocity.set(0, this.velocity.y, 0);
        
        //find player
        this.trackPlayer(_player);

        //apply movement
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        
        //update character model positon to object position
        if (this.characterModel){
            this.characterModel.position.copy(this.position);
        }

        this.applyGravity(ground);

        //update sides for collision
        this.updateSides();

        this.checkForWalls({wallLeft: _wallLeft, wallRight: _wallRight, wallBack: _wallBack});
        this.checkForTree(trees);
        this.checkForBullet(bullets, scene);

        //update animation of enemy
        if (this.velocity != new THREE.Vector3(0,0,0)){
            this.updateAnimation('walk');
        }
        else{
            this.updateAnimation('idle');
        }
        //update animation mixer
        if (this.characterMixer) this.characterMixer.update(deltaTime);
    }


}