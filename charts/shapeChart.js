function initShapeChart() {
  d3.csv("data/bubble/shape-percent.csv", function(error, data) {
    drawShapeChart(data);
  });
}

function drawShapeChart(data) {
  var shapeChartHeight = 400;

  shapeChart.attr("width", getChartWidth()).attr("height", shapeChartHeight);

  var mouseover = function(d) {
    tooltip.html(
      "<span>" +
        d.percent +
        "</span> percent of total sightings were shaped like <span>" +
        d.shape +
        "</span>"
    );
  };

  var mouseleave = function(d) {
    tooltip.html("Hover over a circle for more information");
  };

  var nodes = shapeChart
    .selectAll("g")
    .data(data)
    .enter();

  var circle = nodes
    .append("circle")
    .attr("r", d => {
      return d.percent * 4;
    })
    .attr("class", "shape-circle")
    .style("fill", "#b4fbde")
    .on("mouseover", mouseover)
    .on("click", mouseover)
    .style("cursor", "pointer")
    .on("mouseleave", mouseleave);

  var label = nodes
    .append("text")
    .attr("font-size", 12)
    .style("color", "white")
    .style("font-weight", "bold")
    .style("text-transform", "uppercase")
    .style("text-anchor", "middle")
    .text(d => (d.percent > 6.5 ? d.shape : ""));

  var labelVal = nodes
    .append("text")
    .attr("font-size", 12)
    .style("color", "white")
    .style("text-anchor", "middle")
    .text(d => (d.percent > 6.5 ? d.percent : ""));

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
        .radius(
          ("r",
          d => {
            return d.percent * 5;
          })
        )
        .iterations(1)
    );

  // Force that avoids circle overlapping
  simulation.nodes(data).on("tick", d => {
    circle.attr("cx", d => d.x);
    circle.attr("cy", d => d.y);
    label.attr("dx", d => d.x).attr("dy", d => d.y);
    labelVal.attr("dx", d => d.x).attr("dy", d => d.y + 20);
  });
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
    .text("Shapes of U.S UFO sightings (percent of total)");
}
