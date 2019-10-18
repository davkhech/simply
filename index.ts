import express = require('express');
import createError = require('http-errors');
import cookieParser = require('cookie-parser');
import path = require('path');
import WebSocket = require('ws');

const redis = require("redis"),
    client = redis.createClient();

import { getModels } from "./models";
import usersRouter from "./routes/users";

// Create a new express application instance
const app: express.Application = express();
const http = require('http').createServer(app);
const wss = new WebSocket.Server({ server: http });

const websocketMap = new Map();

wss.on('connection', function connection(ws) {
    let wsid: string = "";

    ws.on('message', function incoming(message) {
        if (message.toString().startsWith('session=')) {
            wsid = message.toString().split('=')[1];
            websocketMap.set(wsid, ws);
        }
        client.get(wsid, function (err: any, nextws: string) {
            let otherClient = websocketMap.get(nextws)
            
            if (otherClient){
                otherClient.send(message);
            }
        });
    });
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

http.listen(3000, async function () {
    await getModels();
    console.log('Example app listening on port 3000!');
});