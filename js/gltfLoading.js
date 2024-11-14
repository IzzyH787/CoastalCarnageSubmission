////////////////WEEK 6//////////////////////////////
let chicken; //store gltf model
let mixer;
let chickenAnimations = []; //store chicken model's animations
let chickenState;
const clock = new THREE.Clock();
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
