const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

var mysql = require('mysql');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cmp5360"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("SELECT * FROM user", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

//serve static files, includes other files
app.use(express.static(path.join(__dirname, 'static')));
//app.use(express.static(path.join(__dirname, 'js')));

//for parsing form data
app.use(express.urlencoded({extended: true}));
app.post('/login', (req, res) => {
  if (req != null){
    //get parameter from the form
    console.log("Logging in");
    console.log("Username: "+ req.body.username);
    console.log("Password: "+ req.body.password);
    const username = req.body.username;
    const password = req.body.password;

    //compare with form in data storage
    if (username == "John"){
      console.log("Correct user John");
      res.redirect('/game');
    }
    //redirect page according to result
    else{
      //change this to correct file name for login fail
      res.redirect('/login-failed')
    }
    
  }
  else{
    console.log("Request is null");
    //change this to correct file name for login fail
    res.sendFile(__dirname + '/login-failed');
  }
})


app.post('/auth', jsonParser, (req, res)=>{
  let name = req.body.name;
  console.log("Authorising...")
  console.log("Input username = " + name);
  let nameJson = {error:false, data:name};

  if (name == "123"){
    console.log("Correct user 123");
    return res.json(nameJson);
  }
  else{
    //let value = req.body.name; //get received json string
    nameJson = {error:true, data:"Wrong user name"};
    res.send(nameJson); //echo result back
    return res.json(nameJson);
  }
})












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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


//decode json in route 
app.post('api/users', jsonParser, (req, res)=>{
  //create user
});