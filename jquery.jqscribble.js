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
	jqScribbleBrush.prototype.init = function(context, brushSize, brushColor)
	{
		this.context = context;
		this.context.globalCompositeOperation = 'source-over';
		this.brushSize = brushSize;
		this.brushColor = brushColor;
		this.prevX = null; 
		this.prevY = null;
		this.moved = false;
	}
	jqScribbleBrush.prototype.update = function(options)
	{
		if(options.brushSize)this.brushSize = options.brushSize;
		if(options.brushColor)this.brushColor = options.brushColor;
	}
	jqScribbleBrush.prototype.strokeBegin = function(x, y){};
	jqScribbleBrush.prototype.strokeMove = function(x, y)
	{
		if(this.moved === false && this.prevX != null && this.prevY != null)this.moved = true;
	};
	jqScribbleBrush.prototype.strokeEnd = function()
	{
		if(this.moved)
		{
			this.moved = false;
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
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.prevX = x; 
		this.prevY = y;
		this.context.beginPath();
	}
	
	BasicBrush.prototype.strokeMove = function(x, y)
	{
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);
		if(this.prevX != null && this.prevY != null)
		{
			this.context.lineWidth = this.brushSize;
			
			this.context.moveTo(this.prevX, this.prevY);
			this.context.lineTo(x, y);
			
			this.context.strokeStyle = this.brushColor;
			this.context.stroke();
			
			this.prevX = x;
			this.prevY = y;
		}
	}
	
	BasicBrush.prototype.strokeEnd = function()
	{
		this.prevX = null;
		this.prevY = null;
		return jqScribbleBrush.prototype.strokeEnd.call(this);
	}
}

function BasicCanvasSave(imageData){window.open(imageData,'My Image');}

(function($)
{	
	var settings = {
		width:				300,
		height: 			250,
		backgroundImage:	false,
		backgroundImageX: 	0,
		backgroundImageY: 	0,
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
		
		//If the container isn't already a canvas then append the canvas we created
		if(!noparent)this.append(this.jqScribble.canvas);
		
		if(settings.backgroundImage)
		{
			addImage(context);
			this.jqScribble.blank = false;
		}
		
		brush = new settings.brush();
		brush.init(context, settings.brushSize, settings.brushColor);
		
		var self = this;
		
		if(brush.strokeBegin && brush.strokeMove && brush.strokeEnd)
		{
			//Have to add touch events the old fashioned way since 
			//jquery removes that stuff from the event object.
			this.jqScribble.canvas.addEventListener("touchstart", function(e)
			{
				var o = self.offset();
				e.preventDefault();
				if(e.touches.length == 1)brush.strokeBegin(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);
			}, false);
			this.jqScribble.canvas.addEventListener("touchmove",  function(e)
			{
				var o = self.offset();
				e.preventDefault();
				if(e.touches.length == 1)brush.strokeMove(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);
			}, false);
			this.jqScribble.canvas.addEventListener("touchend",   function(e)
			{
				e.preventDefault();
				if(e.touches.length == 0)
				{
					var moved = !brush.strokeEnd();
					if(self.jqScribble.blank !== false)self.jqScribble.blank = moved;
				}
			}, false);
		
			$(this.jqScribble.canvas).bind("mousedown", function(e)
			{
				var o = self.offset();
				brush.strokeBegin(e.pageX-o.left, e.pageY-o.top);
			});
			$(this.jqScribble.canvas).bind("mousemove", function(e)
			{
				var o = self.offset();
				brush.strokeMove(e.pageX-o.left, e.pageY-o.top);
			});
			$(this.jqScribble.canvas).bind("mouseup",   function(e)
			{
				var moved = !brush.strokeEnd();
				if(self.jqScribble.blank !== false)self.jqScribble.blank = moved;
			});
			$(this.jqScribble.canvas).bind("mouseout",   function(e)
			{
				var moved = !brush.strokeEnd();
				if(self.jqScribble.blank !== false)self.jqScribble.blank = moved;
			});
		}
	};
	
	$.fn.jqScribble.update = function(options)
	{
		var newImg = !!options.backgroundImage;
		var newWidth = !!options.width;
		var newHeight = !!options.height;
		$.extend(settings, options);
		
		var context = this.canvas.getContext("2d");	
		if(newImg)
		{
			addImage(context);
			this.blank = false;
		}
		brush.init(context, settings.brushSize, settings.brushColor);
		
		if(newWidth)this.canvas.width = settings.width;
		if(newHeight)this.canvas.height = settings.height;
	}
	
	$.fn.jqScribble.clear = function()
	{
		var context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.blank = true;
	}
	$.fn.jqScribble.save = function()
	{
		if(!this.blank)settings.saveFunction(this.canvas.toDataURL(settings.saveMimeType));
	}
})(jQuery);