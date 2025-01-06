////////////////IMPORTS///////////////////////////
import * as THREE from 'three'; //import three.js

//setting up renderer
export const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); //create renderer

renderer.setSize( window.innerWidth, window.innerHeight ); //set size of renderer to window' size
renderer.shadowMap.enabled = true; //allows objects to cast shadows

//get DOM element by ID or canvas rendering
export const canvas = document.querySelector('#scene-container');
canvas.appendChild(renderer.domElement);