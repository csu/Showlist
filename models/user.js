var restful = require('node-restful'),
    mongoose = require('mongoose');

var User = restful.model('user', mongoose.Schema({
    provider: { type: 'string', required: true },
    user_id: { type: 'string', unique: true, required: true},
    name: { type: 'string', required: true},
    email: { type: 'string', required: true},
    photo: { type: 'string'},
    facebook_token: { type: 'string', required: true}
  }))
  .methods(['get', 'post', 'put', 'delete']);

User.register(app, '/api/user');

module.exports = mongoose.model('User', userSchema);