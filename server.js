// DEPENDENCIES:
// intialize Express
var express = require('express');
var app = express();

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

// LISTENER:
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
