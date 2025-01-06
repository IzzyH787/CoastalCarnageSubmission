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
        //if account is logged in, show play or logout button
        if (data){
            document.getElementById("logout-btn").style = "display: block;";
            document.getElementById("play-btn").style = "display: block;";
            document.getElementById("login-btn").style = "display: none;";
            document.getElementById("register-btn").style = "display: none;";
        }
        //no account logged in, show login and register button
        else{
            document.getElementById("logout-btn").style = "display: none;";
            document.getElementById("play-btn").style = "display: none;";
            document.getElementById("login-btn").style = "display: block;";
            document.getElementById("register-btn").style = "display: block;";
        }
    } 
    catch (error) {
        console.error("Error fetching data:", error);
        

    }
})(); //() calls async function
