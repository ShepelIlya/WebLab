# WebLab: server side documentation

## Function list
|Function|Body|Use|
|:---|:---:|:---|
|__socket.emit("draw_line")__| *lines*, *c*, *w* | Emitting line array *lines* periodically. Used for "brush" tool. Line discretisizes to straightforward segments, which added to array *lines*.|  
|__socket.emit("draw_straight")__|*point1*, *point2*, *c*, *w* |Emitting two points for "straight line" tool after "mouse up" event. *point1* is the start of a segment, when *point2* is the end.|
|__socket.emit("draw_rect")__|*point1*, *point2*, *c*, *w* |Emitting two points for "rectangle" tool after "mouse up" event. *point1* and *point2* are  left top corner and right bottom corners of a rectangle respectively. |
|__socket.emit("draw_circle")__|*point1*, *radius*, *c*, *w* | Emitting two points for "circle" tool. *point1* is the center of a circle with *radius*.|
|__socket.emit("eraser")__|*lines*| Emitting line array *lines* periodically. Used for "eraser" tool. Start- and end-point of each segment is used for **clearRect()** function and delete canvas within it.|
_______
|*c*| color information.|
|*w*| width information.|