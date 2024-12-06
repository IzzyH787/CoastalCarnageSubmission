const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

var mysql = require('mysql');

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


  app.get('*', (req, res) => {
    //_dirname
    console.log(__dirname);
    res.status(404).sendFile(__dirname + '/error404.html');
  });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});