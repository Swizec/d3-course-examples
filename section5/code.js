
(function () {

    var width = 960,
        height = 600;

    var geo_projection = d3.geo.albersUsa()
            .scale(1280)
            .translate([width / 2, height / 2]),
        geo_path = d3.geo.path()
            .projection(projection);

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

            
            var tmp = clustered_ufos(_ufos, geo_projection),
                clustered = tmp[0],
                clusters = tmp[1],

                cluster_populations = prepare.cluster_populations(clustered, city_populations);

            var drawers = Drawers(svg, ufos, populations);

            drawers.map(US, geo_path);
            drawers.bases(military_bases, geo_projection);
            drawers.centroids(clusters, clustered, cluster_populations);

        });

})();
