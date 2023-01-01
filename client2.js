#!/usr/bin/env node
var WebSocketClient = require('websocket').client;
var fs = require('fs');

//var client = new WebSocketClient();
var client2 = new WebSocketClient();

webSocketMaker(client2, 'client2', 'ws://localhost:8080/3012997086');

function webSocketMaker(webSocket, webSocketName, webSocketServer) {
    webSocket.on('connectFailed', function (error) {
        console.log('Connect Error: ' + error.toString());
    });

    webSocket.on('connect', function (connection) {

        console.log('WebSocket Client Connected');
        console.log("connection socket readyState", connection.socket.readyState);
        connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
            console.log("connection socket readyState", connection.socket.readyState);
            connection.socket.removeAllListeners();
        });
        connection.on('message', function (message) {
            console.log(message, "message");
            if (message.type === 'utf8') {
                console.log(webSocketName + " Received: '" + JSON.stringify(message) + "'");
            }
        });

        function sendNumber() {
            if (connection.connected) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                let message = { type: "utf8", broadcast: "user", from: "3012997086", to: "3012997085", utf8Data: number };
                connection.sendUTF(JSON.stringify(message));
                setTimeout(sendNumber, 5000);
            }
        }

        sendNumber();

        function uploadImage() {
            let buff = fs.readFileSync('./test.jpeg');
            let base64data = buff.toString('base64');
            let message = { type: "base64", broadcast: "user", from: "3012997086", to: "3012997085", utf8Data: base64data };
            connection.sendUTF(JSON.stringify(message));
            console.log('Image converted to base 64 is:\n\n' + base64data);
        }

        //uploadImage();

    });

    webSocket.connect(webSocketServer, 'echo-protocol');
}



