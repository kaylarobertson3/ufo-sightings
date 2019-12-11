var sightingsData;
var currentState;
var mapData;

function initMap() {
  d3.json("data/map/states.json", function(geoData) {
    d3.csv("data/map/UFO-sightings-by-pop.csv", function(error, data) {
      if (error) {
        console.log("error getting data");
      } else {
        sightingsData = data;
        features = geoData.features;
        for (const key in features) {
          if (features.hasOwnProperty(key)) {
            const element = features[key];
            currentState = element.properties.NAME;
            for (const key in sightingsData) {
              if (sightingsData.hasOwnProperty(key)) {
                const sighting = sightingsData[key];
                if (currentState == sighting.state) {
                  element.properties.sightings = parseInt(sighting.sightings);
                }
              }
            }
          }
        }
        mapData = geoData;
        drawMap(mapData);
      }
    });
  });
}

function drawMap(data) {
  const mapColorMax = d3.max(data.features.map(d => d.properties.sightings));
  const mapColorMin = d3.min(data.features.map(d => d.properties.sightings));

  const mapColorScale = d3
    .scaleLinear()
    .domain([mapColorMin, mapColorMax])
    .range([hot1, hot2]);

  var projection = d3
    .geoAlbersUsa()
    .translate([getChartWidth() / 2, chartHeight / 2])
    .scale(getChartWidth());

  var path = d3.geoPath().projection(projection);

  map
    .attr("height", chartHeight)
    .attr("preserveAspectRatio", "xMinYMax meet")
    .attr("viewBox", "0 0 " + getChartWidth() + " " + chartHeight)
    .attr("transform", "scale(1,1)");

  var paths = map
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", "state")
    .style("stroke", "#0A1E24")
    .style("stroke-width", ".7")
    .attr("fill", function(d) {
      return mapColorScale(d.properties.sightings);
    });

  paths.transition().duration(3000);

  map
    .selectAll("path")
    .on("mousemove", mapMouseOver)
    .on("click", mapMouseOver)
    .on("mouseout", mapMouseLeave);
}

function drawMapLegend() {
  //clear HTML legend
  legend.selectAll("*").remove();

  const mapColorScale = d3
    .scaleLinear()
    .domain([0, 58])
    .range([hot1, hot2]);

  var colorLegend = d3
    .legendColor()
    .scale(mapColorScale)
    .titleWidth(100)
    .shapeWidth(40)
    .cells(7)
    .orient("horizontal")
    .labelFormat("0.0f");

  legend
    .append("text")
    .attr("transform", "translate(100,50)")
    .attr("class", "axis-label")
    .style("color", "white")
    .style("margin-bottom", "15px")
    .text("UFO sightings by state per 100,000 people");

  legend
    .append("svg")
    .attr("width", getChartWidth())
    .call(colorLegend);
}

var mapMouseOver = function(d) {
  d3.select(this).style("opacity", ".7");
  d3.select(this).style("cursor", "pointer");
  const pageX = d3.event.clientX - d3.event.clientX / 2;
  const pageY = d3.event.clientY + 40;
  tooltip.style("display", "block");
  tooltip.style("left", pageX + "px");
  tooltip.style("top", pageY + "px");
  tooltip.html(
    "In <span>" +
      d.properties.NAME +
      "</span>, there were <span>" +
      d.properties.sightings +
      " UFO sightings </span>per 100,000 people"
  );
};

var mapMouseLeave = function(d) {
  tooltip.html("Hover over a state for more information");
  d3.select(this).style("opacity", "1");
  tooltip.style("display", "none");
};

var circleMouseover = function(d) {
  d3.select(this).style("opacity", ".7");
  d3.select(this).style("cursor", "pointer");
  const pageX = d3.event.clientX - d3.event.clientX / 2;
  const pageY = d3.event.clientY + 40;
  tooltip.style("display", "block");
  tooltip.style("left", pageX + "px");
  tooltip.style("top", pageY + "px");
  const cityCap = d.city.charAt(0).toUpperCase() + d.city.slice(1);
  d3.select(this).style("opacity", ".7");
  tooltip.html(
    `<div class="tooltipRow"><p><span>  City:</span>  ${cityCap} </p>
    <p><span>  Date: </span> ${d.datetime} </p>
    <p><span>  Duration:</span>  ${d["duration (hours/min)"]} </p>
    <p><span>  Shape:</span>  ${d.shape} </p>
    <p><span>  Description:</span> "${d.comments}"</p></div>`
  );
};

var circleMouseout = function(d) {
  map.selectAll("circle").style("opacity", ".1");
  tooltip.html("Hover over a circle for more information");
};

