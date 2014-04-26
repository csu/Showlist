var express = require('express'),
    path = require('path'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;
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

	// express
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms
	// app.set('view engine', 'jade'); // set up ejs for templating

	// passport
	app.use(express.session({ secret: 'kCfPusdpqme6cwc9UgpA' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

var Artist = app.resource = restful.model('artist', mongoose.Schema({
    artist_id: { type: 'string', unique: true, required: true },
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
    artist_id: { type: 'string', required: true},
    creator: { type: 'string', required: true},
    rating: { type: 'number', required: true},
    review_body: { type: 'string', required: true}
  }))
  // .methods(['get', { type: 'post', before: validateUser }, { type: 'put', before: validateUser }, 'delete']);
  .methods(['post', 'put', 'delete']);

Review.route('get', function(req, res, next) {
    //console.log('searching for artist_id: ' + req.query.artist_id);
    Review.find({"artist_id": req.query.artist_id}, function(err, reviews) {
        if (!err) {
            return res.json(reviews);
        } else {
            console.log(err);
        }
    })
});

<<<<<<< HEAD
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
      // console.log('data: ' + data);
      // console.log('num: ' + data['number_of_ratings']);
      updateRatingsPhase2(artist_id, rating, data['number_of_ratings']);
=======
Review.after('post', function(req, res, next) {
  var avg = 0;
  var num = 0;
  Review.find({"artist_id": req.query.artist_id}, function(err, reviews) {
        for (review in reviews) {
          avg += review.rating;
          num++;
        }
>>>>>>> e6810cd349087090e290c932606ea0e8d119a684
    });
}

function updateRatingsPhase2(artist_id, rating, num) {
  Artist.findOne({"artist_id": artist_id}, function(err, data) {
    // console.log('cum: ' + data['cumulative_rating']);
    calculateNewRating(artist_id, rating, num, data['cumulative_rating']);
  });
}

function calculateNewRating(artist_id, rating, num, cum) {
  // console.log('rating: ' + rating);
  // console.log('cum*num=' + cum*num);
  // console.log('(cum*num)+rating=' + cum*num+rating);
  // console.log('((cum*num)+rating)/(num+1)=' + ((cum*num)+rating)/(num+1));
  cum = ((cum*num)+parseInt(rating))/(num+1);
  console.log('new cum: ' + cum);
  num = num+1;
  console.log('new num: ' + num);
  updateArtistRating(artist_id, num, cum);
}

function updateArtistRating(artist_id, num, cum) {
  Artist.update({"artist_id": artist_id}, { number_of_ratings: num, cumulative_rating: cum });
}

Review.after('post', function(req, res, next) {
  // num = getNumberOfRatings(req.body.artist_id)+1;
  // cum = ((getCumulativeRating(req.body.artist_id)*(num-1))+req.body.rating)/num;
  // Artist.update({"artist_id": req.body.artist_id}, { number_of_ratings: num, cumulative_rating: cum});
  // console.log('artist_id: ' + req.body.artist_id);
  updateRatingsPhase1(req.body.artist_id, req.body.rating);
  next();
});

// function getNumberOfRatings(artist_id) {
//   Artist.findOne({"artist_id": artist_id}, function(err, data) {
//     console.log('num: ' + data['number_of_ratings'])
//     return data['number_of_ratings'];
//   });
// }

// function getCumulativeRating(artist_id) {
//   Artist.findOne({"artist_id": artist_id}, function(err, data) {
//     console.log('cum: ' + data['cumulative_rating'])
//     return data['cumulative_rating'];
//   });
// }

// Review.after('post', function(req, res, next) {
//   var avg = 0;
//   var num = 0;
//   console.log(req.body.artist_id);
//   console.log(req.body.rating);
//   Review.find({"artist_id": req.body.artist_id}, function(err, results) {
//         if (results.length == 0) {
//           avg = parseInt(req.body.rating);
//           num = 1;
//         }
//         else {
//           for (review in results) {
//             avg += parseInt(review.rating);
//             num++;
//           }
//         }
//     });
//   avg = avg/num;
//   console.log('avg: ' + avg);
//   console.log('num: ' + num);
//   Artist.update({ artist_id: req.query.artist_id }, { $set: { cumulative_rating: avg, number_of_ratings: num }});
//   next();
// });

Review.register(app, '/api/reviews');

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.get('/artist/:artist_id', function (req, res) {
  var rating = 0;
  Artist.findOne({"artist_id": req.params.artist_id}, function(err, artist) {
    console.log(artist);
    rating = artist.cumulative_rating;
    console.log(rating);
  });
  Review.find({"artist_id": req.params.artist_id}, function(err, reviews) {
          res.render('item.jade',
            { "reviews" : reviews,
              "artist_rating" : rating }
          );
    });
});

// app.get('/artist/:artist_id', function (req, res) {
//   Review.find({"artist_id": req.params.artist_id}, function(err, reviews) {
//           // var photo_arr = {};
//           // for (item in reviews) {
//           //   User.findOne({"user_id": reviews[item].creator }, function (err2, creator) {
//           //     console.log(creator.photo);
//           //     photo_arr.push(creator.photo);
//           //   });
//           // }
//           // //console.log(reviews);
//           // console.log(photo_arr);
//           res.render('item.jade',
//             { "reviews" : reviews//,
//             //"photos" : photo_arr
//             }
//           );
//     });
// });

// app.get('/artist/:artist_id', function (req, res) {
//   Review.find({"artist_id": req.params.artist_id}, function(err, reviews) {
//         var creator_list = [];
//         for (item in reviews) {
//           creator_list.push(reviews[item].creator);
//         }
//         console.log(creator_list);
//         User.find({"user_id": { $in: creator_list }}, function (err2, creators) {
//           for (item in reviews) {
//             reviews[item].photo = creators.
//           }
//           var photos_list = [];
//           for (c in creators) {
//             photos_list.push(creators[c].photo);
//           }
//           console.log(photos_list);
//           res.render('item.jade',
//             { "reviews" : reviews,
//             "profile_pictures" : photos_list }
//           );
//         });
//     });
// });

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
