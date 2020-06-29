var express = require('express');
var socket = require('socket.io');
require('dotenv').config(); //using dotenv to separate secrets my source code

// reading port number from .env file otherwise by default is 1337
const port = process.env.PORT || 8081;

var app = express();
/** */
/** */
/** */
server = app.listen(port, function () {
    console.log('server is running on port 8080')
});

let onlineUser = {}

io = socket(server);

io.on('connection', (socket) => {
    console.log("socket.id", socket.id);


    /**
     * 
     * As new user  enter his name and click on join button then joined  
     */
    socket.on('ADD_USER', function (data) {
        socket.nickname = data.userName

        if (!onlineUser[socket.nickname]) { // adding user in online list
            socket.emit('ONLINE_USER', onlineUser) //  Sending online user
            onlineUser[socket.nickname] = socket.id
        } else {
            socket.emit("ERROR", "user already exist with this user name, please try differnet one")
        }
    })

    /**
     * Sending friend request to online user
     */
    socket.on('SEND_REQUEST', function (data) {
        data.userId = socket.id
        // console.log("data", data);
        let sendRequestData = {
            friendId: data.userId,
            friendName: data.userName
        }
        io.to(data.friendId).emit('FRIEND_REQUEST', sendRequestData);
    })

    /**
     * by default any  request come to usr we are accepting
     */
    socket.on('ACCEPT_REQUEST', function (data) {
        data.userId = socket.id
        let acceptedRequestData = {
            friendId: data.userId,
            friendName: data.userName
        }
        io.to(data.friendId).emit('ACCEPTED_REQUEST', acceptedRequestData);
    })

    /**
     * Chat functionlity 
     */
    socket.on('SEND_MESSAGE', function (data) {
        data.userId = socket.id
        console.log("data", data);
        const me = "ME"
        let chatData = {
            userId: data.userId,
            userName: data.userName,
            message: data.message
        }
        io.to(data.friendId).emit('MESSAGE', chatData);
        chatData = {
            userId: data.friendId,
            userName: me,
            message: data.message
        }
        io.to(data.userId).emit('MESSAGE', chatData);
    })

    /**
     * If any user leave chat then removing from online user
     */
    socket.on('disconnect', () => {
        delete onlineUser[socket.nickname]
        io.emit('quit', socket.id)
    })
});
