

//importing libraries
const express = require('express');
const app = express();
const bcrypt = require("bcrypt"); //import bcrypt package
const flash = require("express-flash");
//const session = require("express-session");
const util = require("util");



const port = 3000;
const path = require('path');

var mysql = require('mysql');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

let confirmedID;
let confirmedUsername;
let confirmedHighscore;
let confirmedGamesPlayed;
let dataJson;
let prevLoginStatus = 99;
let prevRegisterStatus = 99;


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "game-database"
});

con.connect((err)=> {
  if (err) throw err;
  console.log("Connected!");
});

//serve static files, includes other files
app.use(express.static(path.join(__dirname, 'static')));
//app.use(express.static(path.join(__dirname, 'js')));

//for parsing form data
app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(express.json());


app.post("/get-details", jsonParser, (req, res)=>{
  try{

    (async () => {
      try {
        const query = util.promisify(con.query).bind(con); //make con.query a promie-based funciton, allows use of await to wait until query complete
        //run async function to run asychronous code immediately
        const result = await query("SELECT * FROM user WHERE username = ?", [confirmedUsername]); //await makes rest of code wait until query finishes

        //confirmedID = result[0].id;
        confirmedUsername = result[0].username;
        confirmedHighscore = result[0].highscore; 
        confirmedGamesPlayed = result[0].games_played; 

        console.log("Read from data base your ID is ", confirmedID, "your highscore is ", confirmedHighscore, "and you have played", confirmedGamesPlayed);

        //make json object of player's username, highscore and games played from database
        dataJson = { 
          username: confirmedUsername, 
          highscore: confirmedHighscore, 
          gamesPlayed: confirmedGamesPlayed,
        }; 

        console.log(dataJson); 
        if(!dataJson){
          console.log("Json not defined yet");
          return res.status(500).json({ error: "No data to get !" }); // handles errors
        }
        return res.json(dataJson); //if there is data stored in adtaJson return it
        
      } 
      catch (error) {
        console.log(error);
      }
    })(); //() calls async method
    
  }
  catch{
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" }); // handles errors
  }

});

app.post("/send-details", jsonParser, (req, res)=>{
  try {
    console.log("updating database");
    con.query("UPDATE user SET highscore = ?, games_played = ? WHERE username = ?",
      [req.body.highscore, req.body.gamesPlayed, req.body.username],
      async (err, result, fields)=> { //using async means you can use await later
      if (err) throw err;
      console.log(result); //result returns array of any matching fields
  });
  } 
  catch (error) {
    console.log(error);
  }
});

app.post("/check-login", jsonParser, (req, res)=>{
  try {
    console.log("checking previous login attempt");
    return res.json({status: prevLoginStatus});
  }
  catch (error) {
    console.log(error);
  }
});

app.post("/check-register", jsonParser, (req, res)=>{
  try {
    console.log("checking previous login attempt");
    return res.json({status: prevRegisterStatus});
  }
  catch (error) {
    console.log(error);
  }
});

app.post("/log-out", jsonParser, (req, res)=>{
  try {
    console.log("logged out");
    confirmedID = null;
    confirmedUsername = null;
    confirmedHighscore = null;
    confirmedGamesPlayed = null;
    dataJson = null;
    
  }
  catch (error) {
    console.log(error);
  }
});

app.get('/log-out', (req, res) => {
  try {
    console.log("logged out");
    confirmedID = null;
    confirmedUsername = null;
    confirmedHighscore = null;
    confirmedGamesPlayed = null;
    dataJson = null;
    res.sendFile(__dirname + '/index.html');
    
  }
  catch (error) {
    console.log(error);
  }
  
});

