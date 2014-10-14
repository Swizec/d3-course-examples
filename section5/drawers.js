
var Drawers = function (svg, ufos, populations) {

    return {

        map: function (US, geo_path) {
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
                .attr("d", geo_path)
                .attr("class", function(d) { 
                    return quantize(ufoCounts[stateIdMap.get(d.id)]); 
                });
            
            svg.append("path")
                .datum(topojson.mesh(US, US.objects.states, 
                                     function(a, b) { return a !== b; }))
                .attr("class", "borders")
                .attr("d", geo_path);
            
        }
    };
};
