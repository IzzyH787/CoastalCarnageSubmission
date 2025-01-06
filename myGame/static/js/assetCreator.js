//imports
import * as THREE from 'three'; //import three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader



/////////////DECLARING VARIABLES//////////////////
const textureLoader = new THREE.TextureLoader();


//create plane funcion
export const addPlane=(x, y, w, h, material, scene)=>{
    //initialise plane
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 2), new THREE.MeshBasicMaterial(material));
    plane.position.x = x;
    plane.position.y = y;
    plane.rotation.x = -Math.PI/2; //make plane flat 
    scene.add(plane)
    return plane
}

//creates skybox
export const createSkybox=(scene)=>{
    let backgroundMesh; //variable for sphere mesh
    
    //load texture from file
    textureLoader.load('resources/images/cartoon-sky.jpg', function(texture){
        const sphere = new THREE.SphereGeometry(100, 60, 40); //sphere geometry for skydome
        const sphereMaterial = new THREE.MeshBasicMaterial({map:texture, side: THREE.DoubleSide}); //create material for skydome
        backgroundMesh = new THREE.Mesh(sphere, sphereMaterial); //create mesh for skydome
        scene.add(backgroundMesh);
    }); 
    
}

//create sphere of blue particles
export const createPointGeometry=(scene, x, y, z, size)=>{
    const pointGeometry = new THREE.SphereGeometry( size, 16, 8); //create sphere particles will appear on

    const newMaterial = new THREE.PointsMaterial({color:'blue', size:0.5}); //material for particles
    let pointObject = new THREE.Points(pointGeometry, newMaterial); //create point geometry
    pointObject.position.set(x, y, z); //set position of particle sphere
    scene.add(pointObject); //add to scene
    return pointObject;
}

//method to create bubble effect from lab
export const createManyObjects=(scene)=>{
    const geometry = new THREE.SphereGeometry(); //create sphere geometry
    //iterate 2000 times
    for (let count = 0; count < 2000; count++){
        const material2 = new THREE.MeshPhongMaterial({
            color: 0x2eabef
        }); //create default material
        const object = new THREE.Mesh(geometry, material2); //create sphere mesh with default material
        //randomise position in scene
        object.position.x = Math.random() * 50 - 25;
        object.position.y = Math.random() * 50 - 25;
        object.position.z = Math.random() * 50 - 25;
        //set scale of object
        object.scale.set(0.5, 0.5, 0.5);
        object.material.color.setHex(Math.random() * 0xffffff); //set material of object to random colour
        scene.add(object); //add object to scene

    }
}


///////////////////MAIN LOGIC////////////////


//create water plane
const waterTexture = new THREE.TextureLoader().load('resources/images/water.jpg'); //laod water texture from file

//ensure texture repeats when offset
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;

waterTexture.repeat.set( 10, 10 ); //how many time texture repeats across plane

const waterPlaneMaterialProperties = {map: waterTexture, side: THREE.DoubleSide, transparent: true}; //set properties for water material
const waterMaterial = new THREE.MeshBasicMaterial(waterPlaneMaterialProperties) //create water material with set properties

const waterWidth = 200; //width of water plane
const waterLength = 100; //lenght of water plane
const waterGeometry = new THREE.PlaneGeometry(waterWidth, waterWidth, 10, 10); //create water plane geometry
const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial); //create mesh for water plane

const waterVertexCount = waterGeometry.attributes.position.count;  //get number of vertices on plane
waterPlane.position.set(0, -4.5, 50); //set position of plane
waterPlane.rotation.x = ((2 *Math.PI) / 360) * 85; //rotate plane so below ground


//export necessary variables
export {waterPlane, waterGeometry, waterVertexCount, waterTexture};