# WebLab: server side documentation

## Function list
|Function|Arguments|Use|
|:---|:---:|:---|
|__socket.on("draw_line")__| *lines*, *c*, *w*, *imageCanvasData* | Emitting line array *lines* periodically. Used for "brush" tool. Line discretisizes to straightforward segments, which added to array *lines*.|  
|__socket.on("draw_straight")__|*point1*, *point2*, *c*, *w*, *imageCanvasData* |Emitting two points for "straight line" tool after "mouse up" event. *point1* is the start of a segment, when *point2* is the end.|
|__socket.on("draw_rect")__|*point1*, *point2*, *c*, *w*, *imageCanvasData* |Emitting two points for "rectangle" tool after "mouse up" event. *point1* and *point2* are  left top corner and right bottom corners of a rectangle respectively. |
|__socket.on("draw_circle")__|*point1*, *radius*, *c*, *w*, *imageCanvasData* | Emitting two points for "circle" tool. *point1* is the center of a circle with *radius*.|
|__socket.on("eraser")__|*lines*, *w*, *imageCanvasData* | Emitting line array *lines* periodically. Used for "eraser" tool. Start- and end-point of each segment is used for **clearRect()** function and delete canvas within it.|
|__socket.on("request_for_image_data")__| *imageCanvasData* | Emitting actual canvas image to all new client connections.|
_______

*c* - color information.  
*w* - width information.  
*imageCanvasData* - string with actual canvas image to keep it on server.