//configuring register post functionality
app.post("/register", async (req, res) =>{
  try {
    //trim() removes all whitespace from value, checks that actual values have been inputted
    
    if (req.body.username.trim().length == 0 || req.body.password.trim().length == 0 ){
      prevRegisterStatus = 0;
      console.log("Missing credentials, try again");
      res.redirect("/register"); //reload register page
    }
    ///////////////////ADD VALIDATION WHEN CREATING PASSWORDS///////////
    else{
      //check if username already exists in user table
      con.query("SELECT username FROM user WHERE username = ?",
        [req.body.username],
        async (err, result, fields)=> { //using async means you can use await later
        if (err) throw err;
        console.log(result); //result returns array of any matching fields

        //check if result array has any entries
        if (result.length > 0){
          console.log("found user");
          prevRegisterStatus = 1; //siplay error mess
          res.redirect("/register"); //reload register page
          
        }

        //username doesnt exist so add details to database
        else{
          //check username or password does not contain spaces, if lengths dont match must contain spaces
          console.log(req.body.username.trim().length, req.body.username.length);
          // \s matches any whitespace character, including spaces, tabs, and newlines
          if (/\s/.test(req.body.username) || /\s/.test(req.body.password)){
            prevRegisterStatus = 2;
            console.log("Username or password can't contain spaces");
            res.redirect("/register"); //reload register page
          }
          else{
            //check password is secure enough, longer than 8 characters, contains symbol and number
            containsNumber = /\d/.test(req.body.password);
            containsCapital = /[A-Z]/.test(req.body.password);
            containsSymbol = /[!"£$%^&*()-_+=|,<>./?;:'@#~]/.test(req.body.password);
            console.log(containsNumber, containsCapital, containsSymbol);
            if (containsNumber && containsCapital && containsSymbol){
              const hashedPassword = await bcrypt.hash(req.body.password, 10); //take inputted password hashes it and makes sure it is completed hashing before continuing
              console.log(hashedPassword);
              //add details to database
              con.query("INSERT INTO user (username, password) VALUES (?, ?)",
                //////////////////add eusername and encrypted password to database///////////////////
                [req.body.username.toString(), hashedPassword],
                (err, result, fields)=>{
                  //debugging
                  if(err) throw err;
                  console.log(result);
                });
      
                //output table to check user has been added
                con.query("SELECT * FROM user", function (err, result, fields) {
                  if (err) throw err;
                  console.log(result);
                });
                
                //redirect to login page
                res.redirect("/login"); //redirect user to login page
            }
            //password is too weak
            else{
              prevRegisterStatus = 3;
              console.log("Password too weak");
              res.redirect("/register"); //reload register page
            }
            
          }
          
        }
      });
    }    
  } 
  catch (error) {
    console.log(error);; //output error found
    res.redirect("/register"); //redirect to register page if any error
  }
})

//configuring register post functionality
app.post("/login", async (req, res) =>{
  try {
    //trim() removes all whitespace from value, checks that actual values have been inputted
    console.log(req.body.username, req.body.password);
    if (req.body.username.trim().length == 0 || req.body.password.trim().length == 0 ){
      console.log("Missing credentials, try again");
      prevLoginStatus = 0;
      res.redirect("/login"); //redirect to register page if any error

    }
    //if a valid usernmae and passowrd value has been enterred
    else{
      //check if username already exists in user table
      con.query("SELECT username FROM user WHERE username = ?",
        [req.body.username],
        async (err, result, fields)=> { //using async means you can use await later
        if (err) throw err;
        console.log(result); //result returns array of any matching fields

        //check if result array has any entries
        if (result.length > 0){
          console.log("Account exists");
          //select password from database that corresponds with inputted username
          con.query("SELECT password FROM user WHERE username = ?", 
            [req.body.username],
            async (err, result, fields)=> {
              //check if inputted password matches database password
              //match = await bcrypt.compare(req.body.password, result[0].password); //check against stored hash value
              if (await bcrypt.compare(req.body.password, result[0].password)){
                console.log("Welcome to the game " + req.body.username);

                

                /////////////SEND DATA TO BE LOADED BY GAME//////////////
                

                const query = util.promisify(con.query).bind(con); //make con.query a promie-based funciton, allows use of await to wait until query complete
                //run async function to run asychronous code immediately
                (async () => {
                  try {
                    const result = await query("SELECT * FROM user WHERE username = ?", [req.body.username]); //await makes rest of code wait until query finishes

                    confirmedID = result[0].id;
                    confirmedUsername = result[0].username;
                    confirmedHighscore = result[0].highscore; 
                    confirmedGamesPlayed = result[0].games_played; 

                    console.log("Read from data base your ID is ", confirmedID, "your highscore is ", confirmedHighscore, "and you have played", confirmedGamesPlayed);

                    //make json object of player's username, highscore and games played from database
                    dataJson = { 
                      username: req.body.username, 
                      highscore: result[0].highscore, 
                      gamesPlayed: result[0].games_played,
                    }; 
          
                    console.log(dataJson); 
                    //res.json({message: "login successful", dataJson});
                  } 
                  catch (error) {
                    console.log(error);
                  }
                })(); //() calls async method
                //load game
                res.redirect("/game"); //redirect to game page if successful login                      
              }
              //wrong password inputted
              else{
                console.log("Wrong password, try again...");
                //reset login page and display issue
                prevLoginStatus = 2;
                res.redirect("/login"); //redirect to game page if successful login
                //return res.status(500).json({error: "Something went wrong"}); //handle errors             
              }         
            });
        
          
        }
        //username doesnt exist so add details to database
        else{ 
          
          console.log("User does not exist");
          ///////////PROMPT TO REGISTER, TELL USER DOESN'T EXIST//////////////
          prevLoginStatus = 1;
          res.redirect("/login"); //redirect to game page if successful login
        }
      });
    }
  }
  catch (error) {
    console.log(error);; //output error found
    //res.redirect("/login"); //redirect to login page if any error
  }
});








//routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
  });
  app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
  });
  app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/game.html');
  });
  app.get('/login-failed', (req, res) => {
    res.sendFile(__dirname + '/login-failed.html');
  });
  app.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/login.html');
  });


  app.get('*', (req, res) => {
    //_dirname
    //console.log(__dirname);
    res.status(404).sendFile(__dirname + '/error404.html');
  });
//end of routes





app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


// //decode json in route 
// app.post('api/users', jsonParser, (req, res)=>{
//   //create user
// });