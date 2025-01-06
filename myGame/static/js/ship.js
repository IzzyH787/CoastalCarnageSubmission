//imports
import * as THREE from 'three'; //import three.js

//declaring variables
export const ships = [];

//defining class
export class Ship{
    constructor(scene, x, y,z){
        //radiusTop : 4.2, radiusBottom : 5, height : 10, radialSegments : 6, heightSegments : 1, openEnded : false, thetaStart : 0, thetaLength : 3); 
        const baseGeometry = new THREE.CylinderGeometry(4.2, 5, 10, 6, 1, false, 0, 3);
        const baseMaterial = new THREE.MeshBasicMaterial({color:0x945028});
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.z = -Math.PI / 2;
        scene.add(base);
    }
    Init(){

    }
    Update(){

    }
}