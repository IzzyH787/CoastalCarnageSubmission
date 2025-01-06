//imports
import * as THREE from 'three'; //import three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader



/////////////DECLARING VARIABLES//////////////////
const textureLoader = new THREE.TextureLoader();
export const trees = []; //create array to store trees


//////////////FUNCTIONS/////////////////
export const spawnTrees=(scene)=>{
    //add trees to scene in random places
    for (let i = 0; i < Math.random() * (20 - 10) + 10; i++){
        const xPos = Math.random() * (70 - -70) - 70; //pick random x position
        const zPos = Math.random() * (30 - -40) + (-40); //pick random z position
        trees.push(new Tree(scene, xPos, 0, zPos)); //add trees to array
    }
}

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