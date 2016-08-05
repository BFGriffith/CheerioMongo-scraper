// DEPENDENCIES:
// intialize Express
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

require("./controllers/controller.js")(app);

//port
var PORT = process.env.PORT || 3000;
//var PORT = 3000 || process.env.PORT;
/*
// DATABASE configuration:
// require MongoJS, then save the url of the database + name of collection
var mongojs = require('mongojs');
var databaseUrl = "CheerioMongoScraper";
var collections = ["articles"];

// use MongoJS to connect the database to the db variable
var db = mongojs(databaseUrl, collections);

// log errors regarding MongoDB
db.on('error', function(err) {
  console.log('Database Error:', err);
});
*/
// LISTENER:
app.listen(PORT, function(){
  console.log('listening on port: ', PORT)
});
