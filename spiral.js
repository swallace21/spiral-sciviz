var width = 1000,
    height = 1200
    num_axes = 96,
    tick_axis = 8,
    start_spiral = 4,
    start = 0,
    end = 32,
    rings = end - start_spiral;
var margin = {top: 20, right: 40, bottom: 20, left: 40};

var theta = function(r) {
  return 2*Math.PI*r;
};

var arc = d3.svg.arc()
  .startAngle(0)
  .endAngle(2*Math.PI);

var radius = d3.scale.linear()
  .domain([start, end])
  .range([0, d3.min([width,height])/2]);

var angle = d3.scale.linear()
  .domain([0,num_axes])
  .range([0,360])

var offset = radius + Math.ceil(28/ num_axes) * 18;

var svg = d3.select("#chart").append("svg")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height)
    .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")")
  .append("g")
    .attr("transform", "translate(" + width/2 + "," + (height/2+8) +")");

//DATA - Generates even spiral for entire clock
var pieces = d3.range(start_spiral, end, (end-start)/width); //1.041667

var cc = 1
var add = 1.00/num_axes
var num = start_spiral
var pieces = [num]
while(cc < (num_axes*(end-start_spiral))) {
  num = num + add
  pieces.push(num)
  cc++
}

//GRADIENT
var domain = [0.0,   1.0,       2.0,       3.0,       4.0,       5.0,     6.0,     7.0];
var range = ['#fff', '#386cb0', '#ffff99', '#fdc086', '#f0027f', '#ccc', 'purple', '#fff'];
  var color = d3.scale.linear().domain(domain).range(range);

var spiral = d3.svg.line.radial()
  .interpolate("cardinal")
  .angle(theta)
  .radius(radius);

svg.append("text")
  .text("Prototype 4")
  .attr("class", "title")
  .attr("x", 0)
  .attr("y", -height/2+end)
  .attr("text-anchor", "middle")

svg.selectAll("circle.tick")
    .data(d3.range(end,start,(start-end)/4))
  .enter().append("circle")
    .attr("class", "tick")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", function(d) { return radius(d); })


var count = 0
d3.json('data.json', function(data) {

	/* Process data */
	var data = {};
	for(var k in data) {

		data[k] = [];
		var days = Object.keys(data[k]);
		for(var i = 0; i < days.length; i++) {
			for(var j = 0; j < num_axes; j++) {
				data[k].push( { i : (i*num_axes)+j, d: data[k][days[i]][j] } )
        //console.log(i + ' - ' + j + ' - ' + data[k][days[i]][j]);
        var val = data[k][days[i]][j];

        if(val == 0 || val == 7) {
          svg.selectAll(".spiral") //loops but does not fill
            .data([[pieces[count], pieces[count+1]]])
          .enter().append('path')
            .style('opacity', 1.0)
            .style('stroke', '#eee') //just to show it can be colored
            .style('stroke-width', 1)
            //.style("stroke-dasharray", ".25,.5")
          .attr("class", "spiral2")
          .attr("d", spiral)
          .attr("transform", function(d) { return "rotate(" + 0 + ")" })
        } else {
          svg.selectAll(".spiral") //loops but does not fill
            .data([[pieces[count], pieces[count+1]]])
          .enter().append('path')
            .style('opacity', 1.0)
            .style('stroke', color(data[k][days[i]][j])) //just to show it can be colored
            .style('stroke-width', rings*0.55)
            //.style("stroke-dasharray", ".25,.5")
          .attr("class", "spiral2")
          .attr("d", spiral)
          .attr("transform", function(d) { return "rotate(" + 0 + ")" })
        }

        count++
			}
		}
	}
});

/* Prepare labels */
var times = [
  "Midnight","","","","1am","","","","2am","","","",
  "3am","","","","4am","","","","5am","","","",
  "6am","","","","7am","","","","8am","","","",
  "9am","","","","10am","","","","11am","","","",
  "Noon","","","","1pm","","","","2pm","","","",
  "3pm","","","","4pm","","","","5pm","","","",
  "6pm","","","","7pm","","","","8pm","","","",
  "9pm","","","","10pm","","","","11pm","","",""
];

var days = [
  "Feb 19-20",
  "Feb 20-21",
  "Feb 22-23",
  "Feb 23-24",
  "Feb 24-25",
  "Feb 25-26",
  "Feb 26-27",
  "Feb 27-28", "Feb 28 - Mar 1",
  "March 1-2", "March 2-3",
  "March 3-4", "March 4-5",
  "March 5-6", "March 6-7",
  "March 7-8", "March 8-9",
  "March 9-10", "March 10-11",
  "March 11-12", "March 12-13",
  "March 13-14", "March 14-15",
  "March 15-16", "March 16-17",
  "March 17-18", "March 18-19",
  "March 19-20"
];

/* LABELS */
svg.selectAll(".axis")
    .data(d3.range(num_axes))
  .enter().append("g")
    .attr("class", "axis")
    .attr("transform", function(d) { return "rotate(" + -angle(d) + ")"; })
  //.call(radial_tick)
  .append("text")
    .attr("y", radius(end)+rings)
    .text(function(d) { return times[d]; })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "rotate(" + 180 + ")" })

function radial_tick(selection) {
  selection.each(function(axis_num) {
    d3.svg.axis()
      .scale(radius)
      .ticks(end)
      .tickValues(axis_num == tick_axis ? null : [])
      .orient("top")(d3.select(this))

    d3.select(this)
      .selectAll("text")
      .attr("text-anchor", "bottom")
      .attr("transform", "rotate(" + angle(axis_num) + ")")
  });

  /* Arc functions -- For Possible Color Gradients */
  ir = function(d, i) {
      return radius + Math.floor(i/num_axes) * height;
  }
  or = function(d, i) {
      return radius + height + Math.floor(i/num_axes) * height;
  }
  sa = function(d, i) {
      return (i * 2 * Math.PI) / num_axes;
  }
  ea = function(d, i) {
      return ((i + 1) * 2 * Math.PI) / num_axes;
  }
}
