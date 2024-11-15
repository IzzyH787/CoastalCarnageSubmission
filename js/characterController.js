import * as THREE from 'three'; //import three.js
import {FBXLoader} from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"; //import fbx loader

export class CharacterController{
    constructor(scene){
        this.Init(params); //initalise values
    }

    Init = (scene) => {
        this.scene = scene;
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

        //Animation stuffs
        this.fbxLoader = new FBXLoader();
        this.characterModel; //variable to store fbx mesh

        this.characterMixer = new THREE.AnimationMixer; //animation mixel for model
        this.characterActions = {}; //array of all animation actions
        
    }
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

    //load fbx model and animaitons
    loadModel=()=>{
        //load fbx
        this.fbxLoader.load('resources/3dmodels/zombie.fbx', (fbx)=>{
            fbx.scale.setScalar(0.04); //scale model down ot reasonavle size
            fbx.position.set(0, -3, 0); //make model level with floor
            this.scene.add(fbx); //add to scene
            this.characterModel = fbx; //assign model attribute to fbx model


            //load idle animation
            this.fbxLoader.load('resources/animations/zombie-idle.fbx', (animObject)=>{
                const clip = animObject.animations[0]; //get clip
                const action = this.characterMixer.clipAction(clip, this.characterModel); //get action
                this.characterActions['idle'] = action; //add to actions array
            });

            //load idle animation
            this.fbxLoader.load('resources/animations/zombie-run.fbx', (animObject)=>{
                const clip = animObject.animations[0]; //get clip
                const action = this.characterMixer.clipAction(clip, this.characterModel); //get animation
                this.characterActions['walk'] = action; //add action to array
            });
        });
    }


    Update(){

        //handling inputs
        if (this.move.forward){
            this.characterModel.position.z -= speed; //move model in scene
            //change animation to walking
            if (this.characterActions['walk']){
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation
            }
            //rotate player model
            this.characterModel.rotation.y = Math.PI;
            //move player cube
            player.position.z -= speed;
        }


        else if (this.move.backward){
            this.characterModel.position.z += speed; //move model in scene
            //change animation to walking
            if (this.characterActions['walk']){
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation 
            }
            //rotate player model
            this.characterModel.rotation.y = 0;
            //move player cube
            player.position.z += speed;
        }

        else if (this.move.right){
            this.characterModel.position.x += speed; //move model in scene
            //change animation to walking
            if (this.characterActions['walk']){
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation 
            }

            //rotate player model
            this.characterModel.rotation.y = Math.PI / 2;

            //move player cube
            player.position.x += speed;

        }



        else if (this.move.left){
            this.characterModel.position.x -= speed; //move model in scene
            //change animation to walking
            if (this.characterActions['walk']){
                this.characterActions['idle']?.stop(); //stop other animation
                this.characterActions['walk'].play(); //play idle animation 
            }
            //rotate player model
            this.characterModel.rotation.y = -Math.PI / 2;
            //move player cube
            player.position.x -= speed;
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