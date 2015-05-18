var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var redis = require('redis');
var redisClient = redis.createClient();

var storeMessage = function(name, data){
	var message = JSON.stringify({name:name,data:data});
	redisClient.lpush("messages",message,function(err,res){
		redisClient.ltrim("messages",0,9);
	});
}

io.on('connection',function(client){
	console.log('Client connected');
	client.on('messages',function(data){ // when server receive message
		var nickname = client.nickname;
		client.broadcast.emit("messages",nickname+":"+data);
		client.emit("messages",nickname+":"+data);
		storeMessage(nickname,data)
	});
	client.on('join',function(name){ // when server receive message
		console.log("New user: "+name+" join");
		redisClient.lrange("messages",0,-1,function(err,messages){
			messages = messages.reverse();
			client.nickname = name;
			messages.forEach(function(message){
				message = JSON.parse(message);
				client.emit('messages',message.name + ": " + message.data);
			});
		});

		client.broadcast
		redisClient.sadd("chatters",name)
	});
});

app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use("/js", express.static(__dirname + '/client/js'));
app.use("/libs", express.static(__dirname + '/client/libs'));

server.listen(3000);