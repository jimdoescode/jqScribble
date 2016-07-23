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
		brushColor:			"rgb(0,0,0)",
    fillOnClear: true
	};
	
	function addImage(context)
	{
		var img = new Image();
		img.src = settings.backgroundImage;
		img.crossOrigin = "Anonymous";
		img.onload = function(){context.drawImage(img, settings.backgroundImageX, settings.backgroundImageY);}
	}

    var jqScribble = function(elm, options)
    {
        var $elm = $(elm);
        var self = this;
        var noparent = $elm.is('canvas');
        var canvas = noparent ? $elm[0] : document.createElement('canvas');
        var context = canvas.getContext('2d');
        var width = $elm.innerWidth();
        var height = $elm.innerHeight();

        $.extend(settings, options);

        if(noparent)
        {
            width = $elm.parent().width();
            height = $elm.parent().height();
        }
        else $elm.append(canvas);

        if(width < 2)width = settings.width;
        if(height < 2)height = settings.height;

        self.blank = true;
        self.canvas = canvas;
        self.canvas.width = width;
        self.canvas.height = height;
        self.clear();

        if(settings.backgroundImage)
        {
            addImage(context);
            self.blank = false;
        }

        self.brush = new settings.brush();
        self.brush._init(context, settings.brushSize, settings.brushColor);

        if(self.brush.strokeBegin && self.brush.strokeMove && self.brush.strokeEnd)
        {
            //Have to add touch events the old fashioned way since
            //jquery removes that stuff from the event object.
            canvas.addEventListener('touchstart', function(e)
            {
                var o = $elm.offset();
                e.preventDefault();
                if(e.touches.length > 0)self.brush.strokeBegin(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);

            }, false);

            canvas.addEventListener('touchmove', function(e)
            {
                var o = $elm.offset();
                e.preventDefault();
                if(e.touches.length > 0 && self.brush.active)self.brush.strokeMove(e.touches[0].pageX-o.left, e.touches[0].pageY-o.top);

            }, false);

            canvas.addEventListener('touchend', function(e)
            {
                e.preventDefault();
                if(e.touches.length == 0)self.blank = !self.brush.strokeEnd() && self.blank;

            }, false);

            $(canvas).bind({
                mousedown: function(e)
                {
                    var o = $elm.offset();
                    self.brush.strokeBegin(e.pageX-o.left, e.pageY-o.top);
                },
                mousemove: function(e)
                {
                    var o = $elm.offset();
                    if(self.brush.active)self.brush.strokeMove(e.pageX-o.left, e.pageY-o.top);
                },
                mouseup: function(e){self.blank = !self.brush.strokeEnd() && self.blank;},
                mouseout: function(e){self.blank = !self.brush.strokeEnd() && self.blank;}
            });
        }
    };

    jqScribble.prototype = {

        clear: function()
        {
            var context = this.canvas.getContext('2d');
            var width = this.canvas.width;
            var height = this.canvas.height;
            context.clearRect(0, 0, width, height);
            if (settings.fillOnClear) {
              context.fillStyle = settings.backgroundColor;
              context.fillRect(0, 0, width, height);
            }
            this.blank = true;
            return this;
        },

        save: function(newSave)
        {
            var saveFunction = settings.saveFunction;
            if(typeof newSave === 'function')saveFunction = newSave;

            if(!this.blank)saveFunction(this.canvas.toDataURL(settings.saveMimeType));
            return this;
        },

        update: function(options, reset)
        {
            var newBg = !!options.backgroundColor;
            var newImg = !!options.backgroundImage;
            var newWidth = !!options.width;
            var newHeight = !!options.height;
            var newBrush = !!options.brush;

            $.extend(settings, options);

            var context = this.canvas.getContext("2d");

            if(newBrush)this.brush = new settings.brush();
            this.brush._init(context, settings.brushSize, settings.brushColor);

            if(newWidth)this.canvas.width = settings.width;
            if(newHeight)this.canvas.height = settings.height;
            if(newBg || newImg || newWidth || newHeight || reset)this.clear();
            if(newImg)
            {
                addImage(context);
                this.blank = false;
            }
            return this;
        }
    };

    $.fn.jqScribble = function(options)
    {
        return this.each(function()
        {
            if(!$.data(this, 'jqScribble'))$.data(this, 'jqScribble', new jqScribble(this, options));
        });
    };


    $(document).ready(function()
    {
      $('#file').change(function(e){
        var file = e.target.files[0],
          imageType = /image.*/;

        if (!file.type.match(imageType))
          return;

        var reader = new FileReader();
        reader.onload = fileOnload;
        reader.readAsDataURL(file);
      });

      function fileOnload(e) {
        var $img = $('<img>', { src: e.target.result });
        var canvas = $('#test')[0];
        var context = canvas.getContext('2d');

        $img.load(function() {
          context.drawImage(this, 0, 0);
        });
      }
    });

})(jQuery);
