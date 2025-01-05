(async () =>{
    try {
        console.log("fetching data");
        const response = await fetch('/check-login', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        
    });
        
        //checks no error when making fetch request, response.ok is true for staus value of 200-299
        if (!response.ok){
            throw new Error("Server didn't respond correctly");
        } 
        const data = await response.json(); //makes sure method is called properly
                       
        console.log("Received data", data); //output data received from server
        
        //status 0 = missing credentials
        //status 1 = user does not exist
        //status 2 = wrong password
        switch(data.status){
            case 0:
                document.getElementById("error-output") .innerHTML = "Missing credentials, try again!";
                break;
            case 1:
                document.getElementById("error-output") .innerHTML = `Username doesn't exist, <a href="/register">register</a> here`;
                break;
            case 2:
                document.getElementById("error-output") .innerHTML = "Wrong password, please try again";
                break;
            default:
                document.getElementById("error-output") .innerHTML = "";
                break;
        }

        
    } 
    catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("error-output").innerHTML = "Error retrieving data.";

    }
})(); //() calls async function