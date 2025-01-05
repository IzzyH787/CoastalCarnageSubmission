//imports
import * as THREE from 'three'; //import three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader



/////////////DECLARING VARIABLES//////////////////
const textureLoader = new THREE.TextureLoader();



//////////////FUNCTIONS/////////////////

export class Tree{
    constructor(scene, x, y, z){
        //create trunk
        const trunkTexture = textureLoader.load('resources/textures/trunkTexture.jpg'); //load texture from external file
        const trunkRadius = Math.random() * (2 - 1) + 1;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkRadius, trunkRadius, 5, 32 ), new THREE.MeshBasicMaterial({map: trunkTexture, })); //create trunk mesh
        //create leaves
        const greenMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00, emissive: 0x55dd33, specular: 0x61c975, shininess: 81 } ); //create green material 
        this.radius = Math.random() * (5 - 3) + 3;
        const baseLeaves = new THREE.Mesh(new THREE.ConeGeometry( this.radius, 10, 32 ), greenMaterial);
        const topLeaves = new THREE.Mesh(new THREE.ConeGeometry( this.radius- 0.5, 8, 32 ), greenMaterial);
        //make leaves relevant to trunk
        baseLeaves.position.y = trunk.position.y + 5;
        topLeaves.position.y = trunk.position.y + 8;
        //set meshes to case shadow
        trunk.castShadow = true;
        baseLeaves.castShadow = true;
        topLeaves.castShadow = true;
        //group meshes together
        let treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(baseLeaves);
        treeGroup.add(topLeaves);
        //set position of tree
        treeGroup.position.set(x, y, z);
        //add tree to scene
        scene.add(treeGroup);
        this.Init(x, y, z);
    }
       
    Init=(x, y, z)=>{
        this.position = new THREE.Vector3(x, y, z);
        //this.radius = leafRadius;
        //define sides of model for collison
        //this.bottomPosition = this.position.y - this.height / 2;
        //this.topPosition = this.position.y + this.height / 2;
        this.leftPosition = this.position.x - this.radius / 2;
        this.rightPosition = this.position.x + this.radius / 2;
        this.frontPosition = this.position.z + this.radius / 2;
        this.backPosition = this.position.z - this.radius / 2;
        this.topPosition = this.position.y;
        this.bottomPosition = this.position.y;
    }
    //check if 2 boxes overlap
    hasBoxCollision=({box1, box2})=>{
        const xCollision = ( (box1.rightPosition >= box2.leftPosition) && (box1.leftPosition <= box2.rightPosition) );
        //frame ahead for y collision, gravity
        const yCollision = ( (box1.bottomPosition + box1.velocity.y <= box2.topPosition) && (box1.topPosition >= box2.bottomPosition) );
        const zCollision = ( (box1.frontPosition >= box2.backPosition) && (box1.backPosition <= box2.frontPosition) );
        
        return (xCollision && yCollision && zCollision);
    }
    Update=()=>{

    }
}

export const addPlane=(x, y, w, h, material, scene)=>{
    //initialise plane
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 2), new THREE.MeshBasicMaterial(material));
    plane.position.x = x;
    plane.position.y = y;
    plane.rotation.x = -Math.PI/2; //make plane flat 
    scene.add(plane)
    return plane
}

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


export const createPointGeometry=(scene, x, y, z, size)=>{
    const pointGeometry = new THREE.SphereGeometry( size, 16, 8); //create sphere particles will appear on

    const newMaterial = new THREE.PointsMaterial({color:'blue', size:0.5}); //material for particles
    let pointObject = new THREE.Points(pointGeometry, newMaterial); //create point geometry
    pointObject.position.set(x, y, z); //set position of particle sphere
    scene.add(pointObject); //add to scene
    return pointObject;
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