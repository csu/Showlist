// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '647376201977611', // your App ID
		'clientSecret' 	: '4b3139b521b2881943929c8f0735bdaf', // your App Secret
		'callbackURL' 	: 'http://dev.christophersu.net:8080/auth/facebook/callback'
	},

	// 'twitterAuth' : {
	// 	'consumerKey' 		: 'your-consumer-key-here',
	// 	'consumerSecret' 	: 'your-client-secret-here',
	// 	'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	// },

	// 'googleAuth' : {
	// 	'clientID' 		: 'your-secret-clientID-here',
	// 	'clientSecret' 	: 'your-client-secret-here',
	// 	'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	// }
	
};