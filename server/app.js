var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var express = require("express");
var morgan = require('morgan');
var path = require("path");

// CONFIG in .env
require('dotenv').config();
console.log("Booting up with Process ENV of: ")
console.log(process.env);

// App configuration
var app = express();
app.use('/client',express.static(path.join(__dirname, '../client')));
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
var spotifyAuth = require('./routes/spotifyAuth');
app.use(spotifyAuth);


app.get("/", function(req,res){
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});
