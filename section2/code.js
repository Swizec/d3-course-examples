
(function () {

    var svg = d3.select("#graph")
            .append("svg")
            .style({width: "100%",
                    height: 1024});

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

    var using_layout = function (data, x, y) {
        var colors = d3.scale.category20c(),
            arc = d3.svg.arc(),
            slice = svg.selectAll('.slice')
                .data(data)
                .enter()
                .append("g")
                .attr("transform", "translate("+x+", "+y+")");

        slice.append("path")
            .attr({d: arc,
                   fill: function (d, i) { return colors(i); }
                  });
    };

    d3.json("triangle-ufos.json", function (data) {
        data = parse_times(data);
        
        var histogram = d3.layout.angle_histogram()
                .value(function (d) {
                    return d.time.getHours();
                })
                .bins(24)
                .innerRadius(function () { return 20; })
                .maxHeight(d3.scale.log().range([0, 400]))
                .minHeight(function (min_val) { return min_val/2; })
                .startAngle(0)
                .endAngle(Math.PI);
        
        using_layout(histogram(data), 500, 600);
    });

})();
