// io = require('socket.io').io;
document.addEventListener("DOMContentLoaded", function() {
      var mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
      };
      // get canvas element and create context
      var canvasDrawing  = document.getElementById('drawingLayer');
      var canvasEvent  = document.getElementById('eventLayer');
      
      // var 
      var context = canvasDrawing.getContext('2d');
      var imageData;


      var width   = parseInt(canvasDrawing.getAttribute('width'));
      var height  = parseInt(canvasDrawing.getAttribute('height'));
      console.log('width=', typeof(width));
      console.log('width=', width);   
      console.log('height=', height);
      var currentTool = 'brush';
      var currentColor;
      var currentSize = 10;
      var socket  = io.connect();

      socket.on('get_server_image_data', function(data) {
            console.log('get_server_image_data, data=')
            console.log(data);
            imageData = data;
            var image = document.createElement("img");
            image.setAttribute("src", imageData);
            var timeout = setTimeout(function() {
                  context.drawImage(image,0,0);
            }, 200);
            console.log(image);
      });
      socket.emit('request', imageData);                              imageData = canvasDrawing.toDataURL('png', 1);
      imageData = canvasDrawing.toDataURL('png', 1);      
      // socket.emit('draw_line', {
      //       line: [ mouse.pos, mouse.pos_prev ],
      //       dataArray: imageData
      // });
      function figureChanged(event) {
            currentTool = event.target.getAttribute('data');
            console.log('currentTool', currentTool);
      }
      document.getElementById('brush').addEventListener("click", figureChanged);
      document.getElementById('line').addEventListener("click", figureChanged);
      document.getElementById('rect').addEventListener("click", figureChanged);
      document.getElementById('circle').addEventListener("click", figureChanged);
      document.getElementById('eraser').addEventListener("click", figureChanged);
      

      canvasEvent.onmousedown = function(e){
            mouse.click = true;
      };
      canvasEvent.onmouseup = function(e){
            console.log('canvasEvent.onmouseup');
            mouse.click = false;
            imageData = canvasDrawing.toDataURL('png', 1);
            console.log("imageData=");
            console.log(imageData);
            socket.emit('post_server_image_data', imageData);
      };

      canvasEvent.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
            mouse.pos.x = e.offsetX / width;
            mouse.pos.y = e.offsetY / height;
            mouse.move = true;
      };

      // draw line received from server
      socket.on('draw_line', function (data) {
            var line = data.line;
            context.beginPath();
            context.moveTo(line[0].x * width, line[0].y * height);
            context.lineTo(line[1].x * width, line[1].y * height);
            context.stroke();
            // console.log(context.getImageData(0,0,width,height).data.length);
            // console.log("type=", typeof(console.log(context.getImageData(0,0,width,height).data)));
      });

      socket.on('eraser', function (data) {
            var line = data.line;
            context.clearRect(line[0].x * width - currentSize/2, line[0].y * height - currentSize/2, currentSize, currentSize);
      });
      
      // socket.on('clear_server_data', function () {});           

      // main loop, running every 25ms
      function mainLoop() {
            switch (currentTool) {
                  case 'brush': {
                        if (mouse.click && mouse.move && mouse.pos_prev) {
                              // send line to to the server
                              imageData = canvasDrawing.toDataURL('png', 1);
                              // console.log(imageData);
                              socket.emit('draw_line', {
                                    line: [ mouse.pos, mouse.pos_prev ],
                                    dataArray: imageData
                              });
                              mouse.move = false;
                        }
                  }
                  case 'line': {

                  }
                  case 'rect': {
                        
                  }
                  case 'circle': {
                        
                  }
                  case 'eraser': {
                        if (mouse.click && mouse.move && mouse.pos_prev) {
                              console.log('eraser on');
                              imageData = canvasDrawing.toDataURL('png', 1);                              
                              // send line to to the server
                              socket.emit('eraser', {
                                    line: [ mouse.pos, mouse.pos_prev ],
                                    dataArray: imageData
                              });
                              mouse.move = false;
                        }                        
                  }
            }
            mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
            socket.emit('clear_server_data');
            setTimeout(mainLoop, 25);
      }
      mainLoop();
});