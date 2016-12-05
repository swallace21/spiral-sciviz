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

//data arrays
var keywords = [];
var keywordsActive = [];
var days = [];
var weekends = [];
var rawData = [];
var hours = [];

var opHigh = 1.0;
var opSld = 0.5;
var opKey = 0.3;
var opLow = 0.1;

var strk_color, strk_opacity, strk_width, strk_dash;

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

var svg = d3.select("#chart").append("svg")
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("display", "block")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height)
    .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")")
  .append("g")
    .attr("transform", "translate(" + width/2 + "," + (height/2+8) +")");

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

svg.append("text")
  .text("Hours Slept")
  .attr("class", "titleHrs")
  .attr("id", "infoHrs")
  .attr("x", 0)
  .attr("y", 0)
  .attr("text-anchor", "middle")

//interactions
//// Events
function updateStatus() {
  var data = d3.select(this).data()[0];
  var id = d3.select(this).attr('id');

  strk_color = d3.select(this).style('stroke');
  strk_opacity = d3.select(this).style('opacity');
  strk_width = d3.select(this).style('stroke-width');
  strk_dash = d3.select(this).style('stroke-dasharray');

  d3.select(this).style('opacity', strk_opacity-0.25);

  d3.select("svg .title").text(days[String((id/96)).split(".")[0]]);
  d3.select("svg .titleHrs").text(hours[id] + ' Hours');

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
}

function clearStatus() {
    var id = d3.select(this).attr('id');
    d3.select(this).style('stroke', strk_color);
    d3.select(this).style('opacity', strk_opacity);
    d3.select(this).style('stroke-width', strk_width);
    d3.select(this).style('stroke-dasharray', strk_dash);

    d3.select("svg .title").text("Day & Sleep Data for ....");
    d3.select("svg .titleHrs").text('Hours Slept');

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

function uncheckall() {
  keywordsActive = [];
  keywords.forEach(function(k) {
    document.getElementById(k).checked = false;
    keywordsActive.push(false);
  });

  keywordsSwitch(keywordsActive);
}

function checkall() {
  keywordsActive = [];
  keywords.forEach(function(k) {
    document.getElementById(k).checked = true;
    keywordsActive.push(true);
  });

  keywordsSwitch(keywordsActive);
}

function random() {
  keywordsActive = [];
  keywords.forEach(function(k) {
    if(Math.floor((Math.random() * 2) + 1) == 1) {
      document.getElementById(k).checked = true;
      keywordsActive.push(true);
    } else {
      document.getElementById(k).checked = false;
      keywordsActive.push(false);
    }
  });

  keywordsSwitch(keywordsActive);
}

function handleClick(cb) {
  keywordsActive = [];
  keywords.forEach(function(k) {
    keywordsActive.push(document.getElementById(k).checked);
  });

  keywordsSwitch(keywordsActive);
}

function keywordsSwitch(keywordsActive) {
  //console.log('######################');
  var countD = 0;
  rawData.forEach(function(d) {
    var countK = 6;
    var sel = ".spiral" + countD;
    var flag = true;
    var BreakException = {};
    try {
      keywordsActive.forEach(function(k) {
        //console.log(keywords[countK] + ' = ' + k);
        var bool = String(d).charAt(countK);

        if(bool == 1 && k == true) {
          flag = false;
          throw BreakException;
        }
        countK++;
      });
    } catch (e) {
      //console.log('BREAK ###################### ' + countK);
      if (e !== BreakException) throw e;
    }

    if(d3.select(sel).style('stroke') == "rgb(238, 238, 238)") {
      //do nothing
    } else {
      var opacity = d3.select(sel).style('opacity');
      if(flag) { //if no keyword found - decrease opacity
        if(opacity == opHigh) {
          d3.select(sel).style('opacity', opKey);
        } else if(opacity == opSld) { //slider
          d3.select(sel).style('opacity', opLow);
        } else if(opacity == opKey) { //keyword
          d3.select(sel).style('opacity', opKey);
        } else if(opacity == opLow) { //both
          d3.select(sel).style('opacity', opLow);
        }
      } else { //keyword found - increase opacity
        //console.log(sel + ' - ' + opacity);
        if(opacity == opHigh) {
          d3.select(sel).style('opacity', opHigh);
        } else if(opacity == opSld) { //slider\
          d3.select(sel).style('opacity', opSld);
        } else if(opacity == opKey) { //keyword
          d3.select(sel).style('opacity', opHigh);
        } else if(opacity == opLow) { //both
          d3.select(sel).style('opacity', opSld);
        }
      }
    }
    countD++;
  });
}

d3.json('data/data12.json', function(userData) {
  //console.log("Start Data 12 Load...");

  daysTemp = userData['Days'];
  daysTemp.forEach(function(day) {
    ////console.log("DAYS " + day);
    var localTime = '02/18/15'
    localTime = moment(day).format('ddd MMM Do, YYYY');
    weekend = moment(day).format('ddd');
    ////console.log("DAYS " + localTime);
    days.push(localTime);
    if(weekend == 'Sat' || weekend == 'Sun') {
      weekends.push("1");
    } else {
      weekends.push("0");
    }
  });

  ////HOURS
  hours = userData['Hours'];

  ////CHECKBOXES
  keywords = userData['Keywords'];
  keywords.forEach(function(n) {
    ////console.log("checkboxes: " + n);
    d3.select("#checkboxes")
      .append("span")
      .style("margin-right", "24px")
      .html("<label class='control control--checkbox'>" + n + "<input type='checkbox' id='" + n + "' checked onclick='handleClick(this);'/><div class='control__indicator'></div></label>");
  });

  rawData = userData['Data'];
  var count = 0;
  rawData.forEach(function(d) {
        //POSITIONS:
        //0-3: rating
        //4: weekend boolean
        //5: sleep state
        //6: start of keywords

       ////console.log(d);

       // convert number to a string, then extract the first digit
       var val = String(d).charAt(5);
       // convert the first digit back to an integer
       var valInt = Number(val);
       if(val > 4) {
         //console.log(val);
       }

       var dash = 0;
       if(weekends[String((count/96)).split(".")[0]] == 1) { //checks for weekends
         dash = ".5, 0, 5, 0.25";
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
           .style('opacity', opHigh)
           .style('stroke', color(val)) //just to show it can be colored
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
  });
});

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
      ////console.log(d);
      return "rotate(" + 180 + ")"
    })

