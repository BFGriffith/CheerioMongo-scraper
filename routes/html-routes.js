// request and cheerio
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

    // landing-page
    app.get('/', function(req, res) {
      // requesting and displaying the articles to the screen
      request('http://www.comicsalliance.com/', function(error, response, html) {
        if (error) throw error;

        // load html into Cheerio and store it in a variable
        var $ = cheerio.load(html);

        // loop through articles
        $('article').each(function(i, element) {

          // empty object to pass to MongoDB
          var article = {};

          // title, href and content of each article
          var comicsAlliance = $(this).text();
          var title = $(this).find('h2.title').text();
          var href = $(this).find('p.more_act.a').attr('href');
          var content = $(this).find('div.the_excerpt.p').text();

          // only add article elements that have content for a title
          if (title !== '') {
            // build article object
            article = {
              title: title,
              href: href,
              content: content,
              comments: []
            };

            // update MongoDB with articles
            db.articles.update(article, article, {
              upsert: true
            }, function(err, saved) {
              if (err) throw err;
              //console.log(saved);
            }); // END db.articles.update()
          } // END conditional
        }); // END article.each()
      }); // END request()

      // find the scraped articles in the database
      db.articles.find({}, function(err, docs) {
        if (err) throw err;

        // articles and comments array for handlebars (comments array will be passed to articles object)
        var articles_hb = [];
        var comments_hb = [];

        // article objects to push to above arrays
        var article_obj = {};

        // loop through returned docs from MongoDB
        docs.forEach(function(article, index, array) {

          // empty the object before each pass
          article_obj = {};

          // empty comments array for each article, initially
          comments_hb = [];

          // loop through each article’s comments
          article.comments.forEach(function(comment, c_index, c_array) {
            //console.log(comment);

            // push comment object into comments array
            comments_hb.push(comment);

            // sort the comments so most recent appear on top
            comments_hb.sort(function(a, b) {
              return b.posted - a.posted;
            });

          }); // END article.comments.forEach()

          // build article and comments objects
          article_obj = {
            title: article.title,
            href: article.href,
            content: article.content,
            article_id: article._id,
            comments: comments_hb //array of comment objects
          };

          // push created article objects into articles array
          articles_hb.push(article_obj);

        }); // END docs.forEach()

        // render index page + pass data to handlebars
        res.render('index', {
          articles: articles_hb
        }); // END res.render()
      }); // END db.articles.find()
    }); // END app.get('/')

    // SUBMIT comment:
    app.post('/submit', function(req, res) {
      // store comment object in variable
      var comment = req.body;
      // console.log(comment.comment, comment.posted, comment.article_id);

      //update database with new comment
      db.articles.update({
        "_id": (mongojs.ObjectId(comment.article_id))
      }, {
        $addToSet: {
          comments: {
            comment: comment.comment,
            posted: comment.posted
          }
        }
      }, function(err, docs) {
        //console.log(docs);
      }); // END db.articles.update()
    }); // END app.get('/submit')

    // DELETE comment:
    app.post('/delete', function(req, res) {

      // set comment to delete in variable
      var comment_to_delete = req.body;

      // delete comment from database
      db.articles.update({
        "_id": (mongojs.ObjectId(comment_to_delete.article_id))
      }, {
        $pull: {
          comments: {
            posted: comment_to_delete.posted
          }
        }
      }, function(err, docs) {
        console.log(docs);
      }); // END db.articles.update()
    }); // END app.post('/delete')
  }; // END module.exports(app)
