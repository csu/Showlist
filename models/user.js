var restful = require('node-restful'),
    mongoose = require('mongoose');

var User = new restful.Model({
  title: 'user',
  methods: ['get', 'post', 'put', 'delete'],
  schema: mongoose.Schema({
    provider: { type: 'string', required: true},
    user_id: { type: 'string', unique: true, required: true},
    full_name: { type: 'string', required: true},
    email: { type: 'string', required: true},
    photo: { type: 'string', required: true},
  }),
});

exports = module.exports = User;