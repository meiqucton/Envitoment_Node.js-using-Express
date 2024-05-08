require('dotenv').config();

const express = require('express');
const app = express();

const ViewEnging = require('./controllers/viewEnging')
const router = require('./router/web')

const port = process.env.PORT || 4212;  
const hostname = process.env.HOST_NAME; 


ViewEnging(app);
app.use(router);

app.listen(port, () => {
    console.log(`Example app listening on http://${hostname}:${port}`);
});