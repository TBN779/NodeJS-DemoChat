var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require('http').Server(app);
var io = require("socket.io")(server);
server.listen(3000, function () {
	console.log("Server listening on port 3000.");
});


var usersArray=["tung"];

io.on("connection", function(socket){
    console.log("Incoming connection " + socket.id);

    socket.on("client-send-username", function(user){
        if(usersArray.indexOf(user) >=0) { //registration failed            
            socket.emit("server-send-registration-failed");            
        } else { //registration successful    
            usersArray.push(user);
            socket.username = user; //create a new property named username
            socket.emit("server-send-registraction-successful", user);
            io.sockets.emit("server-send-list-users", usersArray);
        }
    });

    socket.on("logout", function(){
        usersArray.splice(
            usersArray.indexOf(socket.username), 1
        );
        socket.broadcast.emit("server-send-list-users", usersArray);
    });

    socket.on("user-send-message", function(message){
        io.sockets.emit("server-send-messages", {user:socket.username, content:message});
    });

    socket.on("typing", function(){
        var notificationMsg = socket.username + " is typing...";
        io.sockets.emit("someone-is-typing", notificationMsg);
    });
    socket.on("loss-of-focus", function(){
        // io.sockets.emit("someone-loss-of-typing");
    });
});

app.get("/", function(req, res){
    res.render("home");
});