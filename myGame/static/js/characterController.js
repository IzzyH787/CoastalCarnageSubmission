import * as THREE from 'three'; //import three.js
import {FBXLoader} from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"; //import fbx loader

export class CharacterController{


    ////////////////CONSTRUCTOR/////////////////


    constructor({width, height, depth, velocity = {x: 0, y: 0, z: 0}}, pos = {x: 0, y: -3, z: 0}, speed, manager){
        this.ready = false; //stored if everything about object is loaded
        this.Init(width, height, depth, velocity, pos, speed, manager); //initalise values
    }


    //////////////////////INITIALISING ALL ATTRIBUTES/////////////////////


    Init = (width, height, depth, velocity, pos, manager) => {
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
        this.speed = 0.06;
        this.gravity = -0.002;

        //moving states
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        //input listeners
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);

        //Animation stuff
        this.fbxLoader = new FBXLoader(manager);
        this.characterModel; //variable to store fbx mesh
        this.swordModel;

        this.characterMixer = new THREE.AnimationMixer; //animation mixel for model
        this.characterActions = {}; //array of all animation actions
        this.activeAction;



        
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
    checkForTree=(tree)=>{
        if (this.hasBoxCollision({box1: this, box2: tree})){
            this.velocity.x = 0;
            this.position.z += this.speed;
            this.velocity.z = 0;
        }
    }



    


    ///////////////////INPUT STUFF/////////////////////


    //called when key is pressed
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

        }
    }
    //called when key is released
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
        }
    }


    ////////////////LOADING MODEL AND ANIMATIONS///////////


    loadModel=(scene)=>{
        //load fbx
        this.fbxLoader.load('resources/3dmodels/goblin.fbx', (fbx)=>{
            fbx.scale.setScalar(0.04); //scale model down ot reasonavle size
            fbx.position.copy(this.position); //match position of model to obejct
            scene.add(fbx); //add to scene
            this.characterModel = fbx; //assign model attribute to fbx model


            //load idle animation
            this.fbxLoader.load('resources/animations/player-idle.fbx', (animObject)=>{
                const clip = animObject.animations[0]; //get clip
                const action = this.characterMixer.clipAction(clip, this.characterModel); //get action
                this.characterActions['idle'] = action; //add to actions array
                //this.activeAction = action; //active action is initially idle
                action.play(); //start playing idle animation
            });

            //load walk animation
            this.fbxLoader.load('resources/animations/player-walk.fbx', (animObject)=>{
                const clip = animObject.animations[0]; //get clip
                const action = this.characterMixer.clipAction(clip, this.characterModel); //get animation
                this.characterActions['walk'] = action; //add action to array
            });
        });

        //load sword model

        this.fbxLoader.load('resources/3dmodels/sword.fbx', (fbx)=>{
            fbx.scale.setScalar(2); //scale model down ot reasonavle size
            fbx.position.copy(this.position); //match position of model to obejct
            fbx.position.y += 2.5 //line handle up with hands;
            fbx.rotation.x += Math.PI / 4;
            scene.add(fbx); //add to scene
            this.swordModel = fbx; //assign model attribute to fbx model
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


    /////////////////UPDATE CALLED EVERY FRAME////////////////////////////


    Update(ground, deltaTime, _wallLeft, _wallRight, _wallBack){
        //quit method if object not fully loaded
        if (!this.ready || !this.characterModel){
            return;
        }
        //reset velocity 
        this.velocity.set(0, this.velocity.y, 0);

        //handling inputs
        if (this.move.forward){
            this.velocity.z -= this.speed; //move model in scene
            //change animation to walking
            this.updateAnimation('walk');
            //rotate player model
            this.characterModel.rotation.y = Math.PI;
            console.log(this.characterModel.rotation);
        }


        else if (this.move.backward){
            this.velocity.z += this.speed; //move model in scene
            //change animation to walking
            this.updateAnimation('walk');
            //rotate player model
            this.characterModel.rotation.y = 0;
        }

        else if (this.move.right){
            this.velocity.x += this.speed; //move model in scene
            //change animation to walking
            this.updateAnimation('walk');
            //rotate player model
            this.characterModel.rotation.y = Math.PI / 2;
        }

        else if (this.move.left){
            this.velocity.x -= this.speed; //move model in scene
            //change animation to walking
            this.updateAnimation('walk');
            //rotate player model
            this.characterModel.rotation.y = -Math.PI / 2;
        }
        else{
            //swap back to idle animation
            this.updateAnimation('idle');
        }               

        //apply movement
        this.position.x += this.velocity.x;
        this.position.z += this.velocity.z;

        //update character model positon to object position
        if (this.characterModel){
            this.characterModel.position.copy(this.position);
        }

        //update sword model positon to object position
        if (this.swordModel){
            this.swordModel.position.copy(this.position);
            this.swordModel.position.y += 3; //align handle with height of hands
            this.swordModel.rotation.copy(this.characterModel.rotation);
            this.swordModel.rotation.x += Math.PI / 4;
            //move offset of sword depending on player rotation
            const forwardOffset = 1.5; //match handle to position of hands
            const horizontalOffset = 1;
            //w pressed
            if (this.characterModel.rotation.y == Math.PI){
                this.swordModel.position.z -= forwardOffset;
                this.swordModel.position.x += horizontalOffset;
                //this.swordModel.rotation.x -= Math.PI / 4;
            }
            //s pressed
            else if (this.characterModel.rotation.y == 0){
                this.swordModel.position.z += forwardOffset;
                this.swordModel.position.x -= horizontalOffset;

                //this.swordModel.rotation.x += Math.PI / 4;
            }
            //a pressed
            else if (this.characterModel.rotation.y == -Math.PI / 2){
                this.swordModel.position.x -= forwardOffset;
                this.swordModel.position.z -= horizontalOffset;
                //this.swordModel.rotation.z += Math.PI / 4;
            }
            //d pressed
            else if (this.characterModel.rotation.y == Math.PI / 2){
                this.swordModel.position.x += forwardOffset;
                this.swordModel.position.z += horizontalOffset;
                //this.swordModel.rotation.z -= Math.PI / 4;
            }
        }

        this.applyGravity(ground);

        //update sides for collision
        this.updateSides();

        this.checkForWalls({wallLeft: _wallLeft, wallRight: _wallRight, wallBack: _wallBack});

        
        //update animation mixer
        if (this.characterMixer) this.characterMixer.update(deltaTime);
    }


}