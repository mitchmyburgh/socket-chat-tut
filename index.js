var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http)

//for production
//http://www.jamie-white.com/html5/setting-up-socket-io-for-production/

//express app
app.get('/', function (req, res){
	res.sendFile(__dirname + '/index.html');
});

//handle socket connection 
io.on('connection', function (socket){
	console.log('user connected on socket: '+socket.id);
	for (var user_soc in io.sockets.sockets){ //for efficiency rather make this a json object and send it
		console.log(io.sockets.sockets[user_soc].nickname);
		socket.emit('online users', io.sockets.sockets[user_soc].nickname);
	}
	//broadcast on connect
	socket.broadcast.emit('chat message', "User connected");

	//handle disconnect
	socket.on('disconnect', function () {
		console.log('user disconnected');
		//console.log(JSON.stringify(io.sockets));
		//broadcast on disconnect
		io.emit('chat message', 'User disconnected');
	});

	//handle join
	socket.on('join', function (name){
		socket.nickname = name;
		socket.broadcast.emit('chat message', "User "+ name +" connected");
	});

	//handle chat message
	socket.on('chat message', function (msg){
		console.log('message: ' + msg);
		socket.broadcast.emit('chat message',socket.nickname+' '+ msg);
	});

	//handle username change
	socket.on('change username', function (name){		
		io.emit('chat message', socket.nickname+" changed to "+name);
		socket.nickname = name;
	});	
	
	//show user typing
	socket.on('typing', function (msg){
		socket.broadcast.emit('typing', socket.nickname+" "+msg);
	});

	//private message
	socket.on('private message', function (msg){
		for (var user_soc in io.sockets.sockets){ //rather store user
			if (io.sockets.sockets[user_soc].nickname === msg.name){
				console.log(user_soc);
				console.log(msg.message);
				socket.broadcast.to(io.sockets.sockets[user_soc].id).emit('private message', msg.message+" (private)")
			} 
			//console.log(io.sockets.sockets[user_soc].nickname);
			//socket.emit('online users', io.sockets.sockets[user_soc].nickname);
		}
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
