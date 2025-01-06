import * as THREE from 'three'; //import three.js

///////////CREATING LOADING SCREEN///////////

//create loading manager 
 export const loadingManager = new THREE.LoadingManager();
//get progress bar elemENt from index.html
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.querySelector('.progress-bar-container');
//called for each item loaded by loader
loadingManager.onProgress=(url, loaded, total)=>{
    console.log('Started loading: ' + url);
    progressBar.value = (loaded / total) * 100;
}

//called after all files are loaded
loadingManager.onLoad=()=>{
    progressBarContainer.style.display = 'none';
}