
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
        .defer(d3.json, "data/us.json")
        .defer(d3.json, "data/states-hash.json")
        .defer(d3.csv, "data/state-populations.csv")
        .defer(d3.csv, "data/full-data.csv")
        .await(function (err, US, states_hash, populations, ufos) {
            ufos = prepare.ufos(ufos);
            populations = prepare.populations(populations);
            states = prepare.states(states_hash);

            var ufoCounts = _.mapValues(ufos, function (ufo, state) {
                return ufo.length/populations.get(states.get(state))[2010];
            });

            var quantize = d3.scale.quantize()
                    .domain(d3.extent(_.values(ufoCounts)))
                    .range(d3.range(9).map(function(i) { return "q" + i + "-9-green"; }));

            var states = svg.append("g")
                    .attr("class", "states")
                    .selectAll("g")
                    .data(topojson.feature(US, US.objects.states).features)
                    .enter().append("g");

            states.append("path")
                .attr("d", path)
                .attr("class", function(d) { 
                    return quantize(ufoCounts[stateIdMap.get(d.id)]); 
                });
            
            svg.append("path")
                .datum(topojson.mesh(US, US.objects.states, 
                                     function(a, b) { return a !== b; }))
                .attr("class", "borders")
                .attr("d", path);

            // states.append("text")
            //     .text(function (d) { return stateIdMap.get(d.id) || d.id; })
            //     .attr({
            //         x: function (d) { return path.centroid(d)[0] || 0; },
            //         y: function (d) { return path.centroid(d)[1] || 0; }
            //     });
        });

})();
