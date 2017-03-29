
var express = require('express')
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static(__dirname));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
var engines = require('consolidate');
app.engine('html', engines.hogan);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
var roomBox = new Array();
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://chatroom.db');
var createQ = conn.query('CREATE TABLE message (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT, nickname TEXT, body TEXT, time INTEGER)', function(error, data){
  // console.log('table success');
});

var createQ2 = conn.query('CREATE TABLE roomNum (room TEXT, createTime INTEGER)', function(error, data){
  // console.log('table2 success');
});


io.sockets.on('connection', function(socket){
    // clients emit this when they join new rooms
    socket.on('join', function(roomName, nickname, callback){
        socket.join(roomName);
        socket.roomName = roomName;
        socket.nickname = nickname;

        // get a list of members currently in the room, then send it back
        var memberList = io.sockets.adapter.rooms[roomName].sockets;
        var members = new Array();
        var numClients = (typeof memberList !== 'undefined') ? Object.keys(memberList).length : 0;
        for (var memberId in memberList ) {
             if(memberId != socket.id) {
                 var clientSocket = io.sockets.connected[memberId];
                 members.push(clientSocket.nickname);
             }
        }
        // console.log(members+"\n");
        broadcastMemberJoined(roomName, nickname, numClients);
        var messages;
        var g = getMessage(roomName, function(messages){
            // console.log(messages);
            callback(messages, members, numClients);
        });
    });

    // this gets emitted if a user changes their nickname
    socket.on('nickname', function(nickname){
        var Onickname = socket.nickname;
        var roomName = socket.roomName;
        socket.nickname = nickname;
        broadcastNicknameChanged(roomName, Onickname, nickname);
    });

    // the client emits this when they want to send a message
    socket.on('message', function(message, id){
        var roomName = Object.keys(io.sockets.adapter.sids[socket.id])[1];
        var time = new Date();
        var formatTime= time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate() + " " +  time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        insertMessage(roomName, socket.nickname, message, formatTime)
        // send the message to users!
        // console.log(socket.nickname+ message+formatTime);
        io.sockets.in(roomName).emit('message', socket.nickname, message, formatTime, id);
    });

    // the client disconnected/closed their browser window
    socket.on('disconnect', function(){
        // console.log("dis");
        broadcastMemberLeaved(socket.roomName, socket.nickname);
    });

    // an error occured with sockets
    socket.on('error', function(){
        // Don't forget to handle errors!
        // Maybe you can try to notify users that an error occured and log the error as well.
    });

});

function broadcastMemberJoined(roomName, nickname, numClients){
    io.sockets.in(roomName).emit('newMember', nickname, numClients);
}

function broadcastMemberLeaved(roomName, nickname){
    io.sockets.in(roomName).emit('leave', nickname);
}

function broadcastNicknameChanged(roomName, Onickname, nickname){
    io.sockets.in(roomName).emit('nickname', Onickname, nickname);
}

app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
});

app.get('/new', function(request, response){
  var newName = generateRoomIdentifier();
  while(roomBox.contains(newName)) {
      newName = generateRoomIdentifier();
  }
  roomBox.push(newName);
  var time = new Date().getTime();
  var sql = "INSERT INTO roomNum VALUES($1, $2)";
  var insroom = conn.query(sql, [newName, time]);
  response.render('room.html', {roomName: newName});
});

app.get('/getRoom', function(request, response){
    var messages;
    var sql = 'SELECT room FROM roomNum ORDER BY createTime DESC';
    var q = conn.query(sql, function(error, result){
        messages = result.rows;
        response.json(messages);
    });
});

function getMessage(roomName, callback){
    var sql = 'SELECT id, nickname, body, time FROM message WHERE room=$1 ORDER BY time ASC';
    var q = conn.query(sql, [roomName], function(error, result){
        callback(result.rows);
    });
    // console.log(messages);
}

function insertMessage(roomName, nickname, message, time){
    var sql = "INSERT INTO message VALUES(NULL, $1, $2, $3, $4)";
    var q = conn.query(sql, [roomName, nickname, message, time], function(){
    // console.log('success');
    });
}

app.get('/:roomName', function(request, response){
  response.render('room.html', {roomName: request.params.roomName});
});

Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}

function generateRoomIdentifier() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var result = '';
  for (var i = 0; i < 6; i++) {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

server.listen(8080);
