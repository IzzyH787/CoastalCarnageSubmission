import * as THREE from 'three'; //import three.js


export const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //create scene camera
//setting up camera
camera.position.set(0, 25, 25);
camera.rotation.set(-Math.PI /4, 0, 0);

//create orbit controls
let controls;
const createOrbitControls=()=>{
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
}

export const updateCamera=(player)=>{
    //initial position 0, 3, 20
    camera.position.set(0 + player.position.x, camera.position.y, 20 + player.position.z); //offset camera so doesn't spawn in model
}