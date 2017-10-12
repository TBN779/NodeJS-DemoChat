var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require('http').Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT || 3000, function () {
    console.log("Server listening on port 3000.");
});

var usersArray = [];
var typingArray = [];

io.on("connection", function (socket) {
    console.log("Incoming connection " + socket.id);

    socket.on("client-send-username", function (user) {
        if (usersArray.indexOf(user) >= 0) { //registration failed            
            socket.emit("server-send-registration-failed");
        } else { //registration successful    
            usersArray.push(user);
            socket.username = user; //create a new property named username
            socket.emit("server-send-registraction-successful", user);
            io.sockets.emit("server-send-list-users", usersArray);
        }
    });

    socket.on("logout", function () {
        usersArray.splice(
            usersArray.indexOf(socket.username), 1
        );
        socket.broadcast.emit("server-send-list-users", usersArray);
    });

    socket.on("user-send-message", function (message) {
        io.sockets.emit("server-send-messages", { user: socket.username, content: message });
        typingArray.splice(typingArray.indexOf(socket.username), 1);
        var notificationMsg = "";
        if (typingArray.length > 0) {
            var notificationMsg = typingArray.toString() + " is typing...";
        }
        io.sockets.emit("someone-is-typing", notificationMsg);
    });

    socket.on("typing", function () {
        if (typingArray.indexOf(socket.username) < 0) {
            typingArray.push(socket.username);
            var notificationMsg = typingArray.toString() + " is typing...";
            io.sockets.emit("someone-is-typing", notificationMsg);
        }
    });
});

app.get("/", function (req, res) {
    res.render("home");
});