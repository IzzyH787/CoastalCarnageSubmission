//imports
import * as THREE from 'three'; //import three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js"; //add gltf loader



/////////////DECLARING VARIABLES//////////////////
const textureLoader = new THREE.TextureLoader();



//////////////FUNCTIONS/////////////////

export const createTree=(scene, x, y, z)=>{
    //create trunk
    const trunkTexture = textureLoader.load('resources/textures/trunkTexture.jpg'); //load texture from external file
    const trunkRadius = Math.random() * (2 - 1) + 1;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkRadius, trunkRadius, 5, 32 ), new THREE.MeshBasicMaterial({map: trunkTexture, })); //create trunk mesh
    //create leaves
    const greenMaterial = new THREE.MeshPhongMaterial( { color: 0x00ff00, emissive: 0x55dd33, specular: 0x61c975, shininess: 81 } ); //create green material 
    const leafRadius = Math.random() * (5 - 3) + 3;
    const baseLeaves = new THREE.Mesh(new THREE.ConeGeometry( leafRadius, 10, 32 ), greenMaterial);
    const topLeaves = new THREE.Mesh(new THREE.ConeGeometry( leafRadius- 0.5, 8, 32 ), greenMaterial);
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
    return plane
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


export const createPointGeometry=(scene, x, y, z, size)=>{
    const pointGeometry = new THREE.SphereGeometry( size, 16, 8);

    const newMaterial = new THREE.PointsMaterial({color:'blue', size:0.5});
    let pointObject = new THREE.Points(pointGeometry, newMaterial);
    pointObject.position.set(x, y, z);
    scene.add(pointObject);
    return pointObject;
}




///////////////////MAIN LOGIC////////////////


//create water plane
const waterTexture = new THREE.TextureLoader().load('resources/images/water.jpg');

waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.repeat.set( 10, 10 );

const waterPlaneMaterialProperties = {map: waterTexture, side: THREE.DoubleSide, transparent: true};
const waterMaterial = new THREE.MeshBasicMaterial(waterPlaneMaterialProperties)

const waterWidth = 200;
const waterLength = 100;
const waterGeometry = new THREE.PlaneGeometry(waterWidth, waterWidth, 10, 10);
const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);

const waterVertexCount = waterGeometry.attributes.position.count;
waterPlane.position.set(0, -4.5, 50);
waterPlane.rotation.x = ((2 *Math.PI) / 360) * 85;





export {waterPlane, waterGeometry, waterVertexCount, waterTexture};