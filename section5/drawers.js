
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

        centroids: function (centroids, clustered, cluster_populations) {
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

            var ufo_count = _.values(clustered)
                    .reduce(function (sum, group) {
                        return sum+group.length;
                    }, 0);

            centroids = centroids.map(function (pos, i) {
                return {x: pos[0],
                        y: pos[1],
                        max_R: R(ratios[i]),
                        all_here: clustered[i].length,
                        abs_all: ufo_count,
                        population: cluster_populations[i],
                        count: 0};
            });
            
            svg.append("g")
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
                    id: function (d, i) { return "centroid-"+i; }
                });

        },

        place_ufos: function (ufos) {
            if (!ufos) return;

            var format = d3.time.format("%m/%d/%Y %H:%M");

            ufos = _.sortBy(ufos, function (ufo) { return format.parse(ufo.time); });

            var positions = ufos
                    .map(function (ufo) {
                        return geo_projection([Number(ufo.lon), Number(ufo.lat)]);
                    })
                    .filter(function (pos) { return !!pos; });

            var fps = 1000/60,
                per_frame = Math.ceil(positions.length > fps 
                                      ? positions.length/fps 
                                      : 1),
                ufos_in_batch = positions.length;

            d3.timer((function () {
                var counter = 0,
                    previous = (new Date()).getTime();

                return function draw () {
                    var now = new Date().getTime(),
                        delta = now-previous,
                        frames = Math.ceil(delta/(1000/fps));

                    var to_draw = {
                        pos: positions.splice(0, per_frame*frames),
                        ufos: ufos.splice(0, per_frame*frames)
                    };
                        

                    var g = svg.append("g"),
                        drawn = g.selectAll("circle")
                            .data(to_draw.pos)
                            .enter()
                            .append("circle")
                            .attr({
                                cx: function (d) { return d[0]; },
                                cy: function (d) { return d[1]; },
                                r: 2,
                                class: "point"
                            }),
                        centroids = d3.selectAll(to_draw.ufos.map(function (ufo) {
                            return "#centroid-"+ufo.cluster;
                        }).join(", "));
                                                               
                    g.transition()
                        .duration(500)
                        .style("opacity", .3);

                    centroids.each(function (d) {
                        d.count += 1;
                        d3.select(this).datum(d);
                    });

                    var ratios = [],
                        currently_drawn = 0;

                    d3.selectAll(".centroid")
                        .each(function (d) {
                            currently_drawn += d.count;
                        })
                        .each(function (d) {
                            if (d.population > 0) {
                                ratios.push(d.count/currently_drawn);
                            }else{
                                ratios.push(0);
                            }
                        });

                    var R = d3.scale.linear()
                            .domain([0, d3.max(ratios)])
                            .range([0, 20]);

                    d3.selectAll(".centroid")
                        .transition()
                        .duration(500)
                        .attr("r", function (d) {
                            return R(d.count/currently_drawn);
                            //console.log(d.count/currently_drawn, d.population);
                            //console.log("new R", d.count, d.all, (d.count/d.all)*d.max_R);
                            //console.log(d);
                            //return R(d.count);
                            //return 1;
                            //return (d.count/d.all)*d.max_R;
                        })
                        .ease(d3.ease('elastic-in'));


                    counter += drawn.size();
                    previous = now;

                    return counter >= ufos_in_batch;
                };
            })());
        }
    };
};
