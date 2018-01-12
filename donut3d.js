!function(){
	var Donut3D={};
	var globalData;
	function pieTop(d, rx, ry, ir ){
		if(d.endAngle - d.startAngle == 0 ) return "M 0 0";
		var sx = rx*Math.cos(d.startAngle),
			sy = ry*Math.sin(d.startAngle),
			ex = rx*Math.cos(d.endAngle),
			ey = ry*Math.sin(d.endAngle);
		var ret =[];
		if(ir != 0){
			ret.push("M",sx,sy,"A",rx,ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0),"1",ex,ey,"L",ir*ex,ir*ey);
			ret.push("A",ir*rx,ir*ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0), "0",ir*sx,ir*sy,"z");
		} else {
			if(sy > ey){
				ret.push("M",sx,sy,"A",rx,ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0),"1",ex,ey, "z");
			} else {
				ret.push("M",ex,ey,"A",rx,ry,"0",(d.endAngle-d.startAngle > Math.PI? 1: 0),"1",sx,sy, "z");
			}
		}
		return ret.join(" ");
	}
	
	function pieOuter(d, rx, ry, h ){
		var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
		var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);
		
		var sx = rx*Math.cos(startAngle),
			sy = ry*Math.sin(startAngle),
			ex = rx*Math.cos(endAngle),
			ey = ry*Math.sin(endAngle);
		
		var ret =[];	
		if(sx != -129.5 && sy != 1.2185235651516165e-14){ //no outer
			ret.push("M",sx,h+sy,"A",rx,ry,"0 0 1",ex,h+ey,"L",ex,ey,"A",rx,ry,"0 0 0",sx,sy,"z");
		}
			return ret.join(" ");
	}

	function pieInner(d, rx, ry, h, ir ){
		var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
		var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);
		
		var sx = ir*rx*Math.cos(startAngle),
			sy = ir*ry*Math.sin(startAngle),
			ex = ir*rx*Math.cos(endAngle),
			ey = ir*ry*Math.sin(endAngle);

			var ret =[];
			ret.push("M",sx, sy,"A",ir*rx,ir*ry,"0 0 1",ex,ey, "L",ex,h+ey,"A",ir*rx, ir*ry,"0 0 0",sx,h+sy,"z");
			return ret.join(" ");
	}
	
	function pieSide(d, rx, ry, h, ir ){
		//inner
		var innerstartAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
		var innerendAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);
		
		var innersx = ir*rx*Math.cos(innerstartAngle),
		innersy = ir*ry*Math.sin(innerstartAngle),
		innerex = ir*rx*Math.cos(innerendAngle),
		innerey = ir*ry*Math.sin(innerendAngle);
		
		//top
		var topsx = rx*Math.cos(d.startAngle),
		topsy = ry*Math.sin(d.startAngle),
		topex = rx*Math.cos(d.endAngle),
		topey = ry*Math.sin(d.endAngle);
		
		//outer
		var outerstartAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
		var outerendAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);
		
		var outersx = rx*Math.cos(outerstartAngle),
			outersy = ry*Math.sin(outerstartAngle),
			outerex = rx*Math.cos(outerendAngle),
			outerey = ry*Math.sin(outerendAngle);
		
		var ret =[];
		ret.push("M",topsx,topsy+h,"L",topsx,topsy,"L",ir*topsx,ir*topsy,"L",ir*topsx,ir*topsy+h,"z");
		return ret.join(" ");
	}

	function getPercent(d){
		return (d.endAngle-d.startAngle > 0.2 ? 
				Math.round(1000*(d.endAngle-d.startAngle)/(Math.PI*2))/10+'%' : '');
	}	
	
	Donut3D.transition = function(id, data, rx, ry, h, ir){
		globalData = data;
		function arcTweenInner(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) { return pieInner(i(t), rx+0.5, ry+0.5, h, ir);  };
		}
		function arcTweenTop(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) { return pieTop(i(t), rx, ry, ir);  };
		}
		function arcTweenOuter(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) { return pieOuter(i(t), rx-.5, ry-.5, h);  };
		}
		
		function arcTweenSide(a) {
			  var i = d3.interpolate(this._current, a);
			  this._current = i(0);
			  return function(t) { return pieSide(i(t), rx, ry, h, ir);}
		}
		
		function textTweenX(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) { return (0.7*rx*Math.cos(0.5*(i(t).startAngle+i(t).endAngle)));  };
		}
		function textTweenY(a) {
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) { return (0.7*ry*Math.sin(0.5*(i(t).startAngle+i(t).endAngle)));  };
		}
		
		var _data = d3.layout.pie().sort(null).value(function(d) {return d.value;})(data);
		
		d3.select("#"+id).selectAll(".innerSlice").data(_data)
			.transition().duration(1000).attrTween("d", arcTweenInner); 
			
		d3.select("#"+id).selectAll(".topSlice").data(_data)
			.transition().duration(1000).attrTween("d", arcTweenTop); 
			
		d3.select("#"+id).selectAll(".outerSlice").data(_data)
			.transition().duration(1000).attrTween("d", arcTweenOuter);
		
		d3.select("#"+id).selectAll(".sideSlice_inner").data(_data)
		.transition().duration(1000).attrTween("d", arcTweenSide);
		
		d3.select("#"+id).selectAll(".sideSlice_outer").data(_data)
		.transition().duration(1000).attrTween("d", arcTweenSide);
		
		d3.select("#"+id).selectAll(".sideSlice_clickOuter").data(_data)
		.transition().duration(1000).attrTween("d", arcTweenSide);
		
		d3.select("#"+id).selectAll(".sideSlice_clickInner").data(_data)
		.transition().duration(1000).attrTween("d", arcTweenSide);
		
		setTimeout(function(){
		d3.select("#"+id).selectAll(".percent").data(_data).attr("fill", "white")
			.transition().duration(1000)
			.attrTween("x",textTweenX).attrTween("y",textTweenY).text(getPercent).attr("style", "display:block");
		},1000);
	}
	
	Donut3D.draw=function(id, data, x /*center x*/, y/*center y*/, 
			rx/*radius x*/, ry/*radius y*/, h/*height*/, ir/*inner radius*/){
		var _data = d3.layout.pie().sort(null).value(function(d) {return d.value;})(data);
		
		var slices = d3.select("#"+id).append("g").attr("transform", "translate(" + x + "," + y + ")")
			.attr("class", "slices");
		
		slices.selectAll(".sideSlice_Inner").data(_data).enter()
		//.append("g").attr("id", function(d,i){return "gsidepath_inner"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "sideSlice_inner")
			.attr("id",function(d, i) {return "sidepath_inner" + i;})
			.style("fill", function(d,i) { var f = (i==0)?2:i-1;return d3.hsl(data[f].color).darker(0.9); })
			.style("display","none")
			.attr("d",function(d){ return pieSide(d, rx, ry, h, ir);})
			.each(function(d){this._current=d;});
		
		slices.selectAll(".sideSlice_Outer").data(_data).enter()
		//.append("g").attr("id", function(d,i){return "gsidepath_outer"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "sideSlice_outer")
			.attr("id",function(d, i) {return "sidepath_outer" + i;})
			.style("fill", function(d,i) { return d3.hsl(d.data.color).darker(0.9); })
			.style("display","none")
			.attr("d",function(d){ return pieSide(d, rx, ry, h, ir);})
			.each(function(d){this._current=d;});
		
		slices.selectAll(".sideSlice_clickOuter").data(_data).enter()
		//.append("g").attr("id", function(d,i){return "gsidepath_clickOuter"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "sideSlice_clickOuter")
			.attr("id",function(d, i) {return "sidepath_clickOuter" + i;})
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.9); })
			.style("display","none")
			.attr("d",function(d){ return pieSide(d, rx, ry, h, ir);})
			.each(function(d){this._current=d;});
		
		slices.selectAll(".sideSlice_clickInner").data(_data).enter()
		//.append("g").attr("id", function(d,i){return "gsidepath_clickInner"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "sideSlice_clickInner")
			.attr("id",function(d, i) {return "sidepath_clickInner" + i;})
			.style("fill", function(d,i) { var f = (i==0)?2:i-1;return d3.hsl(data[f].color).darker(0.9); })
			.style("display","none")
			.attr("d",function(d){ return pieSide(d, rx, ry, h, ir);})
			.each(function(d){this._current=d;});
		
		slices.selectAll(".innerSlice").data(_data).enter()
		//.append("g").attr("id", function(d,i){return "ginnerpath"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "innerSlice")
			.attr("id",function(d, i) {return "innerpath" + i;})
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
			.attr("d",function(d){ return pieInner(d, rx+0.5,ry+0.5, h, ir);})
			.each(function(d){this._current=d;})
			.on("mouseover",function(d, i) {
				Donut3D.mouse("mouseover", 0, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
				Donut3D.mouse("mouseleave", 0, i, rx, ry, h, ir);
			});
		
		slices.selectAll(".outerSlice").data(_data).enter()
		//.append("g").attr("id", function(d,i){return "gouterpath"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "outerSlice")
			.attr("id",function(d, i) {return "outerpath" + i;})
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
			.attr("d",function(d){ return pieOuter(d, rx-.5,ry-.5, h);})
			.each(function(d){this._current=d;})
			.on("mouseover",function(d, i) {
				Donut3D.mouse("mouseover", 0, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
				Donut3D.mouse("mouseleave", 0, i, rx, ry, h, ir);
			});
		
		slices.selectAll(".topSlice").data(_data).enter()
		.append("g").attr("id", function(d,i){return "gtoppath"+i}).each(function(d){this._current=d;})
		.append("path").attr("class", "topSlice")
			.attr("id",function(d, i) {return "toppath" + i;})
			.style("fill", function(d) { return d.data.color; })
			//.style("stroke", function(d) { return d.data.color; })
			.attr("d",function(d){ return pieTop(d, rx, ry, ir);})
			.each(function(d){this._current=d;})
			.on("mouseover",function(d, i) {
				Donut3D.mouse("mouseover", 0, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
				Donut3D.mouse("mouseleave", 0, i, rx, ry, h, ir);
			})
			.on("mousedown",function(d, i) {
				Donut3D.mouse("mousedown", 0, i, rx, ry, h, ir);
			});

		slices.selectAll(".percent").data(_data).enter().append("text").attr("class", "percent")
			//.attr("x",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
			//.attr("y",function(d){ return 0.6*ry*Math.sin(0.5*(d.startAngle+d.endAngle));})
			.attr("id",function(d, i) {return "percent" + i;})
			.attr("style", "display:none")
			.attr("font-weight", "bold")
			.text(getPercent).each(function(d){this._current=d;})
			.on("mouseover",function(d, i) {
				Donut3D.mouse("mouseover", 0, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
				Donut3D.mouse("mouseleave", 0, i, rx, ry, h, ir);
			})
			.on("mousedown",function(d, i) {
				Donut3D.mouse("mousedown", 0, i, rx, ry, h, ir);
			});				
	}
	
	Donut3D.drawall=function(id, data, x /*center x*/, y/*center y*/, 
			rx/*radius x*/, ry/*radius y*/, h/*height*/, ir/*inner radius*/){
	
		var _dataAll = d3.layout.pie().sort(null).value(function(d) {return d.value;})(data);
		
		var slicesAll = d3.select("#"+id).append("g").attr("transform", "translate(" + x + "," + y + ")")
			.attr("class", "slices");
		
		var data = data;

		slicesAll.selectAll(".outerSlice").data(_dataAll).enter()
			.append("path").attr("class", "outerSlice")
			.attr("id",function(d) {return "outerpathAll";})
			.style("fill", function(d) { return d3.hsl(d.data.color).darker(0.7); })
			.attr("d",function(d){ return pieOuter(d, rx-.5,ry-.5, h);})
			.on("mouseover",function(d, i) {
					Donut3D.mouse("mouseover", 1, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
					Donut3D.mouse("mouseleave", 1, i, rx, ry, h, ir);
			})
			.on("mousedown",function(d, i) {
					Donut3D.mouse("mousedown", 1, i, rx, ry, h, ir);
			});

		slicesAll.selectAll(".topSlice").data(_dataAll).enter()
			.append("path").attr("class", "topSlice")
			.attr("id",function(d) {return "toppathAll";})
			.style("fill", function(d) { return d.data.color; })
			.attr("d",function(d){ return pieTop(d, rx, ry, ir);})
			.on("mouseover",function(d, i) {
					Donut3D.mouse("mouseover", 1, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
					Donut3D.mouse("mouseleave", 1, i, rx, ry, h, ir);
			})
			.on("mousedown",function(d, i) {
					Donut3D.mouse("mousedown", 1, i, rx, ry, h, ir);
			});
		
		slicesAll.selectAll(".percentAll").data(_dataAll).enter().append("text").attr("class", "percentAll")
			.attr("x",function(d){ return 0.2*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
			.attr("id",function(d) {return "percentAll";})
			.attr("fill", "white")
			.attr("font-weight", "bold")
			.text("All")
			.on("mouseover",function(d, i) {
				Donut3D.mouse("mouseover", 1, i, rx, ry, h, ir);
			})
			.on("mouseleave",function(d, i) {
				Donut3D.mouse("mouseleave", 1, i, rx, ry, h, ir);
			})
			.on("mousedown",function(d, i) {
				Donut3D.mouse("mousedown", 1, i, rx, ry, h, ir);
			});
	}
	
	Donut3D.mouse = function mouseEvent(event, path, i, rx, ry, h, ir) {
		//path: 0 normal, 1 all
		switch(path){
		case 0:
			pieClick(event, i, rx, ry, h, ir);
			break;
		case 1:
			if(event == "mouseover") {
				d3.select("#toppathAll")
					.attr("stroke", "white")
					.attr("stroke-width", 2);
				d3.select("#outerpathAll")
					.attr("stroke", "white")
					.attr("stroke-width", 2);
				d3.select("#rect3")
					.attr("stroke", "white")
			
				d3.select("#legendLB3")
					.attr("color", "orange")
					.attr("stroke-width", 2);
			
				d3.select("#countLB3")
					.attr("color", "orange")
					.attr("stroke-width", 2);
			} else if (event == "mouseleave") {
				d3.select("#toppathAll")
					.attr("stroke", "none");
				d3.select("#outerpathAll")
					.attr("stroke", "none");
				d3.select("#rect3")
					.attr("stroke", "none");
			
				d3.select("#legendLB3")
					.attr("color", "none");
			
				d3.select("#countLB3")
					.attr("color", "none");
			} else {
				d3.select("#toppathAll")
					.transition().duration(1000)
					.attr("d",function(d){ return  pieTop(d, rx*3, ry*3, ir);});
				
				d3.select("#outerpathAll")
					.transition().duration(1000)
					.attr("d",function(d){ return pieOuter(d, rx*3, ry*3, h*2);});
				
				d3.select("#percentAll")
				.attr("x",function(d){ return 0.6*rx*Math.cos(0.5*(d.startAngle+d.endAngle));})
				.attr("fill", "white")
				.attr("font-size", "48px")
				.attr("font-weight", "bold")
				.text("All");
				
				setTimeout(function(){
					window.location.href="/web?page=dashboard-detail";}, 1000);
			}
			break;
		}
	}
	
	function pieClick(event, i, rx, ry, h, ir){
		var index_path = (i==2)?0:(i+1);
		
		function TweenX(a) {
			var f = d3.interpolate(this._current, a);
			this._current = f(0);
			return function(t) { return 1.2*rx*Math.cos(0.5*(f(t).startAngle+f(t).endAngle));  };
		}
		function TweenY(a) {
			var f = d3.interpolate(this._current, a);
			this._current = f(0);
			return function(t) { return 1.2*ry*Math.sin(0.5*(f(t).startAngle+f(t).endAngle));  };
		}
		
		if(event == "mouseover") {
			stroke(i,"white");

		} else if (event == "mouseleave") {
			stroke(i,"none");

		} else {//mousedown
			d3.select("#innerpath" + i)
				.transition().duration(1000)
				.attr("d",function(d){ return pieInner(d, rx * 1.5, ry* 1.5, h, ir *1.5);});

			d3.select("#toppath" + i)
				.transition().duration(1000)
				.attr("d",function(d){ return pieTop(d, rx * 1.5, ry * 1.5, ir * 1.5);});

			if(d3.select("#outerpath" + i).attr("d") != ""){
				d3.select("#outerpath" + i)
				.transition().duration(1000)
				.attr("d",function(d){ return pieOuter(d, rx * 1.5, ry * 1.5, h);});
			}
			
			d3.select("#sidepath_inner" + i)
			.style("display","block");
		
			d3.select("#sidepath_outer" + index_path)
			.style("display","block");
		
			d3.select("#sidepath_clickInner" + index_path)
			.style("display", "block")
			.attr("stroke", "white")
			.attr("stroke-width", 2)
			.transition().duration(1000)
			.attr("d",function(d){ return pieSide(d, rx * 1.5, ry * 1.5, h, ir * 1.5);});

			if(i!=0){
				d3.select("#sidepath_clickOuter" + i)
					.style("display", "block")
					.attr("stroke", "white")
					.attr("stroke-width", 2)
					.transition().duration(1000)
					.attr("d",function(d){ return pieSide(d, rx * 1.5, ry * 1.5, h, ir * 1.5);});
			}

			d3.select("#percent" + i)
			.transition().duration(1000).delay(0)
			.attr("style", "display:block")
			.attr("font-size", "16px")
			.attr("font-weight", "bold")
			.attrTween("x",TweenX).attrTween("y",TweenY).text(getPercent);
			
			for(var x=0;x<2;x++){
				var y = (x==2)?0:(x+1);
				if(globalData[x].value == 0){
					d3.select("#sidepath_inner" + y)
					.style("display","none");
					
					d3.select("#sidepath_outer" + x)
					.style("display","none");
				}
			}

			setTimeout(function(){
				window.location.href="/web?page=dashboard-detail&st="+i;}, 1000);
		}
	}
	
	function stroke(i, storke) {
		d3.select("#innerpath" + i)
		.attr("stroke", storke)
		.attr("stroke-width", 2);
		
		d3.select("#toppath" + i)
		.attr("stroke", storke)
		.attr("stroke-width", 2);
		
		d3.select("#outerpath" + i)
		.attr("stroke", storke)
		.attr("stroke-width", 2);
		
		d3.select("#rect" + i)
		.attr("stroke", storke)
		.attr("stroke-width", 2);
		
		d3.select("#legendLB" + i)
		.attr("color", (storke=="white")?"orange":"black")
		.attr("stroke-width", 2);
		
		d3.select("#countLB" + i)
		.attr("color", (storke=="white")?"orange":"black")
		.attr("stroke-width", 2);
	}
	
	this.Donut3D = Donut3D;
}();