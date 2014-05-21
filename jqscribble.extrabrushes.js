//This is a custom brush that will draw small lines based off the stroke path.
LineBrush.prototype = new jqScribbleBrush;
function LineBrush()
{
	LineBrush.prototype.strokeBegin = function(x, y)
	{
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.lineRadius = 7; 
	};
	
	LineBrush.prototype.strokeMove = function(x, y)
	{
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);
		
		this.context.moveTo(x-this.lineRadius, y-this.lineRadius);
		this.context.lineTo(x+this.lineRadius, y+this.lineRadius);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
	};
};
//This is a custom brush that will draw small crosses based off the stroke path.
CrossBrush.prototype = new jqScribbleBrush;
function CrossBrush()
{
	CrossBrush.prototype.strokeBegin = function(x, y)
	{
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.lineRadius = 7; 
	};
	
	CrossBrush.prototype.strokeMove = function(x, y)
	{
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);
		
		this.context.moveTo(x-this.lineRadius, y-this.lineRadius);
		this.context.lineTo(x+this.lineRadius, y+this.lineRadius);
		
		this.context.moveTo(x-this.lineRadius, y+this.lineRadius);
		this.context.lineTo(x+this.lineRadius, y-this.lineRadius);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
	};
};

//This is a custom brush that will draw dots.
DotBrush.prototype = new jqScribbleBrush;
function DotBrush()
{
	DotBrush.prototype.strokeBegin = function(x, y)
	{
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.lineRadius = 1; 
	};
	
	DotBrush.prototype.strokeMove = function(x, y)
	{
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);
		
		this.context.moveTo(x-this.lineRadius, y+this.lineRadius);
		this.context.lineTo(x+this.lineRadius, y-this.lineRadius);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
	};
};

//This is a custom brush that will draw circles.
CircleBrush.prototype = new jqScribbleBrush;
function CircleBrush()
{
	CircleBrush.prototype.strokeBegin = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.prevX = x; 
		this.prevY = y;
		this.lineRadius = 20; 
	};
	
	CircleBrush.prototype.strokeMove = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);

		this.context.beginPath();
      	this.context.arc(x, y, this.lineRadius, 0, 2 * Math.PI, false);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
	};
};

//This is a custom brush that will draw semicircles.
SemiCircleBrush.prototype = new jqScribbleBrush;
function SemiCircleBrush()
{
	SemiCircleBrush.prototype.strokeBegin = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.prevX = x; 
		this.prevY = y;
		this.lineRadius = 20; 
	};
	
	SemiCircleBrush.prototype.strokeMove = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);

		this.context.beginPath();
      	this.context.arc(x, y, this.lineRadius, 0, Math.PI, false);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
	};
};

//This is a custom brush that will draw rectangles.
RectangleBrush.prototype = new jqScribbleBrush;
function RectangleBrush()
{
	RectangleBrush.prototype.strokeBegin = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeBegin.call(this, x, y);
		this.prevX = x; 
		this.prevY = y;
		this.lineRadius = 20; 
	};
	
	RectangleBrush.prototype.strokeMove = function(x, y)
	{
		//For custom brushes make sure to call the parent brush methods
		jqScribbleBrush.prototype.strokeMove.call(this, x, y);

		this.context.beginPath();
      	this.context.rect(x, y, this.lineRadius, this.lineRadius);
		
		this.context.strokeStyle = this.brushColor;
		this.context.stroke();
	};
};