
(function () {

    var width = 960,
        height = 600;

    var projection = d3.geo.albersUsa()
            .scale(1280)
            .translate([width / 2, height / 2]),
        path = d3.geo.path()
            .projection(projection);

    var svg = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height);

    queue()
        .defer(d3.json, "us.json")
        .defer(d3.csv, "full-data.csv")
        .await(function (err, US, ufos) {
            ufos = _.groupBy(ufos.filter(function (ufo) { return !!ufo.state; }),
                             function (ufo) { return ufo.state; });

            console.log(US);

            svg.append("g")
                .attr("class", "states")
                .selectAll("path")
                .data(topojson.feature(US, US.objects.states).features)
                .enter().append("path")
                //.attr("class", function(d) { return quantize(rateById.get(d.id)); })
                .attr("d", path);

            svg.append("path")
                .datum(topojson.mesh(US, US.objects.states, 
                                     function(a, b) { return a !== b; }))
                .attr("class", "borders")
                .attr("d", path);
        });

})();
