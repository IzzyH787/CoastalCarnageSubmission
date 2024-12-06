////////////////WEEK 6//////////////////////////////
let chicken; //store gltf model
let mixer;
let chickenAnimations = []; //store chicken model's animations
let chickenState;
const clock = new THREE.Clock();


//GLTF


const addModel=(fileName, scale, model, animationsArray)=>{
    const gltfloader  = new GLTFLoader(loadingManager).setPath("resources/3dmodels/");
    // Load a glTF resource
    gltfloader.load(
        fileName,  // called when the resource is loaded
    
        (gltf) => {
            model = gltf.scene;
            model.scale.set(scale, scale, scale);
            scene.add(model); //add GLTF to the scene

            /////////////////WEEK 6////////////////
            //play animation
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                //mixer.clipAction(clip).play();
                animationsArray.push(mixer.clipAction(clip));
                //console.log(clip);
        });
            //////////////////////////////////////
    
        },
        // called when loading is in progresses
    
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    
        },
        // called when loading has errors
    
        (error) => {
            console.log('An error happened' + error);
        }
    );
    //model.position.set(0,4,0);

}



addModel('chicken.gltf', 0.5, chicken, chickenAnimations);

const displayPeck=()=>{
    console.log("Animation 0");
    //chickenState = 0;
    playAction(0);
    //chickenMixer.clipAction(chickenAnimations[0]).play;
}
const displayWalk=()=>{
    console.log("Animation 1");
    //chickenState = 1;
    playAction(1);
}
const displayTwerk=()=>{
    console.log("Animation 2");
    //chickenState = 2;
    playAction(2);
}


document.getElementById("action1").addEventListener("click", displayPeck);
document.getElementById("action2").addEventListener("click", displayWalk);
document.getElementById("action3").addEventListener("click", displayTwerk);

const playAction=(index)=>{
    const action = chickenAnimations[index];
    console.log('play action');
    if (mixer != null){
        console.log('mixer exists');
        mixer.stopAllAction();

        action.reset();
        action.fadeIn(0.5);
        action.play();
    }
}
