// DEPENDENCIES:
// intialize Express
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

// PORT:
//var PORT = process.env.PORT || 3000;
var PORT = 3000;


// body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: false
}));

// middleware:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());

// access public directory
app.use(express.static('public'));

// handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// ROUTES:
require('./routes/html-routes.js')(app);

// LISTENER:
app.listen(PORT, function(){
  console.log('listening on port: ', PORT);
});
