/*
Copyright (C) 2011 by Jim Saunders

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
function jqScribbleBrush()
{
	jqScribbleBrush.prototype._init = function(context, brushSize, brushColor)
	{
		this.context = context;
		this.context.globalCompositeOperation = 'source-over';
		this.brushSize = brushSize;
		this.brushColor = brushColor;
		this.drawn = false;
		this.active = false;
	};
	
	//For custom brushes override this method and perform 
	//any action to prepare the brush for drawing.
	jqScribbleBrush.prototype.strokeBegin = function(x, y)
	{
		this.active = true;
		this.context.beginPath();
		this.context.lineWidth = this.brushSize;
	};
	
	//For custom brushes override this method and perform
	//any action that the brush does while drawing.
	jqScribbleBrush.prototype.strokeMove = function(x, y){this.drawn = this.active;};
	
	//For custom brushes override this method to perform
	//any action to reset the brush once drawing is complete
	jqScribbleBrush.prototype.strokeEnd = function()
	{
		this.active = false;
		if(this.drawn)
		{
			this.drawn = false;
			return true;
		}
		return false;
	};
}
//All brushes should inherit from the Brush interface
BasicBrush.prototype = new jqScribbleBrush;
function BasicBrush()
{
	BasicBrush.prototype.strokeBegin = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.prevX = x; 
		this.prevY = y;
	};
	
	BasicBrush.prototype.strokeMove = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);
					
		this.context.moveTo(this.prevX, this.prevY);
		this.context.lineTo(x, y);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
		
		this.prevX = x;
		this.prevY = y;
	};
}

function BasicCanvasSave(imageData){window.open(imageData,'jqScribble Image');}

(function($)
{	
	//These are the default settings if none are specified.
	var settings = {
		width:				300,
		height: 			250,
		backgroundImage:	false,
		backgroundImageX: 	0,
		backgroundImageY: 	0,
		backgroundColor:	"#ffffff",
		saveMimeType: 		"image/png",
		saveFunction: 		BasicCanvasSave,
		brush:				BasicBrush,
		brushSize:			2,
		brushColor:			"rgb(0,0,0)"
	};
	
	var brush = null;
	
	function addImage(context)
	{
		var img = new Image();
		img.src = settings.backgroundImage;
		img.onload = function(){context.drawImage(img, settings.backgroundImageX, settings.backgroundImageY);}
	}
	
	$.fn.jqScribble = function(options) 
	{
		//Check if the container is a canvas already. If it is
		//then we need the canvas DOM element otherwise we make
		//a new canvas element to use.
		this.jqScribble.blank = true;
		var noparent = this.is('canvas');
		if(noparent)this.jqScribble.canvas = this[0];
		else this.jqScribble.canvas = document.createElement("canvas");
		
		var context = this.jqScribble.canvas.getContext("2d");
		$.extend(settings, options);
		
		//The canvas will take the inner dimensions 
		//of the element it will be attached to, or
		//the settings value if the dims aren't large
		//enough to make a valid drawing area.
		var width = this.innerWidth();
		var height = this.innerHeight();
		if(noparent)
		{
			width = this.parent().width();
			height = this.parent().height();
		}
		if(width < 2)width = settings.width;
		if(height < 2)height = settings.height;
		
		this.jqScribble.canvas.width = width;
		this.jqScribble.canvas.height = height;
		
		this.jqScribble.clear();
		
		//If the container isn't already a canvas then append the canvas we created
		if(!noparent)this.append(this.jqScribble.canvas);
		
		if(settings.backgroundImage)
		{
			addImage(context);
			this.jqScribble.blank = false;
		}
		
		brush = new settings.brush();
		brush._init(context, settings.brushSize, settings.brushColor);
		
		var self = this;
		
		if(brush.strokeBegin && brush.strokeMove && brush.strokeEnd)
		{
			//Have to add touch events the old fashioned way since 
			//jquery removes that stuff from the event object.
			this.jqScribble.canvas.addEventListener("touchstart", function(e)
			{
				var o = self.offset();
				e.preventDefault();
				if(e.touches.length > 0)brush.strokeBegin(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);
			}, false);
			this.jqScribble.canvas.addEventListener("touchmove",  function(e)
			{
				var o = self.offset();
				e.preventDefault();
				if(e.touches.length > 0 && brush.active)brush.strokeMove(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);
			}, false);
			this.jqScribble.canvas.addEventListener("touchend",   function(e)
			{
				e.preventDefault();
				if(e.touches.length == 0)self.jqScribble.blank = !brush.strokeEnd() && self.jqScribble.blank;
			}, false);
		
			$(this.jqScribble.canvas).bind("mousedown", function(e)
			{
				var o = self.offset();
				brush.strokeBegin(e.pageX-o.left, e.pageY-o.top);
			});
			$(this.jqScribble.canvas).bind("mousemove", function(e)
			{
				var o = self.offset();
				if(brush.active)brush.strokeMove(e.pageX-o.left, e.pageY-o.top);
			});
			$(this.jqScribble.canvas).bind("mouseup mouseout",  function(e){self.jqScribble.blank = !brush.strokeEnd() && self.jqScribble.blank;});
		}
	};
	
	$.fn.jqScribble.update = function(options, reset)
	{
		var newBg = !!options.backgroundColor;
		var newImg = !!options.backgroundImage;
		var newWidth = !!options.width;
		var newHeight = !!options.height;
		var newBrush = !!options.brush;
		$.extend(settings, options);
		
		var context = this.canvas.getContext("2d");
		
		if(newBrush)brush = new settings.brush();
		brush._init(context, settings.brushSize, settings.brushColor);
		
		if(newWidth)this.canvas.width = settings.width;
		if(newHeight)this.canvas.height = settings.height;
		if(newBg || newImg || newWidth || newHeight || reset)this.clear();
		if(newImg)
		{
			addImage(context);
			this.blank = false;
		}
		return this;
	};
	
	$.fn.jqScribble.clear = function()
	{
		var context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		context.fillStyle = settings.backgroundColor;
		context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.blank = true;
		return this;
	};
	
	$.fn.jqScribble.save = function(newSave)
	{
		var saveFunction = settings.saveFunction;
		if(typeof newSave === 'function')saveFunction = newSave;
		
		if(!this.blank)saveFunction(this.canvas.toDataURL(settings.saveMimeType));
		return this;
	};
	
})(jQuery);