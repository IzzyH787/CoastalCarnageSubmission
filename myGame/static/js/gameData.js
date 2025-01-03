//called on game loading
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
        
        document.getElementById("details-display").innerHTML = `Username: ${data.username}, Highscore ${data.highscore}, Games played: ${data.gamesPlayed}`;
    
    } 
    catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("details-display").innerHTML = "Error retrieving data.";

    }
})(); //() calls async function