    const redis = require('redis');
    require('dotenv').config();

    let client = {};
    const redisEvents = {
        CONNECT: 'connect',
        ERROR: 'error',
        END: 'end',
        RECONNECTING: 'reconnecting',
    };

    // Function to handle Redis connection events
    const handleRedisEvents = (redisClient) => {
        redisClient.on(redisEvents.CONNECT, () => {
            console.log('Kết nối Redis thành công...');
        });
        redisClient.on(redisEvents.ERROR, (err) => {
            console.error(`Kết nối Redis thất bại: ${err}`);
        });
        redisClient.on(redisEvents.END, () => {
            console.log('Kết thúc kết nối Redis');
        });
        redisClient.on(redisEvents.RECONNECTING, () => {
            console.log('Đang kết nối Redis');
        });
    };

    // kiểm tra kết nối của redis 
    const initRedis = () => {
        const redisClient = redis.createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            password: process.env.REDIS_PASSWORD,
            username: process.env.REDIS_USER
        });

        client.redisClient = redisClient;
        handleRedisEvents(redisClient);

        redisClient.connect().catch(err => {
            console.error('Error connecting to Redis:', err);
        });
    };

    const getRedis = async () => client.redisClient;

    const closeRedis = async () => {
        if (client.redisClient) {
            try {
                await client.redisClient.quit();
                console.log('Redis connection closed.');
            } catch (err) {
                console.error('Error while closing Redis connection:', err);
            }
        }
    };

    module.exports = {
        initRedis,
        getRedis,
        closeRedis,
    };
