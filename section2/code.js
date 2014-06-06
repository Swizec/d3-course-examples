
(function () {

    var svg = d3.select("#graph")
            .append("svg")
            .style({width: "100%",
                    height: 500});

    var parse_times = function (data) {
        return data.map(function (d) {
            d.time = Date.parse(d.time);
            return d;
        }).filter(function (d) {
            return !!d.time;
        }).map(function (d) {
            d.time = new Date(d.time);
            return d;
        });
    };

    d3.json("triangle-ufos.json", function (data) {
        data = parse_times(data);
        
        var histogram = d3.layout.histogram()
                .value(function (d) {
                    return d.time.getHours();
                })
                .bins(24);

        console.log(histogram(data));
    });

})();
