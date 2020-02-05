/*
	Routing for paths
*/

var express = require('express'),
	session = require('express-session'),
	session_store = require('./mongo_session'),
	router = express.Router();

//bcrypt
var bcrypt = require('bcrypt'),
	saltRounds = 10;

//database
var client = session_store.client,
	store = session_store.store;

//
// Handle GET requests
//
router.get('/', function(req, res) {
	req.session.login = false;
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.');
		client.connect();
	}
	res.redirect('/index.html');
});

router.get('/createUser.html', function(req, res) {
	if (req.session.login == true) {
		res.redirect('/index.html');
	}
	res.sendFile('/createUser.html', {'root': 'D:/Documents/IFTFinalClass/IFT402/'});
});
	
router.get('/index.html', function(req, res) {
	res.setHeader('Cache-Contorl', 'no-cache, no-store, max-age=0, must-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '-1');
	console.log('TEST: Checking session');
	if (req.session.login == true) {
		console.log('STATUS: Session ok')
		res.sendFile('/index.html', {'root': 'D:/Documents/IFTFinalClass/IFT402/'});
	} else {
		res.sendFile('/login.html', {'root': 'D:/Documents/IFTFinalClass/IFT402/'});
	}
});

router.get('/get_user', async(req, res) => {
	console.log('STATUS: Gathering user information for page update');
	var uname = req.session.uName,
		orgnum = req.session.orgNum,
		chatname = req.session.chatName,
		taskname = req.session.taskName,
		output = [],
		orglist = req.session.orgList;
	//reconnect if the server is no longer on
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	if (req.session.orgList.length == 0) {
		console.log('UPDATE: Populating organization user list');
		//first try to populate orglist
		try {
			//user collection
			var userCollection = client.db('user_info').collection('user');
			var userQuery = {orgNum: orgnum};
			var user = await userCollection.find(userQuery).toArray();
			user.forEach(function(el) {
				orglist.push(el.userName);
			});
			req.session.orgList = orglist;
		} catch(err) {
			if (err) console.log('ERR: ' + err);
		} finally {
			if (!client.isConnected()) {
				console.log('STATUS: Server disconnected. Connecting to server.')
				client.connect();
			}
		}
	}
	//then the rest
	try {
		//collections
		var userCollection = client.db('user_info').collection('user');
		const chatCollection = client.db('chat_storage').collection('chat_log');
		const taskCollection = client.db('task_storage').collection('task');
		//queries
		var userQuery = {userName: uname};
		var chatQuery = {chatName: chatname};
		var taskQuery = {taskName: taskname};
		var user = await userCollection.findOne(userQuery);
		var chat = await chatCollection.findOne(chatQuery);
		var task = await taskCollection.findOne(taskQuery);
		//preliminary makes IF chat or task does not exist
		if (chat == null) {
			//create new
			console.log('UPDATE: Creating chat');
			chatCollection.insertOne({
				chatName: chatname,
				orgNum: orgnum,
				users: orglist,
				text: [
					{
						created: Date.now(),
						from: chatname,
						message: 'Welcome to the ' + chatname + ' chat!'
					}
				]
			});
			var update = {$push: {chatGroups: chatname}};
			console.log('UPDATE: Added group to users')
			userCollection.updateMany(userQuery, update, function(err, res) {
				if (err) console.log('ERR: ' + err);
				console.log('STATUS: Created chat and updated users');;
			});
		}

		if (task == null) {
			//create new
			console.log('UPDATE: Creating task group');
			taskCollection.insertOne({
				taskName: taskname,
				orgNum: orgnum,
				users: orglist,
				task: [
					{
						created: Date.now(),
						from: taskname,
						description: 'Welcome to the ' + taskname + ' task group!',
						todo: [
							'Use this group'
						]
					}
				]
			});
			var update = {$push: {taskGroups: taskname}};
			console.log('UPDATE: Added group to users')
			userCollection.updateMany(userQuery, update, function(err, res) {
				if (err) console.log('ERR: ' + err);
				console.log('STATUS: Created task and updated users');;
			});
		}
		//generate the message and send it to be updated
		output.push(uname);
		output.push(orgnum);
		output.push(chatname);
		output.push(taskname);
		output.push(user.chatGroups);
		output.push(user.taskGroups);
		output.push(orglist);
		output.push(chat.text);
		output.push(task.task);
		res.send(output);
	} catch (err) {
		console.log('ERR: ' + err);
	} finally {
		res.end();
	}
});

router.get('/logout.html', function(req, res) {
	req.session.destroy(function(err) {
		if (err) console.log('ERR: ' + err);
		if (client.isConnected()) {
			client.close();	
		}
		res.redirect('/');
	});
});

//
// Handle POST requests
//

router.post('/add_chat_group', async(req, res) => {
	console.log('STATUS: Creating newe chat group');
	var uname = req.session.uName,
		orgnum = req.session.orgNum,
		gname = req.body.groupName,
		guser = req.body.groupUsers;
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	try {
		//collections
		const userCollection = client.db('user_info').collection('user');
		const chatCollection = client.db('chat_storage').collection('chat_log');
		//test if it exists
		const userQuery = {userName: {$in: guser}};
		const chatQuery = {chatName: gname};
		var el = await chatCollection.findOne(chatQuery);
		if (el == null) {
			//create new
			console.log('UPDATE: Creating chat');
			chatCollection.insertOne({
				chatName: gname,
				orgNum: orgnum,
				users: guser,
				text: [
					{
						created: Date.now(),
						from: gname,
						message: 'Welcome to the ' + gname + ' chat!'
					}
				]
			});
			var update = {$push: {chatGroups: gname}};
			console.log('UPDATE: Add group to users')
			userCollection.updateMany(userQuery, update, function(err, res) {
				if (err) console.log('ERR:' + err);
				console.log('STATUS: Created chat and updated users');;
			});
		} else {
			console.log('ERR: The chat already exists');
		}
	} catch(err) {
		console.log('ERR:' + err);
	} finally {
		res.end();
	}
});

router.post('/add_task_group', async(req, res) => {
	console.log('STATUS: Creating new task group');
	var uname = req.session.uName,
		orgnum = req.session.orgNum,
		tname = req.body.taskName,
		tuser = req.body.taskUsers;
	console.log(tname + ',' + tuser);
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	try {
		//collections
		const userCollection = client.db('user_info').collection('user');
		const taskCollection = client.db('task_storage').collection('task');
		//test if it exists
		const userQuery = {userName: {$in: tuser}};
		const taskQuery = {taskName: tname};
		var el = await taskCollection.findOne(taskQuery);
		if (el == null) {
			//create new
			console.log('UPDATE: Creating task group');
			taskCollection.insertOne({
				taskName: tname,
				orgNum: orgnum,
				users: tuser,
				task: [
					{
						created: Date.now(),
						from: tname,
						description: 'Welcome to the ' + tname + ' task group!',
						todo: [
							'Use this group'
						]
					}
				]
			});
			var update = {$push: {taskGroups: tname}};
			console.log('UPDATE: Add group to users')
			userCollection.updateMany(userQuery, update, function(err, res) {
				if (err) console.log('ERR:' + err);
				console.log('STATUS: Created task and updated users');;
			});
		} else {
			console.log('ERR: The task group already exists');
		}
	} catch(err) {
		console.log('ERR:' + err);
	} finally {
		res.end();
	}
});

router.post('/login', async(req, res) => {
	console.log('STATUS: Logging in')
	var uname = req.body.uname,
		pwd = req.body.pwd,
		orglist = [];
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	try {
	 	//find user trying to login
		const userCollection = client.db('user_info').collection('user');
	 	var query = {userName: uname};
 		var el = await userCollection.findOne(query);
		var match = await bcrypt.compare(pwd, el.passwordHash);
		if (match) {
			console.log('STATUS: User ok');
			req.session.uName = uname;
			req.session.orgNum = el.orgNum;
			req.session.chatName = el.orgNum;
			req.session.taskName = el.orgNum;
			req.session.orgList = orglist;
			req.session.login = true;
			res.send('okay');
		} else {
			console.log('ERR: Wrong password!');
			res.send('failure');
		}
	} catch (err) {
		console.log("ERR: A problem occurred");
		console.log('ERR:' + err);
		res.send('failure');
	} finally {
 		res.end();
 	}
});

router.post('/remove_task', async(req, res, next) => {
	console.log('STATUS: Removing task from a task log')
	var taskdes = req.body.taskDes,
		taskgroup = req.session.taskName,
		uname = req.session.uName,
		orgnum = req.session.orgNum;
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	try {
		//collections
		const taskCollection = client.db('task_storage').collection('task');
		//if found post
		var query = {taskName: taskgroup};
		var el = await taskCollection.findOne(query);
		if (el) {
			//generate the message and send it to be updated
			var update_task = {$pull: {task: {description: taskdes}}};
			taskCollection.updateOne(el, update_task, function(err, res) {
				if (err) console.log('ERR:' + err);
				console.log('STATUS: Updated tasks');
			});
		}
	} catch (err) {
		console.log('ERR: ' + err);
	} finally {
		res.redirect('/get_user');
	}
});

router.post('/send_task', async(req, res, next) => {
	console.log('STATUS: Adding tasks to a task log')
	var taskname = req.session.taskName,
		tasklist = req.body.task,
		uname = req.session.uName,
		orgnum = req.session.orgNum;
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	try {
		//collections
		const taskCollection = client.db('task_storage').collection('task');
		//if found post
		var query = {taskName: taskname};
		var el = await taskCollection.findOne(query);
		if (el) {
			//generate the message and send it to be updated
			var update_task = {$push: {task: tasklist}};
			taskCollection.updateOne(el, update_task, function(err, res) {
				if (err) console.log('ERR:' + err);
				console.log('STATUS: Updated tasks');
			});
		} else {
			console.log('UPDATE: Creating missing task');
			taskCollection.insertOne({
				taskName: orgnum,
				orgNum: orgnum,
				users: [
					uname
				],
				task: [
					{
						created: Date.now(),
						from: uname,
						description: tasklist.description,
						todo: tasklist.todo
					}
				]
			});
			console.log('STATUS: Created missing task');
		}
	} catch (err) {
		console.log('ERR: ' + err);
	} finally {
		res.end();
	}
});

router.post('/send_text', async(req, res, next) => {
	console.log('STATUS: Adding messages to chat log')
	var text_in = req.body.message,
		uname = req.session.uName,
		orgnum = req.session.orgNum,
		chatname = req.session.chatName;
	if (!client.isConnected()) {
		console.log('STATUS: Server disconnected. Connecting to server.')
		client.connect();
	}
	try {
		//collections
		const chatCollection = client.db('chat_storage').collection('chat_log');
		//if found post
		var query = {chatName: chatname};
		var el = await chatCollection.findOne(query);
		if (el) {
			//generate the message and send it to be updated
			var new_text = {
				created: Date.now(),
				from: uname,
				message: text_in
			};
			var update_text = {$push: {text: new_text}};
			chatCollection.updateOne(el, update_text, function(err, res) {
				if (err) console.log('ERR:' + err);
				console.log('STATUS: Updated messages');
			});
		} else {
			console.log('UPDATE: Creating missing chat');
			chatCollection.insertOne({
				chatName: orgnum,
				orgNum: orgnum,
				users: [
					uname
				],
				text: [
					{
						created: Date.now(),
						from: uname,
						message: text_in
					}
				]
			});
			console.log('STATUS: Created missing chat');
		}
	} catch (err) {
		console.log('ERR:' + err);
	} finally {
		res.end();
	}
});

router.post('/submit_new', async(req, res, next) => {
	console.log('STATUS: Creating new user');
	var uname = req.body.uname,
		email = req.body.email,
		orgnum = req.body.orgnum,
		pwd = req.body.pwd,
		pwd2 = req.body.pwdr;
	//check for valid new user and add if not there
	//connect to mongodb
	//are the passwords matching
	if (pwd == pwd2) {
		if (!client.isConnected()) {
			console.log('STATUS: Server disconnected. Connecting to server.')
			client.connect();
		}	
	 	try {
	 		//get the potential collection
			const userCollection = client.db('user_info').collection('user');
		 	const newCollection = client.db('user_info').collection('user_new');
		 	//if user email collection, add them! remove from potential
		 	var newQuery = {userEmail: email, orgNum: orgnum};
		 	var oldQuery = {userEmail: email, orgNum: orgnum, userName: uname};
		 	var newUser = await newCollection.findOne(newQuery);
		 	var existUser = await userCollection.findOne(oldQuery);
 			if (!existUser) {
 				console.log("UDPATE: Creating user.");
				//add with hash password
				bcrypt.hash(pwd, saltRounds, function(err, hash) {
					if (err) console.log('ERR: ' + err);
					oldCollection.insertOne({
						userName: uname,
						userEmail: email,
						orgNum: orgnum,
						passwordHash: hash,
						chatGroups: [ orgnum ]
					});
					console.log("STATUS: Inserted user");
				});
				//remove
				newCollection.deleteOne(newUser, function(err, del) {
					if (err) console.log('ERR: ' + err);
				});
				//update user to new html page
				//location = 'http://127.0.0.1:4040/index.html'
				res.redirect('/');
			} else {
				//username is in use so, don't redirect
				console.log('ERR: Username already exists');
			}
		} catch(err) {
			console.log('ERR: ' + err);				
		} finally {
			res.end();
		}
	} else {
		console.log('ERR: Passwords do not match');
		res.end();
	}
});

router.post('/update_user', function(req, res) {
	console.log('STATUS: Update user on page');
	if (req.body.groupType == 'chat') req.session.chatName = req.body.groupName;
	if (req.body.groupType == 'task') req.session.taskName = req.body.groupName;
	res.redirect('/get_user');
});

module.exports = router;