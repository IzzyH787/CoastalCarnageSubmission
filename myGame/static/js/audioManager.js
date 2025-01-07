//importing sounds from external files
const deathSound = new Audio("/resources/audio/death-sound.mp3");
const shootSound = new Audio("/resources/audio/shoot-sound.mp3");

export const playDeathSound=()=>{
    deathSound.play(); //play sound effect
}

export const playShootSound=()=>{
    shootSound.play();
}