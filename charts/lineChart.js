var parseTime = d3.timeParse("%Y-%m");

var lineChartData;
var filteredLineChartData = [];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec"
];

var lineMouseleave = function (d) {
  tooltip.html("Hover over a peak for more information");
};

function initLineChart() {
  // format the data
  d3.csv("data/line-chart/year-month-count.csv", function (error, data) {
    data.forEach(function (d) {
      d.date = parseTime(d.date);
      d.count = +d.count;
    });
    lineChartData = data;
    filteredLineChartData = data.filter(d => d.year > 2012);
  });
}

function drawLineChart(data) {
  tooltip.html("Hover over a peak for more information");

  lineChart.selectAll("*").remove();
  lineChart
    .attr(
      "viewBox",
      "0 0 " + (getChartWidth() - margin.left) + " " + chartHeight)
    .attr("width", getChartWidth())
    .attr("height", chartHeight + (chartHeight * .4));

  var x = d3
    .scaleTime()
    .range([margin.left, getChartWidth() - (margin.left + margin.right)])
    .domain(d3.extent(data, d => d.date));

  var y = d3
    .scaleLinear()
    .range([chartHeight - 5, 0])
    .domain([0, d3.max(data, d => d.count)]);

  var valueLine = d3
    .line()
    .curve(d3.curveLinear)
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.count);
    });

  var xAxis = lineChart
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x))
  // .selectAll("text")
  // .attr("y", 0)
  // .attr("x", 9)
  // .attr("dy", ".35em")
  // .attr("transform", "rotate(90)")
  // .style("text-anchor", "start");

  // .tickSizeOuter(1));

  xAxis
    .append("g")
    .attr(
      "transform",
      "translate(" + (getChartWidth() - margin.left - margin.right) / 2 + ",35)"
    )
    .attr("class", "axis-label")
    .append("text")
    .text("Year");

  var yAxis = lineChart
    .append("g")
    .attr("transform", "translate(" + margin.left + ",0)")
    .attr("class", "yAxis")
    .attr("transform", "translate(0,5)")
    .call(
      d3
        .axisRight(y)
        .tickSize(getChartWidth() - margin.left)
      // .ticks(10)
    );

  yAxis
    .selectAll(".tick text")
    .attr("x", 0)
    .attr("dy", -4);

  // yAxis
  //   .append("g")
  //   .attr(
  //     "transform",
  //     "translate(35," + (chartHeight - (margin.top + margin.bottom)) / 2 + ")"
  //   )
  //   .attr("transform", "rotate(90)")
  //   .attr("class", "axis-label")
  //   .append("text")
  //   .text("num of ?");

  xAxis.selectAll(".domain").remove();
  yAxis.selectAll(".domain").remove();

  var circles = lineChart
    .selectAll("myCircles")
    .data(data)
    .enter()
    .append("circle")
    .attr("fill", "#fff8e1")
    .attr("class", "lineChart-circle")
    .attr("stroke", "none")
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d) {
      return y(d.count);
    })
    .attr("r", 10)
    .style("opacity", 0);

  circles
    .attr("transform", "translate(0,5)")
    .on("mouseover", function (d) {
      d3.select(this).style("cursor", "pointer");
      tooltip.html(
        "There were <span>" +
        d.count +
        "</span> sightings in <span>" +
        d.month +
        ", " +
        d.year +
        "</span>"
      );
    })
    .on("click", function (d) {
      d3.select(this).style("cursor", "pointer");
      tooltip.html(
        "There were <span>" +
        d.count +
        "</span> sightings in <span>" +
        d.month +
        ", " +
        d.year +
        "</span>"
      );
    })
    .on("mouseout", lineMouseleave);

  var line = lineChart
    .append("path")
    .data([data])
    .attr("d", valueLine)
    .attr("stroke", "#b4fbde")
    .attr("stroke-width", "2")
    .attr("class", "lineChart")
    .attr("fill", "none")
    .attr("class", "line")
    .attr("transform", "translate(0,5)");

  var totalLength = line.node().getTotalLength();

  line
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength);

  line
    .transition()
    .duration(800)
    .ease(d3.easePolyInOut)
    .attr("stroke-dashoffset", 0)
    .on("end", function () {
      d3.selectAll(".lineChart-circle").style("opacity", 0);
    });

  const annotations = [{
    type: d3.annotationCalloutCircle,
    note: {
      label: "An uptick in UFO sightings happened alongside Internet and mobile phone use",
      title: "UFOs go online",
      wrap: 190,
      orientation: "top",
      align: "middle"
    },
    subject: {
      radius: 20
    },
    data: {
      x: 1995,
      y: 120
    },
    dy: -117,
    dx: -100
  }].map(function (d) {
    d.color = "#E8336D";
    return d;
  });

  const makeAnnotations = d3
    .annotation()
    .type(d3.annotationLabel)
    .accessors({
      x: d => {
        return x(new Date(d.x, 0, 1));
      },
      y: d => {
        return y(d.y);
      }
    })
    .annotations(annotations);

  lineChart
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
    .style("opacity", "0");

  const legendTitle = "U.S. UFO sightings (1910-2013) per month, per year";
  drawLineChartLegend(legendTitle);
}

