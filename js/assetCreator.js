//imports
import * as THREE from 'three'; //import three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader



/////////////DECLARING VARIABLES//////////////////
const textureLoader = new THREE.TextureLoader();



//////////////FUNCTIONS/////////////////

export const createTree=(scene, x, y, z)=>{
    //create trunk
    const trunkTexture = textureLoader.load('resources/textures/trunkTexture.jpg'); //load texture from external file
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry( 2, 2, 5, 32 ), new THREE.MeshBasicMaterial({map: trunkTexture, })); //create trunk mesh
    //create leaves
    const greenMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00, emissive: 0x55dd33, specular: 0x61c975, shininess: 81 } ); //create green material 
    const baseLeaves = new THREE.Mesh(new THREE.ConeGeometry( 5, 10, 32 ), greenMaterial);
    const topLeaves = new THREE.Mesh(new THREE.ConeGeometry( 4.5, 8, 32 ), greenMaterial);
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
}


export const addPlane=(x, y, w, h, material, scene)=>{
    //initialise plane
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 2), new THREE.MeshBasicMaterial(material));
    plane.position.x = x;
    plane.position.y = y;
    plane.rotation.x = -Math.PI/2;
    scene.add(plane)
}

export const createSkybox=(scene)=>{
    let backgroundMesh; //variable for sphere mesh
    
    //load texture from file
    textureLoader.load('resources/images/cartoon-sky.jpg', function(texture){
        const sphere = new THREE.SphereGeometry(100, 60, 40); //sphere geometry for skydome
        const sphereMaterial = new THREE.MeshBasicMaterial({map:texture, side: THREE.DoubleSide});
        backgroundMesh = new THREE.Mesh(sphere, sphereMaterial);
        scene.add(backgroundMesh);
    }); 
    
}

export const createManyObjects=(scene)=>{
    const geometry = new THREE.SphereGeometry();
    for (let count = 0; count < 2000; count++){
        const material2 = new THREE.MeshPhongMaterial({
            color: 0x2eabef
        });
        const object = new THREE.Mesh(geometry, material2);
        object.position.x = Math.random() * 50 - 25;
        object.position.y = Math.random() * 50 - 25;
        object.position.z = Math.random() * 50 - 25;
        object.scale.set(0.5, 0.5, 0.5);
        object.material.color.setHex(Math.random() * 0xffffff);
        scene.add(object);

    }
}


export const createPointGeometry=(scene)=>{
    const pointGeometry = new THREE.SphereGeometry( 15, 32, 16);

    const newMaterial = new THREE.PointsMaterial({color:'red', size:0.5});
    let pointObject = new THREE.Points(pointGeometry, newMaterial);
    scene.add(pointObject);
    let mesh2 = pointObject.clone();
    scene.add(mesh2);
}




///////////////////MAIN LOGIC////////////////

const waterTexture = new THREE.TextureLoader().load('resources/images/water.jpg');
const waterPlaneMaterialProperties = {map: waterTexture, side: THREE.DoubleSide, transparent: true};
const waterMaterial = new THREE.MeshBasicMaterial(waterPlaneMaterialProperties)
//waterMaterial.wrapS = THREE.RepeatWrapping;
//waterMaterial.wrapT = THREE.RepeatWrapping;

const waterWidth = 100;
const waterLength = 100;
const waterGeometry = new THREE.PlaneGeometry(waterWidth, waterWidth, 10, 10);
const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);

const waterVertexCount = waterGeometry.attributes.position.count;
waterPlane.position.set(0, -4.5, 50);
waterPlane.rotation.x = Math.PI / 2;





export {waterPlane, waterGeometry, waterVertexCount};