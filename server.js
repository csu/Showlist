var express = require('express'),
    restful = require('node-restful'),
    mongoose = restful.mongoose;
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var configDB = require('./config/database.js');

app.use(express.bodyParser());
app.use(express.query());

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// express
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms
	app.set('view engine', 'jade'); // set up ejs for templating

	// passport
	app.use(express.session({ secret: 'kCfPusdpqme6cwc9UgpA' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

// API =========================================================================
var Artist = app.resource = restful.model('artist', mongoose.Schema({
    artist_id: { type: 'string', unique: true, required: true},
    cumulative_rating: { type: 'number', required: true},
    number_of_ratings: { type: 'number', required: true}
  }))
  .methods(['get', 'post', 'put', 'delete']);

Artist.register(app, '/artists');

var validateUser = function(req, res, next) {
  if (!req.body.creator) {
    return next({ status: 400, err: "Reviews need a creator" });
  }
  User.Model.findById(req.body.creator, function(err, model) {
    if (!model) return next(restful.objectNotFound());
    return next();
  });
}

var User = app.resource = restful.model('review', mongoose.Schema({
    provider: { type: 'string', required: true},
    user_id: { type: 'string', unique: true, required: true},
    full_name: { type: 'string', required: true},
    email: { type: 'string', required: true},
    photo: { type: 'string', required: true},
  }))
  .methods(['get', 'post', 'put', 'delete']);

User.register(app, '/user');

var Review = app.resource = restful.model('review', mongoose.Schema({
    artist_id: { type: 'ObjectId', ref: 'artist', require: true},
    creator: { type: 'ObjectId', ref: 'user', require: true},
    number_of_ratings: { type: 'numer', required: true},
    rating: { type: 'number', required: true},
    review_body: { type: 'string', required: true},
    event_id: 'string'
  }))
  .methods(['get', { type: 'post', before: validateUser }, { type: 'put', before: validateUser }, 'delete']);

Review.register(app, '/reviews');

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