function updateLineChart() {
  lineChart.selectAll(".annotation-group").remove('*');
  const monthCountData = [{
    month: 1,
    count: 4582
  },
  {
    month: 2,
    count: 3803
  },
  {
    month: 3,
    count: 4457
  },
  {
    month: 4,
    count: 4446
  },
  {
    month: 5,
    count: 4245
  },
  {
    month: 6,
    count: 6432
  },
  {
    month: 7,
    count: 7639
  },
  {
    month: 8,
    count: 6825
  },
  {
    month: 9,
    count: 6182
  },
  {
    month: 10,
    count: 6228
  },
  {
    month: 11,
    count: 5665
  },
  {
    month: 12,
    count: 4610
  }
  ];

  d3.selectAll(".lineChart-circle").remove();

  var x = d3
    .scaleLinear()
    .range([margin.left, getChartWidth() - (margin.left + margin.right)])
    .domain(d3.extent(monthCountData, d => d.month));

  var y = d3
    .scaleLinear()
    .range([chartHeight - 5, 0])
    .domain([0, d3.max(monthCountData, d => d.count)]);

  var xAxis = lineChart
    .selectAll(".xAxis")
    .transition()
    .call(
      d3.axisBottom(x).tickFormat(d => {
        return months[d - 1];
      })
    );

  var yAxis = lineChart
    .selectAll(".yAxis")
    .transition()
    .call(
      d3
        .axisRight(y)
        .tickSize(getChartWidth() - margin.left)
    );

  yAxis
    .selectAll(".tick text")
    .attr("x", 0)
    .attr("dy", -4);

  var valueLine = d3
    .line()
    .curve(d3.curveLinear)
    .x(function (d) {
      return x(d.month);
    })
    .y(function (d) {
      return y(d.count);
    });

  var line = lineChart
    .selectAll(".line")
    .data([monthCountData])
    .transition()
    .attr("d", valueLine)
    .attr("stroke", "#b4fbde")
    .attr("stroke-width", "2")
    .attr("fill", "none")
    .on("end", function () {
      d3.selectAll(".lineChart-circle").style("opacity", 1);
    });

  var circles = lineChart
    .selectAll("myCircles")
    .data(monthCountData)
    .enter()
    .append("circle")
    .attr("fill", "#fff8e1")
    .attr("class", "lineChart-circle")
    .attr("cx", function (d) {
      return x(d.month);
    })
    .attr("cy", function (d) {
      return y(d.count);
    })
    .attr("r", 5)
    .style("opacity", 0)
    .on("mouseover", function (d) {
      d3.select(this).style("cursor", "pointer");
      d3.select(this).style("opacity", ".7")
      tooltip.html(
        "There were <span>" +
        d.count +
        "</span> sightings in <span>" +
        months[d.month - 1] +
        "</span>"
      );
    })
    .on("click", function (d) {
      d3.select(this).style("cursor", "pointer");
      d3.select(this).style("opacity", ".7")
      tooltip.html(
        "There were <span>" +
        d.count +
        "</span> sightings in <span>" +
        months[d.month - 1] +
        "</span>"
      );
    })
    .on("mouseout", function (d) {
      d3.select(this).style("opacity", "1");
      lineMouseleave
    });

  circles.attr("transform", "translate(0,5)");

  xAxis
    .selectAll(".axis-label")
    .selectAll("text")
    .text("Month");

  const legendTitle = "Total sightings (1910 - 2013) by month";
  drawLineChartLegend(legendTitle);

  const annotations = [{
    type: d3.annotationCalloutCircle,
    note: {
      label: "7639 sightings happened in July",
      title: "July",
      wrap: 190,
      orientation: "top",
      align: "middle"
    },
    subject: {
      radius: 20
    },
    data: {
      x: 7,
      y: 7639
    },
    dy: 169,
    dx: 0
  }].map(function (d) {
    d.color = "#E8336D";
    return d;
  });

  const makeAnnotations = d3
    .annotation()
    .type(d3.annotationLabel)
    .accessors({
      x: d => {
        return x(d.x);
      },
      y: d => {
        return y(d.y);
      }
    })
    .annotations(annotations);

  lineChart
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
    .style("opacity", "1");
}

