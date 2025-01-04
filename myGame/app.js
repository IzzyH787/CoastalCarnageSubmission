

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


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "game-database"
});

con.connect((err)=> {
  if (err) throw err;
  console.log("Connected!");
  //outputs table
  // con.query("SELECT * FROM user", function (err, result, fields) {
  //   if (err) throw err;
  //   console.log(result);
  // });
});

//serve static files, includes other files
app.use(express.static(path.join(__dirname, 'static')));
//app.use(express.static(path.join(__dirname, 'js')));

//for parsing form data
app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(express.json());
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false, //wont resave sesson variable if nothing is changed
//   saveUninitialized: false
// }));


app.post('/auth', jsonParser, (req, res)=>{
  let name = req.body.name; //get name data from body
  console.log("Authorising...")
  console.log("Input username = " + name);
  //construct json message
  let nameJson = {error:false, data:name}; //two parameters in object to take server messages back

  //if it coorcet username, return correct json messafe
  if (name == "123"){
    console.log("Correct user 123");
    return res.json(nameJson); //directly return username
  }
  //if it is wrond username, return error
  else{
    //let value = req.body.name; //get received json string
    nameJson = {error:true, data:"Wrong user name"};
    //res.send(nameJson); //echo result back
    return res.json(nameJson); //return error json object
  }
});

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

})

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

//configuring register post functionality
app.post("/register", async (req, res) =>{
  try {
    //trim() removes all whitespace from value, checks that actual values have been inputted
    
    if (req.body.username.trim().length == 0 || req.body.password.trim().length == 0 ){
      console.log("Missing credentials, try again");
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
          res.redirect("/register"); //reload register page
          //alertJson = {error:true, data:"User already exists"}
          /////////////////NOTIFY USER THAT USERNAME IS TAKEN////////////////
        
          //res.send(alertJson); //echo result back
          //if user with that name already exists, deny registration, prompt login
        }
        //username doesnt exist so add details to database
        else{          
          //const hashedPassword = await bcrypt.hash(req.body.password, 10); //take inputted password hashes it and makes sure it is completed hashing before continuing
          //console.log(hashedPassword);
          //add details to database
          con.query("INSERT INTO user (username, password) VALUES (?, ?)",
          //////////////////ENCRYPT LATER///////////////////
          [req.body.username.toString(), req.body.password],
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
          //send alert message to client side
          alertJson = {error:false, data:"New account created successfully"};
          //res.send(alertJson);
          //redirect to login page
          res.redirect("/login"); //redirect user to login page
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
            (err, result, fields)=> {
              //console.log(result[0].password); //get password from table
              //check if inputted password matches database password
              
              if (result[0].password == req.body.password){
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
                return res.status(500).json({error: "Something went wrong"}); //handle errors
                
              }
              


              
            });
        
          
        }
        //username doesnt exist so add details to database
        else{ 
          console.log("User does not exist");
          ///////////PROMPT TO REGISTER, TELL USER DOESN'T EXIST//////////////
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