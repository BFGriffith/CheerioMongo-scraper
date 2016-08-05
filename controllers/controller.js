// DEPENDENCIES:
var request = require('request');
var cheerio = require('cheerio');

// DATABASE configuration:
// require MongoJS, then save the url of the database + name of collection
var mongojs = require('mongojs');
var databaseUrl = "CheerioMongoScraper";
var collections = ["articles"];

// use MongoJS to connect the database to the db variable
var db = mongojs(databaseUrl, collections);

// log errors regarding MongoDB
db.on('error', function(err) {
  console.log('Database Error: ', err);
});


module.exports = function(app) {
  app.get('/', function(req, res) {
      // load scrapings into request
      request('http://www.comicsalliance.com/', function(error, response, html) {
          if (error) throw error;
          // save the html into Cheerio
          var $ = cheerio.load(html);
          // for each article
          $('article').each(function(i, element) {
              var entry = [];
              $(this).find('header').each(function(i, element) {
                entry.push($(this).children('h2.title').text()); //title
                entry.push($(this).children('a').attr('href')); //link
                entry.push($(this).children('div.the_excerpt').text()); //summary
              });
              // create article object
              var articleInfo = {
                title: entry[0],
                link: entry[1],
                summary: entry[2],
                comments: []
              };
              // check if article already exists in database
              db.articles.find(articleInfo, function(err, data) {
                  // insert new article into database
                  if (Object.keys(data).length === 0) {
                    db.articles.insert(articleInfo, function(err, data) {
                      if (err) throw err;
                    });
                    console.log("scraped!");
                  } else {
                    console.log("That article exists already.");
                  };
              });
          });
        // reload page with database information
        db.articles.find({}, function(err, data) {
          res.render('index', {
            data
          });
        });
      });

    app.post('/delete', function(req, res) {
      var id = req.body.commentID;
      var comment = req.body.comment;

      db.articles.update({
        _id: mongojs.ObjectId(id)
      }, {
        $pull: {
          comments: {
            $in: [comment]
          }
        }
      });

      db.articles.find({}, function(err, data) {
        res.render('index', {
          data
        });
      });
    });

    app.post('/update/:id', function(req, res) {
      var id = req.params.id;
      db.articles.update({
        _id: mongojs.ObjectId(id)
      }, {
        $push: {
          'comments': req.body.comment
        }
      }, function(error) {
        if (error) throw error;
      });
      db.articles.find({}, function(err, data) {
        res.render('index', {
          data
        });
      });
    });
  });
};
