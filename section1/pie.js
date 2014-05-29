
(function () {

    var svg = d3.select("#graph")
            .append("svg")
            .style({
                width: 1024,
                height: 1024
            });

    d3.json("ufo-types.json", function (data) {
        console.log(data);
        var colors = d3.scale.category20c(),
            pie = d3.layout.pie()
                .value(function (d) { return d.value; }),
            arc = d3.svg.arc()
                .outerRadius(250)
                .startAngle(function (d) { return d.startAngle; })
                .endAngle(function (d) { return d.endAngle; }),
            slice = svg.selectAll('.slice')
                .data(pie(data))
                .enter()
                .append("g")
                .attr("transform", "translate(400, 400)");

        slice.append("path")
            .attr({d: arc,
                   fill: function (d, i) { return colors(i); },
                   "data-toggle": "tooltip",
                   "title": function (d) { return d.data.label; }
                  });

        
    });
})();
