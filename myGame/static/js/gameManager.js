////////////////IMPORTS///////////////////////////
import * as THREE from 'three'; //import three.js


///////////////DECLARING VARIABLES///////////////
export let isPaused = false;
export let frames = 0; //stores amount of frames that have passed

//initialise timers
export const clock = new THREE.Clock();
export const startTime = Date.now();


//////////////////GET SET METHODS///////////////////
export const setIsPaused=(value)=>{
    isPaused = value;
}
export const setFrames=(value)=>{
    frames = value;
}