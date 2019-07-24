function initLineChart() {
    d3.csv("data/sightings-by-year.csv", function (error, data) {
        var years = []
        var numsightings = []
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key];
                numsightings.push(element.numsightings)
                years.push(element.year)
            }
        }
        drawlineChart(data, years, numsightings);
    });
}

function drawLineChart(data, years, numsightings) {

    lineChart
        .attr("width", getChartWidth())
        .attr("height", chartHeight + 50)

    var x = d3
        .scaleBand()
        .domain(years)
        .range([0, (getChartWidth() - margin.left - margin.right)])
        .padding(0.2);

    var y = d3
        .scaleLinear()
        .domain(d3.extent(numsightings, function (d) {
            return +d;
        }))
        .range([chartHeight, 0])

    lineChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(100," + (chartHeight) + ")")
        .call(d3.axisBottom(x));

    lineChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(100,0)")
        .call(d3.axisLeft(y));

    lineChart.append("path")
        .datum(data)
        .attr("fill", "#69b3a2")
        .attr("transform", "translate(100,0)")
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.year)
            })
            // .y0(chartHeight)
            .y(function (d) {
                return y(d.numsightings)
            })
        )

    lineChart.attr("transform", "translate(100,0)")
}

function drawLineChartLegend() {

}