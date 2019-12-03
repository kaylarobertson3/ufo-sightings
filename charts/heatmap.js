const times = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23"
];

const days = ["7", "6", "5", "4", "3", "2", "1"];

const hot1 = "rgb(21, 44, 48)";
const hot2 = "#b4fbde";

function getWeekday(d) {
  if (d == 1) {
    return "Mon";
  }
  if (d == 2) {
    return "Tues";
  }
  if (d == 3) {
    return "Wed";
  }
  if (d == 4) {
    return "Thurs";
  }
  if (d == 5) {
    return "Fri";
  }
  if (d == 6) {
    return "Sat";
  }
  if (d == 7) {
    return "Sun";
  }
}

// Build color scale
var nums = [];
let min = 0;
let max = 0;

var myColor = d3
  .scaleLinear()
  .range([hot1, hot2])
  .domain([65, 1848]);

function initHeatmap() {
  charts.selectAll("p").style("display", "none");
  d3.csv("data/heatmap/heatmap-data.csv", function(error, data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const element = data[key].num;
        nums.push(parseInt(element));
      }
    }
    min = d3.min(nums);
    max = d3.max(nums);
    drawHorizontalHeatmap(data);
  });
}

// HORIZONTAL HEATMAP ==========================
function drawHorizontalHeatmap(data) {
  tooltip.html("Click or hover over a circle for more information");
  heatmap.attr("width", getChartWidth() + 50).attr("height", chartHeight + 50);

  // Build X scales and axis:
  var x = d3
    .scaleBand()
    .range([0, getChartWidth()])
    .domain(times)
    .padding(0.2);

  var y = d3
    .scaleBand()
    .range([chartHeight - 5, 0])
    .domain(days)
    .padding(0.2);

  var xAxis = heatmap
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(50," + (chartHeight - 25) + ")")
    .call(d3.axisBottom(x));

  if (getChartWidth() <= 370) {
    var ticks = xAxis.selectAll(".tick text");
    ticks.attr("display", function(d, i) {
      if (i % 2 != 0) return "none";
    });
  }

  xAxis
    .append("g")
    .attr(
      "transform",
      "translate(" + (getChartWidth() - margin.left - margin.right) / 2 + ",50)"
    )
    .attr("class", "axis-label")
    .append("text")
    .text("Time of day");

  xAxis.selectAll("path").remove();

  xAxis.selectAll("line").remove();

  var yAxis = heatmap
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(50,-10)")
    .call(d3.axisLeft(y));

  yAxis.selectAll("path").remove();

  yAxis.selectAll("line").remove();

  yAxis.selectAll("text").html(function(n) {
    return getWeekday(n);
  });

  yAxis.selectAll("text").attr("class", "scale-text");

  var heatmapMouseover = function(d, e) {
    // var coordinates = d3.mouse(this);
    // var x = coordinates[0];
    // var y = coordinates[1];
    // .style("position", "absolute")
    // .style("left", x + "px")
    // .style("top", y + "px")

    tooltip.html(
      "There were <span>" +
        d.num +
        "</span> total sightings on <span>" +
        getWeekday(d.day) +
        ".</span> at <span>" +
        d.time +
        ":00</span>"
    );

    d3.select(this).style("cursor", "pointer");
    d3.select(this).style("opacity", ".7");
  };

  var heatmapMouseleave = function(d) {
    d3.select(this).classed("hover", false);
    d3.select(this).style("opacity", "1");
    tooltip.html("Click or hover over a circle for more information");
  };

  heatmap
    .selectAll("rect")
    .data(data, function(d) {
      return d.time + ":" + d.day;
    })
    .enter()
    .append("rect")
    .attr("class", "rect")
    .attr("x", function(d) {
      return 50 + x(d.time);
    })
    .attr("y", function(d) {
      return y(d.day);
    })
    .attr("rx", "50%")
    .attr("width", x.bandwidth())
    .attr("height", x.bandwidth())
    .style("fill", function(d) {
      return myColor(d.num);
    })
    .on("mouseover", heatmapMouseover)
    .on("click", heatmapMouseover)
    .on("mouseleave", heatmapMouseleave)
    .exit()
    .remove();

  heatmap
    .selectAll("*")
    .transition()
    .duration(300)
    .attr("opacity", "1");
  drawHeatmapLegend();

  const annotations = [
    {
      type: d3.annotationLabel,
      note: {
        label: "1,848 UFO sightings between 1910 and 2013",
        title: "9p.m. Saturday night",
        wrap: 190,
        orientation: "top",
        align: "middle"
      },
      connector: {
        end: "arrow"
      },
      subject: {
        radius: 50
      },
      data: {
        x: 21,
        y: 6
      },
      dy: -100,
      dx: -100
    }
  ].map(function(d) {
    d.color = "#E8336D";
    return d;
  });

  const makeAnnotations = d3
    .annotation()
    .type(d3.annotationLabel)
    .accessors({
      x: d => {
        return x(d.x) + margin.left + margin.right - 20;
      },
      y: d => {
        return y(d.y);
      }
    })
    .annotations(annotations);

  heatmap
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
    .style("opacity", "0");
}

function showHigherDays() {
  d3.select(".annotation-group").style("display", "block");
  drawHeatmapLegend();
  heatmap
    .selectAll(".rect")
    .transition()
    .style("fill-opacity", function(d) {
      if (d.num > 1200) {
        return 1;
      } else {
        return 0.3;
      }
    });
}

function exitHeatmap() {
  heatmap
    .selectAll(".tick")
    .transition()
    .duration(150)
    .style("opacity", 0);

  heatmap
    .selectAll(".rect")
    .transition()
    .duration(150)
    .style("opacity", 0);

  legend
    .selectAll("*")
    .transition()
    .duration(150)
    .style("opacity", 0);

  heatmap.style("display", "none");
}

function drawHeatmapLegend() {
  legend.selectAll("*").remove();

  const heatmapColorScale = d3
    .scaleLinear()
    .domain([65, 1848])
    .range([hot1, hot2]);

  legend.style("opacity", 1);

  legend
    .append("text")
    .attr("transform", "translate(100,50)")
    .attr("class", "axis-label")
    .style("color", "white")
    .style("line-height", "1.5")
    .style("margin-bottom", "15px")
    .html(
      "UFO sightings* by time and day of week <br/> *United States sightings"
    );

  var colorLegend = d3
    .legendColor()
    .scale(heatmapColorScale)
    .shapeWidth(40)
    .cells(7)
    .orient("horizontal")
    .labelFormat("0.0f");

  legend
    .append("svg")
    .attr("width", getChartWidth())
    .attr("height", 40)
    .call(colorLegend);
}
