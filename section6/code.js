
(function () {

    var width = 960,
        height = 600;

    var geo_projection = d3.geo.albersUsa()
            .scale(1280)
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
            _ufos = prepare.filter_ufos(_ufos);
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

            var ufos_by_season = prepare.ufos_by_season(_ufos, clusters.assignments),
                seasons = seasons = d3.scale.ordinal()
                    .domain(d3.range(4))
                    .range(["winter", "spring", "summer", "autumn"]);

            var
                stepper = setInterval((function () {
                    var step = 0,
                        year = 1945;
                    return function () {
                        year = timeline_step(step++, year);
                    };
                })(), 1000);

            function timeline_step (step, year) {
                var season = seasons(step%12);

                d3.select("h1.season")
                    .html([season, year].join(" "));

                requestAnimationFrame(function () {
                    drawers.place_ufos(ufos_by_season[[year, season].join("-")]);
                });

                if (step%4 == 3) {
                    year += 1;
                }

                if (year > 2014) {
                    clearInterval(stepper);
                }

                return year;
            };
        });

})();
