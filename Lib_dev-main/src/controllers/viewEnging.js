const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');


const ViewEngine = (app) => {
    // Middleware setup
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));

    app.set('view engine', 'ejs');
    app.set('views', path.join('./src', 'views'));

    app.use(express.static(path.join('./src', 'public')));
    app.use(session({
        secret: 'secret',
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
        resave: false,
        saveUninitialized: false,
    }));
    app.use(flash());
    app.use((req, res, next) => {
        res.locals.messages = req.flash(); // lưu tất cả các flash messages vào res.locals.messages
        next();
    });

    // Socket.io setup
    const http = require('http');
    const socketIo = require('socket.io');
    const server = http.createServer(app);
    const io = socketIo(server);
    
   // Lắng nghe sự kiện kết nối
io.on('connection', (socket) => {
    console.log('connected Socket');

    // Xử lý sự kiện join
    socket.on('join', (UserName) => {
        console.log(` Phòng : ${socket.id} ----  Người Dùng  ${UserName}`);
        socket.join(UserName);
        io.to(UserName).emit('notification', { message: `Người dùng ${UserName} đã vào phòng ` });
    });

    // Xử lý sự kiện rời phòng
    socket.on('leaverChat', (roomId) => {
        console.log(`${socket.id} left room ${roomId}`);
        socket.leave(roomId);
        io.to(roomId).emit('notification', { message: `Người dùng ${roomId} đã rời khỏi phòng ` });
    });

    // Xử lý sự kiện ngắt kết nối
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Xử lý tin nhắn 1-1
    socket.on('sendMessage', ({ user_Id, roomId, message, UserName }) => {
        io.to(roomId).emit('sendMessage', { user_Id, message, UserName });
    });

    // feedback produced by message

    socket.on('startChat', ({roomId, user_Id ,nameProduct, price, imageProduct, message ,userName}) => {
        socket.join(roomId);
        io.to(roomId).emit('startChat', {user_Id ,nameProduct, price, imageProduct, message, userName });
    })
    // Xử lý tin nhắn phòng chat chung
    socket.on('chat forum', (msg) => {
        io.emit('chat forum', msg);
    });
});

    
    // Gán Socket.io vào đối tượng app để truy cập từ bất kỳ đâu
    app.set('socketio', io);

    
};

module.exports = ViewEngine;
