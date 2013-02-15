jqScribble
==========

jqScribble is a jquery plugin that will allow you to draw on an HTML5 canvas element. It works with standard mouse input and also touch input. It is designed to be extremely extensible, allowing for custom brushes and image saving. I have also provided with this plugin a sample PHP file that will demonstrate turning drawn images into actual images.

Usage
-----
To use the jqScribble plugin first select a jquery element to attach to scribble canvas to. Then specify any options you wish.
```js
$('#test').jqScribble(options);
```
Available Options
-----------------
width: The width of the Canvas element if not specified then the width of the parent is used
DEFAULT - 300

height: The height of the Canvas element if not specified then the height of the parent is used.
DEFAULT - 250

backgroundImage: An image to add to the background of the canvas. 
DEFAULT - false

backgroundImageX: The X offset in the canvas to put the specified background image
DEFAULT - 0

backgroundImageY: The Y offset in the canvas to put the specified background image
DEFAULT - 0

backgroundColor: The hex color value to set the background as.
DEFAULT - #ffffff

saveMimeType: If the image is saved the mime type that will be used.
DEFAULT - image/png

saveFunction: The function to use when saving the drawing.
DEFAULT - BasicCanvasSave

brush: The brush to used when drawing on the Canvas.
DEFAULT - BasicBrush

brushSize: The size of the brush that is used.
DEFAULT - 2

brushColor: The color of the brush stroke.
DEFAULT - rgb(0,0,0)

Creating Brushes
----------------
New brushes should inherit from the jqScribbleBrush object as follows:
```js
NewBrush.prototype = new jqScribbleBrush.
NewBrush(){...}
```
They should also implement the following methods:
```js
strokeBegin(x, y)
strokeMove(x, y)
```
and can optionally implement
```js
strokeEnd()
```
Image Saving
------------
A save function will be passed the image data of the canvas, provided the canvas is not empty.
```js
function mySave(imageData)
```
The specified save function will not be called until the canvas is not empty and you call the jqScribble save function. 
```js
$('...').data('jqScribble').save()
```
You can also specify a save function at the time of saving by calling save with a function parameter.
```js
$('...').data('jqScribble').save(function(imageData){...});
```
The save method is chainable with other jqScribble methods.

Updating jqScribble Options
---------------------------
Updates can be passed to the jqscribble by calling
```js
$('...').data('jqScribble').update(options)
```
Where options are any of the original options specified above.
The update method is chainable with other jqScribble methods.

Clearing The Canvas
-------------------
To reset the canvas call 
```js
$('...').data('jqScribble').clear()
```
The clear method is chainable with other jqScribble methods.

jqScribble Attributes
---------------------
You can also access the canvas element jqScribble is using by calling
```js
$('...').data('jqScribble').canvas
```
You can check if the canvas has been drawn on by checking 
```js
$('...').data('jqScribble').blank
```
To get the brush object that jqScribble is currently using
```js
$('...').data('jqScribble').brush
```