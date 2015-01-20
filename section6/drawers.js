
var Resizer = function (svg, width, height, geo_path, geo_projection) {

    var size_ratio = width/height,
        max_width = width,
        max_height = height;

    // densities per 1000px^2
    var max_base_density = 0.3,
        max_centroid_density = 0.5,
        max_point_density = 10;

    var resize_map = function () {
        svg.select(".states")
            .selectAll("path")
            .attr("d", geo_path);
        
        svg.selectAll(".borders")
            .attr("d", geo_path);
    };

    var move_datapoints = function () {
        function move_bases () {
            var density = svg.selectAll(".base").size()/(width*height/1000),
            percent_shown = 1;
            
            if (density > max_base_density) {
                percent_shown = max_base_density/density;
            }
            
            svg.selectAll(".base")
                .attr("transform", function (d, i) {
                    var _i = i % Math.round(10-percent_shown*10);
                    
                    if (_i == 0 || isNaN(_i)) {
                        var pos = geo_projection([d.lon, d.lat]);
                        return pos && "translate("+pos[0]+","+pos[1]+")";
                    }else{
                        return "translate(-100, -100)";
                    }
                });
        }

        function move_centroids () {
            var density = svg.selectAll(".centroid").size()/(width*height/1000),
                percent_shown = 1;
            
            if (density > max_centroid_density) {
                percent_shown = max_centroid_density/density;
            }


            svg.selectAll(".centroid")
                .each(function (d, i) {
                    var pos = geo_projection([d.lon, d.lat]),
                        _i = i % Math.round(10-percent_shown*10);

                    if (_i > 0 && !isNaN(_i)) {
                        pos = [-100, -100];
                    }

                    d3.select(this)              
                        .attr({cx: pos[0],
                               cy: pos[1]});
                });

        }

        function move_points () {
            var N = svg.select("g.points").selectAll("circle").size(),
                density = N/(width*height/1000),
                percent_shown = 1;

            if (density > max_point_density) {
                percent_shown = max_point_density/density;
            }


            svg.select("g.points")
                .selectAll("circle")
                .each(function (d, i) {
                    var pos = geo_projection([d.lon, d.lat]),
                        _i = i % Math.round(10-percent_shown*10);

                    if (_i > 0 && !isNaN(_i)) {
                        pos = [-100, -100];
                    }

                    d3.select(this)
                        .attr({cx: pos[0],
                               cy: pos[1]});
                });
        }

        move_bases();
        move_centroids();
        move_points();
    };

    return function resize_viz() {
        var _w = d3.min([window.innerWidth, $("#graph").width()]),
            _h = window.innerHeight;
        
        if (_w < width) {
            width = _w;
            height = width/size_ratio;
        }else if (_h < height) {
            height = _h;
            width = height*size_ratio;
        }

        if (_w > width) {
            width = _w;
            height = width/size_ratio;

            if (_h < height) {
                height = _h;
                width = height*size_ratio;
            }
        }else if (_h > height) {
            height = _h;
            width = height*size_ratio;

            if (_w < width) {
                width = _w;
                height = width/size_ratio;
            }
        }

        if (width > max_width) {
            width = max_width;
            height = width/size_ratio;
        }
        if (height > max_height) {
            height = max_height;
            width = height*size_ratio;
        }

        svg.attr("width", width)
            .attr("height", height);

        geo_projection
            .scale(width)
            .translate([width / 2, height / 2]);

        resize_map();
        move_datapoints();
    };
};

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
                    return "translate("+d.x+","+d.y+")";
                });
        },

        centroids: function (centroids) {
            svg.append("g")
                .attr("class", "points")
                .datum({type: "points"});

            svg.append("g")
                .attr("class", "hull_layer");

            centroids = centroids.map(function (pos, i) {
                var geo_pos = geo_projection.invert(pos);
                return {x: pos[0],
                        y: pos[1],
                        lon: Number(geo_pos[0]),
                        lat: Number(geo_pos[1]),
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
                .on("mouseover", show_hull)
                .on("mouseout", hide_hull)
                .on("touchstart", show_hull)
                .on("touchend", hide_hull);

            function show_hull(d) {
                var centroid = d,
                    vertices = svg
                        .selectAll(".point.centroid-"+centroid.id)
                        .data()
                        .map(function (d) {
                            return geo_projection([Number(d.lon), Number(d.lat)]);
                        })
                        .filter(function (pos) { return !!pos; }),
                    hull = d3.geom.hull(vertices);
                
                if (!hull.length) return;

                svg.select("g.hull_layer")
                    .append("path")
                    .attr("class", "hull")
                    .datum(hull)
                    .attr("d", function (d) {
                        return "M"+d.map(function () { 
                            return geo_projection([Number(centroid.lon), Number(centroid.lat)]);
                        }).join("L") + "Z";
                    })
                    .transition()
                    .duration(300)
                    .attr("d", function (d) {
                        return "M" + d.join("L") + "Z";
                    });
            }

            function hide_hull(d) {
                svg.select(".hull")
                    .remove();
            }
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
                    cx: function (d) { return geo_projection([d.lon, d.lat])[0]; },
                    cy: function (d) { return geo_projection([d.lon, d.lat])[1]; },
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
