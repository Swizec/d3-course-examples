
(function () {

    var svg = d3.select("#graph")
            .append("svg")
            .style({
                width: "100%",
                height: 500
            });

    var using_layout = function (data, x, y) {
        var colors = d3.scale.category20c(),
            pie = d3.layout.pie()
                .value(function (d) { return d.value; }),
            arc = d3.svg.arc()
                .outerRadius(150),
            slice = svg.selectAll('.slice')
                .data(pie(data))
                .enter()
                .append("g")
                .attr("transform", "translate("+x+", "+y+")");

        slice.append("path")
            .attr({d: arc,
                   fill: function (d, i) { return colors(i); },
                   title: function (d) { return d.data.label + " ("+d.data.value+")"; }
                  });
    };

    var manually = function (data, x, y) {
        data = data.sort(function (a, b) {
            return d3.descending(a.value, b.value);
        });

        var colors = d3.scale.category20c(),
            total = d3.sum(data.map(function (d) { return d.value; })),
            offset = function (d, i) {
                return d3.sum(data.slice(0, i).map(function (d) { 
                    return 2*Math.PI*(d.value/total); 
                }));
            },
            arc = d3.svg.arc()
                .outerRadius(150)
                .startAngle(offset)
                .endAngle(function (d, i) {
                    return offset(d, i)+2*Math.PI*(d.value/total);
                }),
            slice = svg.selectAll('.slice')
                .data(data)
                .enter()
                .append("g")
                .attr("transform", "translate("+x+", "+y+")");

        slice.append("path")
            .attr({d: arc,
                   fill: function (d, i) { return colors(i); },
                   title: function (d) { return d.label + " ("+d.value+")"; }
                   });
    };

    d3.json("ufo-types.json", function (data) {
        using_layout(data, 300, 250);
        manually(data, 700, 250);

        $("svg path").tooltip({
            container: "body",
            placement: "right"
        });
    });
})();
