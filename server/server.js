var express = require('express'), 
app = express(),
http = require('http'),
socketIo = require('socket.io');
var fs = require('fs');

// start webserver on port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// add directory with our static files
app.use(express.static('C:/WebLab/client'));
console.log("Server running on 127.0.0.1:8080");

var imageData = "";
// event-handler for new incoming connections
io.on('connection', function (socket) {
    
    // first send the canvas data to the new client
    socket.on('request', function (data) {
        console.log("request");
        console.log(imageData);
        io.emit('get_server_image_data', imageData);
    });

    socket.on('post_server_image_data', function (data) {
        console.log('post_server_image_data');
        if (!data) {
            console.log('imageData is empty');
            return;
        }
        imageData = data;
        var img = imageData.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(img, 'base64');
        fs.writeFile('fileName.png', buf);
        io.emit('get_server_image_data', imageData);
    });

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // вот тут короче в файл записываем
        imageData = data.dataArray;
        var img = imageData.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(img, 'base64');
        fs.writeFile('fileName.png', buf);
        // send line to all clients
        io.emit('draw_line', { line: data.line, });
    });

    socket.on('eraser', function (data) {
        imageData = data.dataArray;
        var img = imageData.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(img, 'base64');
        fs.writeFile('fileName.png', buf);
        // send line to all clients
        io.emit('eraser', { line: data.line });
    });

    // socket.on('clear_server_data', function(){
    //     imageData = '';
    // });
    
});