var restful = require('node-restful'),
    mongoose = require('mongoose');

var Artist = new restful.Model({
  title: 'user',
  methods: ['get', 'post', 'put', 'delete'],
  schema: mongoose.Schema({
    artist_id: { type: 'string', unique: true, required: true},
    cumulative_rating: { type: 'number', required: true},
    number_of_ratings: { type: 'number', required: true}
  }),
});

exports = module.exports = Artist;