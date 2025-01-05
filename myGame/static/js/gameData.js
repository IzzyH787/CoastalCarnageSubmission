let username;
let highscore;
let gamesPlayed;

//called on game loading
export const readData=()=>{
    (async () =>{
        try {
            console.log("fetching data");
            const response = await fetch('/get-details', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            
        });
            
            //checks no error when making fetch request, response.ok is true for staus value of 200-299
            if (!response.ok){
                throw new Error("Server didn't respond correctly");
            } 
            const data = await response.json(); //makes sure method is called properly
                           
            console.log("Received data", data); //output data received from server
            //display data on page
            username = data.username;
            highscore = data.highscore;
            gamesPlayed = data.gamesPlayed;
            document.getElementById("title") .innerHTML = `Welcome ${data.username}!`;
            document.getElementById("details-display").innerHTML = `Highscore ${data.highscore}, Games played: ${data.gamesPlayed}`;
        } 
        catch (error) {
            console.error("Error fetching data:", error);
            document.getElementById("details-display").innerHTML = "Error retrieving data.";
    
        }
    })(); //() calls async function
}

readData(); //initially read data when page is opened

export const saveData=(timeSurvived)=>{
    if (timeSurvived > highscore){
        highscore = timeSurvived;
    }
    gamesPlayed++;

    (async () =>{
        try {
            console.log("sending data");
            const response = await fetch('/send-details', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'username': username,
                    'highscore': highscore,
                    'gamesPlayed': gamesPlayed,
                }),
             });
            
        } 
        catch (error) {
            console.error("Error sending data:", error);
    
        }
    })(); //() calls async function

}