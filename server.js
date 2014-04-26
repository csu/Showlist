var express = require('express'),
    path = require('path'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;
// var facebook = require('./facebook.js');
// var https = require('https');
var request = require('request');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var User = require('./app/models/user');

var configDB = require('./config/database.js');

app.use(express.bodyParser());
app.use(express.query());

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.favicon(path.join(__dirname, 'public/graphics/favicon.ico'))); 

	// express
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
  app.use(express.cookieSession({ secret: 'RcWudEyiRGh3VQMp6Yzk' }));
	app.use(express.bodyParser()); // get information from html forms
	// app.set('view engine', 'jade'); // set up ejs for templating

	// passport
	app.use(express.session({ secret: 'kCfPusdpqme6cwc9UgpA' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

var Artist = app.resource = restful.model('artist', mongoose.Schema({
    artist_id: { type: 'string', unique: true, required: true, lowercase: true },
    cumulative_rating: { type: 'number', required: true, default: 0 },
    number_of_ratings: { type: 'number', required: true, default: 0 }
  }))
  .methods(['get', 'post', 'put', 'delete']);

Artist.register(app, '/api/artists');

// var User = app.resource = restful.model('user', mongoose.Schema({
//     provider: { type: 'string', required: true },
//     user_id: { type: 'string', unique: true, required: true},
//     name: { type: 'string', required: true},
//     email: { type: 'string', required: true},
//     photo: { type: 'string'},
//     facebook_token: { type: 'string', required: true}
//   }))
//   .methods(['get', 'post', 'put', 'delete']);

// User.register(app, '/api/user');

var validateUser = function(req, res, next) {
  if (!req.body.creator) {
    return next({ status: 400, err: "Reviews need a creator" });
  }
  User.Model.findById(req.body.creator, function(err, model) {
    if (!model) return next(restful.objectNotFound());
    return next();
  });
}

var Review = app.resource = restful.model('review', mongoose.Schema({
    // artist_id: { type: 'ObjectId', ref: 'artist', require: true},
    // creator: { type: 'ObjectId', ref: 'user', require: true},
    artist_id: { type: 'string', required: true, lowercase: true },
    event_id: { type: 'string', required: true},
    creator: { type: 'string', required: true},
    rating: { type: 'number', required: true},
    review_body: { type: 'string', required: true}
  }))
  // .methods(['get', { type: 'post', before: validateUser }, { type: 'put', before: validateUser }, 'delete']);
  .methods(['post', 'put', 'delete']);

Review.route('get', function(req, res, next) {
    //console.log('searching for artist_id: ' + req.query.artist_id);
    Review.find({"event_id": req.query.event_id}, function(err, reviews) {
        if (!err) {
            return res.json(reviews);
        } else {
            console.log(err);
        }
    })
});

// Review.route('get', function(req, res, next) {
//     //console.log('searching for artist_id: ' + req.query.artist_id);
//     Review.find({"artist_id": req.query.artist_id}, function(err, reviews) {
//         if (!err) {
//             return res.json(reviews);
//         } else {
//             console.log(err);
//         }
//     })
// });

function updateRatingsPhase1(artist_id, rating) {
  Artist.findOne({"artist_id": artist_id}, function(err, data) {
    if (data != null) {
        updateRatingsPhase2(artist_id, rating, data['number_of_ratings']);
      }
      else { // it is a new artist and needs to be created
        makeNewArtist(artist_id, rating);
      }
    });
}

function makeNewArtist(artist_id, rating) {
  var newArtist = new Artist({
        "artist_id": artist_id,
        "cumulative_rating": rating,
        "number_of_ratings": 1
    });
    newArtist.save(function(err) {
        if (!err) {
            return console.log('created');
        } else {
            return console.log(err);
        }
    });
}

function updateRatingsPhase2(artist_id, rating, num) {
  Artist.findOne({"artist_id": artist_id}, function(err, data) {
    calculateNewRating(artist_id, rating, num, data['cumulative_rating']);
  });
}

function calculateNewRating(artist_id, rating, num, cum) {
  cum = ((cum*num)+parseInt(rating))/(num+1);
  num = num+1;
  updateArtistRating(artist_id, num, cum);
}

function updateArtistRating(id, num, cum) {
  //Artist.findOneAndUpdate({artist_id: id}, { number_of_ratings: num, cumulative_rating: cum });
  Artist.findOne({ artist_id: id }, function (err, doc) {
    doc.number_of_ratings = num;
    doc.cumulative_rating = cum;
    doc.save();
  })
}

Review.after('post', function(req, res, next) {
  updateRatingsPhase1(req.body.artist_id.toLowerCase(), req.body.rating);
  next();
});

Review.register(app, '/api/reviews');

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.get('/artist/:artist_id', function (req, res) {
  var rating = 0;
  Artist.findOne({"artist_id": req.params.artist_id.toLowerCase()}, function(err, artist) {
    // console.log(artist);
    rating = artist.cumulative_rating;
    // console.log(rating);
  });
  Review.find({"artist_id": req.params.artist_id.toLowerCase()}, function(err, reviews) {
          res.render('item.jade',
            { "reviews" : reviews,
              "artist_rating" : rating }
          );
    });
});

function getArtistCumRating(id) {
  Artist.findOne({artist_id: id}, function(err, artist) {
    // console.log(artist);
    rating = artist.cumulative_rating;
    // console.log(rating);
  });
}

app.get('/', function (req, res) {
  express.static('index.html');
});

app.get('/shit', function (req, res) {
  express.static('review_form.html');
});

app.get('/edit1', function (req, res) {
  express.static('edit1.html');
});

app.get('/edit2', function (req, res) {
  express.static('edit2.html');
});

app.get('/auth/failed', function (req, res) {
  express.static('failed_auth.html');
});

app.get('/event/:event_id', function (req, res) {
  var rating = 0;
  Review.find({"event_id": req.params.event_id}, function(err, reviews) {
        // console.log(reviews);
          res.render('event.jade',
            { "reviews" : reviews,
              "artist_rating" : rating,
              "event_id" : req.params.event_id }
          );
    });
});

// function getAuthTokenForUser(res, uid) {
//   User.findOne({ user_id: uid }, function(err, result) {
//     // console.log(result);
//     getUserLikes(res, result['facebook_token']);
//   })
// }

// function getUserLikes(res, token) {
//   var path = 'https://graph.facebook.com/me/likes?limit=1000&access_token=' + token;
//   // console.log(path);
//   request(path, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       // console.log(body);
//       var body = JSON.parse(body);
//       var data = body["data"];
//       var artist_names = [];
//       for (item in data) {
//         //console.log(item);
//         if (data[item]["category"] == "Musician/band") {
//           artist_names.push(data[item]["name"]);
//         }
//       }
//       res.json(artist_names);
//     }
//   });
// }

// app.get('/api/likes', function (req, res) {
//   getAuthTokenForUser(res, req.session['passport']['user']);
//   // res.send();
// });

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
