//client sude
const postUser=()=>{
    console.log("post user");
    //encode data
    let username = document.getElementById("username").value;
    let formData = {name: username};
  
    let postData = JSON.stringify(formData);
    console.log(formData);
    //send data using xhr
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "auth", true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(postData);
    //decode response
    xhr.onload = () => {
        let result = xhr.response;
        console.log("Get response from express:" + result); //receive text
        let resultObj = JSON.parse(result);
        if (resultObj.error){
        //update UI
        alert("Wrong username or password, try again!");
        }
        else{
        
        alert("Welcome!");
        window.location.href = "/game"; //redirect to game page
        
        }
    }
    }
  
    //add button click event to UI

    const form = document.querySelector("#submit-btn");
    form.addEventListener('click', postUser);