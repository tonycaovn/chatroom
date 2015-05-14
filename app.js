var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection',function(client){
	console.log('Client connected');
	client.on('messages',function(data){ // when server receive message
		var nickname = client.nickname;
		client.broadcast.emit("messages",nickname+":"+data);
		client.emit("messages",nickname+":"+data);
	});
	client.on('join',function(name){ // when server receive message
		console.log("New user: "+name+" join");
		client.nickname = name;
	});
});

app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use("/js", express.static(__dirname + '/client/js'));
app.use("/libs", express.static(__dirname + '/client/libs'));

server.listen(3000);