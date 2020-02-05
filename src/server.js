//webserver
var express = require('express'),
	https = require('https'),
	socket = require('socket.io'),
	fs = require('fs'),
	path = require('path'),
	routes = require('./routes'),
	session = require('express-session'),
	session_store = require('./mongo_session'),
	uuidv4 = require('uuid/v4'),
	//build app, server, and boot/shutdown functions later
	app = express();

//start session storage
var store = session_store.store;
store.on('err', function(err) {
	if (err) console.log('ERR: ' + err);
});

//middleware
app.use('/css', express.static('/IFT402/css'));
app.use('/src', express.static('/IFT402/src'));
app.use('/img', express.static('/IFT402/img'));
app.use(express.urlencoded({
	extended: true
}));
app.use(express.json());
app.use(session({
	genid: function(req) {
		return uuidv4();
	},
	secret: 'ayylmao',
	cookie: {
		secure: true,
		maxAge: 600000
	},
	store: store,
	resave: false,
	saveUninitialized: false
}));
app.use('/', routes);

//basic set values
app.set('port', process.env.PORT || 8000);

//fail states
app.use((req, res, next) => {
	res.status(404).send("Sorry, doesn't seem to be anything there!");
});

app.use((err, req, res, next) => {
  if (err) console.log('ERR: ' + err.stack);
  res.status(500).send('Something broke!');
});

//boot
var httpsServer = https.createServer({
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt')
}, app).listen(app.get('port'), function() {
	console.info('Server running on local port ' + app.get('port'));
});

var io = socket.listen(httpsServer);
io.on('connection', function(socket) {
	console.log('SOCKET: connected');
	
	//alert on disconnect
	socket.on('disconnect', function() {
		console.log('SOCKET: user disconnected');
	});

	//alert message stuff
	socket.on('message', function(data) {
		console.log('SOCKET: resending message forward');
		io.emit('message_get', data);
	});

	//alert task stuff
	socket.on('task', function(data) {
		console.log('SOCKET: resending task forward');
		io.emit('task_get', data);
	});

	//alert chat addition
	socket.on('new_group', function(data) {
		console.log('SOCKET: resending new group');
		io.emit('group_get', data);
	});
});
