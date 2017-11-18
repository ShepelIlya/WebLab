document.addEventListener("DOMContentLoaded", function() {
      var mouse = {                 // object for saving data of mouse interaction
            click: false,
            move: false,
            pos: {x:0, y:0},
            pos_start: {x:0, y:0},
            pos_prev: false
      };
      // get canvas element and create context
      var canvasDrawing  = document.getElementById('drawingLayer'); // canvas with image
      var canvasEvent  = document.getElementById('eventLayer'); // canvas for event handling
      
      var context = canvasDrawing.getContext('2d'); 
      var contextEvent = canvasEvent.getContext('2d'); 
      var imageData;   // canvas data received from server
      var width   = parseInt(canvasDrawing.getAttribute('width')); 
      var height  = parseInt(canvasDrawing.getAttribute('height'));
      var currentTool = 'brush';
      var currentColor = '#000000';
      var currentSize = 10;
      var socket  = io.connect();

      // handler for message "get_server_image_data"
      socket.on('get_server_image_data', function(data) {
            imageData = data;
            var image = document.createElement("img");
            image.setAttribute("src", imageData);
            var timeout = setTimeout(function() {
                  context.drawImage(image,0,0);
            }, 200);
      });
      
      // getting actual canvas data after connecting to a server
      socket.emit('request_for_image_data', imageData);
      imageData = canvasDrawing.toDataURL('png', 1);

      // event listener for changing tools
      function toolChanged(event) {
            currentTool = event.target.getAttribute('data');
            var listOfTools = [];
            listOfTools = document.getElementsByClassName('tool');
            for (var i=0; i<listOfTools.length; i++) {
                  if (listOfTools[i].classList.contains('current')) 
                        listOfTools[i].setAttribute('class', listOfTools[i].getAttribute('class').slice(0, -8));
            }
            var currentToolElement = document.getElementById(currentTool);
            currentToolElement.setAttribute('class', currentToolElement.getAttribute('class')+' current');            
      }

      document.getElementById('brush').addEventListener("click", toolChanged);
      document.getElementById('line').addEventListener("click", toolChanged);
      document.getElementById('rect').addEventListener("click", toolChanged);
      document.getElementById('circle').addEventListener("click", toolChanged);
      document.getElementById('eraser').addEventListener("click", toolChanged);

      // event listener for changing tool sizes
      var listOfSizes = [];
      listOfSizes = document.getElementsByName('thickness');
      for (var i=0; i<listOfSizes.length; i++) {
            listOfSizes[i].addEventListener('click', (event)=>{
                  currentSize = event.target.value;
            })
      }

      // event listener for changing current color
      document.getElementById('color').addEventListener('blur', (event)=> {
            currentColor = event.target.value;
      })

      // saving mouse position on mouse down event
      canvasEvent.onmousedown = function(e){
            mouse.click = true;
            mouse.pos_start.x = e.offsetX;
            mouse.pos_start.y = e.offsetY;
      };

      // drawing figures on canvas on mouse up event
      canvasEvent.onmouseup = function(e){
            mouse.click = false;
            imageData = canvasDrawing.toDataURL('png', 1);

            canvasEvent.width = canvasEvent.width; // clearing canvas for event handling

            switch (currentTool) {
                  case 'rect': {
                        drawRect(context, 
                              { x : mouse.pos_start.x, y : mouse.pos_start.y},
                              { x : mouse.pos.x, y : mouse.pos.y}, 
                              canvasEvent, 
                              currentColor, 
                              currentSize
                        );
                        imageData = canvasDrawing.toDataURL('png', 1);                        
                        socket.emit('draw_rect', {x: mouse.pos_start.x, y: mouse.pos_start.y}, {x: mouse.pos.x, y: mouse.pos.y}, currentColor, currentSize, imageData);
                        break;
                  }
                  case 'circle': {
                        drawCircle(context, 
                              { x : mouse.pos_start.x, y : mouse.pos_start.y },
                              { x : mouse.pos.x, y : mouse.pos.y }, 
                              canvasEvent, 
                              currentColor, 
                              currentSize
                        );
                        imageData = canvasDrawing.toDataURL('png', 1);                        
                        socket.emit('draw_circle', {x: mouse.pos_start.x, y: mouse.pos_start.y}, {x: mouse.pos.x, y: mouse.pos.y}, currentColor, currentSize, imageData);
                        break;
                  }
                  case 'line': {
                        canvasEvent.width = canvasEvent.width;
                        drawLine({
                              line: [ mouse.pos_start, mouse.pos ],
                              c: currentColor,
                              w: currentSize
                        }, context);
                        socket.emit('draw_straight', {x: mouse.pos_start.x, y: mouse.pos_start.y}, {x: mouse.pos.x, y: mouse.pos.y}, currentColor, currentSize, imageData);                        
                        break;
                  }
            }  
      };

      // redrawing figures on mouse move:
      // clearing previous figure (with mouse.pos_prev position)
      // after draw new figure (with mouse.pos position)
      canvasEvent.onmousemove = function(e) {
            mouse.pos.x = e.offsetX;
            mouse.pos.y = e.offsetY;
            mouse.move = true;
            if (!mouse.click) return;
            contextEvent.fillStyle = currentColor;
            switch (currentTool) {
                  case 'rect': {
                        drawRect(contextEvent, 
                              {x : mouse.pos_start.x, y : mouse.pos_start.y},
                              {x : mouse.pos.x, y : mouse.pos.y},
                              canvasEvent,
                              currentColor,
                              currentSize
                        );
                        break;
                  }
                  case 'circle': {
                        drawCircle(contextEvent,
                              {x : mouse.pos_start.x, y : mouse.pos_start.y},
                              {x : mouse.pos.x, y : mouse.pos.y}, 
                              canvasEvent, 
                              currentColor, 
                              currentSize
                        );
                        break;
                  }
                  case 'line': {
                        canvasEvent.width = canvasEvent.width;
                        drawLine({
                              line: [ mouse.pos_start, mouse.pos ],
                              c: currentColor,
                              w: currentSize
                        }, contextEvent);
                        break;
                  }
            }
      };

      // drawing figures functions
      var drawRect = function (ctx, point1, point2, layerReset, color, size) {
            // line style for rectangle
            context.lineCap="square";
            context.lineJoin = "miter";

            layerReset.width = layerReset.width;
            ctx.beginPath();
            if (size) {
                  ctx.lineWidth = size; 
            }
            if (color){
                  ctx.strokeStyle = color;
            }
            ctx.rect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);
            ctx.stroke(); // ctx.fill();

            // basic line style
            context.lineCap="round";
            context.lineJoin = "round";
      }
      
      var drawCircle = function (ctx, point1, point2, layerReset, color, size) {
            layerReset.width = layerReset.width;
            ctx.beginPath();
            if (size) {
                  ctx.lineWidth = size; 
            }
            if (color){
                  ctx.strokeStyle = color;
                  ctx.fillStyle = color;
            }
            var r = Math.sqrt((point2.x - point1.x) * 
                              (point2.x - point1.x) + 
                              (point2.y - point1.y) * 
                              (point2.y - point1.y));
            ctx.arc(point1.x, point1.y, r, 0, 2 * Math.PI);
            ctx.fill(); // ctx.stroke();
      }

      var drawLine = function(data, context) {         
            var line = data.line;
            context.beginPath();
            context.lineCap="round";
            context.lineJoin = "round";
            context.strokeStyle = data.c;
            context.lineWidth = data.w;            
            context.moveTo(line[0].x, line[0].y);
            context.lineTo(line[1].x, line[1].y);
            context.stroke(); // ctx.fill();
            context.lineWidth = currentSize;
            context.strokeStyle = currentColor;
      };

      // draw line events received from server
      socket.on('draw_line', function (data) {
            drawLine(data, context);
            context.lineWidth = currentSize;
            context.strokeStyle = currentColor;
      });

      // eraser events receiving from server
      socket.on('eraser', function (data) {
            var line = data.line;
            context.clearRect(line[0].x - data.w/2, line[0].y - data.w/2, data.w, data.w);
            context.lineWidth = currentSize; 
            context.strokeStyle = currentColor;
      });

      // draw rect events received from server
      socket.on('draw_rect', function (data) {
            drawRect(context, 
                  { x : data.point1.x, y : data.point1.y}, 
                  { x : data.point2.x, y : data.point2.y}, 
                  canvasEvent, 
                  data.c, 
                  data.w
            );    
            context.lineWidth = currentSize; 
            context.strokeStyle = currentColor;        
      });

      // draw circle events received from server
      socket.on('draw_circle', function (data) {
            drawCircle(context, 
                  { x : data.point1.x, y : data.point1.y}, 
                  { x : data.point2.x, y : data.point2.y},
                  canvasEvent,
                  data.c, 
                  data.w
            );    
            context.lineWidth = currentSize; 
            context.strokeStyle = currentColor;        
      });
      
      // draw straight events received from server
      socket.on('draw_straight', function (data) {
            drawLine(data, context);    
            context.lineWidth = currentSize; 
            context.strokeStyle = currentColor;        
      });
      
      // main loop, running every 25ms
      function mainLoop() {
            switch (currentTool) {
                  case 'brush': {
                        if (mouse.click && mouse.move && mouse.pos_prev) {
                              // send line to to the server
                              imageData = canvasDrawing.toDataURL('png', 1);
                              socket.emit('draw_line', {
                                    line: [ mouse.pos, mouse.pos_prev ],
                                    imageCanvasData: imageData,
                                    c: currentColor,
                                    w: currentSize
                              });
                              mouse.move = false;
                        }
                        break;
                  }
                  case 'eraser': {
                        if (mouse.click && mouse.move && mouse.pos_prev) {
                              imageData = canvasDrawing.toDataURL('png', 1);                              
                              // send eraser to to the server
                              socket.emit('eraser', {
                                    line: [ mouse.pos, mouse.pos_prev ],
                                    imageCanvasData: imageData,
                                    w: currentSize
                              });
                              mouse.move = false;
                        }                        
                        break;
                  }
            }
            mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
            setTimeout(mainLoop, 25);
      }
      mainLoop();
});