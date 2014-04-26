var restful = require('node-restful'),
    mongoose = require('mongoose'),
    User = require('./user'),
    Artist = require('./artist');

var validateUser = function(req, res, next) {
  if (!req.body.creator) {
    return next({ status: 400, err: "Reviews need a creator" });
  }
  User.Model.findById(req.body.creator, function(err, model) {
    if (!model) return next(restful.objectNotFound());
    return next();
  });
}

var Review = new restful.Model({
  title: "note",
  methods: ['get', { type: 'post', before: validateUser }, { type: 'put', before: validateUser }, 'delete'],
  schema: mongoose.Schema({
    artist_id: { type: 'ObjectId', ref: 'artist', require: true},
    creator: { type: 'ObjectId', ref: 'user', require: true},
    number_of_ratings: { type: 'numer', required: true},
    rating: { type: 'number', required: true},
    review_body: { type: 'string', required: true},
    event_id: 'string'
  }),
});

exports = module.exports = Review;