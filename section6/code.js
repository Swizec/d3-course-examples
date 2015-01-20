
(function () {

    var max_width = 2560,
        max_height = 1600,
        width = max_width,
        height = max_height;

    var geo_projection = d3.geo.albersUsa()
            .scale(width)
            .translate([width / 2, height / 2]),
        geo_path = d3.geo.path()
            .projection(geo_projection);

    var svg = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height);

    queue()
        .defer(d3.json, "data/us.json")
        .defer(d3.json, "data/states-hash.json")
        .defer(d3.csv, "data/state-populations.csv")
        .defer(d3.json, "data/city-populations.json")
        .defer(d3.xml, "data/military-bases.kml")
        .defer(d3.csv, "data/full-data-geodata.csv")
        .await(function (err, US, states_hash, populations, city_populations, military_bases, _ufos) {
            var resize_viz = Resizer(svg, width, height, geo_path, geo_projection);
            window.onresize = resize_viz;
                        
            _ufos = prepare.filter_ufos(_ufos, geo_projection);
            var ufos = prepare.ufos(_ufos);
            populations = prepare.populations(populations);
            var states = prepare.states(states_hash);
            
            
            var tmp = clustered_ufos(_ufos, geo_projection),
                clustered = tmp[0], // cluster -> ufos
                clusters = tmp[1], // centroids, assignments

                cluster_populations = prepare.cluster_populations(clustered, city_populations);

            var drawers = Drawers(svg, ufos, populations, geo_path, geo_projection);

            drawers.map(US, geo_path, states);
            drawers.bases(military_bases, geo_projection);
            drawers.centroids(clusters.centroids, clustered, cluster_populations);

            var ufos_by_season = prepare.ufos_by_season(_ufos, clusters.assignments);

            var keyframes = prepare.precalc_animation(
                ufos_by_season,
                geo_projection,
                {centroids: clusters.centroids,
                 clustered: clustered,
                 populations: cluster_populations}
            );

            resize_viz();

            var animation = Animation(keyframes, drawers);
            animation.play_forward();
            
            var drag = d3.behavior.drag()
                    .origin(function () { return {x: 0, y: 0}; })
                    .on("drag", function () {                        
                        if (d3.event.x < 0) {
                            // back in time
                            animation.timeline_explore(-1);
                        }else{
                            // forward in time
                            animation.timeline_explore(+1);
                        }
                    });

            d3.select("h1.season")
                .call(drag);

            d3.select("#down")
                .on("click", function () { animation.timeline_explore(-1); });
            d3.select("#up")
                .on("click", function () { animation.timeline_explore(+1); });
            d3.selectAll(".pause")
                .on("click", animation.pause);
            d3.select("#play_forward")
                .on("click", animation.play_forward);
            d3.select("#play_backward")
                .on("click", animation.play_backward);
            d3.selectAll(".speedUp")
                .on("click", animation.speedUp);

            
        });

    $('[data-toggle="tooltip"]').tooltip();
})();


// window.onresize = function () {
//     resize_viz();
// };
