
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
        .defer(d3.json, "data/city-populations.json")
        .defer(d3.csv, "data/full-data-geodata.csv")
        .await(function (err, US, states_hash, populations, city_populations, _ufos) {
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
                vectors = [];

            _ufos
                .map(function (d) { return {
                    label: [d.city, d.state].join(", "),
                    vector: projection([d.lon, d.lat])}; })
                .filter(function (d) { return !!d.vector; })
                .forEach(function (d) {
                    labels.push(d.label);
                    vectors.push(d.vector);
                });
            

            var clusters = figue.kmeans(120, vectors);
            var clustered = _.groupBy(clusters.assignments.map(function (cluster, i) {
                return {label: labels[i],
                        cluster: cluster};
            }), "cluster"),
                cluster_populations = _.mapValues(clustered, function (cluster) {
                    var populations = cluster.map(function (d) {
                        return {city: d.label.toLowerCase(),
                                population: city_populations[d.label.toLowerCase()] || 0};
                    });
                    
                    return _.uniq(populations, function (d) { return d.city; })
                        .reduce(function (sum, d) {
                            return sum+Number(d.population);
                        }, 0);
                }),
                ratios = _.mapValues(clustered,
                                     function (group, key) {
                                         var population = cluster_populations[key];

                                         if (population == 0) {
                                             return 0;
                                         }

                                         return group.length/population;
                                     }),
                R = d3.scale.linear()
                    .domain([0, d3.max(_.values(ratios))])
                    .range([2, 20]);

            svg.append("g")
                .selectAll("circle")
                //.data(positions)
                .data(clusters.centroids)
                .enter()
                .append("circle")
                .attr({
                    cx: function (d) { return d[0]; },
                    cy: function (d) { return d[1]; },
                    r: function (d, i) { return R(ratios[i]); },
                    class: "point"
                });
        });

})();
