var app = require('http').createServer(response);
var fs = require('fs');
var io = require('socket.io')(app);

app.listen(3000);
console.log("Chat initialized...");

var users = [];

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
    socket.on("send message", function(message_sent, callback){
        message_sent = "[ " + getActualDate() + " ]: " + message_sent;
        console.log(message_sent)
        io.sockets.emit("update messages", message_sent);
        callback();
    });
});