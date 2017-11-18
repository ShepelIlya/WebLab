var express = require('express'), 
app = express(),
http = require('http'),
socketIo = require('socket.io');
var fs = require('fs');

// start server on port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);

var dir = __dirname.slice(0, -7)+'\\Client';
app.use(express.static(dir));
console.log("Server running on localhost:8080");

var imageData = "";
// event-handler for new incoming connections
io.on('connection', function (socket) {
    
    // send the canvas data to the new clients
    socket.on('request_for_image_data', function (data) {
        io.emit('get_server_image_data', imageData);
    });

    // handler for message type "draw_line"
    socket.on('draw_line', function (data) {
        imageData = data.imageCanvasData;
        // send line to all clients
        io.emit('draw_line', { line: data.line, c: data.c, w: data.w});
    });

    // handler for message type "draw_rect"
    socket.on('draw_rect', function (point1, point2, c, w, imageCanvasData) {
        imageData = imageCanvasData;
        io.emit('draw_rect', { point1, point2, c, w });
    });

    // handler for message type "draw_circle"
    socket.on('draw_circle', function (point1, point2, c, w, imageCanvasData) {
        imageData = imageCanvasData;
        io.emit('draw_circle', { point1, point2, c, w });
    });

    // handler for message type "draw_straight"
    socket.on('draw_straight', function (point1, point2, c, w, imageCanvasData) {
        imageData = imageCanvasData;
        var data = {
            line: [ point1, point2 ],
            c: c,
            w: w
        }
        io.emit('draw_straight', { line: data.line, c: data.c, w: data.w});
    });
    
    // handler for message type "eraser"
    socket.on('eraser', function (data) {
        imageData = data.imageCanvasData;
        io.emit('eraser', { line: data.line, w: data.w });
    });
});