
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

    var draw = function (data, x, y) {
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

        slice.append("text")
            .text(function (d, i) { return d.value; })
            .classed("label", true)
            .attr({
                transform: function (d, i) {
                    var angle = 180/Math.PI*(d.startAngle+(d.endAngle-d.startAngle)/2);
                    return "rotate("+(-90+angle)+") translate("+(d.innerRadius-30)+") rotate(90)"; 
                },
                "text-anchor": "middle"
            });

        slice.append("line")
            .classed("tick", true)
            .attr({
                x0: 0,
                y0: 0,
                x1: 10,
                y1: 0,
                transform: function (d, i) {
                    var angle = 180/Math.PI*(d.startAngle+(d.endAngle-d.startAngle)/2);
                    return "rotate("+(-90+angle)+") translate("+(d.innerRadius-12)+")"; 
                }
            });
    };

    d3.json("triangle-ufos.json", function (data) {
        data = parse_times(data);
        
        var histogram = d3.layout.angle_histogram()
                .value(function (d) {
                    return d.time.getHours();
                })
                .bins(24)
                .innerRadius(200)
                .maxHeight(d3.scale.log().range([0, 250]))
                .minHeight(function (min_val) { return min_val/2; });
        
        draw(histogram(data), 500, 500);
    });

})();
