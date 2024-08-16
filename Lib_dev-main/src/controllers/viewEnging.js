const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const redisConfig = require('../config/redis');


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
    console.log('Socket connected:', socket.id);

    // check phòng và khỏi taọ hiển thị lại tin nhắn cũ 
    socket.on('join', async (roomId) => {
        try {
            const redisClient = await redisConfig.getRedis();
            if (!redisClient) {
                console.error('Cannot connect to Redis');
                return;
            }
            const messages = await redisClient.lRange('messages', 0, -1);
            const parsedMessages = messages
                .map(mgs => JSON.parse(mgs))
                .filter(msg => msg.roomId === roomId); // lọc tin nhắn phù hợp với ID của phòng 

            // .emit để gửi lại phía cilent phần tin nhắn cũ 
            socket.emit('loadMessages', parsedMessages);
            // 
            socket.join(roomId);
        } catch (error) {
            console.error('Error handling join event:', error);
        }
    });

    // rời phòng
    socket.on('leaverChat', (roomId) => {
        console.log(`${socket.id} left room ${roomId}`);
        socket.leave(roomId);
        io.to(roomId).emit('notification', { message: `User ${socket.id} has left the room` });
    });


    // Gửi tin nhắn 1-1
    socket.on('sendMessage', async ({ user_Id, roomId, message, UserName }) => {
        try {
            // Emit message to the room
            io.to(roomId).emit('sendMessage', { user_Id, message, UserName });
            const redisClient = await redisConfig.getRedis();
            if (!redisClient) {
                console.error('Cannot connect to Redis');
                return;
            }
            const messageToStore = JSON.stringify({ user_Id, roomId, message, UserName });
            await redisClient.rPush('messages', messageToStore);
        } catch (error) {
            console.error('Error handling sendMessage event:', error);
        }
    });

    // socket cho phần tư vấn sản phẩm 
    socket.on('startChat', ({ roomId, user_Id, nameProduct, price, imageProduct, message, userName }) => {
        socket.join(roomId);
        io.to(roomId).emit('startChat', { user_Id, nameProduct, price, imageProduct, message, userName });
    });

    // chat tin nhắn cho phần cộng đồng
    socket.on('chat forum', (msg) => {
        io.emit('chat forum', msg);
    });
});

// Set Socket.io on the app object if needed
app.set('socketio', io);
    
};

module.exports = ViewEngine;