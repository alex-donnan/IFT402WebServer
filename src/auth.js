//bcrypt
var bcrypt = require('bcrypt');
var saltRounds = 10;

//data
var MongoClient = require('mongodb').MongoClient;
var user_rights = (process.env.ADMIN || "admin_donnan");
var user_pass = (process.env.LOGIN || "quixote229");
var uri = "mongodb+srv://" + user_rights + ":" + user_pass + "@buttonintranet-jlpsn.mongodb.net/test?retryWrites=true&w=majority";
var client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

module.exports = {
	//check for user and add if not there
	//connect to mongodb
	/**
	 * Returns whether a user is valid in the user database
	 * @param {String} username
	 * @param {String} password
	 * @returns {Promise} Async promise return
	 */
	userCheck: async function(username, password) {
		console.log("connecting");
		client.connect(async(err) => {
			console.log("connected");
			try {
				//get the information collection
				console.log("getting user");
			 	var collection = client.db("users").collection("user information");
			 	//find user trying to login
			 	var query = {userName: username};
			 	var el = await collection.findOne(query);
			 	console.log("user retrieved");
			 	console.log(el);
	 			try {
	 				console.log("comparing");
	 				var val = bcrypt.compare(password, el.passwordHash);
	 				console.log("done, sending forth " + val);
	 				return val;
				} catch (err) {
					console.log("A problem occurred");
					return false;
				}
		 	} finally {
		 		client.close();
		 	}
		 });
	},

	//check for valid new user and add if not there
	//connect to mongodb
	newUserCheck: async function(username, useremail, orgnum, password1, password2) {
		//are the passwords matching
		if (password1 == password2) {
			client.connect(err => {
				//get the potential collection
			 	const collection = client.db("users").collection("user potential");
			 	//if user email collection, add them! remove from potential
			 	var query = {userEmail: useremail, orgNum: orgnum};
			 	collection.find(query, function(err, res) {
			 		//iterate through results
			 		res.each(function(err, el) {
				 		if (el != null) {
							console.log("Creating user..");
							//get standard user information collection
							var coll_info = client.db('users').collection('user information');
							//add with hash password
							bcrypt.hash(password1, saltRounds, function(err, hash) {
								console.log(hash);
								client.connect(err => {
									coll_info.insertOne({
										userName: username,
										userEmail: useremail,
										orgNum: orgnum,
										passwordHash: hash
									});
									console.log("Inserted user");
									client.close();
								});
							});
							
							//remove
							//connect. honestly redundant but should always pass the connection issue
							client.connect(err => {
								//remove
								collection.deleteOne(el, function(err, del) {
									if (err) throw err;
									console.log("Deleted item");
								});
								//end connection
								client.close();
							});
							//update user to new html page
							//location = 'http://127.0.0.1:4040/index.html'
							return true;
						} else {
							console.log("No new user created");
							//return user to create user page
							//location = 'http://127.0.0.1:4040/createUser.html'
							return false;
						}
					});
				});
				client.close();
			});
		} else {
			console.log('Passwords do not match');
			return false;
		}
	}
}