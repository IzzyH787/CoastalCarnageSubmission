import * as THREE from 'three'; //import three.js
//import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FBXLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/FBXLoader.js"; //add gltf loader


console.log("ANIM FILE RUNNING");

class BasicCharaterController{
    constructor(){
        this._input = new BasicCharaterControllerInput(); //CONTROLLER AHS INSTANCE OF INPUT
        this._stateMachine = new FiniteStateMachine(new BasicCharaterControllerProxy(this)); //controller has instance of finite state machine


        this.LoadModels();
    }

    LoadModels() {
        const loader = new FBXLoader();
        loader.setPath('./resources/');
        loader.load('3dmodels/player.fbx', (fbx) => {
            fbx.scale.setScalar(0.1);
            fbx.traverse(c => {c.castShadow = true;});

            this._target = fbx;
            this._params.scene.add(this._target);

            this._mixer = new THREE.AnimationMixer(this._target);

            this._manager = new THREE.LoadingManager();
            this._manager.onLoad = () => {
                this._fsm.SetState('idle');
            };
        })

    }
};

class BasicCharaterControllerInput{
    constructor(){

    }
};

class FiniteStateMachine{
    constructor(){

    }
}