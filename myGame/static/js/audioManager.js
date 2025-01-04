//importing sounds from external files
const deathSound = new Audio("/resources/audio/death-sound.mp3");

export const playDeathSound=()=>{
    deathSound.play(); //play sound effect
}