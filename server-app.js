var app = require('http').createServer(response);
var fs = require('fs');
var io = require('socket.io')(app);

app.listen(3000);
console.log("Chat initialized...");

var users = [];
var messages = [];

function response (req, res) {
     var file = "";
    
    if(req.url == "/chat"){
        file = __dirname + '/client/index.html';
    }
    
    fs.readFile(file,
        function (error, data) {
            if (error) {
                res.writeHead(404);
                   return res.end('Error: Page or file not found');
            }
            res.writeHead(200);
            res.end(data);
        }
     );
}

function getActualDate(){
 var actual_date = new Date();

 var day = (actual_date.getDate()<10 ? '0' : '') + actual_date.getDate();
 var month = ((actual_date.getMonth() + 1)<10 ? '0' : '') + (actual_date.getMonth() + 1);
 var year = actual_date.getFullYear();

 var hour = (actual_date.getHours()<10 ? '0' : '') + actual_date.getHours();
 var minute = (actual_date.getMinutes()<10 ? '0' : '') + actual_date.getMinutes();
 var second = (actual_date.getSeconds()<10 ? '0' : '') + actual_date.getSeconds();

 var formatted_date = day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;

 return formatted_date;
}

io.on("connection", function(socket){
    socket.on("login", function(nick, callback){
        if(!(nick in users)){
             socket.nick = nick;
             users[nick] = socket;

             io.sockets.emit("update users", Object.keys(users));
             var message_object = {message: "[ " + getActualDate() + " ] " + socket.nick + " entered the room!", type: 'system'}

             io.sockets.emit("update messages", message_object);
             messages.push(message_object);

             callback(true);
        }else{
             callback(false);
        }
    });
    socket.on("send message", function(data, callback){
        var message_sent = data.message;
        var user = data.user;
        if(user == null)
            user = '';
        message_sent = "[ " + getActualDate() + " ] " + socket.nick + " says: " + message_sent;

        if(user == ''){
                io.sockets.emit("update messages", {message: message_sent, type:''});
                messages.push({message: message_sent, type:''});
        }else{
                socket.emit("update messages", {message: message_sent, type:'private'});
                users[user].emit("update messages", {message: message_sent, type:'private'});
        }

        callback();
    });

    socket.on("disconnect", function(){
        delete users[socket.nick];
        io.sockets.emit("update users", Object.keys(users));
        io.sockets.emit("update messages", {message: "[ " + getActualDate() + " ] " + socket.nick + " left the room!", type: 'system'});
        messages.push({message: "[ " + getActualDate() + " ] " + socket.nick + " left the room!", type: 'system'});
    });
});