
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

    var stateIdMap = d3.map({
        1: "AL",
        2: "AK",
        4: "AZ",
        5: "AR",
        6: "CA",
        8: "CO",
        9: "CT",
        10: "DE",
        11: "DC",
        12: "FL",
        13: "GA",
        15: "HI",
        16: "ID",
        17: "IL",
        18: "IN",
        19: "IA",
        20: "KS",
        21: "KY",
        22: "LA",
        23: "ME",
        24: "MD",
        25: "MA",
        26: "MI",
        27: "MN",
        28: "MS",
        29: "MO",
        30: "MT",
        31: "NE",
        32: "NV",
        33: "NH",
        34: "NJ",
        35: "NM",
        36: "NY",
        37: "NC",
        38: "ND",
        39: "OH",
        40: "OK",
        41: "OR",
        42: "PA",
        44: "RI",
        45: "SC",
        46: "SD",
        47: "TN",
        48: "TX",
        49: "UT",
        50: "VT",
        51: "VA",
        53: "WA",
        54: "WV",
        55: "WI",
        56: "WY"
    }),
        knownStates = _.sortBy(stateIdMap.values());

    queue()
        .defer(d3.json, "us.json")
        .defer(d3.json, "states-hash.json")
        .defer(d3.csv, "state-populations.csv")
        .defer(d3.csv, "full-data.csv")
        .await(function (err, US, states_hash, populations, ufos) {
            ufos = _.groupBy(ufos
                             .filter(function (ufo) { return !!ufo.state; })
                             .filter(function (ufo) { 
                                 return _.indexOf(knownStates, ufo.state, true) >= 0; }),
                             function (ufo) { return ufo.state; });

            populations = d3.map(_.zipObject(
                populations.map(function (p) { return p.State.toLowerCase(); }),
                populations.map(function (p) {
                    var years = [2010, 2011, 2012, 2013];
                    return _.zipObject(years,
                                       years.map(function (y) {
                                           return Number(p[y].replace(/\./g, "")); }));
                })));

            states = d3.map(_.mapValues(states_hash,
                                        function (s) { return s.toLowerCase(); }));

            var ufoCounts = _.mapValues(ufos, function (ufo, state) {
                return ufo.length/populations.get(states.get(state))[2010];
            });

            var quantize = d3.scale.quantize()
                    .domain(d3.extent(_.values(ufoCounts)))
                    .range(d3.range(6).map(function(i) { return "q" + i + "-6"; }));

            var states = svg.append("g")
                    .attr("class", "states")
                    .selectAll("g")
                    .data(topojson.feature(US, US.objects.states).features)
                    .enter().append("g");

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

            states.append("text")
                .text(function (d) { return stateIdMap.get(d.id) || d.id; })
                .attr({
                    x: function (d) { return path.centroid(d)[0] || 0; },
                    y: function (d) { return path.centroid(d)[1] || 0; }
                });
        });

})();
