if (process.env.NODE_ENV != "production"){
  require("dotenv").config();
}


//importing libraries
const express = require('express');
const app = express();
const bcrypt = require("bcrypt"); //import bcrypt package
//const initialisePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");

// initialisePassport(
//   passport,
//   username => users.find(user => user.username === username )

// )


const port = 3000;
const path = require('path');

var mysql = require('mysql');

const bodyParser = require('body-parser');
//const passport = require('passport');
const jsonParser = bodyParser.json();


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
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, //wont resave sesson variable if nothing is changed
  saveUninitialized: false
}));
//app.use(passport.init());
//app.use(passport.session());


// app.post('/login', (req, res) => {
//   if (req != null){
//     //get parameter from the form
//     console.log("Logging in");
//     console.log("Username: "+ req.body.username);
//     console.log("Password: "+ req.body.password);
//     const username = req.body.username;
//     const password = req.body.password;

//     //compare with form in data storage
//     if (username == "John"){
//       console.log("Correct user John");
//       res.redirect('/game');
//     }
//     //redirect page according to result
//     else{
//       //change this to correct file name for login fail
//       res.redirect('/login-failed')
//     }
    
//   }
//   else{
//     console.log("Request is null");
//     //change this to correct file name for login fail
//     res.sendFile(__dirname + '/login-failed');
//   }
// })


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

//configuring register post functionality
// app.post("/login", passport.authenticate("local", {
//   successRedirect: "/game",
//   failureRedirect: "/login",
//   failureFlash: true
// }));



//configuring register post functionality
app.post("/register", async (req, res) =>{
  try {
    //trim() removes all whitespace from value, checks that actual values have been inputted
    
    if (req.body.username.trim().length == 0 || req.body.password.trim().length == 0 ){
      console.log("Missing credentials, try again");
    }
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
          alertJson = {error:true, data:"User already exists"}
        
          //res.send(alertJson); //echo result back
          //if user with that name already exists, deny registration, prompt login
        }
        //username doesnt exist so add details to database
        else{          
          //const hashedPassword = await bcrypt.hash(req.body.password, 10); //take inputted password hashes it and makes sure it is completed hashing before continuing
          //console.log(hashedPassword);
          //add details to database
          con.query("INSERT INTO user (username, password) VALUES (?, ?)",
          //unencrypted for now
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