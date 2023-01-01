#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

//all active connections in this object
const clients = {};

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}


function sendMessageToAll(jsonParsedMessage, from) {
    // We are sending the current data to all connected clients
    Object.keys(clients).map((client) => {
        if (client !== from) {
            clients[client].sendUTF(jsonParsedMessage);
        }
    });
}


function sendMessageToUser(jsonParsedMessage, to) {
    // We are sending the current data to a specific client.
    Object.keys(clients).map((client) => {
        if (client === to) {
            clients[client].sendUTF(jsonParsedMessage);
        }

    })

}

wsServer.on('request', function (request) {

    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var userID = request.resource.substr((1), 10);
    var connection = request.accept('echo-protocol', request.origin);

    clients[userID] = connection;
    console.log('clients connected in wsServer: ' + Object.getOwnPropertyNames(clients));
    console.log("connection count: ", connection.socket._server._connections);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function (message) {
        let jsonParsedMessage = JSON.parse(message.utf8Data);
        console.log(jsonParsedMessage, "jsonParsedMessage");
        if (jsonParsedMessage.type === 'utf8') {
            console.log('broadcast user: ' + JSON.stringify(jsonParsedMessage));

            if (jsonParsedMessage.broadcast === "user") {
                sendMessageToUser(JSON.stringify(jsonParsedMessage), jsonParsedMessage.to);

            } else if (jsonParsedMessage.broadcast === "all") {
                sendMessageToAll(JSON.stringify(jsonParsedMessage), jsonParsedMessage.from);
            }
        }
        else if (jsonParsedMessage.type === 'base64') {
            console.log('Message base64: ' + JSON.stringify(jsonParsedMessage));
            let buff = new Buffer.from(jsonParsedMessage.utf8Data, 'base64');
            fs.writeFileSync('test2.jpeg', buff);
        }
    });

    connection.on('close', function (reasonCode, description) {
        console.log("connection count: ", connection.socket._server._connections);
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        console.log("connection socket readyState", connection.socket.readyState);
        delete clients[userID];
        console.log('client connected in wsServer: ' + Object.getOwnPropertyNames(clients));
    });
});