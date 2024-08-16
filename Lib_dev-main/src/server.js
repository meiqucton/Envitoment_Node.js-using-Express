require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const ViewEnging = require('./controllers/viewEnging');
const router = require('./router/web');
const test_redis= require('./config/redis');
const { TestMongoo, TestAPI } = require('./controllers/testConnect');

const app = express();

// Call ViewEnging to set up middleware and socket.io
ViewEnging(app);

// Routes
app.use(router);
// redis
test_redis.initRedis();
// Database connection test
TestMongoo();

// Start server
const port = process.env.PORT || 4212;
const hostname = process.env.HOST_NAME;
const server = app.get('socketio').httpServer;
server.listen(port, () => {
    console.log(`Example app listening on http://${hostname}:${port}`);
});
