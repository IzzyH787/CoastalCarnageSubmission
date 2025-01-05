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
        if (data){
            document.getElementById("logout-btn").style = "display: block;";
        }
        else{
            document.getElementById("logout-btn").style = "display: none;";
        }
    } 
    catch (error) {
        console.error("Error fetching data:", error);
        

    }
})(); //() calls async function