function updateLineChartJuly() {
  lineChart.selectAll(".annotation-group").remove('*');
  d3.csv("data/line-chart/july.csv", function (error, data) {

    d3.selectAll(".lineChart-circle").remove();

    var x = d3
      .scaleLinear()
      .range([margin.left, getChartWidth() - (margin.left + margin.right)])
      .domain(d3.extent(data, d => parseInt(d.date)));

    var y = d3
      .scaleLinear()
      .range([chartHeight - 5, 0])
      .domain([0, d3.max(data, d => parseInt(d.num))]);

    var xAxis = lineChart
      .selectAll(".xAxis")
      .transition()
      .call(d3.axisBottom(x));

    var yAxis = lineChart
      .selectAll(".yAxis")
      .transition()
      .call(
        d3
          .axisRight(y)
          .tickSize(getChartWidth() - margin.left)
      );

    yAxis
      .selectAll(".tick text")
      .attr("x", 0)
      .attr("dy", -4);

    var valueLine = d3
      .line()
      .curve(d3.curveLinear)
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.num);
      });

    var line = lineChart
      .selectAll(".line")
      .data([data])
      .transition()
      .attr("d", valueLine)
      .attr("stroke", "#b4fbde")
      .attr("stroke-width", "2")
      .attr("fill", "none")
      .on("end", function () {
        d3.selectAll(".lineChart-circle").style("opacity", 1);
      });

    // line.attr("transform", "translate(" + margin.left + ",5)");

    var circles = lineChart
      .selectAll("myCircles")
      .data(data)
      .enter()
      .append("circle")
      .attr("fill", "#fff8e1")
      .attr("class", "lineChart-circle")
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d) {
        return y(d.num);
      })
      .attr("r", 5)
      .style("opacity", 0)
      .on("mouseover", function (d) {
        d3.select(this).style("cursor", "pointer");
        d3.select(this).style("opacity", ".7")
        tooltip.html(d.num +
          "</span> sightings happened on July <span>" +
          parseInt(d.date) +
          "</span>"
        );
      })
      .on("click", function (d) {
        d3.select(this).style("cursor", "pointer");
        d3.select(this).style("opacity", ".7")
        tooltip.html(d.num +
          "</span> sightings happened on the <span>" +
          d.date +
          "of July</span>"
        );
      })
      .on("mouseout", function (d) {
        d3.select(this).style("opacity", "1");
        lineMouseleave
      });

    circles.attr("transform", "translate(0,5)");

    xAxis
      .selectAll(".axis-label")
      .selectAll("text")
      .text("Date (July)");

    const legendTitle = "Total U.S. sightings in July (1910 - 2013)";
    drawLineChartLegend(legendTitle);


    const annotations = [{
      type: d3.annotationCalloutCircle,
      note: {
        label: "1083 total sightings",
        title: "4th of July",
        wrap: 190,
        orientation: "top",
        align: "middle"
      },
      subject: {
        radius: 20
      },
      data: {
        x: 4,
        y: 1083
      },
      dy: 50,
      dx: 120
    }].map(function (d) {
      d.color = "#E8336D";
      return d;
    });

    const makeAnnotations = d3
      .annotation()
      .type(d3.annotationLabel)
      .accessors({
        x: d => {
          return x(d.x);
        },
        y: d => {
          return y(d.y);
        }
      })
      .annotations(annotations);

    lineChart
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations)
      .style("opacity", "1");
  })
}

function drawLineChartLegend(legendTitle) {
  legend.selectAll("*").remove();
  legend
    .append("text")
    .attr("transform", "translate(100,50)")
    .attr("class", "axis-label")
    .style("color", "white")
    .style("margin-bottom", "15px")
    .text(legendTitle);
}