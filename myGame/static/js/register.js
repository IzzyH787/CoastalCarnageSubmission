(async () =>{
    try {
        console.log("fetching data");
        const response = await fetch('/check-register', {
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
        //status 1 = user already not exist
        //status 2 = username or password contains space
        //status 3 = weak password
        switch(data.status){
            case 0:
                document.getElementById("error-output") .innerHTML = "Missing credentials, try again!";
                break;
            case 1:
                document.getElementById("error-output") .innerHTML = `Username already exists, <a href="/login">login</a> here`;
                break;
            case 2:
                document.getElementById("error-output") .innerHTML = "Username or passwords can't conatin spaces, try again";
                break
            case 3:
                document.getElementById("error-output") .innerHTML = 'Password must contain<ul><li>At least 8 characters</li><li>At least one capital letter</li><li>At least one number</li><li>At least one symbol (e.g. !?.,&_ )</li></ul>';
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