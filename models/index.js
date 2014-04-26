var User = require('./user'),
    Review = require('./review'),
    Artist = require('./artist');

// console.log(userroutes);
for (var route in userroutes) {
  User.userroute(route, userroutes[route]);
}

exports = module.exports = [User, Review, Artist];