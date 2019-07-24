var counts = {}

d3.csv("data/line-chart/month-count.csv", function (error, data) {

    // data.forEach(function (d) {
    //     // d.date = parseTime(d.date);
    //     d.count = +d.count;
    // });

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            const month = element.month;
            counts[month] = counts[month] ? counts[month] + 1 : 1;
        }
    }

});




