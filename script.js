var container = d3.select("#scroll");
var graphic = container.select(".scroll__graphic");
var charts = graphic.select(".chart");
var heatmap = charts.select("#heatmapSvg");
var map = charts.select("#mapSvg");
var shapeChart = charts.select("#shapeChartSvg");
var lineChart = charts.select("#lineChartSvg");
var text = container.select(".scroll__text");
var step = text.selectAll(".step");
var tooltip = d3.selectAll(".tooltip");
var legend = d3.selectAll(".legend");
var axis = d3.selectAll(".axis");

var margin = {
    top: 30,
    right: 40,
    bottom: 30,
    left: 40
};

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

var windowHeight = window.innerHeight;
const stepWidth = 350;

// const chartHeight = window.innerWidth < 800 ? windowHeight - margin.top - margin.bottom : windowHeight - margin.top - margin.bottom;
const chartHeight = window.innerWidth < 600 ? windowHeight - 200 : windowHeight - 400;
// chartHeight = 350;

var windowWidth = container.node().offsetWidth;

const getChartWidth = () => {
    return window.innerWidth < 800 ? windowWidth - margin.left - margin.right : (windowWidth - stepWidth);
}

function showMap() {
    map
        .transition()
        .duration(300)
        .style("opacity", 1);
    map.style("display", "block");
    heatmap
        .transition()
        .duration(300)
        .style("opacity", 0);
    heatmap.style("display", "none");
    shapeChart
        .transition()
        .duration(300)
        .style("opacity", 0);
    shapeChart.style("display", "none");

    lineChart
        .transition()
        .duration(300)
        .style("opacity", 0);
    lineChart.style("display", "none");
    drawMapLegend();
}

function showHeatmap() {
    heatmap
        .transition()
        .duration(300)
        .style("opacity", 1);
    heatmap.style("display", "block");

    map
        .transition()
        .duration(300)
        .style("opacity", 0);
    map.style("display", "none");

    shapeChart
        .transition()
        .duration(300)
        .style("opacity", 0);
    shapeChart.style("display", "none");

    lineChart
        .transition()
        .duration(300)
        .style("opacity", 0);
    lineChart.style("display", "none");
    drawHeatmapLegend();
}

function showShapeChart() {
    shapeChart
        .transition()
        .duration(300)
        .style("opacity", 1);
    shapeChart.style("display", "block");

    map
        .transition()
        .duration(300)
        .style("opacity", 0);
    map.style("display", "none");

    heatmap
        .transition()
        .duration(300)
        .style("opacity", 0);
    heatmap.style("display", "none");

    lineChart
        .transition()
        .duration(300)
        .style("opacity", 0);
    lineChart.style("display", "none");

    drawShapeChartLegend();
}

function showLineChart() {
    lineChart
        .transition()
        .duration(300)
        .style("opacity", 1);
    lineChart.style("display", "block");

    heatmap
        .transition()
        .duration(300)
        .style("opacity", 0);
    heatmap.style("display", "none");

    map
        .transition()
        .duration(300)
        .style("opacity", 0);
    map.style("display", "none");

    shapeChart
        .transition()
        .duration(300)
        .style("opacity", 0);
    shapeChart.style("display", "none");

    drawLineChartLegend();
}

// initialize the scrollama
var scroller = scrollama();

function handleResize() {
    //1. update height of steps, window
    windowWidth = d3.select("#scroll").node().offsetWidth;
    var stepHeight;
    if (window.innerWidth < 600) {
        stepHeight = window.innerHeight * 2;
    } else {
        // stepHeight = Math.floor(window.innerHeight);
        stepHeight = 900;
    }
    step.style("height", stepHeight + "px");
    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}

var currStep;

// scrollama event handlers
function handleStepEnter(response) {
    // add color to current step only
    step.classed("is-active", function (d, i) {
        return i === response.index;
    });

    // update graphic based on step
    if (response.index == 0) {
        d3.selectAll(".shooting").style("opacity", 0);
        showHeatmap();
        d3.selectAll("#intro").attr("opacity", "0");
        heatmap.selectAll("*").style("fill-opacity", 1);
        d3.select(".annotation-group").style("opacity", "0");
    } else if (response.index == 1) {
        d3.select(".annotation-group").style("opacity", "1");
        showHeatmap();
        showHigherDays();
    } else if (response.index == 2) {
        map.selectAll("path").style("fill-opacity", 1);
        showMap();
        tooltip.html("Hover over a state for more information");
        map.selectAll(".mapCircle").remove();
        map
            .selectAll("*")
            .transition()
            .attr("transform", "scale(1,1)");
        map
            .selectAll("path")
            .on("mouseover", mapMouseOver)
            .on("click", mapMouseOver)
            .on("mouseout", mapMouseLeave);
    } else if (response.index == 3) {
        map.selectAll(".mapCircle").remove();
        showMap();
        currentState = "Washington";
        updateMapWA(currentState);
    } else if (response.index == 4) {
        showMap();
        map.selectAll(".mapCircle").remove();
        currentState = "Montana";
        updateMapMT(currentState);
    } else if (response.index == 5) {
        showShapeChart();
    } else if (response.index == 6) {
        showLineChart();
        drawLineChart(lineChartData);
    } else if (response.index == 7) {
        // updateLineChart();
        lineChart.select(".annotation-group").style("opacity", "1");
    } else if (response.index == 8) {
        lineChart.select(".annotation-group").style("opacity", "0");
        updateLineChart();
        lineChart.select(".annotation-group").style("opacity", "1");
    } else if (response.index == 9) {
        updateLineChartJuly();
    }
}

function handleContainerEnter(response) {
    // response = { direction }

    // sticky the graphic
    graphic.classed("is-fixed", true);
    graphic.classed("is-bottom", false);
}

function handleContainerExit(response) {
    // response = { direction }

    // un-sticky the graphic, and pin to top/bottom of container
    graphic.classed("is-fixed", false);
    graphic.classed("is-bottom", response.direction === "down");
}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
        Stickyfill.add(this);
    });
}

function init() {
    // draw charts
    initHeatmap();
    initMap();
    initShapeChart();
    initLineChart();
    // show heatmap first
    showHeatmap();
    setupStickyfill();
    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    if (window.innerWidth > 600) {
        handleResize();
    }
    scroller
        .setup({
            container: "#scroll",
            graphic: ".scroll__graphic",
            text: ".scroll__text",
            offset: 0.6,
            step: ".scroll__text .step",
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onContainerEnter(handleContainerEnter)
        .onContainerExit(handleContainerExit);
}

// kick things off
init();

if (window.innerWidth > 600) {
    // on resize, reload page and scroll to top
    var resizeId;

    window.addEventListener("resize", function () {
        clearTimeout(resizeId);
        resizeId = setTimeout(doneResizing, 100);
    });

    function doneResizing() {
        document.location.reload(true);
        window.scrollTo(0, 0);
    }
}