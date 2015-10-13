var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)

//for production
//http://www.jamie-white.com/html5/setting-up-socket-io-for-production/

//people object for storing username
var people = {};

//express app
app.get('/', function (req, res){
	res.sendFile(__dirname + '/index.html');
});

//handle socket connection 
io.on('connection', function (socket){
	console.log('user connected on socket: '+socket.id);
	
	//broadcast on connect
	socket.broadcast.emit('chat message', "User connected");

	//handle disconnect
	socket.on('disconnect', function () {
		console.log('user disconnected');
		
		//broadcast on disconnect
		io.emit('chat message', 'User disconnected');
	});

	//handle join
	socket.on('join', function (name){
		people[socket.id] = name;
		io.sockets.emit('chat message', "User "+ name +" connected");
	});

	//handle chat message
	socket.on('chat message', function (msg){
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});	
});

//setup the server to listen
http.listen(3000, function () {
	console.log('listening on *:3000');
});

//get input and broadcast it
var stdin = process.openStdin();
stdin.addListener("data", function(d) {
	console.log("broadcasting message: "+d.toString().trim());
	io.emit('chat message', d.toString().trim());
});
