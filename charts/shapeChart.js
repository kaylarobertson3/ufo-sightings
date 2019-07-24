function initShapeChart() {
  d3.csv("data/bubble/shape-percent.csv", function (error, data) {
    drawShapeChart(data);
  });
}

function drawShapeChart(data) {
  var shapeChartHeight = 400;

  shapeChart.attr("width", getChartWidth()).attr("height", shapeChartHeight);

  var mouseover = function (d) {
    tooltip.html(
      "<span>" +
      d.percent +
      "</span> percent of total sightings were shaped like <span>" +
      d.shape +
      "</span>"
    );
  };

  var mouseleave = function (d) {
    tooltip.html("Hover over a circle for more information");
  };

  var nodes = shapeChart.selectAll("g").data(data).enter()

  var circle = nodes
    .append("circle")
    .attr("r", d => {
      return d.percent * 3;
    })
    .attr("class", "shape-circle")
    .attr("cx", getChartWidth() / 2)
    .attr("cy", shapeChartHeight / 2)
    .style("fill", "#b4fbde")
    .on("mouseover", mouseover)
    .on("click", mouseover)
    .style("cursor", "pointer")
    .on("mouseleave", mouseleave);

  //forces applied to the nodes
  var simulation = d3
    .forceSimulation()
    .force(
      "center",
      d3
        .forceCenter()
        .x(getChartWidth() / 2)
        .y(shapeChartHeight / 2)
    ) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(0.9)) // Nodes are attracted one each other of value is > 0
    .force(
      "collide",
      d3
        .forceCollide()
        .strength(0.5)
        // .radius(30)
        .radius(
          ("r",
            d => {
              return d.percent * 4;
            })
        )
        .iterations(1)
    );

  // Force that avoids circle overlapping
  simulation.nodes(data).on("tick", d => {
    circle.attr("cx", d => d.x);
    circle.attr("cy", d => d.y);
  });

  const annotations = [
    {
      note: {
        label:
          "Basic settings with subject position(x,y) and a note offset(dx, dy)"
      },
      x: 50,
      y: 100,
      dy: 100,
      dx: 162
    }
  ];

  const makeAnnotations = d3
    .annotation()
    .type(d3.annotationLabel)
    .annotations(annotations);

  // shapeChart
  //   .append("g")
  //   .attr("class", "annotation-group")
  //   .call(makeAnnotations)
  //   .style("opacity", "1")

  circle
    .append("text")
    .text(d => d.shape)
    .attr("fill", "pink")
    .attr("font-size", 15);
}

function drawShapeChartLegend() {
  //clear HTML legend
  legend.selectAll("*").remove();

  legend
    .append("text")
    .attr("transform", "translate(100,50)")
    .attr("class", "axis-label")
    .style("color", "white")
    .style("margin-bottom", "15px")
    .text("Shapes of U.S UFO sightings (perecent of total)");
}
