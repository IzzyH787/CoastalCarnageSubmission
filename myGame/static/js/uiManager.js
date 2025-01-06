export let healthText = "Health: ";
export let timerText = "Time alove: ";
export let dataText = "";

//get set methods

export const setHealthText=(value)=>{
    healthText = value;
    document.getElementById("health-display").innerHTML = healthText;
}

export const setTimeText=(value)=>{
    timerText = value;
}

export const setDataText=(value)=>{
    dataText = value;
}