// modules:
var request = require('request');
var cheerio = require('cheerio');
var mongojs = require('mongojs');

// MongoDB configuriation:
var databaseUrl = "CheerioMongoScraper";
var collections = ["articles"];

// use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// this makes sure that any errors are logged if mongodb runs into an issue
db.on('error', function(err) {
  console.log('Database Error: ', err);
});

// REQUEST — index.handlebars
db.articles.findOne({}, function(err, data) {
  if (data === null) {
    var options = {
      url: 'http://www.comicsalliance.com/',
      headers: {
        'User-Agent': 'request'
      }
    };
    //main request to retrieve data and store into mongodb
    request(options, function(error, response, html) {
      if (error) throw error;
      var results = [];
      var $ = cheerio.load(html);
      $('article').each(function(i, element) {
        var title = $(this).find('h2.title').text().trim();
        var date = $(this).find('span.the_date').text().trim();
        var imgURL = $(this).find('.wp-post-image').attr('src');
        var summary = $(this).find('div.the_excerpt').text().trim();
        var link = $(this).find('h2.title').attr('href');
        // console.log(link)
        //not storing image URLs that are undefined
        if (imgURL !== undefined) {
          var obj = {
            title: title,
            date: date,
            imgURL: imgURL,
            summary: summary,
            link: link
          };
          results.push(obj);
        } // END conditional
      }); // END $.each

      db.articles.insert(results, function(err, data) {
        if (err) throw err;
      });
    }); // END request
  }
});

// routes to export to server.js
module.exports = function(app) {

  app.get('/', function(req, res) {
    db.articles.find({}, function(err, data) {
      if (err) throw err;
      // console.log(data)
      res.render('index', {
        results: data
      });
    });
  });

  app.post('/comment', function(req, res) {
    // add comments to the database using ObjectId
    var id = req.body._id;
    var comment = req.body.comment;
    // console.log(req.body)
    db.articles.update({
      "_id": mongojs.ObjectId(id)
    }, {
      $push: {
        "comment": comment
      }
    }, function(err, data) {
      if (err) throw err;
      db.articles.find({
        "_id": mongojs.ObjectId(id)
      }, function(err, data) {
        if (err) throw err;
        // console.log(data)
        //send comments back to front-end
        res.json(data);
      });
    });
  });

  // DELETE:
  app.post('/commentDelete', function(req, res) {
    // delete comments by searching database using the ObjectId
    var id = req.body._id;
    var comment = req.body.comment;
    // console.log(req.body)
    db.articles.update({
      "_id": mongojs.ObjectId(id)
    }, {
      $pull: {
        "comment": comment
      }
    }, function(err, data) {
      if (err) throw err;
      db.articles.find({
        "_id": mongojs.ObjectId(id)
      }, function(err, data) {
        if (err) throw err;
        // console.log(data)
        //send comments back to front-end
        res.json(data);
      });
    });

  });

  // get comments for specific articles based on :id in the URL
  app.get('/comment/:id', function(req, res) {
    var id = req.params.id;
    // console.log(id)
    db.articles.find({
      "_id": id
    }, function(err, data) {
      if (err) throw err;
      // console.log(data)
    });
  });
};
