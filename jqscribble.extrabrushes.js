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

