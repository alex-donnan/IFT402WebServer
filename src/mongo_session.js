//session store, will export functions related
var fs = require('fs'),
	assert = require('assert'),
	session = require('express-session'),
	mongo_store = require('connect-mongodb-session')(session),
	mongo_client = require('mongodb').MongoClient;

//session store
var user_rights = (process.env.ADMIN),
	user_pass = (process.env.LOGIN),
	client_uri = "mongodb access link";

var client = new mongo_client(client_uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

var session_store = new mongo_store({
	uri: client_uri,
	databaseName: 'session_storage',
	collection: 'sessions'
}, function(err) {
	console.log(err);
});

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("STATUS: Connected correctly to server");
});

//currently exports simply holds the session store and client variables, allowing other scripts to access them through the require call
//in the future, exports will have some getter/setter type functions for the sake of adding, deleting, or locating sessions.
module.exports = {
	store: session_store,
	client: client
};
