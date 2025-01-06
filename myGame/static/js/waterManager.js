////////////////IMPORTS///////////////////////////
import * as THREE from 'three'; //import three.js


//create water plane
// const waterTexture = new THREE.TextureLoader().load('resources/images/water.jpg'); //laod water texture from file

// //ensure texture repeats when offset
// waterTexture.wrapS = THREE.RepeatWrapping;
// waterTexture.wrapT = THREE.RepeatWrapping;

// waterTexture.repeat.set( 10, 10 ); //how many time texture repeats across plane

// const waterPlaneMaterialProperties = {map: waterTexture, side: THREE.DoubleSide, transparent: true}; //set properties for water material
// const waterMaterial = new THREE.MeshBasicMaterial(waterPlaneMaterialProperties) //create water material with set properties

// const waterWidth = 200; //width of water plane
// const waterLength = 100; //lenght of water plane
// const waterGeometry = new THREE.PlaneGeometry(waterWidth, waterWidth, 10, 10); //create water plane geometry
// const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial); //create mesh for water plane

// const waterVertexCount = waterGeometry.attributes.position.count;  //get number of vertices on plane
// waterPlane.position.set(0, -4.5, 50); //set position of plane
// waterPlane.rotation.x = ((2 *Math.PI) / 360) * 85; //rotate plane so below ground


// //export necessary variables
// export {waterPlane, waterGeometry, waterVertexCount, waterTexture};

//create water plane
const waterTexture = new THREE.TextureLoader().load('/resources/images/water.jpg'); //laod water texture from file
console.log(waterTexture);
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




const animatePlane = (geometry, count) => {
    //iterate through verties of water plane
    for (let i = 0; i < count; i++){
        const x = geometry.attributes.position.getX(i); //get x position of vertex
        const y = geometry.attributes.position.getY(i); //get x position of vertex

        const xsin = Math.sin (x + frames/120); //find sin value of vertice's x pos and frames/60
        const ycos = Math.cos(y + frames/120);
        
        geometry.attributes.position.setZ(i, xsin + ycos); //set z pos of vertex
    }
    geometry.computeVertexNormals(); //recalculate vertex normals so shadows look correct
    geometry.attributes.position.needsUpdate = true; //update position of vertices
    waterTexture.offset.y += 0.0005; //offset texture to give appearance of moving water
}

//export necessary variables
export {waterPlane, waterGeometry, waterVertexCount, waterTexture, animatePlane};