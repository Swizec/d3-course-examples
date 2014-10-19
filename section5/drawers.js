
var Drawers = function (svg, ufos, populations, geo_path, geo_projection) {

    return {

        map: function (US, geo_path, states) {
            var ufoCounts = _.mapValues(ufos, function (ufos, state) {
                return ufos.length/populations.get(states.get(state))[2010];
            });
            
            var quantize = d3.scale.quantize()
                    .domain(d3.extent(_.values(ufoCounts)))
                    .range(d3.range(9).map(function(i) { return "q" + i + "-9-green"; }));
            
            var states_map = svg.append("g")
                    .attr("class", "states")
                    .selectAll("path")
                    .data(topojson.feature(US, US.objects.states).features)
                    .enter()
                    .append("path")
                    .attr("d", geo_path)
                    .attr("class", function(d) { 
                        return quantize(ufoCounts[stateIdMap.get(d.id)]); 
                    });
            
            svg.append("path")
                .datum(topojson.mesh(US, US.objects.states, 
                                     function(a, b) { return a !== b; }))
                .attr("class", "borders")
                .attr("d", geo_path);
            
        },

        bases: function (military_bases, geo_projection) {
            var base_positions = prepare.base_positions(military_bases, geo_projection);
            
            svg.append("g")
                .selectAll("path")
                .data(base_positions)
                .enter()
                .append("path")
                .attr("d", d3.svg.symbol().type("cross").size(32))
                .attr("class", "base")
                .attr("transform", function (d) {
                    return "translate("+d[0]+","+d[1]+")";
                });
        },

        centroids: function (clusters, clustered, cluster_populations) {
            var
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
                .data(clusters.centroids)
                .enter()
                .append("circle")
                .attr({
                    cx: function (d) { return d[0]; },
                    cy: function (d) { return d[1]; },
                    r: function (d, i) { return R(ratios[i]); },
                    class: "point"
                });

        },

        place_ufos: function (ufos) {
            if (!ufos) return;

            var format = d3.time.format("%m/%d/%Y %H:%M");

            var positions = _.sortBy(ufos, function (ufo) { return format.parse(ufo.time); })
                    .map(function (ufo) {
                        return geo_projection([Number(ufo.lon), Number(ufo.lat)]);
                    })
                    .filter(function (pos) { return !!pos; });

            var circles = svg.append("g")
                    .selectAll("circle")
                    .data(positions)
                    .enter()
                    .append("circle")
                    .attr({
                        cx: function (d) { return d[0]; },
                        cy: function (d) { return d[1]; },
                        r: 2,
                        class: function (d, i) { return "point i-"+i; }
                    })
                    .style("visibility", "hidden");

            d3.timer((function (counter) {
                var fps = 1000/60,
                    per_frame = Math.ceil(circles.size() > fps 
                                          ? circles.size()/fps 
                                          : 1);

                return function () {
                    var selector = d3.range(per_frame)
                            .map(function (i) { return ".i-"+i; })
                            .join(", ");

                    var now = circles.filter(selector)
                            .style("visibility", "visible")
                            .transition()
                            .duration(800)
                            .style("opacity", .3);

                    counter += now.size();

                    return counter >= circles.size();
                };
            })(0));
        }
    };
};
