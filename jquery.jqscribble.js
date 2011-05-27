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
	}
	jqScribbleBrush.prototype.update = function(options)
	{
		if(options.brushSize)this.brushSize = options.brushSize;
		if(options.brushColor)this.brushColor = options.brushColor;
	}
	jqScribbleBrush.prototype.strokeBegin = function(x, y){};
	jqScribbleBrush.prototype.strokeMove = function(x, y){};
	jqScribbleBrush.prototype.strokeEnd = function(){};
}
//All brushes should inherit from the Brush interface
BasicBrush.prototype = new jqScribbleBrush;
function BasicBrush()
{
	BasicBrush.prototype.strokeBegin = function(x, y)
	{
		this.prevX = x; 
		this.prevY = y;
		this.context.beginPath();
	}
	
	BasicBrush.prototype.strokeMove = function(x, y)
	{
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
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	
	function addImage()
	{
		var img = new Image();
		img.src = settings.backgroundImage;
		img.onload = function(){context.drawImage(img, settings.backgroundImageX, settings.backgroundImageY);}
	}
	
	$.fn.jqScribble = function(options) 
	{
		$.extend(settings, options);
		
		//The canvas will take the inner dimensions 
		//of the element it will be attached to, or
		//the settings value if the dims aren't large
		//enough to make a valid drawing area.
		var width = this.innerWidth();
		var height = this.innerHeight();
		if(width < 2)
		{
			this.css("width", settings.width);
			width = settings.width;
		}
		if(height < 2)
		{
			this.css("height", settings.height);
			height = settings.height;
		}
		canvas.width = width;
		canvas.height = height;
		
		this.append(canvas);
		
		if(settings.backgroundImage)addImage();
		
		brush = new settings.brush();
		brush.init(context, settings.brushSize, settings.brushColor);
		
		var self = this;
		
		if(brush.strokeBegin && brush.strokeMove && brush.strokeEnd)
		{
			//Have to add touch events the old fashioned way since 
			//jquery removes that stuff from the event object.
			canvas.addEventListener("touchstart", function(e)
			{
				var o = self.offset();
				e.preventDefault();
				if(e.touches.length == 1)brush.strokeBegin(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);
			}, false);
			canvas.addEventListener("touchmove",  function(e)
			{
				var o = self.offset();
				e.preventDefault();
				if(e.touches.length == 1)brush.strokeMove(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);
			}, false);
			canvas.addEventListener("touchend",   function(e)
			{
				e.preventDefault();
				if(e.touches.length == 0)brush.strokeEnd();
			}, false);
		
			$(canvas).bind("mousedown", function(e)
			{
				var o = self.offset();
				console.log(o);
				brush.strokeBegin(e.pageX-o.left, e.pageY-o.top);
			});
			$(canvas).bind("mousemove", function(e)
			{
				var o = self.offset();
				brush.strokeMove(e.pageX-o.left, e.pageY-o.top);
			});
			$(canvas).bind("mouseup",   function(e)
			{
				brush.strokeEnd();
			});
			$(canvas).bind("mouseout",   function(e)
			{
				brush.strokeEnd();
			});
		}
	};
	
	$.fn.jqScribble.update = function(options)
	{
		var newImg = !!options.backgroundImage;
		$.extend(settings, options);
		
		if(newImg)addImage();
		brush.init(context, settings.brushSize, settings.brushColor);
	}
	
	$.fn.jqScribble.clear = function(){context.clearRect(0, 0, canvas.width, canvas.height);}
	$.fn.jqScribble.save = function(){settings.saveFunction(canvas.toDataURL(settings.saveMimeType));}
})(jQuery);