function updateMapWA() {
  var translate;
  var scale;

  var projection = d3
    .geoAlbersUsa()
    .translate([getChartWidth() / 2, chartHeight / 2])
    .scale(getChartWidth());

  var path = d3.geoPath().projection(projection);

  d3.csv("data/lat-long/wa-sightings.csv", function(waData) {
    var paths = map
      .selectAll("path")
      .on("mousemove", "")
      .on("click", "");

    map
      .selectAll("*")
      .transition()
      .duration(300);

    tooltip.html("Hover over a circle for more information");

    map.selectAll("path").style("fill-opacity", d => {
      if (currentState == "All") {
        return 1;
      } else {
        if (currentState == d.properties.NAME) {
          return 1;
        } else return 0;
      }
    });

    mapData.features.forEach(d => {
      if (currentState == d.properties.NAME) {
        var bounds = path.bounds(d);
        (dx = bounds[1][0] - bounds[0][0]),
          (dy = bounds[1][1] - bounds[0][1]),
          (x = (bounds[0][0] + bounds[1][0]) / 2),
          (y = (bounds[0][1] + bounds[1][1]) / 2),
          (scale = 0.9 / Math.max(dx / getChartWidth(), dy / chartHeight)),
          (translate = [
            getChartWidth() / 2 - scale * x,
            chartHeight / 2 - scale * y
          ]);

        paths
          .transition()
          .duration(300)
          .attr(
            "transform",
            "translate(" + translate + ")scale(" + scale + ")"
          );
      }
    });

    var circles = map
      .append("g")
      .selectAll("circle")
      .data(waData)
      .enter()
      .append("circle")
      .attr("r", 0.8)
      .attr("cy", d => {
        var longitude = d.longitude;
        var latitude = d.latitude;
        return projection([longitude, latitude])[1];
      })
      .attr("cx", d => {
        var longitude = d.longitude;
        var latitude = d.latitude;
        return projection([longitude, latitude])[0];
      })
      .attr("class", "mapCircle")
      .attr("fill", "grey")
      .style("opacity", ".1")
      .attr("stroke-width", 0.09)
      .attr("stroke", "#0A1E24")
      .transition()
      .duration(300)
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    map
      .selectAll("circle")
      .on("mouseover", circleMouseover)
      .on("mousemove", "")
      .on("click", circleMouseover)
      .on("mouseout", circleMouseout);
  });
}

function updateMapMT() {
  var translate;
  var scale;

  var projection = d3
    .geoAlbersUsa()
    .translate([getChartWidth() / 2, chartHeight / 2])
    .scale(getChartWidth());

  var path = d3.geoPath().projection(projection);

  d3.csv("data/lat-long/mt-sightings.csv", function(mtData) {
    var paths = map
      .selectAll("path")
      .on("mousemove", "")
      .on("mouseover", "")
      .on("click", "");

    map
      .selectAll("*")
      .transition()
      .duration(300);

    tooltip.html("Hover over a circle for more information");

    map.selectAll("path").style("fill-opacity", d => {
      if (currentState == "All") {
        return 1;
      } else {
        if (currentState == d.properties.NAME) {
          return 1;
        } else return 0;
      }
    });

    mapData.features.forEach(d => {
      if (currentState == d.properties.NAME) {
        var bounds = path.bounds(d);
        (dx = bounds[1][0] - bounds[0][0]),
          (dy = bounds[1][1] - bounds[0][1]),
          (x = (bounds[0][0] + bounds[1][0]) / 2),
          (y = (bounds[0][1] + bounds[1][1]) / 2),
          (scale = 0.9 / Math.max(dx / getChartWidth(), dy / chartHeight)),
          (translate = [
            getChartWidth() / 2 - scale * x,
            chartHeight / 2 - scale * y
          ]);

        paths
          .transition()
          .duration(300)
          .attr(
            "transform",
            "translate(" + translate + ")scale(" + scale + ")"
          );
      }
    });

    var circles = map
      .append("g")
      .selectAll("circle")
      .data(mtData)
      .enter()
      .append("circle")
      .attr("r", 0.8)
      .attr("cy", d => {
        var longitude = d.longitude;
        var latitude = d.latitude;
        return projection([longitude, latitude])[1];
      })
      .attr("cx", d => {
        var longitude = d.longitude;
        var latitude = d.latitude;
        return projection([longitude, latitude])[0];
      })
      .attr("class", "mapCircle")
      .attr("fill", "grey")
      .style("opacity", ".1")
      .attr("stroke-width", 0.09)
      .attr("stroke", "#0A1E24")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
      .on("mouseover", circleMouseover)
      .on("mousemove", "")
      .on("mouseout", circleMouseout);
  });
}
