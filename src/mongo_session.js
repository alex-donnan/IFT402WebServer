//session store, will export functions related
var fs = require('fs'),
	assert = require('assert'),
	session = require('express-session'),
	mongo_store = require('connect-mongodb-session')(session),
	mongo_client = require('mongodb').MongoClient;

//session store
var user_rights = (process.env.ADMIN || "admin_donnan"),
	user_pass = (process.env.LOGIN || "quixote229"),
	client_uri = "mongodb+srv://" + user_rights + ":" + user_pass + "@buttonintranet-jlpsn.mongodb.net/test?retryWrites=true&w=majority";

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
	client: client/*,
	destroy: function(session, err) {
		//connect to the store
		client.connect(async(err) => {
			//try to access the db, collection and find session
			try {
				var collection = session_store.db('session_storage').collection('sessions');
				var query = { Session: session };
				collection.deleteOne(query, function(err, el) {
					if (err) throw err;
					console.log('Deleted session');
				});
			} catch (err) {
				console.log(err);
			} finally {
				session_store.close();
			}
		});
	},
	get: function(session, err) {
		//connect to the store
		client.connect(async(err) => {
			//try to access the db, collection and find session
			try {
				var collection = session_store.db('session_storage').collection('sessions');
				console.log(id);
				var query = { Session: session };
				var el = await collection.findOne(query);
				//if el is something, return it
				return el;
			} catch (err) {
				console.log(err);
			} finally {
				session_store.close();
			}
		});
	},
	set: function(id, session, err) {
		//get item
		var el = session_store.get(id, function(err) {
			if (err) throw err;
			console.log('found item..');
		});
		//delete it
		session_store.delete(el.id, function(err) {
			if (err) throw err;
			console.log('deleted.');
		})
		//create
		client.connect(async(err) => {
			var collection = session_store.db('session_storage').collection('sessions');
			collection.insertOne(session);
			console.log('inserted');
			session_store.close();
		})
	}
	*/
};