////SLIDER
var widthSlider = getWidth() - 90;

var x = d3.scale.linear()
    .domain([0, 50])
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
  var valueStr = (value/10).toFixed(2);
  document.getElementById("sliderHeader").innerHTML = "Filter by Sleep Rating > " + valueStr;

  sliderHandle.style("left", x(value) + "px")
  value = (value/10).toFixed(2);

  var count = 0;
  rawData.forEach(function(d) {
    var sel = ".spiral" + count;
    if(d3.select(sel).style('stroke') != "rgb(238, 238, 238)") {
      var opacity = d3.select(sel).style('opacity');

      if(value > rawData[count]) { //decrease opacity
        if(opacity == opHigh) {
          d3.select(sel).style('opacity', opSld);
        } else if(opacity == opSld) { //slider
          d3.select(sel).style('opacity', opSld);
        } else if(opacity == opKey) { //keyword
          d3.select(sel).style('opacity', opLow);
        } else if(opacity == opLow) { //both
          d3.select(sel).style('opacity', opLow);
        }
      } else { //increase opacity
        if(opacity == opHigh) {
          d3.select(sel).style('opacity', opHigh);
        } else if(opacity == opSld) { //slider
          d3.select(sel).style('opacity', opHigh);
        } else if(opacity == opKey) { //keyword
          d3.select(sel).style('opacity', opKey);
        } else if(opacity == opLow) { //both
          d3.select(sel).style('opacity', opKey);
        }
        //console.log(d3.select(sel).style('opacity'));
      }
    }
    count++;
  });
});

function getWidth() {
  if (self.innerWidth) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}
