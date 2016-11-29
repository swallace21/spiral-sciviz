var width = 1000,
    height = 1200
    num_axes = 96,
    tick_axis = 8,
    start_spiral = 4,
    start = 0,
    end = 32,
    rings = end - start_spiral
    segmentHeight = 20;
var margin = {top: 20, right: 40, bottom: 20, left: 40};

var strk_color, strk_opacity, strk_width, strk_dash;

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

//SW - 28 = max circles!
var offset = radius + Math.ceil(28/ num_axes) * 18;

var svg = d3.select("#chart").append("svg")
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("display", "block")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height)
    .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")")
  .append("g")
    .attr("transform", "translate(" + width/2 + "," + (height/2+8) +")");

//DATA - Generates even spiral for entire clock
//var pieces = d3.range(start_spiral, end, (end-start)/width); //1.041667 //not used right now


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
var domain = [0.0,   1.0,       2.0,       3.0,       4.0,       5.0,     6.0,       7.0,        8.0];
var range = ['#fff', '#386cb0', '#ffff99', '#fdc086', '#f0027f', '#ccc', '#7fc97f',  '#beaed4',  '#fff'];
  var color = d3.scale.linear().domain(domain).range(range);

var spiral = d3.svg.line.radial()
  .interpolate("cardinal")
  .angle(theta)
  .radius(radius);

svg.append("text")
  .text("Day & Sleep Data")
  .attr("class", "title")
  .attr("id", "info")
  .attr("x", 0)
  .attr("y", -height/2+end)
  .attr("text-anchor", "middle")

/* SW - int conversion
var number = 132943154134;

// convert number to a string, then extract the first digit
var one = String(number).charAt(0);

// convert the first digit back to an integer
var one_as_number = Number(one);
*/

//interactions
//// Events
function updateStatus() {
  var data = d3.select(this).data()[0];
  var id = d3.select(this).attr('id');

  strk_color = d3.select(this).style('stroke');
  strk_opacity = d3.select(this).style('opacity');
  strk_width = d3.select(this).style('stroke-width');
  strk_dash = d3.select(this).style('stroke-dasharray');

  d3.select(this).style('opacity', strk_opacity-0.4);

  d3.select("svg .title").text("Day & Sleep Data for " + id);

  var flag = true;
  var nn = 569;
  while(flag) {
    var sel = ".spiral" + id;
    if(d3.select(sel).style('stroke') == "rgb(238, 238, 238)") {
      d3.select(sel).style('stroke', "rgb(170, 170, 170)");
      d3.select(this).style('stroke-width', '12px');
    } else {
      flag = false;
    }
    id++;
  }

/*
  if(nsa == "rgb(56, 108, 176)") {
    console.log(nsa);
  }
*/

  /*
  var month = months[data.i % months.length];
  var year = 1910 + Math.floor(data.i / months.length);
  var temperature = data.d;
    d3.select('svg .period.label')
      .text(month + ' ' + '');
    d3.select('svg .temperature.label')
      .text(temperature+'');
  */
}

function clearStatus() {
    var id = d3.select(this).attr('id');
    d3.select(this).style('stroke', strk_color);
    d3.select(this).style('opacity', strk_opacity);
    d3.select(this).style('stroke-width', strk_width);
    d3.select(this).style('stroke-dasharray', strk_dash);

    d3.select("svg .title").text("Day & Sleep Data for ....");

    var flag = true;
    id++;
    while(flag) {
      var sel = ".spiral" + id;
      if(d3.select(sel).style('stroke') == "rgb(170, 170, 170)") {
        d3.select(sel).style('stroke', "rgb(238, 238, 238)");
        d3.select(sel).style('stroke-width', '8px');
      } else {
        flag = false;
      }
      id++;
    }
}

var count = 0
d3.json('data.json', function(userData) {

	/* Process data */
	var data = {};
	for(var k in userData) {

		data[k] = [];
		var days = Object.keys(userData[k]);
		for(var i = 0; i < days.length; i++) {
			for(var j = 0; j < num_axes; j++) {
				data[k].push( { i : (i*num_axes)+j, d: userData[k][days[i]][j] } )
        //console.log(i + ' - ' + j + ' - ' + userData[k][days[i]][j]);
        var val = userData[k][days[i]][j];

        var dash;
        if(count >= 2400 && count <= 2591) {
          dash = ".5, 0, 5, 0.25";
        } else {
          dash = 0;
        }

        if(val == 0 || val == 8) {
          svg.selectAll(".spiral") //loops but does not fill
            .data([[pieces[count], pieces[count+1]]])
          .enter().append('path')
            .style('opacity', 0.6)
            .style('stroke', '#eee') //just to show it can be colored
            .style('stroke-width', 8)
            .style("stroke-dasharray", ".5,.25")
          .attr("class", "spiral"+count)
          .attr("d", spiral)
          .attr("id", count)
          .on('mouseover', updateStatus)
          .on('mouseout', clearStatus)
          .attr("transform", function(d) { return "rotate(" + 0 + ")" })
        } else {
          svg.selectAll(".spiral") //loops but does not fill
            .data([[pieces[count], pieces[count+1]]])
          .enter().append('path')
            .style('opacity', 1.0)
            .style('stroke', color(userData[k][days[i]][j])) //just to show it can be colored
            .style('stroke-width', rings*0.53)
            .style("stroke-dasharray", dash)
          .attr("class", "spiral"+count)
          .attr("d", spiral)
          .attr("id", count)
          .on('mouseover', updateStatus)
          .on('mouseout', clearStatus)
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
    .attr("transform", function(d) {
      return "rotate(" + angle(d) + ")";
    })
  .append("text")
    .attr("y", radius(end)+rings)
    .text(function(d) { return times[d]; })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
      //console.log(d);
      return "rotate(" + 180 + ")"
    })

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

    var donutData = [
      {name: "6pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "7pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "8pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "9pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "10pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "11pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "Midnight", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "1am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "2am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "3am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "4am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "5am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "6am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "7am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "8am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "9am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "10am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "11am", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "Noon", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "1pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "2pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "3pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "4pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "5pm", 	value: 10},
      {name: "", 	value: 1},
      {name: "", 	value: 1},
      {name: "", 	value: 1}
    ];



////SLIDER
var widthSlider = 280;

var x = d3.scale.linear()
    .domain([1, 100])
    .range([0, widthSlider])
    .clamp(true);

var dispatch = d3.dispatch("sliderChange");

var slider = d3.select(".slider")
    .style("width", widthSlider + "px");

var sliderTray = slider.append("div")
    .attr("class", "slider-tray");

var sliderHandle = slider.append("div")
    .attr("class", "slider-handle");

sliderHandle.append("div")
    .attr("class", "slider-handle-icon")

slider.call(d3.behavior.drag()
    .on("dragstart", function() {
      dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.sliderChange(x.invert(d3.mouse(sliderTray.node())[0]));
    }));

dispatch.on("sliderChange.slider", function(value) {
  sliderHandle.style("left", x(value) + "px")
});

////CEHCKBOXES
var keywords = ["work", "alcohol", "newmoon"]

keywords.forEach(function(n) {
  //console.log("checkboxes: " + n);
  d3.select("#checkboxes")
    .append("span")
    .style("margin-right", "24px")
    .html("<label class='control control--checkbox'>" + n + "<input type='checkbox' id='" + n + "' checked/><div class='control__indicator'></div></label>");
    //.html("<label class='inline'><input type='checkbox' id='" + n + "' checked><span class='lbl'> </span>" + n + "</label>");
});
