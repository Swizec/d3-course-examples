
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

        centroids: function (centroids) {            
            svg.append("g")
                .attr("class", "points")
                .datum({type: "points"});

            centroids = centroids.map(function (pos, i) {
                return {x: pos[0],
                        y: pos[1],
                        id: i};
            });
            
            svg.append("g")
                .attr("class", "centroids")
                .datum({type: "centroids"})
                .selectAll("circle")
                .data(centroids)
                .enter()
                .append("circle")
                .attr({
                    cx: function (d) { return d.x; },
                    cy: function (d) { return d.y; },
                    //r: function (d, i) { return R(ratios[i]); },
                    r: 0,
                    class: "centroid",
                    id: function (d) { return "centroid-"+d.id; }
                })
                .on("mouseover", function (d) {
                    console.log(svg.selectAll(".centroid-"+d.id));
                });
        },

        draw_keyframe: function (keyframe) {
            keyframe.centroids.forEach(function (d) {
                svg.select("#centroid-"+d.id)
                    .transition()
                    .duration(200)
                    .attr("r", d.R)
                    .ease(d3.ease('elastic-in'));
            });
            
            var remove_ids = keyframe.ufos['-'].map(function (d) {
                return '#ufo-'+d.id;
            });
            
            if (remove_ids.length > 0) {
                svg.selectAll(remove_ids.join(',')).remove();
            }
            
            svg.select('g.points')
                .selectAll('circle')
                .data(keyframe.ufos['+'],
                      function (d) { return d.id; })
                .enter()
                .append('circle')
                .attr({
                    cx: function (d) { return d.x; },
                    cy: function (d) { return d.y; },
                    r: 2,
                    class: function (d) { return "point centroid-"+d.cluster; },
                    id: function (d) { return 'ufo-'+d.id; }
                })
                .transition()
                .duration(250)
                .style("opacity", .3);
        }
    };
};
