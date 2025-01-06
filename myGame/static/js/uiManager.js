export let healthText = "Health: ";
export let timerText = "Time alive: ";
export let dataText = "";
export let survivedText = "";

//get set methods

export const setHealthText=(value)=>{
    healthText = value;
    document.getElementById("health-display").innerHTML = healthText;
}

export const setTimeText=(value)=>{
    timerText = value;
    document.getElementById("timer-display").innerHTML = timerText;
}

export const setDataText=(value)=>{
    dataText = value;
    document.getElementById("details-display").innerHTML = dataText;
}

export const setSurvivalText=(value)=>{
    survivedText = value;
    document.getElementById("time-survived").innerHTML = survivedText;
}