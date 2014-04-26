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
    review_body: { type: 'string', required: true},
    event_id: 'string'
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

Review.register(app, '/api/reviews');

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.get('/artist/:artist_id', function (req, res) {
  Review.find({"artist_id": req.params.artist_id}, function(err, reviews) {
          // var photo_arr = {};
          // for (item in reviews) {
          //   User.findOne({"user_id": reviews[item].creator }, function (err2, creator) {
          //     console.log(creator.photo);
          //     photo_arr.push(creator.photo);
          //   });
          // }
          // //console.log(reviews);
          // console.log(photo_arr);
          res.render('item.jade',
            { "reviews" : reviews//,
            //"photos" : photo_arr
            }
          );
    });
});

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
