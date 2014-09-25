
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
        .defer(d3.csv, "data/full-data-geodata.csv")
        .await(function (err, US, states_hash, populations, _ufos) {
            _ufos = prepare.filter_ufos(_ufos);
            var ufos = prepare.ufos(_ufos);
            populations = prepare.populations(populations);
            states = prepare.states(states_hash);

            var ufoCounts = _.mapValues(ufos, function (ufos, state) {
                return ufos.length/populations.get(states.get(state))[2010];
            });

            var quantize = d3.scale.quantize()
                    .domain(d3.extent(_.values(ufoCounts)))
                    .range(d3.range(9).map(function(i) { return "q" + i + "-9-green"; }));

            var states = svg.append("g")
                    .attr("class", "states")
                    .selectAll("path")
                    .data(topojson.feature(US, US.objects.states).features)
                    .enter();

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

            // var positions = _ufos
            //         .map(function (d) { return projection([d.lon, d.lat]); })
            //         .filter(function (d) { return !!d; });

            var labels = [],
                vectors = [],
                for_clustering = _ufos
                    .map(function (d) { return {
                        label: [d.city, d.state, d.shape].join("-"),
                        vector: projection([d.lon, d.lat])}; })
                    .filter(function (d) { return !!d.vector; })
                    .forEach(function (d) {
                        labels.push(d.label);
                        vectors.push(d.vector);
                    });

            var clusters = figue.kmeans(50, vectors);
            //console.log(clusters);

            svg.append("g")
                .selectAll("circle")
                //.data(positions)
                .data(clusters.centroids)
                .enter()
                .append("circle")
                .attr({
                    cx: function (d) { return d[0]; },
                    cy: function (d) { return d[1]; },
                    r: 1,
                    class: "point"
                });
        });

})();
